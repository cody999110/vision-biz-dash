from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import Response

from app.config import settings
from app.schemas.import_template import ImportTemplateDetail, ImportTemplateListResponse
from app.services.template_service import TemplateNotFoundError, template_service

router = APIRouter()

DomainQuery = Literal["expense", "revenue", "fund", "dashboard"]


@router.get("", response_model=ImportTemplateListResponse)
def list_import_templates(
    domain: DomainQuery | None = Query(default=None, description="按业务域筛选模板"),
) -> ImportTemplateListResponse:
    return template_service.list_templates(domain)


@router.get("/{code}", response_model=ImportTemplateDetail)
def get_import_template(code: str, request: Request) -> ImportTemplateDetail:
    api_prefix = str(request.base_url).rstrip("/") + settings.api_v1_prefix
    try:
        return template_service.get_template_detail(code, api_prefix)
    except TemplateNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{code}/download")
def download_import_template_csv(code: str) -> Response:
    try:
        filename, content = template_service.build_csv(code)
    except TemplateNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return Response(
        content=content,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{code}/download.xlsx")
def download_import_template_xlsx(code: str) -> Response:
    try:
        filename, content = template_service.build_xlsx(code)
    except TemplateNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return Response(
        content=content,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
