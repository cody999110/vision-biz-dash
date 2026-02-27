import { motion } from "framer-motion";
import { Activity, Calendar } from "lucide-react";

const DashboardHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between mb-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
          <Activity className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
            财务数据看板
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            实时监控企业核心财务指标
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
        <Calendar className="w-3.5 h-3.5 text-primary" />
        <span>数据更新: 2024年12月</span>
        <div className="pulse-dot ml-1" />
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
