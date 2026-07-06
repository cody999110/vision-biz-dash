import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getMonthlyRevenueData, businessLines, businessLineWeights } from "@/data/mockData";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const RevenueChart = () => {
  const navigate = useNavigate();
  const allMonths = useMemo(() => getMonthlyRevenueData(), []);
  const lastIdx = allMonths.length - 1;
  const defaultStart = Math.max(0, lastIdx - 11);

  const [startIdx, setStartIdx] = useState<number>(defaultStart);
  const [endIdx, setEndIdx] = useState<number>(lastIdx);
  const [businessLine, setBusinessLine] = useState<string>("全部业务");

  const chartData = useMemo(() => {
    const weight = businessLineWeights[businessLine];
    const lo = Math.min(startIdx, endIdx);
    const hi = Math.max(startIdx, endIdx);
    return allMonths.slice(lo, hi + 1).map(m => {
      const revenue = Math.round(m.revenue * weight.revenueWeight);
      const grossMargin = Math.max(8, Math.min(45, m.grossMargin + weight.marginAdjust));
      return { label: m.label, revenue, grossMargin };
    });
  }, [startIdx, endIdx, businessLine, allMonths]);

  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const len = chartData.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="glass-card p-5 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate("/revenue-analysis")}
    >
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="font-display text-base font-semibold text-foreground whitespace-nowrap">
          收入与毛利率趋势
        </h3>
        <div className="flex items-center gap-1.5" onClick={stop}>
          <Select value={businessLine} onValueChange={setBusinessLine}>
            <SelectTrigger className="h-7 text-xs w-[110px] px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="pointer-events-auto">
              {businessLines.map(bl => (
                <SelectItem key={bl} value={bl} className="text-xs">{bl}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(startIdx)} onValueChange={(v) => setStartIdx(Number(v))}>
            <SelectTrigger className="h-7 text-xs w-[100px] px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="pointer-events-auto max-h-[280px]">
              {allMonths.map((m, i) => (
                <SelectItem key={m.key} value={String(i)} className="text-xs">{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground">至</span>

          <Select value={String(endIdx)} onValueChange={(v) => setEndIdx(Number(v))}>
            <SelectTrigger className="h-7 text-xs w-[100px] px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="pointer-events-auto max-h-[280px]">
              {allMonths.map((m, i) => (
                <SelectItem key={m.key} value={String(i)} className="text-xs">{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
              interval={len > 18 ? 2 : len > 12 ? 1 : 0}
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
              barSize={len > 18 ? 14 : len > 12 ? 20 : 30}
              opacity={0.9}
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
