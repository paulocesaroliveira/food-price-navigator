
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SalesData {
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  salesGrowth: number;
  dailySales: Array<{ date: string; sales: number; revenue: number }>;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  salesByStatus: Array<{ status: string; count: number; color: string }>;
}

const VendasTab = () => {
  const [salesData, setSalesData] = useState<SalesData>({
    totalSales: 0,
    totalRevenue: 0,
    averageTicket: 0,
    salesGrowth: 0,
    dailySales: [],
    topProducts: [],
    salesByStatus: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);

      // Buscar vendas dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .gte('sale_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('sale_date', { ascending: true });

      if (salesError) throw salesError;

      // Buscar itens de venda para produtos mais vendidos
      const { data: saleItems, error: itemsError } = await supabase
        .from('sale_items')
        .select(`
          *,
          sale_id,
          product_id,
          products!inner(name)
        `)
        .in('sale_id', (sales || []).map(s => s.id));

      if (itemsError) throw itemsError;

      // Processar dados
      const totalSales = sales?.length || 0;
      const totalRevenue = sales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
      const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Vendas por dia
      const dailySalesMap = new Map();
      sales?.forEach(sale => {
        const date = sale.sale_date;
        if (!dailySalesMap.has(date)) {
          dailySalesMap.set(date, { date, sales: 0, revenue: 0 });
        }
        const dayData = dailySalesMap.get(date);
        dayData.sales += 1;
        dayData.revenue += sale.total_amount || 0;
      });

      const dailySales = Array.from(dailySalesMap.values()).slice(-7); // Últimos 7 dias

      // Produtos mais vendidos
      const productMap = new Map();
      saleItems?.forEach(item => {
        const productName = item.products?.name || 'Produto sem nome';
        if (!productMap.has(productName)) {
          productMap.set(productName, { name: productName, quantity: 0, revenue: 0 });
        }
        const product = productMap.get(productName);
        product.quantity += item.quantity || 0;
        product.revenue += item.total_price || 0;
      });

      const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Vendas por status
      const statusMap = new Map();
      sales?.forEach(sale => {
        const status = sale.status || 'completed';
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });

      const statusColors = {
        completed: '#10B981',
        pending: '#F59E0B',
        cancelled: '#EF4444'
      };

      const salesByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
        status: status === 'completed' ? 'Concluídas' : status === 'pending' ? 'Pendentes' : 'Canceladas',
        count,
        color: statusColors[status as keyof typeof statusColors] || '#6B7280'
      }));

      // Calcular crescimento (comparar com período anterior)
      const previousPeriodStart = new Date(thirtyDaysAgo);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);

      const { data: previousSales } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('sale_date', previousPeriodStart.toISOString().split('T')[0])
        .lt('sale_date', thirtyDaysAgo.toISOString().split('T')[0]);

      const previousRevenue = previousSales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
      const salesGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      setSalesData({
        totalSales,
        totalRevenue,
        averageTicket,
        salesGrowth,
        dailySales,
        topProducts,
        salesByStatus
      });

    } catch (error) {
      console.error('Erro ao buscar dados de vendas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              {salesData.salesGrowth >= 0 ? '+' : ''}{salesData.salesGrowth.toFixed(1)}% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {salesData.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {salesData.averageTicket.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Por venda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${salesData.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {salesData.salesGrowth >= 0 ? '+' : ''}{salesData.salesGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">vs. mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas por dia */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas dos Últimos 7 Dias</CardTitle>
            <CardDescription>Evolução diária de vendas e receita</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData.dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'sales' ? `${value} vendas` : `R$ ${Number(value).toFixed(2)}`,
                    name === 'sales' ? 'Vendas' : 'Receita'
                  ]}
                />
                <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Produtos mais vendidos */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
            <CardDescription>Top 5 produtos por quantidade</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'quantity' ? `${value} unidades` : `R$ ${Number(value).toFixed(2)}`,
                    name === 'quantity' ? 'Quantidade' : 'Receita'
                  ]}
                />
                <Bar dataKey="quantity" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status das vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Status</CardTitle>
            <CardDescription>Distribuição das vendas por status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesData.salesByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {salesData.salesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resumo de receita */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
            <CardDescription>Principais métricas financeiras</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Receita Bruta:</span>
              <span className="font-medium">R$ {salesData.totalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Número de Vendas:</span>
              <span className="font-medium">{salesData.totalSales}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Ticket Médio:</span>
              <span className="font-medium">R$ {salesData.averageTicket.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Crescimento:</span>
              <span className={`font-medium ${salesData.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {salesData.salesGrowth >= 0 ? '+' : ''}{salesData.salesGrowth.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendasTab;
