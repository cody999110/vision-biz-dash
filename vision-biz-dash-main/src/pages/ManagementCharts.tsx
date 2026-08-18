import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Bar, BarChart, CartesianGrid, LabelList, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import ManagementShell from "@/components/management/ManagementShell";
import { formatPct, formatWan } from "@/components/management/format";
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

const tooltipStyle = {
  background: "hsl(0, 0%, 100%)",
  border: "1px solid hsl(240, 10%, 90%)",
  borderRadius: "8px",
  fontSize: 12,
};

export default function ManagementCharts() {
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

  const chartRows = useMemo(
    () => (data?.lines ?? []).filter(row => row.kind === "line" || row.kind === "unmapped"),
    [data],
  );

  const revenueData = chartRows.map(row => ({
    name: row.line_name,
    current: row.revenue.year,
    prior: row.revenue.prior_year,
  }));
  const marginData = chartRows.map(row => ({
    name: row.line_name,
    margin: row.gross_margin.year,
  }));
  const expenseData = chartRows.map(row => ({
    name: row.line_name,
    current: row.expense.year,
    prior: row.expense.prior_year,
  }));

  if (isDemo || !company) {
    return <ManagementShell>{null}</ManagementShell>;
  }

  return (
    <ManagementShell>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-lg font-semibold">
            {data?.year ? `${data.year}年业务线对比` : "管理图表"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">与报表同一套归集口径。金额单位：万元。</p>
        </div>
        <div className="flex items-center gap-2">
          {data?.available_years?.length ? (
            <Select value={String(data.year)} onValueChange={value => setYear(Number(value))}>
              <SelectTrigger className="w-[120px] h-9"><SelectValue placeholder="年份" /></SelectTrigger>
              <SelectContent>
                {data.available_years.map(item => (
                  <SelectItem key={item} value={String(item)}>{item}年</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          <Button variant="outline" size="sm" asChild>
            <Link to="/management/report">查看报表</Link>
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">加载图表中...</p>}

      {data && !data.is_live_data && (
        <div className="glass-card p-6 text-sm text-muted-foreground">{data.warnings[0] ?? "暂无数据"}</div>
      )}

      {data?.is_live_data && (
        <div className="grid grid-cols-1 gap-4">
          <div className="glass-card p-5">
            <h3 className="font-display text-sm font-semibold mb-4">
              {data.year}年收入 vs {data.prior_year}年
            </h3>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 90%)" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(240, 6%, 45%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(240, 6%, 45%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [`${formatWan(value)} 万`, name]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="prior" name={`${data.prior_year}年`} fill="hsl(210, 40%, 72%)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="current" name={`${data.year}年`} fill="hsl(262, 60%, 50%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-display text-sm font-semibold mb-4">{data.year}年毛利率</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marginData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 90%)" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(240, 6%, 45%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(240, 6%, 45%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={value => `${value}%`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatPct(value), "毛利率"]} />
                  <Line type="monotone" dataKey="margin" name="毛利率" stroke="hsl(25, 90%, 48%)" strokeWidth={2.5} dot={{ r: 4 }}>
                    <LabelList dataKey="margin" position="top" fontSize={11} formatter={(value: number) => `${Number(value).toFixed(1)}%`} />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {data.has_expense && (
            <div className="glass-card p-5">
              <h3 className="font-display text-sm font-semibold mb-4">
                {data.year}年费用 vs {data.prior_year}年
              </h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenseData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 90%)" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(240, 6%, 45%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(240, 6%, 45%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [`${formatWan(value)} 万`, name]} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="prior" name={`${data.prior_year}年`} fill="hsl(210, 40%, 72%)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="current" name={`${data.year}年`} fill="hsl(222, 45%, 32%)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </ManagementShell>
  );
}
