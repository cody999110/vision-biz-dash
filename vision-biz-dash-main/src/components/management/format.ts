export function formatWan(value: number) {
  return value.toLocaleString("zh-CN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatPct(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatYoy(value: number | null, isRate = false) {
  if (value === null || value === undefined) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}${isRate ? "ppt" : "%"}`;
}

export function yoyClass(value: number | null) {
  if (value === null || value === 0) return "text-muted-foreground";
  return value > 0 ? "text-chart-3" : "text-destructive";
}

export function newConfigId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
