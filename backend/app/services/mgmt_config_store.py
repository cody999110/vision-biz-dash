from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from app.config import settings
from app.schemas.management import ManagementConfig, ManagementConfigUpdate


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def default_config(company: str) -> ManagementConfig:
    return ManagementConfig(
        company=company,
        business_lines=[{"id": "line_other", "name": "其他", "aliases": [], "catch_all": True}],
        expense_groups=[],
        allocation_rules=[],
        updated_at=None,
    )


class MgmtConfigStore:
    def __init__(self, root: Path | None = None) -> None:
        self.root = root or settings.mgmt_config_dir
        self.root.mkdir(parents=True, exist_ok=True)

    def _slug(self, company: str) -> str:
        safe = "".join(ch if ch.isalnum() or ch in "-_." else "_" for ch in company).strip("._") or "company"
        digest = hashlib.sha256(company.encode("utf-8")).hexdigest()[:10]
        return f"{safe[:40]}_{digest}"

    def _path(self, company: str) -> Path:
        return self.root / f"{self._slug(company)}.json"

    def get(self, company: str) -> ManagementConfig:
        path = self._path(company)
        if not path.exists():
            return default_config(company)
        payload = json.loads(path.read_text(encoding="utf-8"))
        return ManagementConfig.model_validate(payload)

    def save(self, company: str, update: ManagementConfigUpdate) -> ManagementConfig:
        record = ManagementConfig(
            company=company,
            business_lines=update.business_lines,
            expense_groups=update.expense_groups,
            allocation_rules=update.allocation_rules,
            updated_at=_utc_now(),
        )
        self._path(company).write_text(
            json.dumps(record.model_dump(), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return record

    def delete(self, company: str) -> bool:
        path = self._path(company)
        if not path.exists():
            return False
        path.unlink()
        return True


mgmt_config_store = MgmtConfigStore()
