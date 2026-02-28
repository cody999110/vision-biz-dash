import { useState } from "react";
import { motion } from "framer-motion";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { revenueGrossProfitData, years } from "@/data/mockData";

const RevenueChart = () => {
  const [selectedYears, setSelectedYears] = useState<string[]>(["2025"]);

  const toggleYear = (year: string) => {
    setSelectedYears((prev) =>
      prev.includes(year)
        ? prev.length > 1 ? prev.filter((y) => y !== year) : prev
        : [...prev, year]
    );
  };

  const chartData = revenueGrossProfitData["2024"].map((item, i) => {
    const point: Record<string, unknown> = { month: item.month };
    selectedYears.forEach((year) => {
      const yearData = revenueGrossProfitData[year as keyof typeof revenueGrossProfitData];
      if (yearData && yearData[i]) {
        point[`revenue_${year}`] = yearData[i].revenue;
        point[`grossProfit_${year}`] = yearData[i].grossProfit;
        point[`grossMargin_${year}`] = yearData[i].grossMargin;
      }
    });
    return point;
  });

  const colorMap: Record<string, { bar: string; line: string }> = {
    "2020": { bar: "hsl(262, 60%, 75%)", line: "hsl(262, 60%, 50%)" },
    "2021": { bar: "hsl(210, 80%, 75%)", line: "hsl(210, 80%, 50%)" },
    "2022": { bar: "hsl(150, 60%, 70%)", line: "hsl(150, 60%, 42%)" },
    "2023": { bar: "hsl(35, 90%, 75%)", line: "hsl(35, 90%, 50%)" },
    "2024": { bar: "hsl(262, 60%, 65%)", line: "hsl(262, 80%, 45%)" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-base font-semibold text-foreground">
          收入与毛利趋势
        </h3>
        <div className="flex gap-1.5 flex-wrap">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => toggleYear(year)}
              className={`filter-chip ${selectedYears.includes(year) ? "filter-chip-active" : ""}`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-container h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 90%)" strokeOpacity={0.8} />
            <XAxis dataKey="month" tick={{ fill: "hsl(240, 6%, 45%)", fontSize: 11 }} axisLine={false} tickLine={false} />
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
              domain={[10, 35]}
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
                if (name.startsWith("grossMargin")) return [`${value}%`, "毛利率"];
                return [`¥${value.toLocaleString()}万`, name.startsWith("revenue") ? "收入" : "毛利"];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "hsl(240, 6%, 45%)" }}
              formatter={(value) => {
                if (value.startsWith("revenue")) return `收入(${value.split("_")[1]})`;
                if (value.startsWith("grossProfit")) return `毛利(${value.split("_")[1]})`;
                return `毛利率(${value.split("_")[1]})`;
              }}
            />
            {selectedYears.map((year) => (
              <Bar
                key={`rev_${year}`}
                yAxisId="left"
                dataKey={`revenue_${year}`}
                fill={colorMap[year]?.bar || "hsl(262,60%,65%)"}
                radius={[3, 3, 0, 0]}
                barSize={selectedYears.length > 2 ? 12 : 20}
                opacity={0.9}
              />
            ))}
            {selectedYears.map((year) => (
              <Line
                key={`gm_${year}`}
                yAxisId="right"
                type="monotone"
                dataKey={`grossMargin_${year}`}
                stroke={colorMap[year]?.line || "hsl(262,80%,45%)"}
                strokeWidth={2}
                dot={{ r: 3, fill: colorMap[year]?.line || "hsl(262,80%,45%)" }}
                activeDot={{ r: 5 }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default RevenueChart;
