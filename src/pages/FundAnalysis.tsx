import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Download, Save, Link2, Search,
  ChevronLeft, ChevronRight, X, ChevronDown, ChevronUp,
  Eye, EyeOff, RotateCcw, Play, Code2, Clock, Database,
  Copy, FileSpreadsheet, FileText,
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
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  bankAccounts, bankNames, counterparties, transactionTypes,
  businessSources, fundCurrencies, fundEntities,
  fundDimensions, fundMetrics,
  generateFundDetailRows, generateFundGroupedData,
  type FundDetailRow,
} from "@/data/fundMockData";

// ── Reusable MultiSelect ──
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
        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground min-w-[120px] max-w-[220px] truncate hover:border-primary/40 transition-colors"
      >
        {selected.length > 0
          ? `${selected[0]}${selected.length > 1 ? ` +${selected.length - 1}` : ""}`
          : <span className="text-muted-foreground">{placeholder}</span>}
        <ChevronDown className="w-3 h-3 ml-auto text-muted-foreground" />
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

const formatNum = (v: unknown) => {
  if (typeof v !== "number") return String(v ?? "");
  return v.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
};

const FundAnalysis = () => {
  const navigate = useNavigate();

  // ── Filters ──
  const [startDate, setStartDate] = useState("2025-01");
  const [endDate, setEndDate] = useState("2025-12");
  const [entity, setEntity] = useState("集团合并");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [direction, setDirection] = useState("全部");
  const [counterpartySearch, setCounterpartySearch] = useState("");
  const [summaryKeyword, setSummaryKeyword] = useState("");
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(["CNY"]);
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  // ── Dimensions & Metrics ──
  const [selectedDims, setSelectedDims] = useState<string[]>(["transDate", "counterparty"]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["incomeAmount", "expenseAmount", "netFlow"]);

  // ── Data granularity ──
  const [granularity, setGranularity] = useState("summary");

  // ── Result state ──
  const [generated, setGenerated] = useState(false);
  const [detailRows] = useState<FundDetailRow[]>(() => generateFundDetailRows(300));
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [hiddenCols, setHiddenCols] = useState<string[]>([]);
  const [sqlOpen, setSqlOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Record<string, unknown> | null>(null);

  // ── Filter detail rows ──
  const filteredDetail = useMemo(() => {
    return detailRows.filter(r => {
      if (r.transDate < startDate || r.transDate > endDate + "-31") return false;
      if (entity !== "集团合并" && r.entity !== entity) return false;
      if (selectedAccounts.length > 0 && !selectedAccounts.includes(r.bankAccount)) return false;
      if (selectedBanks.length > 0 && !selectedBanks.includes(r.bankName)) return false;
      if (direction === "收入" && r.incomeAmount === 0) return false;
      if (direction === "支出" && r.expenseAmount === 0) return false;
      if (counterpartySearch && !r.counterparty.includes(counterpartySearch)) return false;
      if (summaryKeyword && !r.summary.includes(summaryKeyword)) return false;
      if (selectedCurrencies.length > 0 && !selectedCurrencies.includes(r.currency)) return false;
      if (amountMin && (r.incomeAmount + r.expenseAmount) < Number(amountMin)) return false;
      if (amountMax && (r.incomeAmount + r.expenseAmount) > Number(amountMax)) return false;
      if (selectedSources.length > 0 && !selectedSources.includes(r.businessSource)) return false;
      return true;
    });
  }, [detailRows, startDate, endDate, entity, selectedAccounts, selectedBanks, direction, counterpartySearch, summaryKeyword, selectedCurrencies, amountMin, amountMax, selectedSources]);

  // ── Grouped data ──
  const groupedData = useMemo(() => {
    if (!generated) return [];
    return generateFundGroupedData(selectedDims, selectedMetrics, filteredDetail);
  }, [generated, selectedDims, selectedMetrics, filteredDetail]);

  // ── Display data ──
  const displayData = useMemo(() => {
    if (!generated) return [];

    let data: Record<string, unknown>[];
    if (granularity === "detail") {
      data = filteredDetail.map(r => ({
        交易日期: r.transDate,
        银行账户: r.bankAccount,
        开户银行: r.bankName,
        交易对手: r.counterparty,
        入账金额: r.incomeAmount,
        出账金额: r.expenseAmount,
        账户余额: r.balance,
        交易摘要: r.summary,
        交易类型: r.transType,
        业务来源: r.businessSource,
        币种: r.currency,
        主体: r.entity,
        单据号: r.id,
      }));
    } else {
      data = groupedData;
    }

    // search
    if (searchTerm) {
      data = data.filter(row =>
        Object.values(row).some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // sort
    if (sortCol) {
      data = [...data].sort((a, b) => {
        const va = a[sortCol] ?? "";
        const vb = b[sortCol] ?? "";
        if (typeof va === "number" && typeof vb === "number") return sortAsc ? va - vb : vb - va;
        return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
      });
    }

    return data;
  }, [generated, granularity, filteredDetail, groupedData, searchTerm, sortCol, sortAsc]);

  const columns = useMemo(() => {
    if (displayData.length === 0) return [];
    return Object.keys(displayData[0]).filter(c => !hiddenCols.includes(c));
  }, [displayData, hiddenCols]);

  const allColumns = useMemo(() => {
    if (displayData.length === 0) return [];
    return Object.keys(displayData[0]);
  }, [displayData]);

  const totalPages = Math.max(1, Math.ceil(displayData.length / pageSize));
  const pageData = displayData.slice((page - 1) * pageSize, page * pageSize);

  const handleGenerate = useCallback(() => {
    setGenerated(true);
    setPage(1);
    setSortCol(null);
    setHiddenCols([]);
    toast.success(`查询完成，返回 ${granularity === "detail" ? filteredDetail.length : "汇总"} 条数据`);
  }, [granularity, filteredDetail.length]);

  const handleReset = () => {
    setStartDate("2025-01");
    setEndDate("2025-12");
    setEntity("集团合并");
    setSelectedAccounts([]);
    setSelectedBanks([]);
    setDirection("全部");
    setCounterpartySearch("");
    setSummaryKeyword("");
    setSelectedCurrencies(["CNY"]);
    setAmountMin("");
    setAmountMax("");
    setSelectedSources([]);
    setSelectedDims(["transDate", "counterparty"]);
    setSelectedMetrics(["incomeAmount", "expenseAmount", "netFlow"]);
    setGranularity("summary");
    setGenerated(false);
  };

  const mockSql = `SELECT ${selectedDims.map(d => fundDimensions.find(fd => fd.key === d)?.label).join(", ")},
  ${selectedMetrics.map(m => fundMetrics.find(fm => fm.key === m)?.label).join(", ")}
FROM fund_transactions
WHERE trans_date BETWEEN '${startDate}' AND '${endDate}'
  AND entity = '${entity}'${direction !== "全部" ? `\n  AND direction = '${direction}'` : ""}${counterpartySearch ? `\n  AND counterparty LIKE '%${counterpartySearch}%'` : ""}
GROUP BY ${selectedDims.map(d => fundDimensions.find(fd => fd.key === d)?.label).join(", ")}
ORDER BY 1`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-card border-b border-border px-4 md:px-6 py-3"
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">资金流水数据查询平台</h1>
              <p className="text-xs text-muted-foreground">银行资金流水自助查询与导出</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => toast.success("查询模板已保存")}>
              <Save className="w-3 h-3" /> 保存查询模板
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => toast.info("模板列表")}>
              <FileText className="w-3 h-3" /> 我的模板
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => toast.success("Excel导出中...")}>
              <FileSpreadsheet className="w-3 h-3" /> 导出Excel
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => toast.success("CSV导出中...")}>
              <Download className="w-3 h-3" /> 导出CSV
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={() => { navigator.clipboard.writeText("FUND-QRY-20250312-001"); toast.success("查询链接已复制"); }}>
              <Link2 className="w-3 h-3" /> 复制链接
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-4 space-y-4">
        {/* ─── Filter Area ─── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-3.5 h-3.5 text-primary" />
            <span className="section-title text-xs">查询条件</span>
          </div>

          {/* Row 1: Basic filters */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium">起始期间</label>
              <Input type="month" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-7 text-xs w-[130px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium">截止期间</label>
              <Input type="month" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-7 text-xs w-[130px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium">运营主体</label>
              <Select value={entity} onValueChange={setEntity}>
                <SelectTrigger className="h-7 text-xs w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>{fundEntities.map(e => <SelectItem key={e} value={e} className="text-xs">{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium">银行账户</label>
              <MultiSelect options={bankAccounts} selected={selectedAccounts} onChange={setSelectedAccounts} placeholder="全部账户" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium">开户银行</label>
              <MultiSelect options={bankNames} selected={selectedBanks} onChange={setSelectedBanks} placeholder="全部银行" searchable />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium">交易方向</label>
              <Select value={direction} onValueChange={setDirection}>
                <SelectTrigger className="h-7 text-xs w-[90px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["全部", "收入", "支出"].map(d => <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: More filters */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium">交易对手</label>
              <Input placeholder="模糊搜索..." value={counterpartySearch} onChange={e => setCounterpartySearch(e.target.value)} className="h-7 text-xs w-[140px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium">摘要关键词</label>
              <Input placeholder="关键词..." value={summaryKeyword} onChange={e => setSummaryKeyword(e.target.value)} className="h-7 text-xs w-[120px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium">币种</label>
              <MultiSelect options={fundCurrencies} selected={selectedCurrencies} onChange={setSelectedCurrencies} placeholder="全部币种" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium">金额下限</label>
              <Input type="number" placeholder="最小" value={amountMin} onChange={e => setAmountMin(e.target.value)} className="h-7 text-xs w-[100px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium">金额上限</label>
              <Input type="number" placeholder="最大" value={amountMax} onChange={e => setAmountMax(e.target.value)} className="h-7 text-xs w-[100px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium">业务来源</label>
              <MultiSelect options={businessSources} selected={selectedSources} onChange={setSelectedSources} placeholder="全部来源" />
            </div>
          </div>
        </motion.div>

        {/* ─── Dimensions & Metrics ─── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="glass-card p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dimensions */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="section-title text-xs">分组维度 (Group By)</span>
                <Badge variant="secondary" className="text-[10px]">{selectedDims.length}项</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {fundDimensions.map(d => (
                  <button
                    key={d.key}
                    onClick={() => setSelectedDims(prev => prev.includes(d.key) ? prev.filter(x => x !== d.key) : [...prev, d.key])}
                    className={`filter-chip ${selectedDims.includes(d.key) ? "filter-chip-active" : ""}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="section-title text-xs">指标 (Metrics)</span>
                <Badge variant="secondary" className="text-[10px]">{selectedMetrics.length}项</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {fundMetrics.map(m => (
                  <button
                    key={m.key}
                    onClick={() => setSelectedMetrics(prev => prev.includes(m.key) ? prev.filter(x => x !== m.key) : [...prev, m.key])}
                    className={`filter-chip ${selectedMetrics.includes(m.key) ? "filter-chip-active" : ""}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Granularity */}
            <div className="space-y-2">
              <span className="section-title text-xs">数据粒度</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: "summary", label: "汇总数据" },
                  { key: "detail", label: "明细数据" },
                ].map(g => (
                  <button
                    key={g.key}
                    onClick={() => setGranularity(g.key)}
                    className={`filter-chip ${granularity === g.key ? "filter-chip-active" : ""}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={handleGenerate}>
              <Play className="w-3 h-3" /> 生成数据
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleReset}>
              <RotateCcw className="w-3 h-3" /> 重置
            </Button>
          </div>
        </motion.div>

        {/* ─── Results ─── */}
        {generated && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {/* Query summary */}
            <div className="glass-card p-3">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> 查询时间: {new Date().toLocaleString("zh-CN")}</div>
                <div className="flex items-center gap-1"><Database className="w-3 h-3" /> 返回: {displayData.length} 条</div>
                <div className="flex flex-wrap gap-1">
                  {selectedDims.map(d => <Badge key={d} variant="outline" className="text-[10px]">{fundDimensions.find(fd => fd.key === d)?.label}</Badge>)}
                  {selectedMetrics.map(m => <Badge key={m} className="text-[10px] bg-primary/10 text-primary border-primary/20">{fundMetrics.find(fm => fm.key === m)?.label}</Badge>)}
                </div>
                <Collapsible open={sqlOpen} onOpenChange={setSqlOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1">
                      <Code2 className="w-3 h-3" /> SQL预览 {sqlOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <pre className="mt-2 p-3 bg-muted/50 rounded-lg text-[11px] text-foreground overflow-x-auto font-mono">{mockSql}</pre>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input placeholder="搜索数据..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} className="pl-7 h-7 text-xs" />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                    <Eye className="w-3 h-3" /> 列管理
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader><DialogTitle className="text-sm">显示/隐藏列</DialogTitle></DialogHeader>
                  <div className="space-y-1 max-h-60 overflow-auto">
                    {allColumns.map(col => (
                      <label key={col} className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-muted/50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!hiddenCols.includes(col)}
                          onChange={() => setHiddenCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])}
                          className="accent-primary"
                        />
                        {col}
                      </label>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Data table */}
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-10 text-[10px] text-center">#</TableHead>
                      {columns.map(col => (
                        <TableHead
                          key={col}
                          className="text-[10px] font-semibold cursor-pointer hover:text-primary whitespace-nowrap"
                          onClick={() => { setSortCol(col); setSortAsc(sortCol === col ? !sortAsc : true); }}
                        >
                          <span className="flex items-center gap-1">
                            {col}
                            {sortCol === col && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                          </span>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageData.length === 0 ? (
                      <TableRow><TableCell colSpan={columns.length + 1} className="text-center text-xs text-muted-foreground py-8">暂无数据，请调整查询条件后点击"生成数据"</TableCell></TableRow>
                    ) : pageData.map((row, i) => (
                      <TableRow
                        key={i}
                        className="cursor-pointer hover:bg-primary/5 transition-colors"
                        onClick={() => setSelectedRow(row)}
                      >
                        <TableCell className="text-[10px] text-center text-muted-foreground">{(page - 1) * pageSize + i + 1}</TableCell>
                        {columns.map(col => (
                          <TableCell key={col} className="text-xs whitespace-nowrap py-2">
                            {typeof row[col] === "number" ? formatNum(row[col]) : String(row[col] ?? "")}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/20">
                <span className="text-[10px] text-muted-foreground">共 {displayData.length} 条，第 {page}/{totalPages} 页</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const p = start + i;
                    if (p > totalPages) return null;
                    return (
                      <Button key={p} variant={p === page ? "default" : "ghost"} size="icon" className="h-6 w-6 text-[10px]" onClick={() => setPage(p)}>
                        {p}
                      </Button>
                    );
                  })}
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="flex items-center gap-2 py-2">
              <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => toast.success("Excel导出中...")}>
                <FileSpreadsheet className="w-3 h-3" /> 导出Excel
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => toast.success("CSV导出中...")}>
                <Download className="w-3 h-3" /> 导出CSV
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => toast.success("已保存为常用查询")}>
                <Save className="w-3 h-3" /> 保存为常用查询
              </Button>
              <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={() => { navigator.clipboard.writeText("FUND-QRY-" + Date.now()); toast.success("查询ID已复制"); }}>
                <Copy className="w-3 h-3" /> 复制查询ID
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Detail drawer */}
      <Sheet open={!!selectedRow} onOpenChange={() => setSelectedRow(null)}>
        <SheetContent className="w-[400px] sm:w-[500px] overflow-auto">
          <SheetHeader>
            <SheetTitle className="text-sm">数据详情</SheetTitle>
          </SheetHeader>
          {selectedRow && (
            <div className="mt-4 space-y-3">
              {Object.entries(selectedRow).map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-xs text-muted-foreground">{k}</span>
                  <span className="text-xs font-medium text-foreground">{formatNum(v)}</span>
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default FundAnalysis;
