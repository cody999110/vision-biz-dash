from __future__ import annotations

from fastapi import APIRouter, Query

from app.schemas.dashboard import DataFreshnessResponse
from app.services.dataset_store import dataset_store

router = APIRouter()


@router.get("/data-freshness", response_model=DataFreshnessResponse)
def get_data_freshness(
    source_mode: str = Query(default="official"),
    dataset_id: str | None = Query(default=None),
) -> DataFreshnessResponse:
    if source_mode == "dataset" and dataset_id:
        record = dataset_store.get(dataset_id)
        if record and record.data_as_of:
            return DataFreshnessResponse(
                label=f"{record.data_as_of[:4]}年{int(record.data_as_of[5:7])}月",
                source_mode="dataset",
                dataset_id=record.id,
                dataset_name=record.name,
            )

    return DataFreshnessResponse(label="演示数据", source_mode="official")
