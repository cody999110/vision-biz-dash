import { useEffect, useState } from "react";
import { Building2, Download, FolderPlus, Upload, Zap } from "lucide-react";
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
import { api, type Domain, type ImportTemplateSummary } from "@/lib/api";
import { useDataSource } from "@/contexts/DataSourceContext";

const DOMAIN_LABELS: Record<Domain, string> = {
  expense: "费用",
  revenue: "收入成本",
  fund: "资金",
};

export default function CampaignManager() {
  const {
    companies,
    refreshCompanies,
    selectView,
    campaignOpen: open,
    setCampaignOpen: setOpen,
    campaignPreset,
    openCampaign,
  } = useDataSource();
  const [company, setCompany] = useState("");
  const [domain, setDomain] = useState<Domain>("revenue");
  const [templates, setTemplates] = useState<ImportTemplateSummary[]>([]);
  const [templateCode, setTemplateCode] = useState("");
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<"create" | "upload" | "done">("create");

  useEffect(() => {
    if (!open) return;
    api.listTemplates(domain).then(res => {
      setTemplates(res.items);
      setTemplateCode(res.items[0]?.code ?? "");
    });
  }, [open, domain]);

  useEffect(() => {
    if (!open || !campaignPreset) return;
    if (campaignPreset.company) setCompany(campaignPreset.company);
    if (campaignPreset.domain) setDomain(campaignPreset.domain);
    setDatasetId(null);
    setStep("create");
  }, [open, campaignPreset]);

  const resetForm = () => {
    setCompany("");
    setDomain("revenue");
    setDatasetId(null);
    setStep("create");
  };

  const handleCreate = async () => {
    if (!company.trim() || !templateCode) {
      toast.error("请填写公司名称并选择模板");
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
        toast.success(`已上传，顶部数据视图已切换到「${company.trim()}」`);
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
      <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => openCampaign()}>
        <FolderPlus className="w-3.5 h-3.5" />
        Campaign 数据
      </Button>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Campaign 数据管理（按公司）</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {companies.length > 0 && (
            <div className="rounded-lg border border-border p-3 space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">已上传公司</div>
              {companies.map(item => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    {item.name}
                  </span>
                  <span className="flex gap-1">
                    {(Object.keys(item.datasets) as Domain[])
                      .filter(d => item.datasets[d])
                      .map(d => (
                        <Badge key={d} variant="secondary" className="text-[10px]">{DOMAIN_LABELS[d]}</Badge>
                      ))}
                  </span>
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground pt-1">
                提示：想给同一家公司补充其它数据域，填写相同的公司名称再上传即可。
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
              <p className="text-sm text-muted-foreground">
                请上传填好数据的 CSV（保留第 1 行 key、第 2 行中文 label，从第 3 行开始填数据）。
              </p>
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
                    if (file) void handleUpload(file);
                  }}
                />
              </label>
            </div>
          )}

          {step === "done" && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/40 p-4 text-sm">
                上传成功。顶部「数据视图」已切换到「{company.trim()}」，看板仅展示该公司数据；
                切回「演示数据（示例公司）」即可查看示例数据。
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
