import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { topCustomers } from "@/data/mockData";

const TopCustomers = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="glass-card p-5"
    >
      <h3 className="font-display text-base font-semibold text-foreground mb-4">
        前五大客户
      </h3>
      <div className="space-y-3">
        {topCustomers.map((customer, index) => (
          <div
            key={customer.name}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-xs font-bold text-primary font-display shrink-0">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {customer.name}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  ¥{customer.sales.toLocaleString()}万
                </span>
                <span className="text-xs text-muted-foreground">
                  占比 {customer.percentage}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs shrink-0">
              {customer.trend > 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-chart-3" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-destructive" />
              )}
              <span className={customer.trend > 0 ? "text-chart-3" : "text-destructive"}>
                {customer.trend > 0 ? "+" : ""}{customer.trend}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TopCustomers;
