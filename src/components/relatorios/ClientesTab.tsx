
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Users, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CustomerData {
  totalCustomers: number;
  newCustomersThisMonth: number;
  averageOrderValue: number;
  customerGrowth: number;
  topCustomers: Array<{ name: string; orders: number; totalSpent: number }>;
  customersByMonth: Array<{ month: string; count: number }>;
  orderFrequency: Array<{ frequency: string; count: number; color: string }>;
}

const ClientesTab = () => {
  const [customerData, setCustomerData] = useState<CustomerData>({
    totalCustomers: 0,
    newCustomersThisMonth: 0,
    averageOrderValue: 0,
    customerGrowth: 0,
    topCustomers: [],
    customersByMonth: [],
    orderFrequency: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);

      // Buscar todos os clientes
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: true });

      if (customersError) throw customersError;

      // Buscar pedidos dos últimos 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          customers!inner(name)
        `)
        .gte('created_at', sixMonthsAgo.toISOString());

      if (ordersError) throw ordersError;

      // Processar dados
      const totalCustomers = customers?.length || 0;

      // Novos clientes este mês
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const newCustomersThisMonth = customers?.filter(customer => 
        new Date(customer.created_at) >= thisMonth
      ).length || 0;

      // Calcular crescimento de clientes
      const lastMonth = new Date(thisMonth);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const newCustomersLastMonth = customers?.filter(customer => {
        const createdAt = new Date(customer.created_at);
        return createdAt >= lastMonth && createdAt < thisMonth;
      }).length || 0;

      const customerGrowth = newCustomersLastMonth > 0 
        ? ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth) * 100 
        : 0;

      // Valor médio de pedido
      const totalOrderValue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const averageOrderValue = orders?.length ? totalOrderValue / orders.length : 0;

      // Top clientes
      const customerOrderMap = new Map();
      orders?.forEach(order => {
        const customerName = order.customers?.name || 'Cliente sem nome';
        if (!customerOrderMap.has(customerName)) {
          customerOrderMap.set(customerName, { name: customerName, orders: 0, totalSpent: 0 });
        }
        const customer = customerOrderMap.get(customerName);
        customer.orders += 1;
        customer.totalSpent += order.total_amount || 0;
      });

      const topCustomers = Array.from(customerOrderMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      // Clientes por mês (últimos 6 meses)
      const monthMap = new Map();
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        monthMap.set(monthKey, { month: monthName, count: 0 });
      }

      customers?.forEach(customer => {
        const monthKey = customer.created_at.slice(0, 7);
        if (monthMap.has(monthKey)) {
          monthMap.get(monthKey).count += 1;
        }
      });

      const customersByMonth = Array.from(monthMap.values());

      // Frequência de pedidos
      const frequencyMap = new Map();
      customerOrderMap.forEach(customer => {
        let frequency;
        if (customer.orders === 1) frequency = '1 pedido';
        else if (customer.orders <= 3) frequency = '2-3 pedidos';
        else if (customer.orders <= 5) frequency = '4-5 pedidos';
        else frequency = '6+ pedidos';

        frequencyMap.set(frequency, (frequencyMap.get(frequency) || 0) + 1);
      });

      const frequencyColors = {
        '1 pedido': '#EF4444',
        '2-3 pedidos': '#F59E0B',
        '4-5 pedidos': '#10B981',
        '6+ pedidos': '#3B82F6'
      };

      const orderFrequency = Array.from(frequencyMap.entries()).map(([frequency, count]) => ({
        frequency,
        count,
        color: frequencyColors[frequency as keyof typeof frequencyColors] || '#6B7280'
      }));

      setCustomerData({
        totalCustomers,
        newCustomersThisMonth,
        averageOrderValue,
        customerGrowth,
        topCustomers,
        customersByMonth,
        orderFrequency
      });

    } catch (error) {
      console.error('Erro ao buscar dados de clientes:', error);
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
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerData.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerData.newCustomersThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              {customerData.customerGrowth >= 0 ? '+' : ''}{customerData.customerGrowth.toFixed(1)}% vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {customerData.averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Por pedido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${customerData.customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {customerData.customerGrowth >= 0 ? '+' : ''}{customerData.customerGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">vs. mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Melhores Clientes</CardTitle>
            <CardDescription>Top 5 clientes por valor gasto</CardDescription>
          </CardHeader>
          <CardContent>
            {customerData.topCustomers.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={customerData.topCustomers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'orders' ? `${value} pedidos` : `R$ ${Number(value).toFixed(2)}`,
                      name === 'orders' ? 'Pedidos' : 'Total Gasto'
                    ]}
                  />
                  <Bar dataKey="totalSpent" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Nenhum pedido registrado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Crescimento de clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Clientes</CardTitle>
            <CardDescription>Novos clientes por mês (últimos 6 meses)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={customerData.customersByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} clientes`, 'Novos Clientes']} />
                <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Frequência de pedidos */}
        <Card>
          <CardHeader>
            <CardTitle>Frequência de Pedidos</CardTitle>
            <CardDescription>Distribuição de clientes por número de pedidos</CardDescription>
          </CardHeader>
          <CardContent>
            {customerData.orderFrequency.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={customerData.orderFrequency}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ frequency, count }) => `${frequency}: ${count}`}
                  >
                    {customerData.orderFrequency.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Nenhum pedido registrado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo de atividade */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Atividade</CardTitle>
            <CardDescription>Principais métricas de clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total de Clientes:</span>
              <span className="font-medium">{customerData.totalCustomers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Novos Este Mês:</span>
              <span className="font-medium">{customerData.newCustomersThisMonth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Ticket Médio:</span>
              <span className="font-medium">R$ {customerData.averageOrderValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Crescimento:</span>
              <span className={`font-medium ${customerData.customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {customerData.customerGrowth >= 0 ? '+' : ''}{customerData.customerGrowth.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Clientes Ativos:</span>
              <span className="font-medium">{customerData.topCustomers.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientesTab;
