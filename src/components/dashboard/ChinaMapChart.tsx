import { useState } from "react";
import { motion } from "framer-motion";
import { regionSalesData } from "@/data/mockData";

// Simplified China map using positioned province blocks
const provinces = [
  // Row structure approximating China's geography
  { name: "新疆", x: 8, y: 15, w: 18, h: 18 },
  { name: "西藏", x: 8, y: 35, w: 16, h: 14 },
  { name: "青海", x: 26, y: 20, w: 10, h: 10 },
  { name: "甘肃", x: 30, y: 12, w: 14, h: 8 },
  { name: "内蒙古", x: 38, y: 4, w: 24, h: 10 },
  { name: "黑龙江", x: 72, y: 2, w: 12, h: 12 },
  { name: "吉林", x: 74, y: 14, w: 10, h: 8 },
  { name: "辽宁", x: 72, y: 22, w: 10, h: 8 },
  { name: "北京", x: 64, y: 18, w: 6, h: 5 },
  { name: "天津", x: 66, y: 23, w: 5, h: 4 },
  { name: "河北", x: 60, y: 16, w: 8, h: 12 },
  { name: "山东", x: 62, y: 28, w: 10, h: 8 },
  { name: "山西", x: 54, y: 18, w: 7, h: 10 },
  { name: "陕西", x: 44, y: 18, w: 7, h: 14 },
  { name: "宁夏", x: 40, y: 14, w: 5, h: 6 },
  { name: "河南", x: 54, y: 28, w: 8, h: 8 },
  { name: "江苏", x: 66, y: 32, w: 8, h: 8 },
  { name: "安徽", x: 62, y: 36, w: 7, h: 8 },
  { name: "上海", x: 74, y: 36, w: 5, h: 4 },
  { name: "浙江", x: 70, y: 40, w: 7, h: 8 },
  { name: "湖北", x: 50, y: 34, w: 10, h: 8 },
  { name: "湖南", x: 50, y: 42, w: 8, h: 10 },
  { name: "江西", x: 60, y: 42, w: 7, h: 10 },
  { name: "福建", x: 68, y: 48, w: 7, h: 8 },
  { name: "四川", x: 32, y: 30, w: 14, h: 14 },
  { name: "重庆", x: 42, y: 36, w: 6, h: 6 },
  { name: "贵州", x: 42, y: 44, w: 8, h: 8 },
  { name: "云南", x: 28, y: 46, w: 12, h: 14 },
  { name: "广西", x: 42, y: 54, w: 10, h: 8 },
  { name: "广东", x: 54, y: 54, w: 12, h: 8 },
  { name: "海南", x: 52, y: 66, w: 6, h: 6 },
  { name: "台湾", x: 76, y: 50, w: 5, h: 10 },
  { name: "香港", x: 64, y: 62, w: 4, h: 3 },
  { name: "澳门", x: 60, y: 63, w: 4, h: 3 },
];

const getColor = (value: number, max: number) => {
  const ratio = value / max;
  if (ratio > 0.7) return "hsl(262, 60%, 55%)";
  if (ratio > 0.5) return "hsl(262, 50%, 45%)";
  if (ratio > 0.3) return "hsl(262, 40%, 35%)";
  if (ratio > 0.15) return "hsl(228, 30%, 30%)";
  return "hsl(228, 20%, 22%)";
};

const ChinaMapChart = () => {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const maxSales = Math.max(...Object.values(regionSalesData));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-base font-semibold text-foreground">
          区域销售分布
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>低</span>
          <div className="flex gap-0.5">
            {["hsl(228,20%,22%)", "hsl(228,30%,30%)", "hsl(262,40%,35%)", "hsl(262,50%,45%)", "hsl(262,60%,55%)"].map(
              (c, i) => (
                <div key={i} className="w-5 h-3 rounded-sm" style={{ background: c }} />
              )
            )}
          </div>
          <span>高</span>
        </div>
      </div>

      <div className="relative w-full" style={{ paddingBottom: "75%" }}>
        <svg
          viewBox="0 0 90 75"
          className="absolute inset-0 w-full h-full"
          style={{ overflow: "visible" }}
        >
          {provinces.map((province) => {
            const sales = regionSalesData[province.name] || 0;
            const isHovered = hoveredProvince === province.name;
            return (
              <g key={province.name}>
                <rect
                  x={province.x}
                  y={province.y}
                  width={province.w}
                  height={province.h}
                  rx={1.2}
                  fill={getColor(sales, maxSales)}
                  stroke={isHovered ? "hsl(195, 85%, 50%)" : "hsl(228, 15%, 18%)"}
                  strokeWidth={isHovered ? 0.8 : 0.3}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredProvince(province.name)}
                  onMouseLeave={() => setHoveredProvince(null)}
                  opacity={isHovered ? 1 : 0.9}
                />
                <text
                  x={province.x + province.w / 2}
                  y={province.y + province.h / 2 + 1}
                  textAnchor="middle"
                  fill="hsl(220, 20%, 80%)"
                  fontSize={province.w < 6 ? 2 : 2.5}
                  className="pointer-events-none select-none"
                >
                  {province.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredProvince && (
          <div className="absolute top-2 right-2 bg-popover border border-border rounded-lg px-3 py-2 text-xs z-10">
            <div className="font-semibold text-foreground">{hoveredProvince}</div>
            <div className="text-muted-foreground mt-0.5">
              销售额: ¥{((regionSalesData[hoveredProvince] || 0)).toLocaleString()}万
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChinaMapChart;
