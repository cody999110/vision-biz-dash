from __future__ import annotations

import csv
import io
import uuid
from datetime import datetime
from typing import Any

from app.services.dataset_store import DatasetRecord, dataset_store
from app.templates.definitions import ImportTemplateDefinition, get_template


class ImportValidationError(Exception):
    pass


def _parse_number(value: str) -> float | None:
    text = value.strip().replace(",", "")
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def _normalize_date(value: str, month_only: bool = False) -> str | None:
    """Normalize dates like 2026/6/15, 2026.6.15, 2026-6 to canonical YYYY-MM-DD / YYYY-MM."""
    text = value.strip().replace("/", "-").replace(".", "-")
    if not text:
        return None
    parts = text.split("-")
    try:
        year = int(parts[0])
        month = int(parts[1]) if len(parts) > 1 and parts[1] else 1
        day = int(parts[2]) if len(parts) > 2 and parts[2] else 1
    except (ValueError, IndexError):
        return None
    if not (1 <= month <= 12):
        return None
    if month_only:
        return f"{year:04d}-{month:02d}"
    if not (1 <= day <= 31):
        day = 1
    return f"{year:04d}-{month:02d}-{day:02d}"


def _normalize_row(raw: dict[str, str], template: ImportTemplateDefinition) -> tuple[dict[str, Any], list[str]]:
    errors: list[str] = []
    normalized: dict[str, Any] = {}

    for column in template.columns:
        raw_value = (raw.get(column.key) or "").strip()
        if not raw_value:
            if column.required:
                errors.append(f"缺少必填字段: {column.label}({column.key})")
            continue

        if column.column_type == "number":
            number = _parse_number(raw_value)
            if number is None:
                errors.append(f"字段 {column.label} 不是有效数值: {raw_value}")
            else:
                normalized[column.key] = number
        elif column.column_type in {"date", "month"}:
            canonical = _normalize_date(raw_value, month_only=column.column_type == "month")
            if canonical is None:
                errors.append(f"字段 {column.label} 不是有效日期: {raw_value}")
            else:
                normalized[column.key] = canonical
        else:
            normalized[column.key] = raw_value
            if column.enum_values and raw_value not in column.enum_values:
                errors.append(
                    f"字段 {column.label} 枚举值非法: {raw_value}，允许值: {' / '.join(column.enum_values)}"
                )

    return normalized, errors


def _read_csv_rows(content: bytes) -> tuple[list[str], list[dict[str, str]]]:
    text = content.decode("utf-8-sig")
    reader = csv.reader(io.StringIO(text))
    rows = list(reader)
    if len(rows) < 3:
        raise ImportValidationError("CSV 至少需要 3 行：字段 key、中文 label、数据行")

    keys = [cell.strip() for cell in rows[0]]
    data_rows: list[dict[str, str]] = []
    for row in rows[2:]:
        if not any(cell.strip() for cell in row):
            continue
        padded = row + [""] * (len(keys) - len(row))
        data_rows.append({keys[i]: padded[i] for i in range(len(keys))})
    return keys, data_rows


def _compute_data_as_of(rows: list[dict[str, Any]], template: ImportTemplateDefinition) -> str | None:
    date_keys = [col.key for col in template.columns if col.column_type in {"date", "month"}]
    if not date_keys:
        return None
    values: list[str] = []
    for row in rows:
        for key in date_keys:
            value = row.get(key)
            if isinstance(value, str) and value:
                values.append(value[:7])
    if not values:
        return None
    return max(values)


def import_dataset_file(dataset_id: str, content: bytes) -> DatasetRecord:
    record = dataset_store.get(dataset_id)
    if record is None:
        raise KeyError(dataset_id)

    template = get_template(record.template_code)
    if template is None:
        raise ImportValidationError(f"未知模板: {record.template_code}")

    record.status = "validating"
    dataset_store.save(record)

    try:
        keys, raw_rows = _read_csv_rows(content)
    except ImportValidationError as exc:
        record.status = "failed"
        record.errors = [str(exc)]
        record.row_count = 0
        record.error_count = 1
        dataset_store.save(record)
        return record

    expected_keys = [col.key for col in template.columns]
    missing_keys = [key for key in expected_keys if key not in keys]
    if missing_keys:
        record.status = "failed"
        record.errors = [f"缺少模板列: {', '.join(missing_keys)}"]
        record.row_count = len(raw_rows)
        record.error_count = len(missing_keys)
        dataset_store.save(record)
        return record

    parsed_rows: list[dict[str, Any]] = []
    all_errors: list[str] = []
    seen_doc_nos: set[str] = set()

    for index, raw in enumerate(raw_rows, start=3):
        normalized, row_errors = _normalize_row(raw, template)
        doc_no = normalized.get("doc_no")
        if isinstance(doc_no, str):
            if doc_no in seen_doc_nos:
                row_errors.append(f"第 {index} 行单据号重复: {doc_no}")
            seen_doc_nos.add(doc_no)

        if row_errors:
            all_errors.extend([f"第 {index} 行: {msg}" for msg in row_errors])
            continue
        parsed_rows.append(normalized)

    record.rows = parsed_rows
    record.row_count = len(raw_rows)
    record.error_count = len(all_errors)
    record.errors = all_errors[:50]
    record.data_as_of = _compute_data_as_of(parsed_rows, template)

    if parsed_rows and not all_errors:
        record.status = "validated"
    elif parsed_rows:
        record.status = "validated"
        record.errors = all_errors[:50]
    else:
        record.status = "failed"

    dataset_store.save(record)
    return record


def new_batch_id() -> str:
    return str(uuid.uuid4())
