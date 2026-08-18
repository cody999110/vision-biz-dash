import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ManagementShell from "@/components/management/ManagementShell";
import { newConfigId } from "@/components/management/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataSource } from "@/contexts/DataSourceContext";
import {
  api,
  type AllocationMatchField,
  type AllocationMethod,
  type AllocationRuleConfig,
  type BusinessLineConfig,
  type ExpenseGroupConfig,
  type ManagementConfigUpdate,
} from "@/lib/api";

const MATCH_LABELS: Record<AllocationMatchField, string> = {
  expense_category: "费用大类",
  department_name: "部门",
  expense_subject: "费用科目",
};

function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const next = index + direction;
  if (next < 0 || next >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(index, 1);
  copy.splice(next, 0, item);
  return copy;
}

function OptionChecks({
  options,
  selected,
  onToggle,
  takenBy,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  takenBy?: (value: string) => string | undefined;
}) {
  if (!options.length) {
    return <p className="text-xs text-muted-foreground">暂无上传数据可选项，也可在下方手动添加。</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(option => {
        const taken = takenBy?.(option);
        const checked = selected.includes(option);
        return (
          <label
            key={option}
            className={`text-xs px-2 py-1 rounded-md border cursor-pointer ${
              checked
                ? "border-primary/40 bg-primary/10 text-primary"
                : taken
                  ? "border-border text-muted-foreground"
                  : "border-border hover:border-primary/30"
            }`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={checked}
              disabled={Boolean(taken) && !checked}
              onChange={() => onToggle(option)}
            />
            {option}
            {taken && !checked ? ` · ${taken}` : ""}
          </label>
        );
      })}
    </div>
  );
}

export default function ManagementConfig() {
  const queryClient = useQueryClient();
  const { isDemo, currentCompany } = useDataSource();
  const company = currentCompany?.name;
  const [draft, setDraft] = useState<ManagementConfigUpdate | null>(null);
  const [aliasDraft, setAliasDraft] = useState<Record<string, string>>({});
  const [subjectDraft, setSubjectDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data: config } = useQuery({
    queryKey: ["mgmt-config", company],
    queryFn: () => api.getManagementConfig(company!),
    enabled: Boolean(company),
  });
  const { data: distincts } = useQuery({
    queryKey: ["mgmt-distincts", company],
    queryFn: () => api.getManagementDistincts(company!),
    enabled: Boolean(company),
  });

  useEffect(() => {
    setDraft(null);
  }, [company]);

  useEffect(() => {
    if (!config) return;
    setDraft({
      business_lines: config.business_lines,
      expense_groups: config.expense_groups,
      allocation_rules: config.allocation_rules,
    });
  }, [config]);

  const ratioSumByRule = useMemo(() => {
    if (!draft) return {};
    const result: Record<string, number> = {};
    for (const rule of draft.allocation_rules) {
      result[rule.id] = draft.business_lines.reduce((sum, line) => sum + Number(rule.ratios[line.id] || 0), 0);
    }
    return result;
  }, [draft]);

  if (isDemo || !company || !draft) {
    return (
      <ManagementShell>
        {!isDemo && <div className="text-sm text-muted-foreground">加载配置中...</div>}
      </ManagementShell>
    );
  }

  const takenAlias = (value: string, currentId: string) => {
    const key = value.trim().toLowerCase();
    const found = draft.business_lines.find(line => {
      if (line.id === currentId) return false;
      return line.name.trim().toLowerCase() === key || line.aliases.some(alias => alias.trim().toLowerCase() === key);
    });
    return found?.name;
  };

  const takenSubject = (value: string, currentId: string) => {
    const found = draft.expense_groups.find(group => group.id !== currentId && group.subjects.includes(value));
    return found?.name;
  };

  const updateLines = (business_lines: BusinessLineConfig[]) => setDraft({ ...draft, business_lines });
  const updateGroups = (expense_groups: ExpenseGroupConfig[]) => setDraft({ ...draft, expense_groups });
  const updateRules = (allocation_rules: AllocationRuleConfig[]) => setDraft({ ...draft, allocation_rules });

  const handleSave = async () => {
    if (!draft.business_lines.length || draft.business_lines.some(line => !line.name.trim())) {
      toast.error("请为每条业务线填写名称");
      return;
    }
    if (draft.expense_groups.some(group => !group.name.trim())) {
      toast.error("请为每个费用大类填写名称");
      return;
    }
    if (draft.allocation_rules.some(rule => !rule.name.trim())) {
      toast.error("请为每条分摊规则填写名称");
      return;
    }
    setSaving(true);
    try {
      await api.saveManagementConfig(company, draft);
      await queryClient.invalidateQueries({ queryKey: ["mgmt-config", company] });
      await queryClient.invalidateQueries({ queryKey: ["mgmt-distincts", company] });
      await queryClient.invalidateQueries({ queryKey: ["mgmt-report"] });
      toast.success("配置已保存，报表将按新规则归集");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ManagementShell>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground max-w-2xl">
          把上传数据里的业务线、费用科目归到你定义的管理口径；后台/管理/研发等共用费用用分摊规则切到各业务线。保存后到「管理报表」「管理图表」查看。
        </p>
        <Button onClick={() => void handleSave()} disabled={saving}>
          {saving ? "保存中..." : "保存配置"}
        </Button>
      </div>

      {distincts && (distincts.unmapped_business_lines.length > 0 || distincts.unmapped_subjects.length > 0) && (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground space-y-1">
          {distincts.unmapped_business_lines.length > 0 && (
            <p>未单独映射的收入业务线（将进入兜底）：{distincts.unmapped_business_lines.join("、")}</p>
          )}
          {distincts.unmapped_subjects.length > 0 && (
            <p>未归集的费用科目：{distincts.unmapped_subjects.join("、")}</p>
          )}
        </div>
      )}

      <Tabs defaultValue="lines">
        <TabsList>
          <TabsTrigger value="lines">业务线</TabsTrigger>
          <TabsTrigger value="groups">费用归集</TabsTrigger>
          <TabsTrigger value="alloc">费用分摊</TabsTrigger>
        </TabsList>

        <TabsContent value="lines" className="space-y-3 mt-4">
          {draft.business_lines.map((line, index) => (
            <div key={line.id} className="glass-card p-4 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Input
                  className="max-w-xs h-9"
                  value={line.name}
                  placeholder="业务线名称，例如：轮胎"
                  onChange={e => updateLines(draft.business_lines.map(item => (
                    item.id === line.id ? { ...item, name: e.target.value } : item
                  )))}
                />
                <label className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
                  未匹配时归入此线
                  <Switch
                    checked={line.catch_all}
                    onCheckedChange={checked => updateLines(draft.business_lines.map(item => (
                      item.id === line.id ? { ...item, catch_all: checked } : { ...item, catch_all: checked ? false : item.catch_all }
                    )))}
                  />
                </label>
                <Button variant="ghost" size="sm" onClick={() => updateLines(moveItem(draft.business_lines, index, -1))}>
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => updateLines(moveItem(draft.business_lines, index, 1))}>
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={draft.business_lines.length <= 1}
                  onClick={() => updateLines(draft.business_lines.filter(item => item.id !== line.id))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">对应上传数据中的业务线字段</Label>
                <OptionChecks
                  options={distincts?.business_lines ?? []}
                  selected={line.aliases}
                  takenBy={value => takenAlias(value, line.id)}
                  onToggle={value => updateLines(draft.business_lines.map(item => {
                    if (item.id !== line.id) return item;
                    const aliases = item.aliases.includes(value)
                      ? item.aliases.filter(alias => alias !== value)
                      : [...item.aliases, value];
                    return { ...item, aliases };
                  }))}
                />
                <div className="flex gap-2 max-w-md">
                  <Input
                    className="h-8 text-xs"
                    placeholder="手动添加别名"
                    value={aliasDraft[line.id] ?? ""}
                    onChange={e => setAliasDraft(prev => ({ ...prev, [line.id]: e.target.value }))}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const value = (aliasDraft[line.id] ?? "").trim();
                      if (!value) return;
                      updateLines(draft.business_lines.map(item => (
                        item.id === line.id && !item.aliases.includes(value)
                          ? { ...item, aliases: [...item.aliases, value] }
                          : item
                      )));
                      setAliasDraft(prev => ({ ...prev, [line.id]: "" }));
                    }}
                  >
                    添加
                  </Button>
                </div>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => updateLines([
              ...draft.business_lines,
              { id: newConfigId("line"), name: "", aliases: [], catch_all: false },
            ])}
          >
            <Plus className="w-4 h-4" /> 添加业务线
          </Button>
        </TabsContent>

        <TabsContent value="groups" className="space-y-3 mt-4">
          <p className="text-xs text-muted-foreground">把费用科目归到管理口径，例如差旅、工资都进「人力成本」。</p>
          {draft.expense_groups.map(group => (
            <div key={group.id} className="glass-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  className="max-w-xs h-9"
                  value={group.name}
                  placeholder="费用大类名称，例如：人力成本"
                  onChange={e => updateGroups(draft.expense_groups.map(item => (
                    item.id === group.id ? { ...item, name: e.target.value } : item
                  )))}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => updateGroups(draft.expense_groups.filter(item => item.id !== group.id))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <OptionChecks
                options={distincts?.expense_subjects ?? []}
                selected={group.subjects}
                takenBy={value => takenSubject(value, group.id)}
                onToggle={value => updateGroups(draft.expense_groups.map(item => {
                  if (item.id !== group.id) return item;
                  const subjects = item.subjects.includes(value)
                    ? item.subjects.filter(subject => subject !== value)
                    : [...item.subjects, value];
                  return { ...item, subjects };
                }))}
              />
              <div className="flex gap-2 max-w-md">
                <Input
                  className="h-8 text-xs"
                  placeholder="手动添加科目"
                  value={subjectDraft[group.id] ?? ""}
                  onChange={e => setSubjectDraft(prev => ({ ...prev, [group.id]: e.target.value }))}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const value = (subjectDraft[group.id] ?? "").trim();
                    if (!value) return;
                    updateGroups(draft.expense_groups.map(item => (
                      item.id === group.id && !item.subjects.includes(value)
                        ? { ...item, subjects: [...item.subjects, value] }
                        : item
                    )));
                    setSubjectDraft(prev => ({ ...prev, [group.id]: "" }));
                  }}
                >
                  添加
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => updateGroups([
              ...draft.expense_groups,
              { id: newConfigId("group"), name: "", subjects: [] },
            ])}
          >
            <Plus className="w-4 h-4" /> 添加费用大类
          </Button>
        </TabsContent>

        <TabsContent value="alloc" className="space-y-3 mt-4">
          <p className="text-xs text-muted-foreground">
            规则按从上到下匹配，命中第一条即停止。比例分摊按你填的百分比；按收入分摊则用各业务线当期收入占比。
          </p>
          {draft.allocation_rules.map((rule, index) => {
            const options = rule.match_field === "department_name"
              ? distincts?.departments ?? []
              : rule.match_field === "expense_subject"
                ? distincts?.expense_subjects ?? []
                : distincts?.expense_categories ?? [];
            const sum = ratioSumByRule[rule.id] ?? 0;
            return (
              <div key={rule.id} className="glass-card p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    className="max-w-xs h-9"
                    value={rule.name}
                    placeholder="规则名称，例如：管理费用分摊"
                    onChange={e => updateRules(draft.allocation_rules.map(item => (
                      item.id === rule.id ? { ...item, name: e.target.value } : item
                    )))}
                  />
                  <Select
                    value={rule.match_field}
                    onValueChange={(value: AllocationMatchField) => updateRules(draft.allocation_rules.map(item => (
                      item.id === rule.id ? { ...item, match_field: value, match_values: [] } : item
                    )))}
                  >
                    <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(MATCH_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={rule.method}
                    onValueChange={(value: AllocationMethod) => updateRules(draft.allocation_rules.map(item => (
                      item.id === rule.id ? { ...item, method: value } : item
                    )))}
                  >
                    <SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ratio">按比例分摊</SelectItem>
                      <SelectItem value="revenue_share">按收入占比</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => updateRules(moveItem(draft.allocation_rules, index, -1))}>
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => updateRules(moveItem(draft.allocation_rules, index, 1))}>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => updateRules(draft.allocation_rules.filter(item => item.id !== rule.id))}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">命中条件（{MATCH_LABELS[rule.match_field]}）</Label>
                  <OptionChecks
                    options={options}
                    selected={rule.match_values}
                    onToggle={value => updateRules(draft.allocation_rules.map(item => {
                      if (item.id !== rule.id) return item;
                      const match_values = item.match_values.includes(value)
                        ? item.match_values.filter(entry => entry !== value)
                        : [...item.match_values, value];
                      return { ...item, match_values };
                    }))}
                  />
                </div>
                {rule.method === "ratio" && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      分摊比例（合计 {sum}%{sum !== 100 ? "，保存时会按比例归一化" : ""}）
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {draft.business_lines.map(line => (
                        <div key={line.id} className="flex items-center gap-2">
                          <span className="text-xs w-20 truncate">{line.name || "未命名"}</span>
                          <Input
                            className="h-8"
                            type="number"
                            min={0}
                            value={rule.ratios[line.id] ?? 0}
                            onChange={e => updateRules(draft.allocation_rules.map(item => (
                              item.id === rule.id
                                ? { ...item, ratios: { ...item.ratios, [line.id]: Number(e.target.value) } }
                                : item
                            )))}
                          />
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => updateRules([
              ...draft.allocation_rules,
              {
                id: newConfigId("rule"),
                name: "",
                match_field: "expense_category",
                match_values: [],
                method: "ratio",
                ratios: Object.fromEntries(draft.business_lines.map(line => [line.id, 0])),
              },
            ])}
          >
            <Plus className="w-4 h-4" /> 添加分摊规则
          </Button>
        </TabsContent>
      </Tabs>
    </ManagementShell>
  );
}
