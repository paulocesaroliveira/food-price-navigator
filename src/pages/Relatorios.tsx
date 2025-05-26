
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp, TrendingDown, DollarSign, Package, Users, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/calculations";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const Relatorios = () => {
  const [dateRange, setDateRange] = useState("month");

  // Calcular período baseado na seleção
  const getDateRange = () => {
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

  // Query para dados de vendas
  const { data: salesData } = useQuery({
    queryKey: ['salesReport', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .gte('sale_date', startDate)
        .lte('sale_date', endDate)
        .order('sale_date');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Query para dados de produtos mais vendidos
  const { data: topProducts } = useQuery({
    queryKey: ['topProducts', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sale_items')
        .select(`
          product_id,
          quantity,
          total_price,
          products(name)
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      if (error) throw error;
      
      // Agrupar por produto
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
        .slice(0, 5);
    }
  });

  // Query para dados de pedidos
  const { data: ordersData } = useQuery({
    queryKey: ['ordersReport', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Query para contas a pagar
  const { data: accountsPayable } = useQuery({
    queryKey: ['accountsPayable'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_payable')
        .select('*')
        .eq('status', 'pending');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calcular métricas
  const totalSales = salesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
  const totalProfit = salesData?.reduce((sum, sale) => sum + Number(sale.net_profit), 0) || 0;
  const totalOrders = ordersData?.length || 0;
  const pendingPayments = accountsPayable?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

  // Preparar dados para gráficos
  const dailySales = salesData?.reduce((acc, sale) => {
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

  // Status dos pedidos
  const ordersByStatus = ordersData?.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const statusData = Object.entries(ordersByStatus).map(([status, count]) => ({
    name: status === 'pending' ? 'Pendente' : 
          status === 'confirmed' ? 'Confirmado' :
          status === 'in_production' ? 'Em Produção' :
          status === 'ready' ? 'Pronto' :
          status === 'delivered' ? 'Entregue' :
          status === 'cancelled' ? 'Cancelado' : status,
    value: count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="year">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
            <p className="text-xs text-muted-foreground">
              {salesData?.length || 0} vendas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalProfit)}</div>
            <p className="text-xs text-muted-foreground">
              Margem: {totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              No período selecionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas a Pagar</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingPayments)}</div>
            <p className="text-xs text-muted-foreground">
              {accountsPayable?.length || 0} contas pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vendas" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
        </TabsList>

        <TabsContent value="vendas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              {dailySales.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="vendas" stroke="#8884d8" name="Vendas" />
                    <Line type="monotone" dataKey="lucro" stroke="#82ca9d" name="Lucro" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhuma venda encontrada no período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="produtos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts && topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
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
              <CardTitle>Status dos Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
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
