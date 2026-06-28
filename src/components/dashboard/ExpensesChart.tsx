import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowLeft, MousePointerClick } from "lucide-react";
import { operatingExpenses, expenseSubcategories } from "@/data/mockData";

const ExpensesChart = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<"2025" | "2024">("2025");
  const [drillCategory, setDrillCategory] = useState<string | null>(null);

  const topLevelData = operatingExpenses[selectedYear];
  const drillData = drillCategory ? expenseSubcategories[drillCategory] ?? null : null;
  const activeData = drillData ?? topLevelData;
  const total = activeData.reduce((sum, item) => sum + item.amount, 0);

  // Click flow:
  // - Top-level slice click  -> drill into that category's subcategory pie
  // - Sub-level slice click  -> navigate to expense detail page
  // - Card background click  -> navigate (existing behavior), but only when not on a slice
  const handleSliceClick = (categoryName: string) => {
    if (drillCategory) {
      navigate(`/expense-analysis?category=${encodeURIComponent(drillCategory)}&sub=${encodeURIComponent(categoryName)}`);
    } else {
      // Only drill if subcategory data exists
      if (expenseSubcategories[categoryName]) {
        setDrillCategory(categoryName);
      } else {
        navigate(`/expense-analysis?category=${encodeURIComponent(categoryName)}`);
      }
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDrillCategory(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="glass-card p-5 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0">
          {drillCategory && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-6 h-6 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="返回"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          <h3 className="font-display text-base font-semibold text-foreground truncate">
            {drillCategory ? `${drillCategory} · 明细科目` : "运营费用结构"}
          </h3>
        </div>
        {!drillCategory && (
          <div className="flex gap-1.5">
            {(["2024", "2025"] as const).map((year) => (
              <button
                key={year}
                onClick={(e) => { e.stopPropagation(); setSelectedYear(year); }}
                className={`filter-chip ${selectedYear === year ? "filter-chip-active" : ""}`}
              >
                {year}
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={drillCategory ?? "top"}
          initial={{ opacity: 0, x: drillCategory ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: drillCategory ? -20 : 20 }}
          transition={{ duration: 0.25 }}
          className="flex gap-4"
        >
          <div className="chart-container h-[220px] w-[220px] shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="amount"
                  onClick={(slice: { category?: string }) => {
                    if (slice?.category) handleSliceClick(slice.category);
                  }}
                  className="cursor-pointer"
                >
                  {activeData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.color}
                      opacity={0.9}
                      stroke="hsl(0, 0%, 100%)"
                      strokeWidth={2}
                      className="hover:opacity-100 transition-opacity"
                    />
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
                  className="pointer-events-none"
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
                  className="pointer-events-none"
                >
                  {drillCategory ? "科目合计" : "总费用"}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 space-y-2 pt-2 min-w-0">
            {activeData.map((item) => (
              <button
                key={item.category}
                onClick={() => handleSliceClick(item.category)}
                className="w-full flex items-center gap-1.5 text-xs hover:bg-muted/40 rounded px-1.5 py-1 -mx-1.5 transition-colors text-left"
              >
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: item.color }} />
                <span className="text-muted-foreground flex-1 min-w-0 truncate" title={item.category}>{item.category}</span>
                <span className="text-foreground font-medium tabular-nums shrink-0 text-[11px]">
                  ¥{item.amount.toLocaleString()}
                </span>
                <span className="text-muted-foreground w-9 text-right tabular-nums shrink-0 text-[11px]">
                  {item.percentage}%
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border text-[10px] text-muted-foreground">
        <MousePointerClick className="w-3 h-3 text-primary" />
        {drillCategory
          ? <span>点击任意科目进入费用明细查询</span>
          : <span>点击费用类别查看明细科目，再次点击进入查询页</span>}
      </div>
    </motion.div>
  );
};

export default ExpensesChart;
