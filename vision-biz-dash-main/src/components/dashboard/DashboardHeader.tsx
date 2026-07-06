import { motion } from "framer-motion";
import { Activity, Building2, Calendar, FlaskConical } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import CampaignManager from "@/components/campaign/CampaignManager";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { DEMO_VIEW, useDataSource } from "@/contexts/DataSourceContext";

const DashboardHeader = () => {
  const { selectedView, isDemo, companies, currentCompany, selectView } = useDataSource();

  const freshnessDatasetId = currentCompany
    ? currentCompany.datasets.revenue ??
      currentCompany.datasets.fund ??
      currentCompany.datasets.expense ??
      undefined
    : undefined;

  const { data: freshness } = useQuery({
    queryKey: ["freshness", selectedView],
    queryFn: () => api.getDataFreshness(freshnessDatasetId),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between mb-6 gap-3 flex-wrap"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
          <Activity className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
            财务数据看板
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            切换数据视图，查看示例公司或已上传公司的独立数据
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Select value={selectedView} onValueChange={selectView}>
          <SelectTrigger className="w-[190px] h-9 text-sm gap-1.5">
            {isDemo ? (
              <FlaskConical className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <Building2 className="w-3.5 h-3.5 text-primary" />
            )}
            <SelectValue placeholder="选择数据视图" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>示例</SelectLabel>
              <SelectItem value={DEMO_VIEW}>演示数据（示例公司）</SelectItem>
            </SelectGroup>
            {companies.length > 0 && (
              <>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>已上传公司</SelectLabel>
                  {companies.map(company => (
                    <SelectItem key={company.name} value={company.name}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </>
            )}
          </SelectContent>
        </Select>

        <CampaignManager />

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>数据更新: {freshness?.label ?? "加载中..."}</span>
          {isDemo ? (
            <Badge variant="secondary" className="text-[10px] h-5">演示</Badge>
          ) : (
            <Badge variant="default" className="text-[10px] h-5">Campaign</Badge>
          )}
          <div className="pulse-dot ml-1" />
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
