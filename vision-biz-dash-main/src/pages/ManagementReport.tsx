import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import ManagementShell from "@/components/management/ManagementShell";
import { formatPct, formatWan, formatYoy, yoyClass } from "@/components/management/format";
import PeriodTable from "@/components/management/PeriodTable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataSource } from "@/contexts/DataSourceContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ManagementReport() {
  const { isDemo, currentCompany } = useDataSource();
  const company = currentCompany?.name;
  const [year, setYear] = useState<number | undefined>(undefined);

  const { data, isLoading } = useQuery({
    queryKey: ["mgmt-report", company, year],
    queryFn: () => api.getManagementReport(company!, year),
    enabled: Boolean(company),
  });

  useEffect(() => {
    if (data?.year && year === undefined) setYear(data.year);
  }, [data?.year, year]);

  const displayYear = data?.year || year;
  const revenueRows = useMemo(
    () => (data?.lines ?? []).filter(row => row.kind !== "unallocated"),
    [data],
  );
  const expenseRows = data?.lines ?? [];

  if (isDemo || !company) {
    return <ManagementShell>{null}</ManagementShell>;
  }

  return (
    <ManagementShell>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-lg font-semibold">
            {displayYear ? `${displayYear}年全年完成情况` : "管理报表"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">金额单位：万元。H1/H2 按发生日期拆分，同比对比上年全年。</p>
        </div>
        <div className="flex items-center gap-2">
          {data?.available_years?.length ? (
            <Select value={String(displayYear ?? "")} onValueChange={value => setYear(Number(value))}>
              <SelectTrigger className="w-[120px] h-9"><SelectValue placeholder="年份" /></SelectTrigger>
              <SelectContent>
                {data.available_years.map(item => (
                  <SelectItem key={item} value={String(item)}>{item}年</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          <Button variant="outline" size="sm" asChild>
            <Link to="/management/config">去配置</Link>
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">加载报表中...</p>}

      {data && !data.is_live_data && (
        <div className="glass-card p-6 text-sm text-muted-foreground">{data.warnings[0] ?? "暂无数据"}</div>
      )}

      {data?.is_live_data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card-glow p-5">
              <div className="section-title text-xs mb-2">全年收入</div>
              <div className="kpi-value text-foreground">{formatWan(data.kpis.revenue)}</div>
              <div className="text-xs text-muted-foreground mt-1">万元</div>
            </div>
            <div className="glass-card-glow p-5">
              <div className="section-title text-xs mb-2">同比</div>
              <div className={cn("kpi-value flex items-center gap-2", yoyClass(data.kpis.revenue_yoy))}>
                {data.kpis.revenue_yoy != null && data.kpis.revenue_yoy >= 0
                  ? <TrendingUp className="w-6 h-6" />
                  : <TrendingDown className="w-6 h-6" />}
                {formatYoy(data.kpis.revenue_yoy)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">上年 {formatWan(data.kpis.revenue_prior)} 万元</div>
            </div>
            <div className="glass-card-glow p-5">
              <div className="section-title text-xs mb-2">综合毛利率</div>
              <div className="kpi-value text-foreground">{formatPct(data.kpis.gross_margin)}</div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Wallet className="w-3 h-3" />
                费用 {formatWan(data.kpis.expense)} 万元
              </div>
            </div>
          </div>

          {data.warnings.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground space-y-1">
              {data.warnings.map(item => <p key={item}>{item}</p>)}
            </div>
          )}

          <PeriodTable title="收入" rows={revenueRows} year={data.year} priorYear={data.prior_year} pick={row => row.revenue} />
          <PeriodTable title="毛利" rows={revenueRows} year={data.year} priorYear={data.prior_year} pick={row => row.gross_profit} />
          <PeriodTable title="毛利率" rows={revenueRows} year={data.year} priorYear={data.prior_year} pick={row => row.gross_margin} isRate />
          {data.has_expense && (
            <>
              <PeriodTable title="费用" rows={expenseRows} year={data.year} priorYear={data.prior_year} pick={row => row.expense} />
              {data.groups.length > 0 && (
                <div className="glass-card overflow-hidden">
                  <div className="px-5 py-3 border-b border-border">
                    <h3 className="font-display text-sm font-semibold">费用大类（全年）</h3>
                  </div>
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-muted-foreground border-b border-border">
                          <th className="text-left font-medium px-4 py-2.5">业务线</th>
                          {data.groups.map(group => (
                            <th key={group.id} className="text-right font-medium px-3 py-2.5">{group.name}</th>
                          ))}
                          <th className="text-right font-medium px-4 py-2.5">费用合计</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenseRows.map(row => (
                          <tr
                            key={row.line_id}
                            className={cn("border-b border-border last:border-0", row.kind === "total" && "bg-muted/50 font-semibold")}
                          >
                            <td className="px-4 py-2.5 whitespace-nowrap">{row.line_name}</td>
                            {data.groups.map(group => (
                              <td key={group.id} className="px-3 py-2.5 text-right tabular-nums">
                                {formatWan(row.expense_groups[group.id]?.year ?? 0)}
                              </td>
                            ))}
                            <td className="px-4 py-2.5 text-right tabular-nums">{formatWan(row.expense.year)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {data.summary && (
            <div className="rounded-xl px-5 py-4 text-sm text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              {data.summary}
            </div>
          )}
        </>
      )}
    </ManagementShell>
  );
}
