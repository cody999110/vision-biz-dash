import { useState } from "react";
import { motion } from "framer-motion";
import { regionSalesData } from "@/data/mockData";

// Simplified but recognizable China province SVG paths
const chinaProvinces = [
  { id: "xinjiang", name: "新疆", d: "M80,60 L130,40 L180,45 L200,70 L210,110 L190,150 L160,160 L120,155 L90,130 L70,100 Z" },
  { id: "xizang", name: "西藏", d: "M70,150 L120,140 L160,145 L190,155 L180,200 L160,230 L120,240 L80,230 L60,200 L55,170 Z" },
  { id: "qinghai", name: "青海", d: "M190,110 L220,100 L250,110 L260,140 L240,160 L210,165 L190,155 L185,130 Z" },
  { id: "gansu", name: "甘肃", d: "M200,65 L230,55 L260,60 L280,80 L270,100 L250,110 L220,100 L210,90 Z M260,100 L290,95 L310,110 L300,130 L280,125 L265,115 Z" },
  { id: "neimenggu", name: "内蒙古", d: "M280,25 L320,15 L380,10 L430,15 L460,30 L470,55 L450,70 L420,65 L400,75 L380,60 L360,70 L340,55 L310,65 L290,60 L270,70 L260,55 Z" },
  { id: "heilongjiang", name: "黑龙江", d: "M460,10 L490,5 L520,15 L540,40 L530,70 L510,85 L480,80 L460,60 L455,35 Z" },
  { id: "jilin", name: "吉林", d: "M455,75 L480,80 L510,85 L520,100 L505,115 L480,118 L460,110 L450,90 Z" },
  { id: "liaoning", name: "辽宁", d: "M440,100 L460,95 L480,100 L500,115 L495,135 L475,145 L455,140 L440,125 L435,110 Z" },
  { id: "beijing", name: "北京", d: "M415,88 L425,85 L432,92 L428,100 L418,100 Z" },
  { id: "tianjin", name: "天津", d: "M428,100 L438,98 L442,108 L435,112 L426,108 Z" },
  { id: "hebei", name: "河北", d: "M400,75 L420,70 L440,80 L445,95 L440,110 L435,125 L420,130 L405,120 L395,105 L390,90 Z" },
  { id: "shandong", name: "山东", d: "M405,125 L430,120 L450,130 L465,145 L460,160 L440,165 L415,155 L400,140 Z" },
  { id: "shanxi", name: "山西", d: "M370,80 L390,75 L400,90 L405,115 L395,130 L380,135 L365,120 L360,100 Z" },
  { id: "shaanxi", name: "陕西", d: "M320,100 L345,90 L365,100 L370,125 L380,145 L370,170 L350,180 L330,170 L315,145 L310,120 Z" },
  { id: "ningxia", name: "宁夏", d: "M295,90 L315,85 L325,100 L315,115 L300,110 Z" },
  { id: "henan", name: "河南", d: "M370,135 L395,130 L410,145 L415,165 L400,175 L380,178 L365,168 L360,150 Z" },
  { id: "jiangsu", name: "江苏", d: "M430,150 L450,145 L470,155 L475,180 L460,195 L440,190 L425,175 L420,160 Z" },
  { id: "anhui", name: "安徽", d: "M410,165 L430,160 L440,180 L445,200 L430,215 L410,210 L400,195 L398,178 Z" },
  { id: "shanghai", name: "上海", d: "M470,185 L482,182 L485,195 L475,200 L468,195 Z" },
  { id: "zhejiang", name: "浙江", d: "M445,195 L465,190 L478,200 L480,220 L468,235 L450,230 L440,215 Z" },
  { id: "hubei", name: "湖北", d: "M340,170 L370,160 L395,170 L405,190 L395,205 L370,210 L345,205 L330,190 Z" },
  { id: "hunan", name: "湖南", d: "M340,210 L370,205 L390,215 L395,240 L380,260 L355,265 L335,250 L325,230 Z" },
  { id: "jiangxi", name: "江西", d: "M395,210 L420,205 L435,220 L440,245 L425,265 L405,268 L390,255 L385,235 Z" },
  { id: "fujian", name: "福建", d: "M435,230 L455,225 L470,240 L475,265 L460,280 L440,275 L430,255 Z" },
  { id: "sichuan", name: "四川", d: "M230,160 L260,150 L290,155 L320,160 L335,175 L340,200 L325,220 L300,225 L270,220 L245,210 L225,190 Z" },
  { id: "chongqing", name: "重庆", d: "M315,185 L340,180 L350,195 L345,215 L325,220 L310,210 Z" },
  { id: "guizhou", name: "贵州", d: "M290,230 L320,225 L340,235 L350,255 L335,270 L310,275 L290,265 L280,248 Z" },
  { id: "yunnan", name: "云南", d: "M220,230 L250,220 L280,230 L295,255 L305,280 L295,310 L270,320 L240,310 L220,290 L210,260 Z" },
  { id: "guangxi", name: "广西", d: "M310,270 L340,265 L365,275 L375,295 L360,310 L335,315 L310,305 L300,290 Z" },
  { id: "guangdong", name: "广东", d: "M370,270 L400,262 L430,270 L445,285 L440,305 L420,315 L395,320 L370,310 L360,295 Z" },
  { id: "hainan", name: "海南", d: "M370,325 L390,322 L395,340 L385,350 L370,345 Z" },
  { id: "taiwan", name: "台湾", d: "M490,240 L500,235 L508,255 L505,280 L495,290 L485,275 L483,255 Z" },
  { id: "xianggang", name: "香港", d: "M430,315 L440,312 L445,320 L438,325 Z" },
  { id: "aomen", name: "澳门", d: "M418,318 L425,316 L428,322 L422,325 Z" },
];

const getColor = (value: number, max: number) => {
  const ratio = value / max;
  if (ratio > 0.7) return "hsl(262, 65%, 45%)";
  if (ratio > 0.5) return "hsl(262, 55%, 55%)";
  if (ratio > 0.3) return "hsl(262, 45%, 65%)";
  if (ratio > 0.15) return "hsl(262, 35%, 78%)";
  if (ratio > 0.05) return "hsl(262, 25%, 88%)";
  return "hsl(262, 15%, 93%)";
};

const ChinaMapChart = () => {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const maxSales = Math.max(...Object.values(regionSalesData));

  const handleMouseMove = (e: React.MouseEvent<SVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

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
            {["hsl(262,15%,93%)", "hsl(262,25%,88%)", "hsl(262,35%,78%)", "hsl(262,45%,65%)", "hsl(262,55%,55%)", "hsl(262,65%,45%)"].map(
              (c, i) => (
                <div key={i} className="w-5 h-3 rounded-sm" style={{ background: c }} />
              )
            )}
          </div>
          <span>高</span>
        </div>
      </div>

      <div className="relative w-full" style={{ paddingBottom: "70%" }}>
        <svg
          viewBox="40 0 500 360"
          className="absolute inset-0 w-full h-full"
          style={{ overflow: "visible" }}
          onMouseMove={handleMouseMove}
        >
          {chinaProvinces.map((province) => {
            const sales = regionSalesData[province.name] || 0;
            const isHovered = hoveredProvince === province.name;
            return (
              <g key={province.id}>
                <path
                  d={province.d}
                  fill={getColor(sales, maxSales)}
                  stroke={isHovered ? "hsl(262, 60%, 50%)" : "hsl(0, 0%, 100%)"}
                  strokeWidth={isHovered ? 2 : 1}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredProvince(province.name)}
                  onMouseLeave={() => setHoveredProvince(null)}
                  style={{
                    filter: isHovered ? "brightness(0.9) drop-shadow(0 0 4px hsl(262, 60%, 50%, 0.3))" : "none",
                  }}
                />
              </g>
            );
          })}

          {/* South China Sea box */}
          <rect x="445" y="280" width="60" height="70" rx="3" fill="none" stroke="hsl(240, 10%, 85%)" strokeWidth="1" strokeDasharray="3 3" />
          <text x="475" y="300" textAnchor="middle" fill="hsl(240, 6%, 55%)" fontSize="8">南海诸岛</text>
        </svg>

        {hoveredProvince && (
          <div
            className="absolute bg-card border border-border rounded-lg px-3 py-2 text-xs z-10 pointer-events-none"
            style={{
              left: Math.min(tooltipPos.x + 12, 200),
              top: Math.max(tooltipPos.y - 40, 0),
              boxShadow: "0 4px 12px hsl(240, 10%, 80%, 0.3)",
            }}
          >
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
