
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getOrders } from "@/services/orderService";
import { resaleService } from "@/services/resaleService";

const FinanceiroTab = () => {
  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['resale-transactions'],
    queryFn: resaleService.getTransactions,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular dados reais
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const totalRevenue = safeOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) +
                      safeTransactions.reduce((sum, transaction) => sum + Number(transaction.total_amount || 0), 0);
  
  const totalCommissions = safeTransactions.reduce((sum, transaction) => sum + Number(transaction.commission_amount || 0), 0);
  const netRevenue = totalRevenue - totalCommissions;
  const pendingOrders = safeOrders.filter(order => order.status === 'Novo').length;

  // Agrupar dados por mês
  const monthlyData = {};
  
  safeOrders.forEach(order => {
    const date = new Date(order.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: monthKey, vendas: 0, pedidos: 0 };
    }
    monthlyData[monthKey].vendas += Number(order.total_amount || 0);
    monthlyData[monthKey].pedidos += 1;
  });

  safeTransactions.forEach(transaction => {
    const date = new Date(transaction.transaction_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: monthKey, vendas: 0, pedidos: 0 };
    }
    monthlyData[monthKey].vendas += Number(transaction.total_amount || 0);
  });

  const salesByMonth = Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {safeOrders.length + safeTransactions.length} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCommissions)}</div>
            <p className="text-xs text-muted-foreground">
              {totalRevenue > 0 ? ((totalCommissions / totalRevenue) * 100).toFixed(1) : 0}% da receita
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Líquida</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {totalRevenue > 0 ? ((netRevenue / totalRevenue) * 100).toFixed(1) : 0}% margem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              {safeOrders.length > 0 ? ((pendingOrders / safeOrders.length) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {salesByMonth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value) => {
                    const [year, month] = value.split('-');
                    return `${month}/${year}`;
                  }}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value).replace('R$', 'R$').replace(',00', '')} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="vendas" fill="#E76F51" name="Receita" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {salesByMonth.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Nenhum dado de vendas encontrado ainda.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinanceiroTab;
