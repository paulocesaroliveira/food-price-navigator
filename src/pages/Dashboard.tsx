
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, getRecentOrders, getSalesData, DashboardFilters } from "@/services/dashboard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import SalesChart from "@/components/dashboard/SalesChart";
import StatusOverview from "@/components/dashboard/StatusOverview";
import RecentOrders from "@/components/dashboard/RecentOrders";
import QuickActions from "@/components/dashboard/QuickActions";

const Dashboard = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    period: 'week'
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', filters],
    queryFn: () => getDashboardStats(filters),
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: getRecentOrders,
  });

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-data', filters],
    queryFn: () => getSalesData(filters),
  });

  const handlePeriodChange = (period: DashboardFilters['period']) => {
    setFilters(prev => ({ ...prev, period }));
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 p-6">
      <DashboardHeader
        filters={filters}
        onPeriodChange={handlePeriodChange}
        onCustomDateChange={handleCustomDateChange}
      />

      <DashboardStats
        stats={stats}
        filters={filters}
        isLoading={statsLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SalesChart
          salesData={salesData}
          isLoading={salesLoading}
        />

        <StatusOverview />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders
          orders={recentOrders || []}
          isLoading={ordersLoading}
        />

        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
