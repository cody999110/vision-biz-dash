from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, model_validator

MatchField = Literal["expense_category", "department_name", "expense_subject"]
AllocationMethod = Literal["ratio", "revenue_share"]
RowKind = Literal["line", "unmapped", "unallocated", "total"]


class BusinessLineConfig(BaseModel):
    id: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=80)
    aliases: list[str] = Field(default_factory=list)
    catch_all: bool = False


class ExpenseGroupConfig(BaseModel):
    id: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=80)
    subjects: list[str] = Field(default_factory=list)


class AllocationRuleConfig(BaseModel):
    id: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=80)
    match_field: MatchField
    match_values: list[str] = Field(default_factory=list)
    method: AllocationMethod = "ratio"
    ratios: dict[str, float] = Field(default_factory=dict)


class ManagementConfig(BaseModel):
    company: str
    business_lines: list[BusinessLineConfig] = Field(default_factory=list)
    expense_groups: list[ExpenseGroupConfig] = Field(default_factory=list)
    allocation_rules: list[AllocationRuleConfig] = Field(default_factory=list)
    updated_at: str | None = None

    @model_validator(mode="after")
    def _one_catch_all(self) -> ManagementConfig:
        count = sum(1 for line in self.business_lines if line.catch_all)
        if count > 1:
            raise ValueError("只能有一个兜底业务线")
        return self


class ManagementConfigUpdate(BaseModel):
    business_lines: list[BusinessLineConfig]
    expense_groups: list[ExpenseGroupConfig] = Field(default_factory=list)
    allocation_rules: list[AllocationRuleConfig] = Field(default_factory=list)

    @model_validator(mode="after")
    def _one_catch_all(self) -> ManagementConfigUpdate:
        count = sum(1 for line in self.business_lines if line.catch_all)
        if count > 1:
            raise ValueError("只能有一个兜底业务线")
        return self


class DistinctValues(BaseModel):
    company: str
    business_lines: list[str]
    departments: list[str]
    expense_categories: list[str]
    expense_subjects: list[str]
    mapped_business_lines: list[str]
    unmapped_business_lines: list[str]
    unmapped_subjects: list[str]


class PeriodAmounts(BaseModel):
    h1: float = 0
    h2: float = 0
    year: float = 0
    prior_year: float = 0
    yoy: float | None = None


class ReportLineRow(BaseModel):
    line_id: str
    line_name: str
    kind: RowKind = "line"
    revenue: PeriodAmounts = Field(default_factory=PeriodAmounts)
    cost: PeriodAmounts = Field(default_factory=PeriodAmounts)
    gross_profit: PeriodAmounts = Field(default_factory=PeriodAmounts)
    gross_margin: PeriodAmounts = Field(default_factory=PeriodAmounts)
    expense: PeriodAmounts = Field(default_factory=PeriodAmounts)
    expense_groups: dict[str, PeriodAmounts] = Field(default_factory=dict)


class ExpenseGroupMeta(BaseModel):
    id: str
    name: str


class ManagementKpis(BaseModel):
    revenue: float = 0
    revenue_prior: float = 0
    revenue_yoy: float | None = None
    gross_profit: float = 0
    gross_margin: float = 0
    expense: float = 0
    unallocated_expense: float = 0


class ManagementReportResponse(BaseModel):
    company: str
    year: int
    prior_year: int
    available_years: list[int]
    has_revenue: bool = False
    has_expense: bool = False
    kpis: ManagementKpis = Field(default_factory=ManagementKpis)
    lines: list[ReportLineRow] = Field(default_factory=list)
    groups: list[ExpenseGroupMeta] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    summary: str = ""
    is_live_data: bool = False
