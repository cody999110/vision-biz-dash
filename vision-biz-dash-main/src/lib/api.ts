const API_BASE = "/api/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed: ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export type Domain = "expense" | "revenue" | "fund";
export type DatasetStatus = "draft" | "validating" | "validated" | "failed" | "active" | "archived";

export interface ImportTemplateSummary {
  code: string;
  name: string;
  domain: Domain;
  version: string;
  description: string;
}

export interface ImportTemplateListResponse {
  items: ImportTemplateSummary[];
  total: number;
}

export interface DatasetSummary {
  id: string;
  name: string;
  company: string;
  domain: Domain;
  template_code: string;
  status: DatasetStatus;
  row_count: number;
  error_count: number;
  data_as_of: string | null;
  created_at: string;
  activated_at: string | null;
}

export interface DatasetListResponse {
  items: DatasetSummary[];
  total: number;
}

export interface CompanyView {
  name: string;
  datasets: {
    expense?: string | null;
    revenue?: string | null;
    fund?: string | null;
  };
  data_as_of: string | null;
}

export interface CompanyListResponse {
  items: CompanyView[];
  total: number;
}

export interface DatasetDetail extends DatasetSummary {
  errors: string[];
  preview_rows: Record<string, unknown>[];
}

export interface UploadResult {
  batch_id: string;
  dataset_id: string;
  status: DatasetStatus;
  total_rows: number;
  success_rows: number;
  error_rows: number;
  can_activate: boolean;
  message: string;
  errors: string[];
}

export interface DataFreshnessResponse {
  label: string;
  source_mode: string;
  dataset_id: string | null;
  dataset_name: string | null;
}

export interface LiveDataMeta {
  source_mode: string;
  dataset_id: string | null;
  is_live_data: boolean;
}

export interface FundKpiResponse extends LiveDataMeta {
  total: number;
  bank_deposit: number;
  cash_on_hand: number;
  short_term_investment: number;
  change: number;
}

export interface RevenueTrendPoint {
  month: string;
  revenue: number;
  gross_profit: number;
  gross_margin: number;
}

export interface RevenueTrendResponse extends LiveDataMeta {
  years: Record<string, RevenueTrendPoint[]>;
}

export interface TopCustomerItem {
  name: string;
  sales: number;
  percentage: number;
  trend: number | null;
}

export interface TopCustomersResponse extends LiveDataMeta {
  items: TopCustomerItem[];
}

export interface RegionSalesResponse extends LiveDataMeta {
  regions: Record<string, number>;
}

export interface ProductMarginItem {
  name: string;
  margin: number;
  revenue: number;
  color: string;
}

export interface ProductMarginResponse extends LiveDataMeta {
  items: ProductMarginItem[];
}

export interface ExpenseStructureItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface ExpenseStructureResponse extends LiveDataMeta {
  year: string;
  items: ExpenseStructureItem[];
}

export const api = {
  listTemplates(domain?: Domain) {
    const query = domain ? `?domain=${domain}` : "";
    return request<ImportTemplateListResponse>(`/import/templates${query}`);
  },

  downloadTemplate(code: string) {
    return `${API_BASE}/import/templates/${code}/download`;
  },

  listDatasets(domain?: Domain) {
    const query = domain ? `?domain=${domain}` : "";
    return request<DatasetListResponse>(`/import/datasets${query}`);
  },

  listCompanies() {
    return request<CompanyListResponse>("/import/datasets/companies");
  },

  createDataset(payload: { name: string; company: string; domain: Domain; template_code: string }) {
    return request<DatasetDetail>("/import/datasets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  uploadDataset(datasetId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request<UploadResult>(`/import/datasets/${datasetId}/upload`, {
      method: "POST",
      body: formData,
    });
  },

  activateDataset(datasetId: string) {
    return request<{ dataset_id: string; status: DatasetStatus; message: string }>(
      `/import/datasets/${datasetId}/activate`,
      { method: "POST" },
    );
  },

  getDataFreshness(datasetId?: string) {
    const query = datasetId ? `?source_mode=dataset&dataset_id=${datasetId}` : "";
    return request<DataFreshnessResponse>(`/meta/data-freshness${query}`);
  },

  getFundKpi(datasetId?: string) {
    const query = datasetId ? `?dataset_id=${datasetId}` : "";
    return request<FundKpiResponse>(`/dashboard/fund-kpi${query}`);
  },

  getRevenueTrend(years: string[], datasetId?: string) {
    const params = new URLSearchParams();
    if (years.length) params.set("years", years.join(","));
    if (datasetId) params.set("dataset_id", datasetId);
    const query = params.toString();
    return request<RevenueTrendResponse>(`/dashboard/revenue-trend${query ? `?${query}` : ""}`);
  },

  getTopCustomers(datasetId?: string) {
    const query = datasetId ? `?dataset_id=${datasetId}` : "";
    return request<TopCustomersResponse>(`/dashboard/top-customers${query}`);
  },

  getRegionSales(datasetId?: string) {
    const query = datasetId ? `?dataset_id=${datasetId}` : "";
    return request<RegionSalesResponse>(`/dashboard/region-sales${query}`);
  },

  getProductMargin(datasetId?: string) {
    const query = datasetId ? `?dataset_id=${datasetId}` : "";
    return request<ProductMarginResponse>(`/dashboard/product-margin${query}`);
  },

  getExpenseStructure(year: string, datasetId?: string) {
    const params = new URLSearchParams({ year });
    if (datasetId) params.set("dataset_id", datasetId);
    return request<ExpenseStructureResponse>(`/dashboard/expense-structure?${params.toString()}`);
  },
};
