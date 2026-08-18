from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.schemas.management import (
    DistinctValues,
    ManagementConfig,
    ManagementConfigUpdate,
    ManagementReportResponse,
)
from app.services.management_service import management_service
from app.services.mgmt_config_store import mgmt_config_store

router = APIRouter()


@router.get("/config", response_model=ManagementConfig)
def get_management_config(company: str = Query(..., min_length=1, max_length=100)) -> ManagementConfig:
    return mgmt_config_store.get(company)


@router.put("/config", response_model=ManagementConfig)
def put_management_config(
    payload: ManagementConfigUpdate,
    company: str = Query(..., min_length=1, max_length=100),
) -> ManagementConfig:
    if not payload.business_lines:
        raise HTTPException(status_code=400, detail="至少配置一条业务线")
    return mgmt_config_store.save(company, payload)


@router.get("/distincts", response_model=DistinctValues)
def get_management_distincts(company: str = Query(..., min_length=1, max_length=100)) -> DistinctValues:
    return management_service.distincts(company)


@router.get("/report", response_model=ManagementReportResponse)
def get_management_report(
    company: str = Query(..., min_length=1, max_length=100),
    year: int | None = Query(default=None),
) -> ManagementReportResponse:
    return management_service.report(company, year)
