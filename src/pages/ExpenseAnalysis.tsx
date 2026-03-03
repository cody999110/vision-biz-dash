import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Download, Save, Info, Filter, Search,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus,
  ChevronLeft, ChevronRight, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, Line, ComposedChart, Legend, Cell,
} from "recharts";
import {
  entities, currencies, expenseRanges, expenseSubjects,
  analysisDimensions, compareDimensions, metricOptions, granularityOptions,
  generateTrendData, generateTopNData, generateCompositionData,
  generateWaterfallData, generateDetailRows, generateKpiData,
  approvalStatuses,
} from "@/data/expenseMockData";

const STACK_COLORS = [
  "hsl(262, 60%, 55%)",
  "hsl(195, 85%, 50%)",
  "hsl(150, 60%, 50%)",
  "hsl(35, 90%, 55%)",
];

const MultiSelect = ({
  options, selected, onChange, placeholder, searchable = false,
}: {
  options: string[]; selected: string[]; onChange: (v: string[]) => void;
  placeholder: string; searchable?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = searchable ? options.filter(o => o.includes(search)) : options;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground min-w-[120px] max-w-[200px] truncate hover:border-primary/40 transition-colors"
      >
        {selected.length > 0 ? `${selected[0]}${selected.length > 1 ? ` +${selected.length - 1}` : ""}` : placeholder}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 w-56 bg-card border border-border rounded-lg shadow-lg p-2 max-h-60 overflow-auto">
            {searchable && (
              <Input
                placeholder="搜索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-2 h-7 text-xs"
              />
            )}
            {filtered.map(opt => (
              <label key={opt} className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-muted/50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => {
                    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);
                  }}
                  className="rounded border-border accent-primary"
                />
                {opt}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const KpiCard = ({ title, value, unit, trend, trendLabel, tooltip }: {
  title: string; value: string; unit?: string; trend?: number; trendLabel?: string; tooltip?: string;
}) => {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 flex flex-col gap-1"
    >
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">{title}</span>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
            <TooltipContent className="max-w-[200px] text-xs">{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-xl font-bold text-foreground">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs ${isPositive ? "text-green-600" : isNegative ? "text-red-500" : "text-muted-foreground"}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : isNegative ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          <span>{Math.abs(trend)}%</span>
          {trendLabel && <span className="text-muted-foreground ml-1">{trendLabel}</span>}
        </div>
      )}
    </motion.div>
  );
};

const ExpenseAnalysis = () => {
  const navigate = useNavigate();

  // Filter states
  const [entity, setEntity] = useState("集团");
  const [currency, setCurrency] = useState("本位币");
  const [selectedRanges, setSelectedRanges] = useState(["销售费用", "管理费用", "研发费用"]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [dimension, setDimension] = useState("部门");
  const [compareDim, setCompareDim] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState(["费用发生额", "费用率", "同比", "环比"]);
  const [topN, setTopN] = useState(10);
  const [granularity, setGranularity] = useState("月");
  const [tableSearch, setTableSearch] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const [drawerRow, setDrawerRow] = useState<any>(null);

  // Generate data (memoized, re-generates on filter change for realistic feel)
  const trendData = useMemo(() => generateTrendData(12), [entity, selectedRanges]);
  const topNData = useMemo(() => generateTopNData(dimension, topN), [dimension, topN, entity]);
  const compositionData = useMemo(() => generateCompositionData(), [entity, selectedRanges]);
  const waterfallData = useMemo(() => generateWaterfallData(), [entity]);
  const detailRows = useMemo(() => generateDetailRows(80), [entity]);
  const kpi = useMemo(() => generateKpiData(), [entity, selectedRanges]);

  const filteredRows = useMemo(() => {
    let rows = detailRows;
    if (tableSearch) {
      rows = rows.filter(r =>
        Object.values(r).some(v => String(v).toLowerCase().includes(tableSearch.toLowerCase()))
      );
    }
    return rows;
  }, [detailRows, tableSearch]);

  const pageSize = 15;
  const totalPages = Math.ceil(filteredRows.length / pageSize);
  const pagedRows = filteredRows.slice((tablePage - 1) * pageSize, tablePage * pageSize);

  const showMetric = useCallback((m: string) => selectedMetrics.includes(m), [selectedMetrics]);

  // Waterfall cumulative calculation
  const waterfallProcessed = useMemo(() => {
    let cumulative = 0;
    return waterfallData.map((item) => {
      if (item.type === "total") {
        cumulative = item.value;
        return { ...item, start: 0, end: item.value, displayValue: item.value };
      }
      const start = cumulative;
      cumulative += item.value;
      return { ...item, start: Math.min(start, cumulative), end: Math.max(start, cumulative), displayValue: item.value };
    });
  }, [waterfallData]);

  const chartTooltipStyle = {
    background: "hsl(0, 0%, 100%)",
    border: "1px solid hsl(240, 10%, 90%)",
    borderRadius: "8px",
    fontSize: 11,
    color: "hsl(240, 10%, 15%)",
    boxShadow: "0 4px 12px hsl(240, 10%, 80%, 0.3)",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="font-display text-lg font-bold text-foreground">费用分析自助取数</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Save className="w-3.5 h-3.5" /> 保存视图
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Download className="w-3.5 h-3.5" /> 导出
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <Info className="w-3.5 h-3.5" /> 口径说明
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>指标口径说明</DialogTitle></DialogHeader>
                <div className="text-sm space-y-3 text-muted-foreground">
                  <p><strong className="text-foreground">费用发生额：</strong>指当期实际发生并已入账的费用总额，包含已审批报销单据及预提费用。</p>
                  <p><strong className="text-foreground">费用率：</strong>费用发生额 / 同期营业收入 × 100%，反映费用控制效率。</p>
                  <p><strong className="text-foreground">同比：</strong>(本期费用 - 去年同期费用) / 去年同期费用 × 100%。</p>
                  <p><strong className="text-foreground">环比：</strong>(本期费用 - 上期费用) / 上期费用 × 100%。</p>
                  <p><strong className="text-foreground">预算差异额：</strong>实际费用 - 预算费用，负值表示节约，正值表示超支。</p>
                  <p><strong className="text-foreground">预算差异率：</strong>预算差异额 / 预算费用 × 100%。</p>
                  <p><strong className="text-foreground">人均费用：</strong>费用发生额 / 期末部门人数。</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-4 space-y-4">
        {/* Filter Bar */}
        <div className="glass-card p-4 space-y-3">
          {/* Row 1 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium w-16 shrink-0">通用筛选</span>
            <Select value={entity} onValueChange={setEntity}>
              <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{entities.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <MultiSelect options={expenseRanges} selected={selectedRanges} onChange={setSelectedRanges} placeholder="费用范围" />
            <MultiSelect options={expenseSubjects} selected={selectedSubjects} onChange={setSelectedSubjects} placeholder="费用科目" searchable />
          </div>
          {/* Row 2 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium w-16 shrink-0">分析视角</span>
            <Select value={dimension} onValueChange={setDimension}>
              <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{analysisDimensions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={compareDim} onValueChange={setCompareDim}>
              <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue placeholder="对比维度" /></SelectTrigger>
              <SelectContent>{compareDimensions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
            <MultiSelect options={metricOptions} selected={selectedMetrics} onChange={setSelectedMetrics} placeholder="指标选择" />
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">TopN:</span>
              <Input
                type="number" value={topN} onChange={e => setTopN(Number(e.target.value) || 5)}
                className="w-16 h-8 text-xs" min={3} max={20}
              />
            </div>
            <Select value={granularity} onValueChange={setGranularity}>
              <SelectTrigger className="w-[80px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{granularityOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                  <Filter className="w-3 h-3" /> 高级筛选
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader><SheetTitle>高级筛选</SheetTitle></SheetHeader>
                <div className="space-y-4 mt-4">
                  {[
                    { label: "审批状态", options: approvalStatuses },
                    { label: "报销类型", options: ["差旅报销", "日常报销", "招待报销", "项目报销"] },
                    { label: "发票类型", options: ["增值税专用发票", "增值税普通发票", "电子发票", "其他"] },
                    { label: "客户可归属", options: ["是", "否"] },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="text-sm font-medium text-foreground">{f.label}</label>
                      <Select>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="全部" /></SelectTrigger>
                        <SelectContent>{f.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {showMetric("费用发生额") && (
            <KpiCard title="本期费用发生额" value={`¥${kpi.totalExpense.toLocaleString()}`} unit="万" tooltip="当期实际发生并已入账的费用总额" />
          )}
          {showMetric("费用率") && (
            <KpiCard title="费用率" value={`${kpi.expenseRate}%`} trend={-1.2} trendLabel="vs上期" tooltip="费用/收入×100%" />
          )}
          {showMetric("同比") && (
            <KpiCard title="同比变动" value={`${kpi.yoy > 0 ? "+" : ""}${kpi.yoy}%`} trend={kpi.yoy} trendLabel="vs去年同期" />
          )}
          {showMetric("环比") && (
            <KpiCard title="环比变动" value={`${kpi.mom > 0 ? "+" : ""}${kpi.mom}%`} trend={kpi.mom} trendLabel="vs上月" />
          )}
          {showMetric("预算差异额") && (
            <KpiCard title="预算差异额" value={`¥${kpi.budgetDiffAmount.toLocaleString()}`} unit="万" trend={kpi.budgetDiffRate} trendLabel="差异率" tooltip="实际-预算，负值为节约" />
          )}
          {showMetric("人均费用") && (
            <KpiCard title="人均费用" value={`¥${kpi.perCapita}`} unit="万/人" tooltip="费用/期末部门人数" />
          )}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Trend Chart */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">费用趋势分析</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 90%)" />
                  <XAxis dataKey="period" tick={{ fontSize: 10, fill: "hsl(240, 6%, 45%)" }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(240, 6%, 45%)" }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(240, 6%, 45%)" }} unit="%" />
                  <ReTooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="expense" name="费用额(万)" fill="hsl(262, 60%, 55%)" radius={[3, 3, 0, 0]} opacity={0.85} />
                  {showMetric("预算差异额") && (
                    <Bar yAxisId="left" dataKey="budget" name="预算(万)" fill="hsl(262, 30%, 80%)" radius={[3, 3, 0, 0]} opacity={0.5} />
                  )}
                  {showMetric("费用率") && (
                    <Line yAxisId="right" type="monotone" dataKey="expenseRate" name="费用率(%)" stroke="hsl(35, 90%, 55%)" strokeWidth={2} dot={{ r: 3 }} />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* TopN Chart */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">
              Top{topN} {dimension}费用排名
            </h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topNData} layout="vertical" margin={{ left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 90%)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(240, 6%, 45%)" }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "hsl(240, 6%, 45%)" }} width={55} />
                  <ReTooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`¥${v.toLocaleString()}万`, ""]} />
                  <Bar dataKey="value" name="费用额" fill="hsl(262, 60%, 55%)" radius={[0, 4, 4, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Composition Stacked */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">费用构成分析</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compositionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 90%)" />
                  <XAxis dataKey="period" tick={{ fontSize: 10, fill: "hsl(240, 6%, 45%)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(240, 6%, 45%)" }} />
                  <ReTooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {expenseRanges.map((r, i) => (
                    <Bar key={r} dataKey={r} stackId="a" fill={STACK_COLORS[i]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Waterfall */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">预算 vs 实际差异（瀑布图）</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterfallProcessed}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 90%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(240, 6%, 45%)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(240, 6%, 45%)" }} domain={["auto", "auto"]} />
                  <ReTooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(_: any, __: any, props: any) => {
                      const item = props.payload;
                      return [`¥${item.displayValue.toLocaleString()}万`, item.type === "total" ? "合计" : "差异"];
                    }}
                  />
                  {/* Invisible base bar */}
                  <Bar dataKey="start" stackId="waterfall" fill="transparent" />
                  {/* Visible delta bar */}
                  <Bar dataKey={(entry: any) => entry.end - entry.start} stackId="waterfall" radius={[3, 3, 0, 0]}>
                    {waterfallProcessed.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.type === "total"
                            ? "hsl(262, 60%, 55%)"
                            : entry.displayValue >= 0
                              ? "hsl(150, 60%, 50%)"
                              : "hsl(0, 72%, 55%)"
                        }
                        opacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Detail Table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-sm font-semibold text-foreground">费用明细</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="搜索明细..."
                  value={tableSearch}
                  onChange={e => { setTableSearch(e.target.value); setTablePage(1); }}
                  className="pl-8 h-8 w-52 text-xs"
                />
              </div>
              <span className="text-xs text-muted-foreground">共 {filteredRows.length} 条</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["日期", "主体", "部门", "销售人员", "客户", "项目", "费用科目", "金额(元)", "单据号", "摘要", "供应商", "状态"].map(h => (
                    <th key={h} className="text-left py-2.5 px-2 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedRows.map(row => (
                  <tr
                    key={row.id}
                    className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setDrawerRow(row)}
                  >
                    <td className="py-2 px-2 whitespace-nowrap">{row.date}</td>
                    <td className="py-2 px-2 whitespace-nowrap">{row.entity}</td>
                    <td className="py-2 px-2 whitespace-nowrap">{row.department}</td>
                    <td className="py-2 px-2 whitespace-nowrap">{row.salesPerson}</td>
                    <td className="py-2 px-2 whitespace-nowrap">{row.customer}</td>
                    <td className="py-2 px-2 whitespace-nowrap max-w-[100px] truncate">{row.project}</td>
                    <td className="py-2 px-2 whitespace-nowrap">{row.subject}</td>
                    <td className="py-2 px-2 whitespace-nowrap font-medium tabular-nums text-right">¥{row.amount.toLocaleString()}</td>
                    <td className="py-2 px-2 whitespace-nowrap text-muted-foreground">{row.docNo}</td>
                    <td className="py-2 px-2 whitespace-nowrap">{row.summary}</td>
                    <td className="py-2 px-2 whitespace-nowrap">{row.supplier}</td>
                    <td className="py-2 px-2 whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        row.status === "已审批" ? "bg-green-100 text-green-700" :
                        row.status === "审批中" ? "bg-amber-100 text-amber-700" :
                        row.status === "已驳回" ? "bg-red-100 text-red-700" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              第 {(tablePage - 1) * pageSize + 1}-{Math.min(tablePage * pageSize, filteredRows.length)} 条
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={tablePage <= 1} onClick={() => setTablePage(p => p - 1)}>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="text-xs px-2">{tablePage} / {totalPages}</span>
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={tablePage >= totalPages} onClick={() => setTablePage(p => p + 1)}>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row Detail Drawer */}
      <Sheet open={!!drawerRow} onOpenChange={(open) => !open && setDrawerRow(null)}>
        <SheetContent className="sm:max-w-lg overflow-auto">
          <SheetHeader>
            <SheetTitle className="text-base">费用明细详情</SheetTitle>
          </SheetHeader>
          {drawerRow && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["单据号", drawerRow.docNo],
                  ["日期", drawerRow.date],
                  ["主体", drawerRow.entity],
                  ["部门", drawerRow.department],
                  ["销售人员", drawerRow.salesPerson],
                  ["客户", drawerRow.customer],
                  ["项目", drawerRow.project],
                  ["费用科目", drawerRow.subject],
                  ["金额", `¥${drawerRow.amount.toLocaleString()}`],
                  ["币种", drawerRow.currency],
                  ["摘要", drawerRow.summary],
                  ["供应商", drawerRow.supplier],
                  ["状态", drawerRow.status],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="text-muted-foreground text-xs">{label}</span>
                    <p className="font-medium text-foreground">{value}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold mb-3">该对象费用趋势</h4>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={generateTrendData(6).map(d => ({ ...d, expense: Math.round(d.expense * 0.3) }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 90%)" />
                      <XAxis dataKey="period" tick={{ fontSize: 9, fill: "hsl(240, 6%, 45%)" }} />
                      <YAxis tick={{ fontSize: 9, fill: "hsl(240, 6%, 45%)" }} />
                      <ReTooltip contentStyle={chartTooltipStyle} />
                      <Bar dataKey="expense" fill="hsl(262, 60%, 55%)" radius={[3, 3, 0, 0]} opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ExpenseAnalysis;
