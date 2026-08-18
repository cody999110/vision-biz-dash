from __future__ import annotations

from collections import defaultdict
from typing import Any

from app.schemas.management import (
    AllocationRuleConfig,
    DistinctValues,
    ExpenseGroupMeta,
    ManagementConfig,
    ManagementKpis,
    ManagementReportResponse,
    PeriodAmounts,
    ReportLineRow,
)
from app.services.dataset_store import DatasetRecord, dataset_store
from app.services.mgmt_config_store import mgmt_config_store

UNGROUPED_ID = "ungrouped"
UNGROUPED_NAME = "未归集"
UNMAPPED_ID = "unmapped"
UNMAPPED_NAME = "未归集"
UNALLOCATED_ID = "unallocated"
UNALLOCATED_NAME = "未分摊"
TOTAL_ID = "total"
WAN = 10000.0


def _norm(value: Any) -> str:
    return str(value or "").strip()


def _norm_key(value: Any) -> str:
    return _norm(value).lower()


def _parse_year_month(value: Any) -> tuple[int, int] | None:
    text = str(value or "").strip().replace("/", "-").replace(".", "-")
    if len(text) < 7:
        return None
    parts = text.split("-")
    try:
        year = int(parts[0])
        month = int(parts[1])
    except (TypeError, ValueError, IndexError):
        return None
    if month < 1 or month > 12:
        return None
    return year, month


def _num(value: Any) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def _yoy(current: float, prior: float, *, is_rate: bool = False) -> float | None:
    if is_rate:
        if current == 0 and prior == 0:
            return None
        return round(current - prior, 1)
    if prior == 0:
        return None
    return round((current - prior) / prior * 100, 1)


def _period(h1: float, h2: float, year: float, prior_year: float, *, is_rate: bool = False) -> PeriodAmounts:
    digits = 1 if is_rate else 2
    return PeriodAmounts(
        h1=round(h1, digits),
        h2=round(h2, digits),
        year=round(year, digits),
        prior_year=round(prior_year, digits),
        yoy=_yoy(year, prior_year, is_rate=is_rate),
    )


def _empty_bucket() -> dict[str, float]:
    return {"h1": 0.0, "h2": 0.0, "year": 0.0, "prior_year": 0.0}


def _add(bucket: dict[str, float], half: str | None, is_prior: bool, amount: float) -> None:
    if is_prior:
        bucket["prior_year"] += amount
        return
    bucket[half or "h1"] += amount
    bucket["year"] += amount


def _company_datasets(company: str) -> dict[str, str | None]:
    for item in dataset_store.list_companies():
        if item["name"] == company:
            return item.get("datasets") or {}
    return {}


def _usable(domain: str, dataset_id: str | None) -> DatasetRecord | None:
    if not dataset_id:
        return None
    return dataset_store.get_usable(dataset_id, domain)


def _line_matcher(config: ManagementConfig):
    alias_map: dict[str, str] = {}
    catch_all_id: str | None = None
    for line in config.business_lines:
        alias_map[_norm_key(line.name)] = line.id
        for alias in line.aliases:
            key = _norm_key(alias)
            if key:
                alias_map[key] = line.id
        if line.catch_all:
            catch_all_id = line.id

    def match(raw: Any) -> tuple[str | None, bool]:
        key = _norm_key(raw)
        if key and key in alias_map:
            return alias_map[key], False
        return catch_all_id, True

    return match, catch_all_id


def _group_matcher(config: ManagementConfig):
    subject_map: dict[str, str] = {}
    for group in config.expense_groups:
        for subject in group.subjects:
            key = _norm_key(subject)
            if key:
                subject_map[key] = group.id

    def match(raw: Any) -> str:
        key = _norm_key(raw)
        return subject_map.get(key, UNGROUPED_ID)

    return match


def _rule_matches(rule: AllocationRuleConfig, row: dict[str, Any]) -> bool:
    if not rule.match_values:
        return False
    actual = _norm_key(row.get(rule.match_field))
    if not actual:
        return False
    allowed = {_norm_key(value) for value in rule.match_values}
    return actual in allowed


def _ratio_weights(rule: AllocationRuleConfig, line_ids: list[str]) -> dict[str, float]:
    values = {line_id: max(0.0, float(rule.ratios.get(line_id, 0) or 0)) for line_id in line_ids}
    total = sum(values.values())
    if total <= 0:
        even = 1 / len(line_ids) if line_ids else 1
        return {line_id: even for line_id in line_ids}
    return {line_id: value / total for line_id, value in values.items()}


def _mix_weights(revenues: dict[str, float], line_ids: list[str]) -> dict[str, float]:
    total = sum(max(0.0, revenues.get(line_id, 0)) for line_id in line_ids)
    if total <= 0:
        even = 1 / len(line_ids) if line_ids else 1
        return {line_id: even for line_id in line_ids}
    return {line_id: max(0.0, revenues.get(line_id, 0)) / total for line_id in line_ids}


def _fmt_wan(value: float) -> str:
    text = f"{value:,.1f}".rstrip("0").rstrip(".")
    return text


def _fmt_yoy(value: float | None) -> str:
    if value is None:
        return "—"
    sign = "+" if value > 0 else ""
    return f"{sign}{value:.1f}%"


def _build_summary(year: int, kpis: ManagementKpis, lines: list[ReportLineRow]) -> str:
    parts = [
        f"{year}全年收入 {_fmt_wan(kpis.revenue)} 万元，同比 {_fmt_yoy(kpis.revenue_yoy)}，"
        f"综合毛利率 {kpis.gross_margin:.1f}%，费用 {_fmt_wan(kpis.expense)} 万元"
    ]
    growth = [
        row for row in lines
        if row.kind == "line" and row.revenue.yoy is not None
    ]
    if growth:
        top = max(growth, key=lambda row: row.revenue.yoy or -999)
        if (top.revenue.yoy or 0) > 0:
            parts.append(f"增长最快的是{top.line_name}（同比 {_fmt_yoy(top.revenue.yoy)}）")
    if kpis.unallocated_expense:
        parts.append(f"尚有 {_fmt_wan(kpis.unallocated_expense)} 万元费用未分摊，请在配置中补充分摊规则")
    return "；".join(parts) + "。"


class ManagementService:
    def distincts(self, company: str) -> DistinctValues:
        config = mgmt_config_store.get(company)
        datasets = _company_datasets(company)
        revenue = _usable("revenue", datasets.get("revenue"))
        expense = _usable("expense", datasets.get("expense"))

        business_lines = sorted({
            _norm(row.get("business_line"))
            for row in (revenue.rows if revenue else [])
            if _norm(row.get("business_line"))
        })
        departments = sorted({
            _norm(row.get("department_name"))
            for row in (expense.rows if expense else [])
            if _norm(row.get("department_name"))
        })
        categories = sorted({
            _norm(row.get("expense_category"))
            for row in (expense.rows if expense else [])
            if _norm(row.get("expense_category"))
        })
        subjects = sorted({
            _norm(row.get("expense_subject"))
            for row in (expense.rows if expense else [])
            if _norm(row.get("expense_subject"))
        })

        match, _ = _line_matcher(config)
        mapped: list[str] = []
        unmapped: list[str] = []
        for value in business_lines:
            line_id, fallback = match(value)
            if line_id and not fallback:
                mapped.append(value)
            else:
                unmapped.append(value)
        grouped = {_norm_key(subject) for group in config.expense_groups for subject in group.subjects}
        unmapped_subjects = [subject for subject in subjects if _norm_key(subject) not in grouped]

        return DistinctValues(
            company=company,
            business_lines=business_lines,
            departments=departments,
            expense_categories=categories,
            expense_subjects=subjects,
            mapped_business_lines=mapped,
            unmapped_business_lines=unmapped,
            unmapped_subjects=unmapped_subjects,
        )

    def report(self, company: str, year: int | None = None) -> ManagementReportResponse:
        config = mgmt_config_store.get(company)
        datasets = _company_datasets(company)
        revenue_ds = _usable("revenue", datasets.get("revenue"))
        expense_ds = _usable("expense", datasets.get("expense"))
        revenue_rows = revenue_ds.rows if revenue_ds else []
        expense_rows = expense_ds.rows if expense_ds else []

        years = sorted({
            parsed[0]
            for row in [*revenue_rows, *expense_rows]
            if (parsed := _parse_year_month(row.get("trans_date")))
        })
        if not years:
            return ManagementReportResponse(
                company=company,
                year=year or 0,
                prior_year=(year or 1) - 1,
                available_years=[],
                warnings=["当前公司还没有可用的收入或费用数据，请先在 Campaign 中上传。"],
            )

        selected = year if year in years else years[-1]
        prior_year = selected - 1
        line_ids = [line.id for line in config.business_lines]
        match_line, catch_all_id = _line_matcher(config)
        match_group = _group_matcher(config)
        group_metas = [ExpenseGroupMeta(id=group.id, name=group.name) for group in config.expense_groups]
        if any(match_group(row.get("expense_subject")) == UNGROUPED_ID for row in expense_rows):
            group_metas.append(ExpenseGroupMeta(id=UNGROUPED_ID, name=UNGROUPED_NAME))

        metrics = ["revenue", "cost", "expense"]
        buckets: dict[str, dict[str, dict[str, float]]] = defaultdict(
            lambda: {metric: _empty_bucket() for metric in metrics}
        )
        group_buckets: dict[str, dict[str, dict[str, float]]] = defaultdict(
            lambda: defaultdict(_empty_bucket)
        )
        unmatched_values: set[str] = set()
        used_unmapped = False
        unallocated_count = 0

        for row in revenue_rows:
            parsed = _parse_year_month(row.get("trans_date"))
            if parsed is None:
                continue
            row_year, month = parsed
            if row_year not in {selected, prior_year}:
                continue
            raw_line = _norm(row.get("business_line"))
            line_id, fallback = match_line(raw_line)
            if line_id is None:
                line_id = UNMAPPED_ID
                used_unmapped = True
                if raw_line:
                    unmatched_values.add(raw_line)
            elif fallback and raw_line:
                unmatched_values.add(raw_line)
            half = "h1" if month <= 6 else "h2"
            is_prior = row_year == prior_year
            _add(buckets[line_id]["revenue"], half, is_prior, _num(row.get("revenue")) / WAN)
            _add(buckets[line_id]["cost"], half, is_prior, _num(row.get("cost")) / WAN)

        revenue_mix = {
            "h1": {line_id: buckets[line_id]["revenue"]["h1"] for line_id in line_ids},
            "h2": {line_id: buckets[line_id]["revenue"]["h2"] for line_id in line_ids},
            "year": {line_id: buckets[line_id]["revenue"]["year"] for line_id in line_ids},
            "prior_year": {line_id: buckets[line_id]["revenue"]["prior_year"] for line_id in line_ids},
        }

        for row in expense_rows:
            parsed = _parse_year_month(row.get("trans_date"))
            if parsed is None:
                continue
            row_year, month = parsed
            if row_year not in {selected, prior_year}:
                continue
            half = "h1" if month <= 6 else "h2"
            is_prior = row_year == prior_year
            amount = _num(row.get("amount")) / WAN
            group_id = match_group(row.get("expense_subject"))
            rule = next((item for item in config.allocation_rules if _rule_matches(item, row)), None)
            if rule is None or not line_ids:
                target = UNALLOCATED_ID
                _add(buckets[target]["expense"], half, is_prior, amount)
                _add(group_buckets[target][group_id], half, is_prior, amount)
                unallocated_count += 1
                continue
            mix_key = "prior_year" if is_prior else half
            weights = (
                _mix_weights(revenue_mix[mix_key], line_ids)
                if rule.method == "revenue_share"
                else _ratio_weights(rule, line_ids)
            )
            for line_id, weight in weights.items():
                share = amount * weight
                if share == 0:
                    continue
                _add(buckets[line_id]["expense"], half, is_prior, share)
                _add(group_buckets[line_id][group_id], half, is_prior, share)

        warnings: list[str] = []
        if unmatched_values and catch_all_id:
            warnings.append(
                "以下收入业务线未单独配置，已计入兜底「"
                + next(line.name for line in config.business_lines if line.id == catch_all_id)
                + f"」：{'、'.join(sorted(unmatched_values))}"
            )
        elif unmatched_values:
            warnings.append(f"以下收入业务线未映射：{'、'.join(sorted(unmatched_values))}")
        if unallocated_count:
            warnings.append(f"有 {unallocated_count} 条费用未命中分摊规则，已列入「未分摊」。")

        ordered_ids = list(line_ids)
        if used_unmapped:
            ordered_ids.append(UNMAPPED_ID)
        if any(buckets[UNALLOCATED_ID]["expense"].values()):
            ordered_ids.append(UNALLOCATED_ID)

        name_map = {line.id: line.name for line in config.business_lines}
        name_map[UNMAPPED_ID] = UNMAPPED_NAME
        name_map[UNALLOCATED_ID] = UNALLOCATED_NAME
        kind_map = {line.id: "line" for line in config.business_lines}
        kind_map[UNMAPPED_ID] = "unmapped"
        kind_map[UNALLOCATED_ID] = "unallocated"

        rows: list[ReportLineRow] = []
        totals = {metric: _empty_bucket() for metric in metrics}
        total_groups: dict[str, dict[str, float]] = defaultdict(_empty_bucket)

        for line_id in ordered_ids:
            revenue = buckets[line_id]["revenue"]
            cost = buckets[line_id]["cost"]
            expense = buckets[line_id]["expense"]
            gp = {
                key: revenue[key] - cost[key]
                for key in ("h1", "h2", "year", "prior_year")
            }
            margin = {
                key: (gp[key] / revenue[key] * 100) if revenue[key] else 0.0
                for key in gp
            }
            group_out: dict[str, PeriodAmounts] = {}
            for meta in group_metas:
                gb = group_buckets[line_id][meta.id]
                group_out[meta.id] = _period(gb["h1"], gb["h2"], gb["year"], gb["prior_year"])
                for key in totals["expense"]:
                    total_groups[meta.id][key] += gb[key]
            rows.append(
                ReportLineRow(
                    line_id=line_id,
                    line_name=name_map[line_id],
                    kind=kind_map[line_id],  # type: ignore[arg-type]
                    revenue=_period(**revenue),
                    cost=_period(**cost),
                    gross_profit=_period(**gp),
                    gross_margin=_period(**margin, is_rate=True),
                    expense=_period(**expense),
                    expense_groups=group_out,
                )
            )
            for metric, bucket in (("revenue", revenue), ("cost", cost), ("expense", expense)):
                for key in totals[metric]:
                    totals[metric][key] += bucket[key]

        gp_total = {
            key: totals["revenue"][key] - totals["cost"][key]
            for key in ("h1", "h2", "year", "prior_year")
        }
        margin_total = {
            key: (gp_total[key] / totals["revenue"][key] * 100) if totals["revenue"][key] else 0.0
            for key in gp_total
        }
        total_group_out = {
            meta.id: _period(
                total_groups[meta.id]["h1"],
                total_groups[meta.id]["h2"],
                total_groups[meta.id]["year"],
                total_groups[meta.id]["prior_year"],
            )
            for meta in group_metas
        }
        rows.append(
            ReportLineRow(
                line_id=TOTAL_ID,
                line_name="总计",
                kind="total",
                revenue=_period(**totals["revenue"]),
                cost=_period(**totals["cost"]),
                gross_profit=_period(**gp_total),
                gross_margin=_period(**margin_total, is_rate=True),
                expense=_period(**totals["expense"]),
                expense_groups=total_group_out,
            )
        )

        kpis = ManagementKpis(
            revenue=round(totals["revenue"]["year"], 2),
            revenue_prior=round(totals["revenue"]["prior_year"], 2),
            revenue_yoy=_yoy(totals["revenue"]["year"], totals["revenue"]["prior_year"]),
            gross_profit=round(gp_total["year"], 2),
            gross_margin=round(margin_total["year"], 1),
            expense=round(totals["expense"]["year"], 2),
            unallocated_expense=round(buckets[UNALLOCATED_ID]["expense"]["year"], 2),
        )
        return ManagementReportResponse(
            company=company,
            year=selected,
            prior_year=prior_year,
            available_years=years,
            has_revenue=bool(revenue_rows),
            has_expense=bool(expense_rows),
            kpis=kpis,
            lines=rows,
            groups=group_metas,
            warnings=warnings,
            summary=_build_summary(selected, kpis, rows),
            is_live_data=True,
        )


management_service = ManagementService()
