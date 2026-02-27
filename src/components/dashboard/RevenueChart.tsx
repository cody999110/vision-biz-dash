import { useState } from "react";
import { motion } from "framer-motion";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { revenueGrossProfitData, years } from "@/data/mockData";

const RevenueChart = () => {
  const [selectedYears, setSelectedYears] = useState<string[]>(["2024"]);

  const toggleYear = (year: string) => {
    setSelectedYears((prev) =>
      prev.includes(year)
        ? prev.length > 1 ? prev.filter((y) => y !== year) : prev
        : [...prev, year]
    );
  };

  // Merge data for multi-year view
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
    "2020": { bar: "hsl(262, 60%, 35%)", line: "hsl(262, 60%, 55%)" },
    "2021": { bar: "hsl(195, 85%, 30%)", line: "hsl(195, 85%, 50%)" },
    "2022": { bar: "hsl(150, 60%, 30%)", line: "hsl(150, 60%, 50%)" },
    "2023": { bar: "hsl(35, 90%, 35%)", line: "hsl(35, 90%, 55%)" },
    "2024": { bar: "hsl(262, 60%, 45%)", line: "hsl(195, 85%, 50%)" },
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
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 15%, 20%)" strokeOpacity={0.5} />
            <XAxis dataKey="month" tick={{ fill: "hsl(220, 12%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              yAxisId="left"
              tick={{ fill: "hsl(220, 12%, 55%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v >= 10000 ? `${v / 10000}万` : v}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "hsl(220, 12%, 55%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={[30, 65]}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(228, 22%, 12%)",
                border: "1px solid hsl(228, 15%, 25%)",
                borderRadius: "8px",
                fontSize: 12,
                color: "hsl(220, 20%, 92%)",
              }}
              formatter={(value: number, name: string) => {
                if (name.startsWith("grossMargin")) return [`${value}%`, "毛利率"];
                return [`¥${value.toLocaleString()}万`, name.startsWith("revenue") ? "收入" : "毛利"];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "hsl(220, 12%, 55%)" }}
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
                fill={colorMap[year]?.bar || "hsl(262,60%,45%)"}
                radius={[3, 3, 0, 0]}
                barSize={selectedYears.length > 2 ? 12 : 20}
                opacity={0.85}
              />
            ))}
            {selectedYears.map((year) => (
              <Line
                key={`gm_${year}`}
                yAxisId="right"
                type="monotone"
                dataKey={`grossMargin_${year}`}
                stroke={colorMap[year]?.line || "hsl(195,85%,50%)"}
                strokeWidth={2}
                dot={{ r: 3, fill: colorMap[year]?.line || "hsl(195,85%,50%)" }}
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
