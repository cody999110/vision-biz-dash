from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class TemplateColumnSchema(BaseModel):
    key: str
    label: str
    required: bool
    type: str
    description: str = ""
    enum_values: list[str] = Field(default_factory=list)
    example: str = ""


class ImportTemplateSummary(BaseModel):
    code: str
    name: str
    domain: Literal["expense", "revenue", "fund", "dashboard"]
    version: str
    description: str
    fact_table: str
    column_count: int
    required_column_count: int


class ImportTemplateDetail(ImportTemplateSummary):
    columns: list[TemplateColumnSchema]
    download_csv_url: str
    download_xlsx_url: str


class ImportTemplateListResponse(BaseModel):
    items: list[ImportTemplateSummary]
    total: int
