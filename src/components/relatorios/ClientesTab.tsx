
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const ClientesTab = () => {
  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers-report'],
    queryFn: async () => {
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*');

      if (customersError) throw customersError;

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('customer_id, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (ordersError) throw ordersError;

      const totalCustomers = customers?.length || 0;
      const activeCustomers = new Set(orders?.map(order => order.customer_id)).size;
      
      // Calcular taxa de retenção (clientes que fizeram pedidos nos últimos 30 dias)
      const retentionRate = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;

      return {
        totalCustomers,
        activeCustomers,
        retentionRate
      };
    },
  });

  const customerTypes = [
    { name: "Clientes Ativos", value: customersData?.activeCustomers || 0, color: "#E76F51" },
    { name: "Clientes Inativos", value: (customersData?.totalCustomers || 0) - (customersData?.activeCustomers || 0), color: "#2A9D8F" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8">
          <p>Carregando dados dos clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersData?.totalCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersData?.activeCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">Compraram nos últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Retenção</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersData?.retentionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {customerTypes[0].value > 0 || customerTypes[1].value > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {customerTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center p-8">
              <p className="text-muted-foreground">Nenhum dado de cliente encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientesTab;
