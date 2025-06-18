
import React, { useState } from "react";
import RecentOrders from "@/components/dashboard/RecentOrders";
import QuickActions from "@/components/dashboard/QuickActions";
import SalesChart from "@/components/dashboard/SalesChart";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusOverview from "@/components/dashboard/StatusOverview";
import DashboardNotices from "@/components/dashboard/DashboardNotices";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardStats, DashboardFilters } from "@/services/dashboard";
import { getDashboardStats } from "@/services/dashboard/statsService";
import { getRecentOrders } from "@/services/dashboard/ordersService";
import { getSalesData } from "@/services/dashboard/salesService";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useProfileBlocked } from "@/hooks/useProfileBlocked";
import { AlertTriangle } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { isBlocked } = useProfileBlocked();
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

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Notificação de bloqueio - aparece apenas para usuários bloqueados */}
      {isBlocked && (
        <Card className="bg-red-50 border-red-200 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">
                  Conta Bloqueada
                </h3>
                <p className="text-red-700 mt-1">
                  Seu acesso foi restrito pelo administrador do sistema. Você pode visualizar apenas o Dashboard e acessar o Suporte.
                </p>
                <p className="text-red-600 text-sm mt-2">
                  Para resolver esta situação, entre em contato através da página de Suporte.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
