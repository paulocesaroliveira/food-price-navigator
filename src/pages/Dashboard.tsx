import React from "react";
import { DashboardStats, DashboardFilters } from "@/services/dashboard";
import { getDashboardStats } from "@/services/dashboard/statsService";
import { getRecentOrders } from "@/services/dashboard/ordersService";
import { getSalesData } from "@/services/dashboard/salesService";
import { useQuery } from "@tanstack/react-query";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useState } from "react";
import { StatusOverview } from "@/components/dashboard/StatusOverview";
import DashboardNotices from "@/components/dashboard/DashboardNotices";

const Dashboard = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    period: 'today',
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', filters],
    queryFn: () => getDashboardStats(filters),
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: () => getRecentOrders(),
  });

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-data', filters],
    queryFn: () => getSalesData(filters),
  });

  const handlePeriodChange = (period: DashboardFilters['period']) => {
    setFilters({ ...filters, period });
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setFilters({ ...filters, period: 'custom', [field]: value });
  };

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <DashboardNotices />
      <DashboardHeader
        filters={filters}
        onPeriodChange={handlePeriodChange}
        onCustomDateChange={handleCustomDateChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-1 md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Receita Hoje
              </div>
              <div className="text-2xl font-bold">
                {statsLoading ? "Carregando..." : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.todayRevenue || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Pedidos Hoje
              </div>
              <div className="text-2xl font-bold">{statsLoading ? "Carregando..." : stats?.todayOrders || 0}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Receita da Semana
              </div>
              <div className="text-2xl font-bold">
                {statsLoading ? "Carregando..." : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.weekRevenue || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Pedidos da Semana
              </div>
              <div className="text-2xl font-bold">{statsLoading ? "Carregando..." : stats?.weekOrders || 0}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RecentOrders orders={recentOrders} isLoading={ordersLoading} />
        <QuickActions />
        <StatusOverview />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SalesChart salesData={salesData} isLoading={salesLoading} />
      </div>
    </div>
  );
};

export default Dashboard;
