import { DatabaseZap, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataSource } from "@/contexts/DataSourceContext";
import type { Domain } from "@/lib/api";

interface DataEmptyStateProps {
  company: string;
  domain: Domain;
  domainLabel: string;
  className?: string;
}

const DataEmptyState = ({ company, domain, domainLabel, className }: DataEmptyStateProps) => {
  const { openCampaign } = useDataSource();

  return (
    <div
      className={`flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-10 min-h-[160px] ${className ?? ""}`}
    >
      <div className="w-11 h-11 rounded-xl bg-muted/60 flex items-center justify-center">
        <DatabaseZap className="w-5 h-5 text-muted-foreground/70" />
      </div>
      <p className="text-sm font-medium text-foreground/80">「{company}」暂无{domainLabel}数据</p>
      <p className="text-xs">下载模板填好数据后上传，即可在该视图查看真实{domainLabel}数据</p>
      <Button
        size="sm"
        className="mt-1 gap-1.5"
        onClick={(e) => {
          e.stopPropagation();
          openCampaign({ company, domain });
        }}
      >
        <Upload className="w-3.5 h-3.5" />
        下载模板 / 上传{domainLabel}数据
      </Button>
    </div>
  );
};

export default DataEmptyState;
