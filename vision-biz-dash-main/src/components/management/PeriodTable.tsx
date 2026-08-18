import { cn } from "@/lib/utils";
import type { PeriodAmounts, ReportLineRow } from "@/lib/api";
import { formatPct, formatWan, formatYoy, yoyClass } from "@/components/management/format";

export default function PeriodTable({
  title,
  rows,
  year,
  priorYear,
  pick,
  isRate = false,
}: {
  title: string;
  rows: ReportLineRow[];
  year: number;
  priorYear: number;
  pick: (row: ReportLineRow) => PeriodAmounts;
  isRate?: boolean;
}) {
  const formatValue = (value: number) => (isRate ? formatPct(value) : formatWan(value));

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <h3 className="font-display text-sm font-semibold">{title}</h3>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground border-b border-border">
              <th className="text-left font-medium px-4 py-2.5">业务线</th>
              <th className="text-right font-medium px-3 py-2.5">H1</th>
              <th className="text-right font-medium px-3 py-2.5">H2</th>
              <th className="text-right font-medium px-3 py-2.5">{year}全年</th>
              <th className="text-right font-medium px-3 py-2.5">{priorYear}年</th>
              <th className="text-right font-medium px-4 py-2.5">同比</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const period = pick(row);
              const total = row.kind === "total";
              return (
                <tr
                  key={row.line_id}
                  className={cn(
                    "border-b border-border last:border-0",
                    total && "bg-muted/50 font-semibold",
                    row.kind === "unallocated" && "text-muted-foreground",
                  )}
                >
                  <td className="px-4 py-2.5 whitespace-nowrap">{row.line_name}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatValue(period.h1)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatValue(period.h2)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatValue(period.year)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatValue(period.prior_year)}</td>
                  <td className={cn("px-4 py-2.5 text-right tabular-nums", yoyClass(period.yoy))}>
                    {formatYoy(period.yoy, isRate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
