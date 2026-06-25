import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Check, ChevronDown, Calendar } from "lucide-react";
import { getMonthlyRevenueData, businessLines, businessLineWeights } from "@/data/mockData";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const RevenueChart = () => {
  const navigate = useNavigate();
  const allMonths = useMemo(() => getMonthlyRevenueData(), []);
  // Default: last 12 months
  const [selectedMonths, setSelectedMonths] = useState<string[]>(
    () => allMonths.slice(-12).map(m => m.key)
  );
  const [businessLine, setBusinessLine] = useState<string>("全部业务");
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const toggleMonth = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMonths(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : [...prev, key]
    );
  };

  const selectQuickRange = (n: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMonths(allMonths.slice(-n).map(m => m.key));
  };

  const selectYear = (year: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMonths(allMonths.filter(m => m.year === year).map(m => m.key));
  };

  // Filter + apply business line weighting
  const chartData = useMemo(() => {
    const weight = businessLineWeights[businessLine];
    return allMonths
      .filter(m => selectedMonths.includes(m.key))
      .map(m => {
        const revenue = Math.round(m.revenue * weight.revenueWeight);
        const grossMargin = Math.max(8, Math.min(45, m.grossMargin + weight.marginAdjust));
        const grossProfit = Math.round(revenue * grossMargin / 100);
        return {
          label: m.label,
          revenue,
          grossProfit,
          grossMargin,
        };
      });
  }, [selectedMonths, businessLine, allMonths]);

  // Group months by year for picker UI
  const monthsByYear = useMemo(() => {
    const groups: Record<string, typeof allMonths> = {};
    allMonths.forEach(m => {
      if (!groups[m.year]) groups[m.year] = [];
      groups[m.year].push(m);
    });
    return groups;
  }, [allMonths]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="glass-card p-5 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate("/revenue-analysis")}
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-base font-semibold text-foreground">
          收入与毛利趋势
        </h3>
        <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
          {/* Business Line filter */}
          <div className="flex gap-1 flex-wrap">
            {businessLines.map(bl => (
              <button
                key={bl}
                onClick={(e) => { e.stopPropagation(); setBusinessLine(bl); }}
                className={`filter-chip ${businessLine === bl ? "filter-chip-active" : ""}`}
              >
                {bl}
              </button>
            ))}
          </div>

          {/* Month picker */}
          <Popover open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5 border-border bg-card hover:bg-primary/5 hover:border-primary/30"
                onClick={(e) => e.stopPropagation()}
              >
                <Calendar className="w-3 h-3" />
                已选 {selectedMonths.length} 个月
                <ChevronDown className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[420px] p-3 pointer-events-auto"
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-3">
                {/* Quick ranges */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
                  <span className="text-xs font-semibold text-muted-foreground">快捷选择</span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={(e) => selectQuickRange(3, e)}>近3月</Button>
                    <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={(e) => selectQuickRange(6, e)}>近6月</Button>
                    <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={(e) => selectQuickRange(12, e)}>近12月</Button>
                    <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={(e) => selectQuickRange(24, e)}>近24月</Button>
                  </div>
                </div>

                {/* Year groups with month grid */}
                <div className="max-h-[280px] overflow-y-auto space-y-3 pr-1">
                  {Object.entries(monthsByYear).reverse().map(([year, months]) => (
                    <div key={year}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-foreground">{year}年</span>
                        <button
                          onClick={(e) => selectYear(year, e)}
                          className="text-[10px] text-primary hover:underline"
                        >
                          选择全年
                        </button>
                      </div>
                      <div className="grid grid-cols-6 gap-1">
                        {months.map(m => {
                          const active = selectedMonths.includes(m.key);
                          return (
                            <button
                              key={m.key}
                              onClick={(e) => toggleMonth(m.key, e)}
                              className={`text-[11px] py-1.5 rounded border transition-all ${
                                active
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                              }`}
                            >
                              {m.monthNum}月
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer summary */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-[10px] text-muted-foreground">已选 {selectedMonths.length} 个月份</span>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={(e) => { e.stopPropagation(); setMonthPickerOpen(false); }}>
                    完成
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active filter summary */}
      <div className="flex items-center gap-2 mb-3 text-[10px] text-muted-foreground" onClick={(e) => e.stopPropagation()}>
        <Badge variant="outline" className="text-[10px] py-0 h-5 border-primary/30 text-primary bg-primary/5">
          {businessLine}
        </Badge>
        {chartData.length > 0 && (
          <span>{chartData[0].label} ~ {chartData[chartData.length - 1].label}</span>
        )}
      </div>

      <div className="chart-container h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 90%)" strokeOpacity={0.8} />
            <XAxis
              dataKey="label"
              tick={{ fill: "hsl(240, 6%, 45%)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={chartData.length > 18 ? 2 : chartData.length > 12 ? 1 : 0}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: "hsl(240, 6%, 45%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v >= 10000 ? `${v / 10000}万` : v}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "hsl(240, 6%, 45%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 50]}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(240, 10%, 90%)",
                borderRadius: "8px",
                fontSize: 12,
                color: "hsl(240, 10%, 15%)",
                boxShadow: "0 4px 12px hsl(240, 10%, 80%, 0.3)",
              }}
              formatter={(value: number, name: string) => {
                if (name === "毛利率") return [`${value}%`, name];
                return [`¥${value.toLocaleString()}万`, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "hsl(240, 6%, 45%)" }} />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              name="收入"
              fill="hsl(262, 60%, 65%)"
              radius={[3, 3, 0, 0]}
              barSize={chartData.length > 18 ? 10 : chartData.length > 12 ? 14 : 22}
              opacity={0.9}
            />
            <Bar
              yAxisId="left"
              dataKey="grossProfit"
              name="毛利"
              fill="hsl(195, 75%, 60%)"
              radius={[3, 3, 0, 0]}
              barSize={chartData.length > 18 ? 10 : chartData.length > 12 ? 14 : 22}
              opacity={0.85}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="grossMargin"
              name="毛利率"
              stroke="hsl(35, 90%, 50%)"
              strokeWidth={2}
              dot={{ r: 3, fill: "hsl(35, 90%, 50%)" }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default RevenueChart;
