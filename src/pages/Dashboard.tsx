
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, getRecentOrders, getSalesData, DashboardFilters } from "@/services/dashboard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import SalesChart from "@/components/dashboard/SalesChart";
import StatusOverview from "@/components/dashboard/StatusOverview";
import RecentOrders from "@/components/dashboard/RecentOrders";
import QuickActions from "@/components/dashboard/QuickActions";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  ShoppingCart,
  Target,
  Activity
} from "lucide-react";

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
    <>
      <SEOHead 
        title="Dashboard - TastyHub"
        description="Visão geral completa do seu negócio com estatísticas, vendas e relatórios em tempo real"
        keywords="dashboard, estatísticas, vendas, relatórios, negócio"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container-responsive py-4 sm:py-6 lg:py-8 spacing-responsive">
          {/* Header */}
          <PageHeader
            title="Dashboard"
            subtitle="Visão geral completa do seu negócio"
            icon={BarChart3}
            gradient="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700"
            badges={[
              { icon: TrendingUp, text: "Análise em Tempo Real" },
              { icon: Target, text: "Insights Precisos" }
            ]}
            actions={
              <DashboardHeader
                filters={filters}
                onPeriodChange={handlePeriodChange}
                onCustomDateChange={handleCustomDateChange}
              />
            }
          />

          {/* Stats Cards */}
          <DashboardStats
            stats={stats}
            filters={filters}
            isLoading={statsLoading}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Sales Chart - Takes 2 columns */}
            <div className="lg:col-span-2">
              <SalesChart
                salesData={salesData}
                isLoading={salesLoading}
              />
            </div>

            {/* Status Overview */}
            <div className="lg:col-span-1">
              <StatusOverview />
            </div>
          </div>

          {/* Secondary Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Recent Orders */}
            <RecentOrders
              orders={recentOrders || []}
              isLoading={ordersLoading}
            />

            {/* Quick Actions */}
            <QuickActions />
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-emerald-50 group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="rounded-xl p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 group-hover:scale-110 transition-transform duration-300">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Meta</Badge>
                </div>
                <p className="text-lg font-bold text-gray-900">85%</p>
                <p className="text-xs text-gray-500">Performance Geral</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-cyan-50 group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="rounded-xl p-2 bg-gradient-to-r from-cyan-500 to-cyan-600 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Hoje</Badge>
                </div>
                <p className="text-lg font-bold text-gray-900">24</p>
                <p className="text-xs text-gray-500">Clientes Ativos</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-rose-50 group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="rounded-xl p-2 bg-gradient-to-r from-rose-500 to-rose-600 group-hover:scale-110 transition-transform duration-300">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Estoque</Badge>
                </div>
                <p className="text-lg font-bold text-gray-900">156</p>
                <p className="text-xs text-gray-500">Produtos Disponíveis</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-violet-50 group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="rounded-xl p-2 bg-gradient-to-r from-violet-500 to-violet-600 group-hover:scale-110 transition-transform duration-300">
                    <ShoppingCart className="h-4 w-4 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Mês</Badge>
                </div>
                <p className="text-lg font-bold text-gray-900">2.4K</p>
                <p className="text-xs text-gray-500">Pedidos Processados</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
