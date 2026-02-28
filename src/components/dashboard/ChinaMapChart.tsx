import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { geoMercator, geoPath } from "d3-geo";
import * as topojson from "topojson-client";
import { regionSalesData } from "@/data/mockData";

interface ProvinceFeature {
  type: string;
  id: string;
  properties: { name: string; 地名: string };
  geometry: any;
}

const nameMap: Record<string, string> = {
  "广东省": "广东", "浙江省": "浙江", "江苏省": "江苏", "上海市": "上海",
  "北京市": "北京", "山东省": "山东", "四川省": "四川", "福建省": "福建",
  "湖北省": "湖北", "湖南省": "湖南", "河南省": "河南", "安徽省": "安徽",
  "河北省": "河北", "辽宁省": "辽宁", "陕西省": "陕西", "重庆市": "重庆",
  "天津市": "天津", "江西省": "江西", "广西壮族自治区": "广西", "云南省": "云南",
  "贵州省": "贵州", "山西省": "山西", "吉林省": "吉林", "黑龙江省": "黑龙江",
  "内蒙古自治区": "内蒙古", "新疆维吾尔自治区": "新疆", "甘肃省": "甘肃",
  "海南省": "海南", "宁夏回族自治区": "宁夏", "青海省": "青海",
  "西藏自治区": "西藏", "台湾省": "台湾", "香港特别行政区": "香港",
  "澳门特别行政区": "澳门",
};

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
  const [geoData, setGeoData] = useState<ProvinceFeature[] | null>(null);
  const maxSales = Math.max(...Object.values(regionSalesData));

  useEffect(() => {
    fetch("/data/cn-atlas.json")
      .then((res) => res.json())
      .then((topoData) => {
        const provinces = topojson.feature(topoData, topoData.objects.provinces) as any;
        setGeoData(provinces.features);
      })
      .catch(console.error);
  }, []);

  const projection = useMemo(
    () =>
      geoMercator()
        .center([104, 35])
        .scale(580)
        .translate([320, 260]),
    []
  );

  const pathGenerator = useMemo(() => geoPath().projection(projection), [projection]);

  const handleMouseMove = (e: React.MouseEvent<SVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const getShortName = (feature: ProvinceFeature) => {
    const fullName = feature.properties?.地名 || feature.properties?.name || "";
    return nameMap[fullName] || fullName.replace(/省|市|自治区|特别行政区|壮族|回族|维吾尔/g, "");
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

      <div className="relative w-full" style={{ paddingBottom: "80%" }}>
        {!geoData ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            加载地图中...
          </div>
        ) : (
          <svg
            viewBox="0 0 640 520"
            className="absolute inset-0 w-full h-full"
            onMouseMove={handleMouseMove}
          >
            {geoData.map((feature, i) => {
              const shortName = getShortName(feature);
              const sales = regionSalesData[shortName] || 0;
              const isHovered = hoveredProvince === shortName;
              const d = pathGenerator(feature.geometry as any);
              if (!d) return null;
              return (
                <path
                  key={feature.id || i}
                  d={d}
                  fill={getColor(sales, maxSales)}
                  stroke={isHovered ? "hsl(262, 60%, 50%)" : "hsl(0, 0%, 96%)"}
                  strokeWidth={isHovered ? 2 : 0.5}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredProvince(shortName)}
                  onMouseLeave={() => setHoveredProvince(null)}
                  style={{
                    filter: isHovered
                      ? "brightness(0.85) drop-shadow(0 0 6px hsl(262, 60%, 50%, 0.4))"
                      : "none",
                  }}
                />
              );
            })}

            {/* South China Sea indicator */}
            <rect x="520" y="390" width="100" height="110" rx="4" fill="none" stroke="hsl(240, 10%, 82%)" strokeWidth="1" strokeDasharray="4 3" />
            <text x="570" y="415" textAnchor="middle" fill="hsl(240, 6%, 55%)" fontSize="10" fontFamily="Space Grotesk">
              南海诸岛
            </text>
          </svg>
        )}

        {hoveredProvince && (
          <div
            className="absolute bg-card border border-border rounded-lg px-3 py-2 text-xs z-10 pointer-events-none shadow-lg"
            style={{
              left: Math.min(tooltipPos.x + 12, 250),
              top: Math.max(tooltipPos.y - 40, 0),
            }}
          >
            <div className="font-semibold text-foreground">{hoveredProvince}</div>
            <div className="text-muted-foreground mt-0.5">
              销售额: ¥{(regionSalesData[hoveredProvince] || 0).toLocaleString()}万
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChinaMapChart;
