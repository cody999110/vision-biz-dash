import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataSourceProvider } from "@/contexts/DataSourceContext";
import Index from "./pages/Index";
import ExpenseAnalysis from "./pages/ExpenseAnalysis";
import RevenueAnalysis from "./pages/RevenueAnalysis";
import FundAnalysis from "./pages/FundAnalysis";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DataSourceProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/expense-analysis" element={<ExpenseAnalysis />} />
            <Route path="/revenue-analysis" element={<RevenueAnalysis />} />
            <Route path="/fund-analysis" element={<FundAnalysis />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </DataSourceProvider>
  </QueryClientProvider>
);

export default App;
