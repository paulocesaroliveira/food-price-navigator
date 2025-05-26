
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const StatusOverview = () => {
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['ordersStatus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('status')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Processar dados para o gráfico
  const statusCounts = ordersData?.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const statusLabels: Record<string, string> = {
    'pending': 'Pendente',
    'confirmed': 'Confirmado',
    'in_production': 'Em Produção',
    'ready': 'Pronto',
    'delivered': 'Entregue',
    'cancelled': 'Cancelado'
  };

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: statusLabels[status] || status,
    value: count,
    status: status
  }));

  const totalOrders = chartData.reduce((sum, item) => sum + item.value, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Geral dos Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Geral dos Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Nenhum pedido encontrado</p>
              <p className="text-sm text-muted-foreground">
                Quando você tiver pedidos, eles aparecerão aqui
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Geral dos Pedidos</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total de {totalOrders} pedidos
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Lista de status com contadores */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {chartData.map((item, index) => (
            <div key={item.status} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span>{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusOverview;
