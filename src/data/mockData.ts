// Mock financial data for dashboard

export const fundBalance = {
  total: 3520000000,
  bankDeposit: 2180000000,
  cashOnHand: 420000000,
  shortTermInvestment: 920000000,
  change: 5.8,
};

export const revenueGrossProfitData: Record<string, { month: string; revenue: number; grossProfit: number; grossMargin: number }[]> = {
  "2021": [
    { month: "1月", revenue: 2800, grossProfit: 560, grossMargin: 20 },
    { month: "2月", revenue: 2200, grossProfit: 418, grossMargin: 19 },
    { month: "3月", revenue: 3100, grossProfit: 651, grossMargin: 21 },
    { month: "4月", revenue: 3500, grossProfit: 735, grossMargin: 21 },
    { month: "5月", revenue: 3800, grossProfit: 836, grossMargin: 22 },
    { month: "6月", revenue: 4200, grossProfit: 924, grossMargin: 22 },
    { month: "7月", revenue: 4800, grossProfit: 1056, grossMargin: 22 },
    { month: "8月", revenue: 5200, grossProfit: 1196, grossMargin: 23 },
    { month: "9月", revenue: 5800, grossProfit: 1334, grossMargin: 23 },
    { month: "10月", revenue: 6500, grossProfit: 1560, grossMargin: 24 },
    { month: "11月", revenue: 7200, grossProfit: 1728, grossMargin: 24 },
    { month: "12月", revenue: 8500, grossProfit: 2125, grossMargin: 25 },
  ],
  "2022": [
    { month: "1月", revenue: 3200, grossProfit: 640, grossMargin: 20 },
    { month: "2月", revenue: 2600, grossProfit: 494, grossMargin: 19 },
    { month: "3月", revenue: 3800, grossProfit: 798, grossMargin: 21 },
    { month: "4月", revenue: 4100, grossProfit: 861, grossMargin: 21 },
    { month: "5月", revenue: 4500, grossProfit: 990, grossMargin: 22 },
    { month: "6月", revenue: 4800, grossProfit: 1056, grossMargin: 22 },
    { month: "7月", revenue: 5500, grossProfit: 1210, grossMargin: 22 },
    { month: "8月", revenue: 6200, grossProfit: 1426, grossMargin: 23 },
    { month: "9月", revenue: 6800, grossProfit: 1564, grossMargin: 23 },
    { month: "10月", revenue: 7500, grossProfit: 1800, grossMargin: 24 },
    { month: "11月", revenue: 8200, grossProfit: 1968, grossMargin: 24 },
    { month: "12月", revenue: 9800, grossProfit: 2450, grossMargin: 25 },
  ],
  "2023": [
    { month: "1月", revenue: 3500, grossProfit: 700, grossMargin: 20 },
    { month: "2月", revenue: 2900, grossProfit: 551, grossMargin: 19 },
    { month: "3月", revenue: 4200, grossProfit: 882, grossMargin: 21 },
    { month: "4月", revenue: 4500, grossProfit: 945, grossMargin: 21 },
    { month: "5月", revenue: 4800, grossProfit: 1056, grossMargin: 22 },
    { month: "6月", revenue: 5200, grossProfit: 1144, grossMargin: 22 },
    { month: "7月", revenue: 5800, grossProfit: 1276, grossMargin: 22 },
    { month: "8月", revenue: 6500, grossProfit: 1495, grossMargin: 23 },
    { month: "9月", revenue: 7200, grossProfit: 1656, grossMargin: 23 },
    { month: "10月", revenue: 7800, grossProfit: 1872, grossMargin: 24 },
    { month: "11月", revenue: 8500, grossProfit: 2125, grossMargin: 25 },
    { month: "12月", revenue: 10200, grossProfit: 2652, grossMargin: 26 },
  ],
  "2024": [
    { month: "1月", revenue: 3800, grossProfit: 760, grossMargin: 20 },
    { month: "2月", revenue: 3200, grossProfit: 608, grossMargin: 19 },
    { month: "3月", revenue: 4500, grossProfit: 945, grossMargin: 21 },
    { month: "4月", revenue: 4800, grossProfit: 1008, grossMargin: 21 },
    { month: "5月", revenue: 5100, grossProfit: 1122, grossMargin: 22 },
    { month: "6月", revenue: 5500, grossProfit: 1210, grossMargin: 22 },
    { month: "7月", revenue: 6200, grossProfit: 1426, grossMargin: 23 },
    { month: "8月", revenue: 6800, grossProfit: 1564, grossMargin: 23 },
    { month: "9月", revenue: 7500, grossProfit: 1800, grossMargin: 24 },
    { month: "10月", revenue: 8200, grossProfit: 2050, grossMargin: 25 },
    { month: "11月", revenue: 9000, grossProfit: 2340, grossMargin: 26 },
    { month: "12月", revenue: 10800, grossProfit: 2916, grossMargin: 27 },
  ],
  "2025": [
    { month: "1月", revenue: 4200, grossProfit: 840, grossMargin: 20 },
    { month: "2月", revenue: 3500, grossProfit: 665, grossMargin: 19 },
    { month: "3月", revenue: 4800, grossProfit: 1008, grossMargin: 21 },
    { month: "4月", revenue: 5200, grossProfit: 1092, grossMargin: 21 },
    { month: "5月", revenue: 5500, grossProfit: 1210, grossMargin: 22 },
    { month: "6月", revenue: 5800, grossProfit: 1276, grossMargin: 22 },
    { month: "7月", revenue: 6500, grossProfit: 1495, grossMargin: 23 },
    { month: "8月", revenue: 7200, grossProfit: 1656, grossMargin: 23 },
    { month: "9月", revenue: 7800, grossProfit: 1872, grossMargin: 24 },
    { month: "10月", revenue: 8500, grossProfit: 2125, grossMargin: 25 },
    { month: "11月", revenue: 9500, grossProfit: 2470, grossMargin: 26 },
    { month: "12月", revenue: 11500, grossProfit: 3105, grossMargin: 27 },
  ],
};

export const regionSalesData: Record<string, number> = {
  "广东": 52000,
  "浙江": 38500,
  "江苏": 42000,
  "上海": 35800,
  "北京": 28500,
  "山东": 22000,
  "四川": 15800,
  "福建": 18500,
  "湖北": 12800,
  "湖南": 11200,
  "河南": 10500,
  "安徽": 16200,
  "河北": 9800,
  "辽宁": 13500,
  "陕西": 8200,
  "重庆": 19500,
  "天津": 11800,
  "江西": 9500,
  "广西": 7800,
  "云南": 5200,
  "贵州": 4800,
  "山西": 6500,
  "吉林": 7200,
  "黑龙江": 6800,
  "内蒙古": 3800,
  "新疆": 2500,
  "甘肃": 3200,
  "海南": 4500,
  "宁夏": 1800,
  "青海": 1200,
  "西藏": 800,
  "台湾": 15200,
  "香港": 8800,
  "澳门": 2200,
};

export const topCustomers = [
  { name: "豪威集团", sales: 42800, percentage: 18.5, trend: 22.3 },
  { name: "深圳市京鸿志物流有限公司", sales: 31200, percentage: 13.5, trend: 15.8 },
  { name: "北京淳显科技有限公司", sales: 25600, percentage: 11.1, trend: 8.6 },
  { name: "杭州恒毅信息技术有限公司", sales: 19800, percentage: 8.6, trend: -2.5 },
  { name: "安波福电子（苏州）有限公司", sales: 16500, percentage: 7.1, trend: 12.1 },
];

export const productGrossMargin = [
  { name: "AX650N", margin: 28.5, revenue: 45200, color: "hsl(262, 60%, 55%)" },
  { name: "AX630C", margin: 24.2, revenue: 32100, color: "hsl(195, 85%, 50%)" },
  { name: "AX620Q", margin: 22.8, revenue: 25800, color: "hsl(150, 60%, 50%)" },
  { name: "AX620A", margin: 20.5, revenue: 18600, color: "hsl(35, 90%, 55%)" },
  { name: "AX530", margin: 18.2, revenue: 12500, color: "hsl(340, 70%, 55%)" },
];

export const operatingExpenses: Record<string, { category: string; amount: number; percentage: number; color: string }[]> = {
  "2025": [
    { category: "研发费用", amount: 48500, percentage: 39.2, color: "hsl(262, 60%, 55%)" },
    { category: "销售费用", amount: 28200, percentage: 22.8, color: "hsl(195, 85%, 50%)" },
    { category: "管理费用", amount: 19800, percentage: 16.0, color: "hsl(150, 60%, 50%)" },
    { category: "财务费用", amount: 9200, percentage: 7.4, color: "hsl(35, 90%, 55%)" },
    { category: "折旧摊销", amount: 11500, percentage: 9.3, color: "hsl(340, 70%, 55%)" },
    { category: "其他费用", amount: 6580, percentage: 5.3, color: "hsl(220, 40%, 50%)" },
  ],
  "2024": [
    { category: "研发费用", amount: 42500, percentage: 38.2, color: "hsl(262, 60%, 55%)" },
    { category: "销售费用", amount: 25800, percentage: 23.2, color: "hsl(195, 85%, 50%)" },
    { category: "管理费用", amount: 18200, percentage: 16.4, color: "hsl(150, 60%, 50%)" },
    { category: "财务费用", amount: 8500, percentage: 7.6, color: "hsl(35, 90%, 55%)" },
    { category: "折旧摊销", amount: 10200, percentage: 9.2, color: "hsl(340, 70%, 55%)" },
    { category: "其他费用", amount: 5980, percentage: 5.4, color: "hsl(220, 40%, 50%)" },
  ],
};

export const expenseSubcategories: Record<string, { category: string; amount: number; percentage: number; color: string }[]> = {
  "研发费用": [
    { category: "研发人员薪酬", amount: 28500, percentage: 58.8, color: "hsl(262, 65%, 50%)" },
    { category: "研发材料费", amount: 8200, percentage: 16.9, color: "hsl(262, 55%, 60%)" },
    { category: "IP授权与EDA工具", amount: 5800, percentage: 12.0, color: "hsl(262, 45%, 70%)" },
    { category: "流片与测试", amount: 3500, percentage: 7.2, color: "hsl(262, 35%, 78%)" },
    { category: "外包研发服务", amount: 1800, percentage: 3.7, color: "hsl(280, 50%, 65%)" },
    { category: "研发设备折旧", amount: 700, percentage: 1.4, color: "hsl(245, 50%, 70%)" },
  ],
  "销售费用": [
    { category: "销售人员薪酬", amount: 14200, percentage: 50.4, color: "hsl(195, 85%, 45%)" },
    { category: "市场推广与广告", amount: 6500, percentage: 23.0, color: "hsl(195, 75%, 55%)" },
    { category: "差旅与招待", amount: 3800, percentage: 13.5, color: "hsl(195, 65%, 65%)" },
    { category: "展会与会议", amount: 2200, percentage: 7.8, color: "hsl(195, 55%, 72%)" },
    { category: "销售佣金", amount: 1100, percentage: 3.9, color: "hsl(210, 70%, 60%)" },
    { category: "运输与仓储", amount: 400, percentage: 1.4, color: "hsl(180, 60%, 55%)" },
  ],
  "管理费用": [
    { category: "管理人员薪酬", amount: 9800, percentage: 49.5, color: "hsl(150, 60%, 42%)" },
    { category: "办公租赁", amount: 3500, percentage: 17.7, color: "hsl(150, 50%, 52%)" },
    { category: "中介服务费", amount: 2800, percentage: 14.1, color: "hsl(150, 45%, 62%)" },
    { category: "差旅与办公", amount: 1900, percentage: 9.6, color: "hsl(150, 35%, 70%)" },
    { category: "业务招待", amount: 1100, percentage: 5.6, color: "hsl(160, 50%, 55%)" },
    { category: "其他管理费", amount: 700, percentage: 3.5, color: "hsl(140, 45%, 60%)" },
  ],
  "财务费用": [
    { category: "利息支出", amount: 5200, percentage: 56.5, color: "hsl(35, 90%, 50%)" },
    { category: "汇兑损益", amount: 2100, percentage: 22.8, color: "hsl(35, 80%, 60%)" },
    { category: "手续费", amount: 1300, percentage: 14.1, color: "hsl(35, 70%, 68%)" },
    { category: "其他财务费用", amount: 600, percentage: 6.5, color: "hsl(45, 70%, 60%)" },
  ],
  "折旧摊销": [
    { category: "固定资产折旧", amount: 6800, percentage: 59.1, color: "hsl(340, 70%, 50%)" },
    { category: "无形资产摊销", amount: 3200, percentage: 27.8, color: "hsl(340, 60%, 62%)" },
    { category: "长期待摊费用", amount: 1500, percentage: 13.0, color: "hsl(340, 50%, 70%)" },
  ],
  "其他费用": [
    { category: "诉讼与罚款", amount: 2100, percentage: 31.9, color: "hsl(220, 50%, 50%)" },
    { category: "捐赠支出", amount: 1800, percentage: 27.4, color: "hsl(220, 45%, 60%)" },
    { category: "资产处置损失", amount: 1500, percentage: 22.8, color: "hsl(220, 40%, 68%)" },
    { category: "其他营业外", amount: 1180, percentage: 17.9, color: "hsl(230, 45%, 60%)" },
  ],
};

export const businessLines = ["全部业务", "智能安防", "智能驾驶", "AIoT", "芯片IP授权", "技术服务"];

// Per-business-line weight against total for revenue/margin splitting
export const businessLineWeights: Record<string, { revenueWeight: number; marginAdjust: number }> = {
  "全部业务": { revenueWeight: 1.0, marginAdjust: 0 },
  "智能安防": { revenueWeight: 0.38, marginAdjust: 2 },
  "智能驾驶": { revenueWeight: 0.28, marginAdjust: -1 },
  "AIoT": { revenueWeight: 0.18, marginAdjust: 1 },
  "芯片IP授权": { revenueWeight: 0.10, marginAdjust: 8 },
  "技术服务": { revenueWeight: 0.06, marginAdjust: 4 },
};

export const years = ["2021", "2022", "2023", "2024", "2025"];

// Flatten revenue data into month list for month-based picker (most recent 24 months)
export interface MonthlyDataPoint {
  key: string;          // e.g. "2025-03"
  label: string;        // e.g. "25年3月"
  fullLabel: string;    // e.g. "2025年3月"
  year: string;
  monthNum: number;
  revenue: number;
  grossProfit: number;
  grossMargin: number;
}

export function getMonthlyRevenueData(): MonthlyDataPoint[] {
  const result: MonthlyDataPoint[] = [];
  Object.entries(revenueGrossProfitData).forEach(([year, months]) => {
    months.forEach((m, idx) => {
      const monthNum = idx + 1;
      result.push({
        key: `${year}-${String(monthNum).padStart(2, "0")}`,
        label: `${year.slice(2)}年${monthNum}月`,
        fullLabel: `${year}年${monthNum}月`,
        year,
        monthNum,
        revenue: m.revenue,
        grossProfit: m.grossProfit,
        grossMargin: m.grossMargin,
      });
    });
  });
  return result.sort((a, b) => a.key.localeCompare(b.key));
}

