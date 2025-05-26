import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  ShoppingCart,
  Users
} from "lucide-react";
import { DashboardStats as StatsType, DashboardFilters } from "@/services/dashboard";

interface DashboardStatsProps {
  stats: StatsType | null;
  filters: DashboardFilters;
  isLoading: boolean;
}

const DashboardStats = ({ stats, filters, isLoading }: DashboardStatsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const defaultStats: StatsType = {
    todayRevenue: 0,
    todayOrders: 0,
    weekRevenue: 0,
    weekOrders: 0,
    monthRevenue: 0,
    monthOrders: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    avgOrderValue: 0,
    totalCustomers: 0
  };

  const currentStats = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {filters.period === 'today' ? 'Vendas Hoje' : 
             filters.period === 'week' ? 'Vendas na Semana' : 
             filters.period === 'month' ? 'Vendas no Mês' : 'Vendas no Período'}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : formatCurrency(currentStats.weekRevenue)}
          </div>
          <p className="text-xs text-muted-foreground flex items-center">
            {currentStats.revenueGrowth >= 0 ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
            )}
            {Math.abs(currentStats.revenueGrowth).toFixed(1)}% em relação ao período anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {filters.period === 'today' ? 'Pedidos Hoje' : 
             filters.period === 'week' ? 'Pedidos na Semana' : 
             filters.period === 'month' ? 'Pedidos no Mês' : 'Pedidos no Período'}
          </CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : currentStats.weekOrders}
          </div>
          <p className="text-xs text-muted-foreground flex items-center">
            {currentStats.ordersGrowth >= 0 ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
            )}
            {Math.abs(currentStats.ordersGrowth).toFixed(1)}% em relação ao período anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : formatCurrency(currentStats.avgOrderValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Valor médio por pedido
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : currentStats.totalCustomers}
          </div>
          <p className="text-xs text-muted-foreground">
            Clientes cadastrados
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
