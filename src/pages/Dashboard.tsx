
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
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  ShoppingCart,
  Target,
  Activity,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";

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

  // Buscar dados reais para os cards de performance (sem Performance Geral)
  const { data: realTimeData } = useQuery({
    queryKey: ['dashboard-realtime'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Clientes ativos (clientes com pedidos nos últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: activeCustomers } = await supabase
        .from('orders')
        .select('customer_id')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      // Produtos disponíveis
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Pedidos processados no mês
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      
      const { count: monthlyOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', firstDayOfMonth.toISOString());

      const uniqueCustomers = activeCustomers ? new Set(activeCustomers.map(o => o.customer_id)).size : 0;

      return {
        activeCustomers: uniqueCustomers,
        availableProducts: productCount || 0,
        monthlyOrders: monthlyOrders || 0
      };
    }
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
              <div className="flex flex-wrap gap-3 items-center">
                <DashboardHeader
                  filters={filters}
                  onPeriodChange={handlePeriodChange}
                  onCustomDateChange={handleCustomDateChange}
                />
                <Button variant="default" size="sm" asChild className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-200">
                  <Link to="/relatorios">
                    <Calendar className="h-4 w-4 mr-2" />
                    Relatórios
                  </Link>
                </Button>
              </div>
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

          {/* Performance Metrics - DADOS REAIS (sem Performance Geral) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-cyan-50 group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="rounded-xl p-2 bg-gradient-to-r from-cyan-500 to-cyan-600 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <Badge variant="outline" className="text-xs bg-white border-cyan-200 text-cyan-700">7 dias</Badge>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {realTimeData?.activeCustomers || 0}
                </p>
                <p className="text-xs text-gray-500">Clientes Ativos</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-rose-50 group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="rounded-xl p-2 bg-gradient-to-r from-rose-500 to-rose-600 group-hover:scale-110 transition-transform duration-300">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <Badge variant="outline" className="text-xs bg-white border-rose-200 text-rose-700">Estoque</Badge>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {realTimeData?.availableProducts || 0}
                </p>
                <p className="text-xs text-gray-500">Produtos Disponíveis</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-violet-50 group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="rounded-xl p-2 bg-gradient-to-r from-violet-500 to-violet-600 group-hover:scale-110 transition-transform duration-300">
                    <ShoppingCart className="h-4 w-4 text-white" />
                  </div>
                  <Badge variant="outline" className="text-xs bg-white border-violet-200 text-violet-700">Mês</Badge>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {realTimeData?.monthlyOrders || 0}
                </p>
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
