from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from app.schemas.dataset import (
    ActivateResult,
    CompanyListResponse,
    CompanyView,
    CreateDatasetRequest,
    DatasetDetail,
    DatasetListResponse,
    DatasetSummary,
    UploadResult,
)
from app.services.dataset_store import dataset_store
from app.services.import_service import ImportValidationError, import_dataset_file, new_batch_id
from app.templates.definitions import get_template

router = APIRouter()


def _to_summary(record) -> DatasetSummary:
    return DatasetSummary(
        id=record.id,
        name=record.name,
        company=record.company,
        domain=record.domain,
        template_code=record.template_code,
        status=record.status,
        row_count=record.row_count,
        error_count=record.error_count,
        data_as_of=record.data_as_of,
        created_at=record.created_at,
        activated_at=record.activated_at,
    )


@router.get("", response_model=DatasetListResponse)
def list_datasets(domain: str | None = Query(default=None)) -> DatasetListResponse:
    items = [_to_summary(record) for record in dataset_store.list_all(domain)]
    return DatasetListResponse(items=items, total=len(items))


@router.get("/companies", response_model=CompanyListResponse)
def list_companies() -> CompanyListResponse:
    items = [CompanyView(**company) for company in dataset_store.list_companies()]
    return CompanyListResponse(items=items, total=len(items))


@router.post("", response_model=DatasetDetail)
def create_dataset(payload: CreateDatasetRequest) -> DatasetDetail:
    template = get_template(payload.template_code)
    if template is None:
        raise HTTPException(status_code=400, detail=f"Unknown template: {payload.template_code}")
    if template.domain != payload.domain:
        raise HTTPException(status_code=400, detail="Template domain does not match dataset domain")

    record = dataset_store.create(payload.name, payload.company, payload.domain, payload.template_code)
    return DatasetDetail(**_to_summary(record).model_dump(), errors=[], preview_rows=[])


@router.get("/{dataset_id}", response_model=DatasetDetail)
def get_dataset(dataset_id: str) -> DatasetDetail:
    record = dataset_store.get(dataset_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return DatasetDetail(
        **_to_summary(record).model_dump(),
        errors=record.errors,
        preview_rows=record.rows[:10],
    )


@router.post("/{dataset_id}/upload", response_model=UploadResult)
async def upload_dataset(dataset_id: str, file: UploadFile = File(...)) -> UploadResult:
    record = dataset_store.get(dataset_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Dataset not found")

    content = await file.read()
    try:
        record = import_dataset_file(dataset_id, content)
    except ImportValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    can_activate = record.status == "validated" and len(record.rows) > 0
    return UploadResult(
        batch_id=new_batch_id(),
        dataset_id=record.id,
        status=record.status,
        total_rows=record.row_count,
        success_rows=len(record.rows),
        error_rows=record.error_count,
        can_activate=can_activate,
        message="上传完成，请查看校验结果",
        errors=record.errors[:10],
    )


@router.post("/{dataset_id}/activate", response_model=ActivateResult)
def activate_dataset(dataset_id: str) -> ActivateResult:
    record = dataset_store.get(dataset_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    if not record.rows:
        raise HTTPException(status_code=400, detail="Dataset has no valid rows")

    try:
        record = dataset_store.activate(dataset_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return ActivateResult(dataset_id=record.id, status=record.status, message="Campaign 已激活，看板将展示上传数据")


@router.delete("/{dataset_id}")
def delete_dataset(dataset_id: str) -> dict[str, bool]:
    if not dataset_store.delete(dataset_id):
        raise HTTPException(status_code=404, detail="Dataset not found")
    return {"deleted": True}
