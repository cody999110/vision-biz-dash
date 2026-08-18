import { Link, useLocation } from "react-router-dom";
import { PieChart, Settings2, Table2 } from "lucide-react";
import CompanySwitcher from "@/components/layout/CompanySwitcher";
import WorkspaceMenu from "@/components/layout/WorkspaceMenu";
import { useDataSource } from "@/contexts/DataSourceContext";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/management/config", label: "报表配置", icon: Settings2 },
  { to: "/management/report", label: "管理报表", icon: Table2 },
  { to: "/management/charts", label: "管理图表", icon: PieChart },
];

const TITLES: Record<string, string> = {
  "/management/config": "报表配置",
  "/management/report": "管理报表",
  "/management/charts": "管理图表",
};

export default function ManagementShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isDemo } = useDataSource();
  const title = TITLES[location.pathname] ?? "管理报表";

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-[1440px] mx-auto space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-lg font-semibold text-foreground tracking-tight leading-none">
              {title}
            </h1>
            <CompanySwitcher className="mt-1" />
          </div>
          <WorkspaceMenu />
        </div>

        <div className="flex items-center gap-1">
          {NAV.map(item => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md text-muted-foreground hover:text-foreground",
                  active && "bg-muted text-foreground font-medium",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {isDemo && (
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            管理报表按公司配置。请先在左上角切换到已上传公司，并确保已上传收入、费用数据。
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
