import { useState } from "react";
import { motion } from "framer-motion";
import { regionSalesData } from "@/data/mockData";

// More accurate China province SVG paths
const chinaProvinces = [
  { id: "xinjiang", name: "新疆", d: "M95,55 L115,38 L145,32 L175,35 L200,42 L215,55 L220,75 L225,95 L218,118 L205,135 L188,148 L170,155 L148,158 L125,152 L108,140 L95,125 L85,105 L82,82 Z" },
  { id: "xizang", name: "西藏", d: "M75,148 L100,140 L125,138 L148,142 L170,148 L188,155 L198,168 L195,188 L185,208 L170,225 L150,235 L128,238 L105,232 L85,220 L72,202 L65,182 L68,162 Z" },
  { id: "qinghai", name: "青海", d: "M195,108 L218,100 L238,105 L255,115 L258,132 L250,148 L235,158 L218,162 L200,155 L192,142 L188,125 Z" },
  { id: "gansu", name: "甘肃", d: "M215,58 L235,52 L258,58 L278,72 L285,88 L275,102 L258,108 L240,102 L228,92 L218,78 Z M262,98 L285,92 L305,102 L312,118 L302,132 L285,128 L272,118 Z" },
  { id: "neimenggu", name: "内蒙古", d: "M285,22 L310,15 L342,12 L378,10 L410,15 L438,25 L458,38 L468,55 L462,72 L448,78 L432,72 L418,68 L402,72 L388,65 L375,72 L358,62 L342,58 L325,62 L308,58 L292,65 L278,58 L268,48 Z" },
  { id: "heilongjiang", name: "黑龙江", d: "M458,8 L478,5 L498,12 L518,25 L530,42 L535,62 L525,78 L512,88 L495,85 L478,78 L465,65 L458,48 L455,32 Z" },
  { id: "jilin", name: "吉林", d: "M458,72 L478,78 L498,85 L515,92 L520,105 L510,118 L495,122 L478,118 L462,112 L455,98 L452,85 Z" },
  { id: "liaoning", name: "辽宁", d: "M442,98 L458,95 L475,102 L492,112 L498,128 L490,142 L475,148 L458,145 L442,135 L435,118 L438,108 Z" },
  { id: "beijing", name: "北京", d: "M418,82 L428,78 L435,85 L432,95 L422,95 L415,90 Z" },
  { id: "tianjin", name: "天津", d: "M430,95 L440,92 L445,102 L440,108 L432,105 Z" },
  { id: "hebei", name: "河北", d: "M398,72 L415,68 L432,75 L442,88 L445,105 L442,118 L435,132 L425,138 L412,135 L402,125 L395,112 L392,95 Z" },
  { id: "shandong", name: "山东", d: "M412,128 L432,122 L448,132 L462,142 L465,158 L455,168 L438,172 L418,165 L405,152 L402,138 Z" },
  { id: "shanxi", name: "山西", d: "M375,78 L392,72 L402,88 L405,108 L402,128 L392,138 L378,142 L368,132 L362,115 L365,95 Z" },
  { id: "shaanxi", name: "陕西", d: "M318,95 L342,85 L362,95 L368,112 L375,132 L378,148 L372,168 L358,178 L342,182 L328,172 L318,155 L312,135 L308,115 Z" },
  { id: "ningxia", name: "宁夏", d: "M298,85 L312,82 L322,95 L318,112 L305,115 L295,105 Z" },
  { id: "henan", name: "河南", d: "M372,132 L392,128 L408,138 L415,155 L408,172 L392,178 L375,175 L365,165 L362,148 Z" },
  { id: "jiangsu", name: "江苏", d: "M428,148 L448,142 L465,152 L472,168 L468,185 L455,195 L438,192 L425,178 L418,162 Z" },
  { id: "anhui", name: "安徽", d: "M408,162 L425,155 L438,168 L442,188 L435,205 L418,212 L405,208 L398,192 L400,175 Z" },
  { id: "shanghai", name: "上海", d: "M468,178 L478,175 L482,188 L476,195 L468,192 Z" },
  { id: "zhejiang", name: "浙江", d: "M442,192 L458,188 L472,195 L478,212 L470,228 L455,232 L442,225 L435,208 Z" },
  { id: "hubei", name: "湖北", d: "M342,168 L365,162 L385,168 L398,182 L395,198 L378,208 L358,212 L340,205 L328,192 Z" },
  { id: "hunan", name: "湖南", d: "M342,208 L362,202 L382,212 L392,228 L388,248 L372,262 L355,265 L338,255 L325,238 L328,218 Z" },
  { id: "jiangxi", name: "江西", d: "M392,208 L412,202 L428,212 L435,232 L428,252 L415,262 L398,265 L385,255 L382,238 L385,222 Z" },
  { id: "fujian", name: "福建", d: "M432,228 L450,222 L465,235 L470,255 L462,272 L448,278 L435,272 L428,255 Z" },
  { id: "sichuan", name: "四川", d: "M235,155 L258,148 L282,152 L308,158 L328,168 L342,182 L342,202 L328,218 L308,225 L282,222 L258,215 L240,202 L228,185 L225,168 Z" },
  { id: "chongqing", name: "重庆", d: "M318,185 L338,178 L348,192 L345,212 L332,222 L318,215 L308,202 Z" },
  { id: "guizhou", name: "贵州", d: "M295,228 L318,222 L338,232 L348,248 L342,268 L325,275 L305,272 L290,258 L285,242 Z" },
  { id: "yunnan", name: "云南", d: "M225,228 L252,218 L278,225 L292,245 L298,268 L295,292 L282,312 L262,318 L242,312 L225,295 L215,272 L212,248 Z" },
  { id: "guangxi", name: "广西", d: "M308,272 L332,265 L355,272 L368,288 L365,308 L348,318 L325,315 L308,305 L298,290 Z" },
  { id: "guangdong", name: "广东", d: "M365,268 L392,260 L418,265 L438,278 L442,298 L432,312 L415,320 L395,322 L375,315 L362,300 L358,282 Z" },
  { id: "hainan", name: "海南", d: "M372,328 L388,325 L395,342 L385,352 L372,348 Z" },
  { id: "taiwan", name: "台湾", d: "M488,235 L498,228 L505,245 L505,268 L498,282 L488,285 L482,272 L480,252 Z" },
  { id: "xianggang", name: "香港", d: "M428,318 L438,315 L442,322 L436,326 Z" },
  { id: "aomen", name: "澳门", d: "M418,322 L425,320 L427,326 L422,328 Z" },
];

const getColor = (value: number, max: number) => {
  const ratio = value / max;
  if (ratio > 0.7) return "hsl(262, 70%, 35%)";
  if (ratio > 0.5) return "hsl(262, 60%, 45%)";
  if (ratio > 0.35) return "hsl(262, 55%, 55%)";
  if (ratio > 0.2) return "hsl(262, 45%, 65%)";
  if (ratio > 0.1) return "hsl(262, 35%, 78%)";
  if (ratio > 0.03) return "hsl(262, 25%, 88%)";
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
            {["hsl(262,15%,93%)", "hsl(262,25%,88%)", "hsl(262,35%,78%)", "hsl(262,45%,65%)", "hsl(262,55%,55%)", "hsl(262,60%,45%)", "hsl(262,70%,35%)"].map(
              (c, i) => (
                <div key={i} className="w-4 h-3 rounded-sm" style={{ background: c }} />
              )
            )}
          </div>
          <span>高</span>
        </div>
      </div>

      <div className="relative w-full" style={{ paddingBottom: "72%" }}>
        <svg
          viewBox="50 0 500 370"
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
                  stroke={isHovered ? "hsl(262, 60%, 50%)" : "hsl(0, 0%, 95%)"}
                  strokeWidth={isHovered ? 2.5 : 0.8}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredProvince(province.name)}
                  onMouseLeave={() => setHoveredProvince(null)}
                  style={{
                    filter: isHovered ? "brightness(0.85) drop-shadow(0 0 6px hsl(262, 60%, 50%, 0.4))" : "none",
                  }}
                />
              </g>
            );
          })}

          {/* South China Sea box */}
          <rect x="448" y="285" width="58" height="68" rx="3" fill="none" stroke="hsl(240, 10%, 82%)" strokeWidth="1" strokeDasharray="3 3" />
          <text x="477" y="305" textAnchor="middle" fill="hsl(240, 6%, 55%)" fontSize="8">南海诸岛</text>
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
