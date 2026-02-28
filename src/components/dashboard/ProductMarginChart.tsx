import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { productGrossMargin } from "@/data/mockData";

const ProductMarginChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="glass-card p-5"
    >
      <h3 className="font-display text-base font-semibold text-foreground mb-4">
        核心产品毛利率
      </h3>
      <div className="chart-container h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={productGrossMargin} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 90%)" strokeOpacity={0.8} horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 35]}
              tick={{ fill: "hsl(240, 6%, 45%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "hsl(240, 6%, 45%)", fontSize: 12, fontFamily: "Space Grotesk" }}
              axisLine={false}
              tickLine={false}
              width={65}
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
              formatter={(value: number) => [`${value}%`, "毛利率"]}
            />
            <Bar dataKey="margin" radius={[0, 4, 4, 0]} barSize={24}>
              {productGrossMargin.map((entry, index) => (
                <Cell key={index} fill={entry.color} opacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default ProductMarginChart;
