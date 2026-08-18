import { Building2, FlaskConical } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEMO_VIEW, useDataSource } from "@/contexts/DataSourceContext";
import { cn } from "@/lib/utils";

export default function CompanySwitcher({ className }: { className?: string }) {
  const { selectedView, isDemo, companies, selectView } = useDataSource();

  return (
    <Select value={selectedView} onValueChange={selectView}>
      <SelectTrigger
        className={cn(
          "h-7 w-auto min-w-[132px] max-w-[220px] border-0 bg-transparent px-0 shadow-none gap-1.5 text-sm text-muted-foreground hover:text-foreground focus:ring-0 focus:ring-offset-0",
          className,
        )}
      >
        {isDemo ? (
          <FlaskConical className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <Building2 className="w-3.5 h-3.5 shrink-0 text-primary" />
        )}
        <SelectValue placeholder="选择公司" />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectGroup>
          <SelectLabel>示例</SelectLabel>
          <SelectItem value={DEMO_VIEW}>演示数据</SelectItem>
        </SelectGroup>
        {companies.length > 0 && (
          <>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>已上传公司</SelectLabel>
              {companies.map(company => (
                <SelectItem key={company.name} value={company.name}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </>
        )}
      </SelectContent>
    </Select>
  );
}
