
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Calendar, TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, Users, AlertTriangle, Target, PieChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/calculations";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

const Relatorios = () => {
  const [dateRange, setDateRange] = useState("month");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();

  // Calcular período baseado na seleção
  const getDateRange = () => {
    if (dateRange === "custom" && customStartDate && customEndDate) {
      return {
        startDate: customStartDate.toISOString().split('T')[0],
        endDate: customEndDate.toISOString().split('T')[0]
      };
    }

    const now = new Date();
    const start = new Date();
    
    switch (dateRange) {
      case "week":
        start.setDate(now.getDate() - 7);
        break;
      case "month":
        start.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        start.setMonth(now.getMonth() - 3);
        break;
      case "year":
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setMonth(now.getMonth() - 1);
    }
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    };
  };

  const { startDate, endDate } = getDateRange();

  // Query para métricas de vendas
  const { data: salesMetrics } = useQuery({
    queryKey: ['salesMetrics', startDate, endDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: sales, error } = await supabase
        .from('sales')
        .select('total_amount, gross_profit, net_profit, sale_date')
        .eq('user_id', user.id)
        .gte('sale_date', startDate)
        .lte('sale_date', endDate);
      
      if (error) throw error;
      
      const totalRevenue = sales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      const totalProfit = sales?.reduce((sum, sale) => sum + Number(sale.net_profit), 0) || 0;
      const salesCount = sales?.length || 0;
      const avgTicket = salesCount > 0 ? totalRevenue / salesCount : 0;
      
      return { totalRevenue, totalProfit, salesCount, avgTicket, sales: sales || [] };
    }
  });

  // Query para produtos mais vendidos
  const { data: topProducts } = useQuery({
    queryKey: ['topProducts', startDate, endDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('sale_items')
        .select(`
          product_id,
          quantity,
          total_price,
          products!inner(name, user_id)
        `)
        .eq('products.user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      if (error) throw error;
      
      const productMap = new Map();
      data?.forEach(item => {
        const productId = item.product_id;
        const existing = productMap.get(productId) || {
          name: item.products?.name || 'Produto sem nome',
          quantity: 0,
          revenue: 0
        };
        
        existing.quantity += item.quantity;
        existing.revenue += Number(item.total_price);
        productMap.set(productId, existing);
      });
      
      return Array.from(productMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 8);
    }
  });

  // Query para status dos pedidos
  const { data: ordersStatus } = useQuery({
    queryKey: ['ordersStatus', startDate, endDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('orders')
        .select('status, total_amount')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      if (error) throw error;
      
      const statusMap = data?.reduce((acc, order) => {
        const status = order.status;
        if (!acc[status]) {
          acc[status] = { count: 0, value: 0 };
        }
        acc[status].count += 1;
        acc[status].value += Number(order.total_amount);
        return acc;
      }, {} as Record<string, { count: number; value: number }>) || {};
      
      return Object.entries(statusMap).map(([status, data]) => ({
        status: status === 'pending' ? 'Pendente' : 
                status === 'confirmed' ? 'Confirmado' :
                status === 'in_production' ? 'Em Produção' :
                status === 'ready' ? 'Pronto' :
                status === 'delivered' ? 'Entregue' :
                status === 'cancelled' ? 'Cancelado' : status,
        count: data.count,
        value: data.value
      }));
    }
  });

  // Query para contas a pagar
  const { data: accountsPayable } = useQuery({
    queryKey: ['accountsPayable'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('accounts_payable')
        .select('amount, status, due_date, expense_categories(name)')
        .eq('user_id', user.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      
      const totalPending = data?.reduce((sum, account) => sum + Number(account.amount), 0) || 0;
      const overdue = data?.filter(account => new Date(account.due_date) < new Date()).length || 0;
      
      return { totalPending, overdue, count: data?.length || 0 };
    }
  });

  // Query para evolução de vendas
  const { data: salesEvolution } = useQuery({
    queryKey: ['salesEvolution', startDate, endDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('sales')
        .select('sale_date, total_amount, net_profit')
        .eq('user_id', user.id)
        .gte('sale_date', startDate)
        .lte('sale_date', endDate)
        .order('sale_date');
      
      if (error) throw error;
      
      return data?.reduce((acc, sale) => {
        const date = sale.sale_date;
        const existing = acc.find(item => item.date === date);
        
        if (existing) {
          existing.vendas += Number(sale.total_amount);
          existing.lucro += Number(sale.net_profit);
        } else {
          acc.push({
            date,
            vendas: Number(sale.total_amount),
            lucro: Number(sale.net_profit)
          });
        }
        
        return acc;
      }, [] as any[]) || [];
    }
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const formatPeriodLabel = () => {
    if (dateRange === "custom" && customStartDate && customEndDate) {
      return "Período personalizado";
    }
    
    switch (dateRange) {
      case "week": return "Última semana";
      case "month": return "Último mês";
      case "quarter": return "Último trimestre";
      case "year": return "Último ano";
      default: return "Último mês";
    }
  };

  const handleCustomDateChange = (start: Date, end: Date) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Relatórios Gerenciais</h1>
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="year">Último ano</SelectItem>
              <SelectItem value="custom">Período personalizado</SelectItem>
            </SelectContent>
          </Select>
          {dateRange === "custom" && (
            <DateRangePicker
              startDate={customStartDate}
              endDate={customEndDate}
              onDateChange={handleCustomDateChange}
            />
          )}
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(salesMetrics?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesMetrics?.salesCount || 0} vendas em {formatPeriodLabel().toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(salesMetrics?.totalProfit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Margem: {salesMetrics?.totalRevenue ? ((salesMetrics.totalProfit / salesMetrics.totalRevenue) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(salesMetrics?.avgTicket || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por venda realizada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas a Pagar</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(accountsPayable?.totalPending || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {accountsPayable?.overdue || 0} em atraso de {accountsPayable?.count || 0} total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="financeiro" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
        </TabsList>

        <TabsContent value="financeiro" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Evolução Financeira
              </CardTitle>
            </CardHeader>
            <CardContent>
              {salesEvolution && salesEvolution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesEvolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    <Area type="monotone" dataKey="vendas" stackId="1" stroke="#8884d8" fill="#8884d8" name="Faturamento" />
                    <Area type="monotone" dataKey="lucro" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Lucro" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhum dado financeiro encontrado no período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Vendas por Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              {salesEvolution && salesEvolution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesEvolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="vendas" stroke="#8884d8" strokeWidth={2} name="Vendas" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhuma venda encontrada no período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="produtos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produtos Mais Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts && topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#8884d8" name="Quantidade" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhum produto vendido no período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pedidos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Status dos Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersStatus && ordersStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={ordersStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, count }) => `${status}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {ordersStatus.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhum pedido encontrado no período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
