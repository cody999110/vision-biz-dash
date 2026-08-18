import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Building2, Download, Eye, Upload, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api, type DatasetDetail, type DatasetSummary, type Domain, type ImportTemplateSummary } from "@/lib/api";
import { useDataSource } from "@/contexts/DataSourceContext";
import { cn } from "@/lib/utils";

const DOMAIN_LABELS: Record<Domain, string> = {
  expense: "费用",
  revenue: "收入成本",
  fund: "资金",
};

const DOMAINS: Domain[] = ["revenue", "expense", "fund"];

function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export default function CampaignManager() {
  const {
    companies,
    refreshCompanies,
    selectView,
    campaignOpen: open,
    setCampaignOpen: setOpen,
    campaignPreset,
  } = useDataSource();
  const [company, setCompany] = useState("");
  const [domain, setDomain] = useState<Domain>("revenue");
  const [templates, setTemplates] = useState<ImportTemplateSummary[]>([]);
  const [templateCode, setTemplateCode] = useState("");
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [step, setStep] = useState<"create" | "upload" | "done" | "preview">("create");
  const [datasetSummaries, setDatasetSummaries] = useState<DatasetSummary[]>([]);
  const [preview, setPreview] = useState<DatasetDetail | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const summariesById = useMemo(() => {
    const map = new Map<string, DatasetSummary>();
    for (const item of datasetSummaries) map.set(item.id, item);
    return map;
  }, [datasetSummaries]);

  useEffect(() => {
    if (!open) return;
    api.listTemplates(domain).then(res => {
      setTemplates(res.items);
      setTemplateCode(res.items[0]?.code ?? "");
    });
  }, [open, domain]);

  useEffect(() => {
    if (!open) return;
    api.listDatasets().then(res => setDatasetSummaries(res.items)).catch(() => setDatasetSummaries([]));
  }, [open, companies]);

  useEffect(() => {
    if (!open || !campaignPreset) return;
    if (campaignPreset.company) setCompany(campaignPreset.company);
    if (campaignPreset.domain) setDomain(campaignPreset.domain);
    setDatasetId(null);
    setUpdating(false);
    setPreview(null);
    setStep("create");
  }, [open, campaignPreset]);

  const resetForm = () => {
    setCompany("");
    setDomain("revenue");
    setDatasetId(null);
    setUpdating(false);
    setPreview(null);
    setStep("create");
  };

  const startUpdate = (id: string, companyName: string, domainValue: Domain) => {
    setCompany(companyName);
    setDomain(domainValue);
    setDatasetId(id);
    setUpdating(true);
    setPreview(null);
    setStep("upload");
  };

  const openPreview = async (id: string, companyName: string, domainValue: Domain) => {
    setCompany(companyName);
    setDomain(domainValue);
    setDatasetId(id);
    setUpdating(true);
    setStep("preview");
    setPreviewLoading(true);
    try {
      setPreview(await api.getDataset(id, 80));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "加载数据失败");
      setStep("create");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!company.trim() || !templateCode) {
      toast.error("请填写公司名称并选择模板");
      return;
    }
    const existingId = companies.find(item => item.name === company.trim())?.datasets[domain];
    if (existingId) {
      startUpdate(existingId, company.trim(), domain);
      toast.info("该公司该数据域已有数据，上传将覆盖现有记录。建议先下载再修改。");
      return;
    }
    try {
      const name = `${company.trim()} · ${DOMAIN_LABELS[domain]}`;
      const dataset = await api.createDataset({
        name,
        company: company.trim(),
        domain,
        template_code: templateCode,
      });
      setDatasetId(dataset.id);
      setUpdating(false);
      setStep("upload");
      toast.success("已创建，请上传 CSV 文件");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "创建失败");
    }
  };

  const handleUpload = async (file: File) => {
    if (!datasetId) return;
    setUploading(true);
    try {
      const result = await api.uploadDataset(datasetId, file);
      if (result.can_activate) {
        await refreshCompanies();
        selectView(company.trim());
        setStep("done");
        toast.success(
          updating
            ? `已覆盖更新「${company.trim()}」的${DOMAIN_LABELS[domain]}数据`
            : `已上传，顶部数据视图已切换到「${company.trim()}」`,
        );
      } else {
        toast.error(`校验未通过：${result.errors[0] ?? "请检查 CSV 格式"}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "上传失败");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) resetForm(); }}>
      <DialogContent className={cn(step === "preview" ? "max-w-4xl" : "max-w-lg")}>
        <DialogHeader>
          <DialogTitle>Campaign 数据管理（按公司）</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {companies.length > 0 && step !== "preview" && (
            <div className="rounded-lg border border-border p-3 space-y-3">
              <div className="text-xs font-semibold text-muted-foreground">已上传公司</div>
              {companies.map(item => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    {item.name}
                  </div>
                  {DOMAINS.filter(d => item.datasets[d]).map(d => {
                    const id = item.datasets[d] as string;
                    const meta = summariesById.get(id);
                    return (
                      <div key={d} className="flex items-center justify-between gap-2 pl-5">
                        <div className="min-w-0 flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] shrink-0">{DOMAIN_LABELS[d]}</Badge>
                          <span className="text-[11px] text-muted-foreground truncate">
                            {meta ? `${meta.row_count} 行` : "已上传"}
                            {meta?.data_as_of ? ` · 截至 ${meta.data_as_of}` : ""}
                          </span>
                        </div>
                        <div className="flex items-center shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[11px] gap-1"
                            onClick={() => void openPreview(id, item.name, d)}
                          >
                            <Eye className="w-3 h-3" /> 查看
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1" asChild>
                            <a href={api.downloadDataset(id)} download>
                              <Download className="w-3 h-3" /> 下载
                            </a>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[11px] gap-1"
                            onClick={() => startUpdate(id, item.name, d)}
                          >
                            <Upload className="w-3 h-3" /> 更新
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground pt-1">
                可下载已有 CSV 修改后点「更新」覆盖上传；要给同一家公司补充其它数据域，填写相同公司名称即可。
              </p>
            </div>
          )}

          {step === "create" && (
            <div className="space-y-3">
              <Input
                placeholder="公司名称，例如：ABC 公司"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <Select value={domain} onValueChange={(value: Domain) => setDomain(value)}>
                <SelectTrigger><SelectValue placeholder="选择数据域" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">收入成本</SelectItem>
                  <SelectItem value="expense">费用</SelectItem>
                  <SelectItem value="fund">资金</SelectItem>
                </SelectContent>
              </Select>
              <Select value={templateCode} onValueChange={setTemplateCode}>
                <SelectTrigger><SelectValue placeholder="选择模板" /></SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.code} value={template.code}>{template.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {templateCode && (
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <a href={api.downloadTemplate(templateCode)} download>
                    <Download className="w-3.5 h-3.5" /> 下载 CSV 模板
                  </a>
                </Button>
              )}
              <Button className="w-full gap-1.5" onClick={handleCreate}>
                <Zap className="w-3.5 h-3.5" /> 创建并进入上传
              </Button>
            </div>
          )}

          {step === "upload" && (
            <div className="space-y-3">
              {updating ? (
                <div className="rounded-lg bg-muted/40 p-3 space-y-2">
                  <p className="text-sm">
                    正在更新「{company.trim()}」的{DOMAIN_LABELS[domain]}数据，上传将覆盖现有记录。
                  </p>
                  <p className="text-xs text-muted-foreground">
                    建议先下载当前数据，改完后再选文件上传。
                  </p>
                  {datasetId && (
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <a href={api.downloadDataset(datasetId)} download>
                        <Download className="w-3.5 h-3.5" /> 下载当前数据
                      </a>
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  请上传填好数据的 CSV（保留第 1 行 key、第 2 行中文 label，从第 3 行开始填数据）。
                </p>
              )}
              <label className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 cursor-pointer hover:bg-muted/40">
                <Upload className="w-5 h-5 text-primary" />
                <span className="text-sm">{uploading ? "上传中..." : "点击选择 CSV 文件"}</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void handleUpload(file);
                  }}
                />
              </label>
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { setUpdating(false); setDatasetId(null); setStep("create"); }}>
                <ArrowLeft className="w-3.5 h-3.5" /> 返回
              </Button>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-medium">
                    {company} · {DOMAIN_LABELS[domain]}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {previewLoading
                      ? "加载中..."
                      : preview
                        ? `共 ${preview.row_count} 行，预览前 ${preview.preview_rows.length} 行。下载后可修改再点「更新」覆盖。`
                        : "暂无预览"}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {datasetId && (
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <a href={api.downloadDataset(datasetId)} download>
                        <Download className="w-3.5 h-3.5" /> 下载 CSV
                      </a>
                    </Button>
                  )}
                  {datasetId && (
                    <Button size="sm" className="gap-1.5" onClick={() => startUpdate(datasetId, company, domain)}>
                      <Upload className="w-3.5 h-3.5" /> 更新上传
                    </Button>
                  )}
                </div>
              </div>
              <div className="rounded-lg border border-border max-h-80 overflow-auto">
                {preview && preview.preview_rows.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-muted/90 backdrop-blur-sm">
                      <tr>
                        {(preview.columns.length ? preview.columns : Object.keys(preview.preview_rows[0]).map(key => ({ key, label: key }))).map(col => (
                          <th key={col.key} className="text-left font-medium text-muted-foreground whitespace-nowrap px-2 py-2 border-b">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.preview_rows.map((row, index) => (
                        <tr key={index} className="border-b last:border-0">
                          {(preview.columns.length ? preview.columns.map(col => col.key) : Object.keys(row)).map(key => (
                            <td key={key} className="px-2 py-1.5 whitespace-nowrap text-foreground/90">
                              {formatCell(row[key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  !previewLoading && <p className="text-sm text-muted-foreground p-6 text-center">没有可预览的数据行</p>
                )}
              </div>
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { setPreview(null); setUpdating(false); setDatasetId(null); setStep("create"); }}>
                <ArrowLeft className="w-3.5 h-3.5" /> 返回
              </Button>
            </div>
          )}

          {step === "done" && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/40 p-4 text-sm">
                {updating ? "覆盖更新成功" : "上传成功"}。顶部「数据视图」已切换到「{company.trim()}」，看板仅展示该公司数据；
                切回「演示数据（示例公司）」即可查看示例数据。之后可随时在上方下载或再次更新。
              </div>
              <Button variant="outline" className="w-full" onClick={resetForm}>
                继续为其它公司/数据域上传
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
