from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

DatasetStatus = Literal["draft", "validating", "validated", "failed", "active", "archived"]
Domain = Literal["expense", "revenue", "fund"]


class CreateDatasetRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    company: str = Field(min_length=1, max_length=100)
    domain: Domain
    template_code: str


class DatasetSummary(BaseModel):
    id: str
    name: str
    company: str
    domain: Domain
    template_code: str
    status: DatasetStatus
    row_count: int = 0
    error_count: int = 0
    data_as_of: str | None = None
    created_at: datetime
    activated_at: datetime | None = None


class CompanyDatasets(BaseModel):
    expense: str | None = None
    revenue: str | None = None
    fund: str | None = None


class CompanyView(BaseModel):
    name: str
    datasets: CompanyDatasets
    data_as_of: str | None = None


class CompanyListResponse(BaseModel):
    items: list[CompanyView]
    total: int


class DatasetListResponse(BaseModel):
    items: list[DatasetSummary]
    total: int


class DatasetColumn(BaseModel):
    key: str
    label: str


class DatasetDetail(DatasetSummary):
    errors: list[str] = Field(default_factory=list)
    preview_rows: list[dict[str, str | float | int | None]] = Field(default_factory=list)
    columns: list[DatasetColumn] = Field(default_factory=list)


class UploadResult(BaseModel):
    batch_id: str
    dataset_id: str
    status: DatasetStatus
    total_rows: int
    success_rows: int
    error_rows: int
    can_activate: bool
    message: str
    errors: list[str] = Field(default_factory=list)


class ActivateResult(BaseModel):
    dataset_id: str
    status: DatasetStatus
    message: str
