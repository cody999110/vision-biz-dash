import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KpiCards from "@/components/dashboard/KpiCards";
import RevenueChart from "@/components/dashboard/RevenueChart";
import ChinaMapChart from "@/components/dashboard/ChinaMapChart";
import TopCustomers from "@/components/dashboard/TopCustomers";
import ProductMarginChart from "@/components/dashboard/ProductMarginChart";
import ExpensesChart from "@/components/dashboard/ExpensesChart";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-[1440px] mx-auto">
        <DashboardHeader />
        <KpiCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div>
            <TopCustomers />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <div>
            <ChinaMapChart />
          </div>
          <div>
            <ProductMarginChart />
          </div>
          <div>
            <ExpensesChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
