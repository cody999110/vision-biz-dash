from __future__ import annotations

from pydantic import BaseModel, Field


class FundKpiResponse(BaseModel):
    total: float
    bank_deposit: float
    cash_on_hand: float
    short_term_investment: float
    change: float
    source_mode: str
    dataset_id: str | None = None
    is_live_data: bool = False


class RevenueTrendPoint(BaseModel):
    month: str
    revenue: float
    gross_profit: float
    gross_margin: float


class RevenueTrendResponse(BaseModel):
    years: dict[str, list[RevenueTrendPoint]]
    source_mode: str
    dataset_id: str | None = None
    is_live_data: bool = False


class TopCustomerItem(BaseModel):
    name: str
    sales: float
    percentage: float
    trend: float | None = None


class TopCustomersResponse(BaseModel):
    items: list[TopCustomerItem]
    source_mode: str
    dataset_id: str | None = None
    is_live_data: bool = False


class RegionSalesResponse(BaseModel):
    regions: dict[str, float]
    source_mode: str
    dataset_id: str | None = None
    is_live_data: bool = False


class ProductMarginItem(BaseModel):
    name: str
    margin: float
    revenue: float
    color: str


class ProductMarginResponse(BaseModel):
    items: list[ProductMarginItem]
    source_mode: str
    dataset_id: str | None = None
    is_live_data: bool = False


class ExpenseStructureItem(BaseModel):
    category: str
    amount: float
    percentage: float
    color: str


class ExpenseStructureResponse(BaseModel):
    year: str
    items: list[ExpenseStructureItem]
    source_mode: str
    dataset_id: str | None = None
    is_live_data: bool = False


class DataFreshnessResponse(BaseModel):
    label: str
    source_mode: str
    dataset_id: str | None = None
    dataset_name: str | None = None
