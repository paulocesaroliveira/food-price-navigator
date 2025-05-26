
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Plus,
  Eye,
  Calendar,
  BarChart3,
  Filter
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { getDashboardStats, getRecentOrders, getSalesData, DashboardFilters, DashboardStats } from "@/services/dashboardService";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    period: 'week'
  });

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Novo": return "bg-blue-100 text-blue-800";
      case "Em preparo": return "bg-yellow-100 text-yellow-800";
      case "Pronto": return "bg-green-100 text-green-800";
      case "Finalizado": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const defaultStats: DashboardStats = {
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
    <div className="space-y-6 p-6">
      {/* Header with Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={filters.period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          {filters.period === 'custom' && (
            <div className="flex gap-2 items-center">
              <div>
                <Label htmlFor="start-date" className="text-xs">De:</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                  className="w-36"
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="text-xs">Até:</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                  className="w-36"
                />
              </div>
            </div>
          )}

          <Button variant="outline" size="sm" asChild>
            <Link to="/relatorios">
              <Calendar className="h-4 w-4 mr-2" />
              Relatórios
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
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
              {statsLoading ? "..." : formatCurrency(currentStats.weekRevenue)}
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
              {statsLoading ? "..." : currentStats.weekOrders}
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
              {statsLoading ? "..." : formatCurrency(currentStats.avgOrderValue)}
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
              {statsLoading ? "..." : currentStats.totalCustomers}
            </div>
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart - Usando dados reais do Supabase */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vendas do Período</CardTitle>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-muted-foreground">Carregando dados...</div>
              </div>
            ) : !salesData || salesData.length === 0 ? (
              <div className="h-80 flex items-center justify-center flex-col gap-2">
                <div className="text-muted-foreground">Nenhum dado de vendas encontrado</div>
                <p className="text-sm text-muted-foreground">Comece registrando suas primeiras vendas</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#E76F51" 
                    fill="#E76F51" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status de Estoque - dados estáticos por enquanto */}
        <Card>
          <CardHeader>
            <CardTitle>Status Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Produtos Ativos</span>
                <span className="text-sm font-medium">12</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Receitas</span>
                <span className="text-sm font-medium">8</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-secondary h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Pedidos Pendentes</span>
                <span className="text-sm font-medium">{currentStats.todayOrders}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders - Dados reais do Supabase */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pedidos Recentes</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/orders">
                <Eye className="h-4 w-4 mr-2" />
                Ver todos
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
                    <div className="flex flex-col space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-medium">{order.id} - {order.customer}</span>
                      <span className="text-sm text-muted-foreground">{order.time}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{formatCurrency(order.value)}</span>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="mb-2">Nenhum pedido encontrado</div>
                <p className="text-sm">Comece criando seu primeiro pedido</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/orders">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Pedido
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/products">
                  <Package className="h-4 w-4 mr-2" />
                  Produtos
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/customers">
                  <Users className="h-4 w-4 mr-2" />
                  Clientes
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/sales">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Vendas
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
