import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { operatingExpenses } from "@/data/mockData";

const ExpensesChart = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<"2025" | "2024">("2025");
  const data = operatingExpenses[selectedYear];
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="glass-card p-5 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate("/expense-analysis")}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-base font-semibold text-foreground">
          运营费用结构
        </h3>
        <div className="flex gap-1.5">
          {(["2024", "2025"] as const).map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`filter-chip ${selectedYear === year ? "filter-chip-active" : ""}`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="chart-container h-[220px] w-[220px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="amount"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} opacity={0.9} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(240, 10%, 90%)",
                  borderRadius: "8px",
                  fontSize: 12,
                  color: "hsl(240, 10%, 15%)",
                  boxShadow: "0 4px 12px hsl(240, 10%, 80%, 0.3)",
                }}
                formatter={(value: number) => [`¥${value.toLocaleString()}万`, "金额"]}
              />
              <text
                x="50%"
                y="48%"
                textAnchor="middle"
                dominantBaseline="central"
                fill="hsl(240, 10%, 15%)"
                fontSize={14}
                fontWeight={700}
                fontFamily="Space Grotesk"
              >
                ¥{(total / 10000).toFixed(1)}万
              </text>
              <text
                x="50%"
                y="60%"
                textAnchor="middle"
                dominantBaseline="central"
                fill="hsl(240, 6%, 45%)"
                fontSize={10}
              >
                总费用
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2 pt-2">
          {data.map((item) => (
            <div key={item.category} className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: item.color }} />
              <span className="text-muted-foreground flex-1">{item.category}</span>
              <span className="text-foreground font-medium tabular-nums">
                ¥{item.amount.toLocaleString()}万
              </span>
              <span className="text-muted-foreground w-10 text-right tabular-nums">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ExpensesChart;
