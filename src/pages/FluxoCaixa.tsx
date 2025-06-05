
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  BarChart3,
  AlertCircle,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/calculations";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Badge } from "@/components/ui/badge";

const FluxoCaixa = () => {
  const [dateRange, setDateRange] = useState("month");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();

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

  // Query para saídas (Contas a Pagar)
  const { data: cashOutflow } = useQuery({
    queryKey: ['cashOutflow', startDate, endDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('accounts_payable')
        .select(`
          amount,
          payment_date,
          status,
          expense_categories(name, color)
        `)
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .gte('payment_date', startDate)
        .lte('payment_date', endDate);
      
      if (error) throw error;
      
      const categoryTotals = data?.reduce((acc, expense) => {
        const categoryName = expense.expense_categories?.name || 'Sem Categoria';
        const categoryColor = expense.expense_categories?.color || '#EF4444';
        
        if (!acc[categoryName]) {
          acc[categoryName] = { total: 0, color: categoryColor };
        }
        acc[categoryName].total += Number(expense.amount);
        return acc;
      }, {} as Record<string, { total: number; color: string }>) || {};
      
      const totalOutflow = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.total, 0);
      
      return {
        categoryTotals,
        totalOutflow,
        expenses: data || []
      };
    }
  });

  // Query para entradas (Vendas)
  const { data: salesInflow } = useQuery({
    queryKey: ['salesInflow', startDate, endDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('sales')
        .select('total_amount, sale_date')
        .eq('user_id', user.id)
        .gte('sale_date', startDate)
        .lte('sale_date', endDate);
      
      if (error) throw error;
      
      const totalSales = data?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      
      return { totalSales, sales: data || [] };
    }
  });

  // Query para entradas de pedidos
  const { data: ordersInflow } = useQuery({
    queryKey: ['ordersInflow', startDate, endDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('orders')
        .select('total_amount, payment_date, payment_status')
        .eq('user_id', user.id)
        .eq('payment_status', 'paid')
        .gte('payment_date', startDate)
        .lte('payment_date', endDate);
      
      if (error) throw error;
      
      const totalOrders = data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      
      return { totalOrders, orders: data || [] };
    }
  });

  // Query para revenda
  const { data: resaleInflow } = useQuery({
    queryKey: ['resaleInflow', startDate, endDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('resale_transactions')
        .select('total_amount, transaction_date')
        .eq('user_id', user.id)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);
      
      if (error) throw error;
      
      const totalResale = data?.reduce((sum, resale) => sum + Number(resale.total_amount), 0) || 0;
      
      return { totalResale, resales: data || [] };
    }
  });

  const totalInflow = (salesInflow?.totalSales || 0) + (ordersInflow?.totalOrders || 0) + (resaleInflow?.totalResale || 0);
  const totalOutflow = cashOutflow?.totalOutflow || 0;
  const netCashFlow = totalInflow - totalOutflow;
  const isPositive = netCashFlow >= 0;

  // Preparar dados para o gráfico de categorias de saída
  const outflowChartData = Object.entries(cashOutflow?.categoryTotals || {}).map(([category, data]) => ({
    category,
    value: data.total,
    color: data.color
  }));

  // Dados para gráfico de entradas
  const inflowData = [
    { name: 'Vendas', value: salesInflow?.totalSales || 0, color: '#10B981' },
    { name: 'Pedidos', value: ordersInflow?.totalOrders || 0, color: '#3B82F6' },
    { name: 'Revenda', value: resaleInflow?.totalResale || 0, color: '#8B5CF6' }
  ].filter(item => item.value > 0);

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

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
        <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
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

      {/* Resumo do Fluxo de Caixa */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalInflow)}
            </div>
            <p className="text-xs text-muted-foreground">
              Em {formatPeriodLabel().toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalOutflow)}
            </div>
            <p className="text-xs text-muted-foreground">
              Gastos no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netCashFlow)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
                {isPositive ? "Lucro" : "Prejuízo"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem Operacional</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalInflow > 0 ? ((netCashFlow / totalInflow) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Eficiência operacional
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Entradas e Saídas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saídas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownCircle className="h-5 w-5 text-red-600" />
              Saídas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {outflowChartData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={outflowChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, value }) => `${category}: ${formatCurrency(value)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {outflowChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="space-y-2">
                  {outflowChartData.map((item, index) => (
                    <div key={item.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                        />
                        <span>{item.category}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Nenhuma despesa encontrada no período</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Entradas por Fonte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-green-600" />
              Entradas por Fonte
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inflowData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={inflowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    <Bar dataKey="value" fill="#8884d8">
                      {inflowData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Vendas Diretas</span>
                    </div>
                    <span className="font-bold text-green-600">
                      {formatCurrency(salesInflow?.totalSales || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Pedidos</span>
                    </div>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(ordersInflow?.totalOrders || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">Revenda</span>
                    </div>
                    <span className="font-bold text-purple-600">
                      {formatCurrency(resaleInflow?.totalResale || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Nenhuma entrada encontrada no período</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Análise Resumida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise do Período - {formatPeriodLabel()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Total de Receitas</h3>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalInflow)}</p>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Total de Despesas</h3>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOutflow)}</p>
            </div>
            
            <div className={`text-center p-4 rounded-lg ${isPositive ? 'bg-blue-50' : 'bg-orange-50'}`}>
              <h3 className={`font-semibold mb-2 ${isPositive ? 'text-blue-800' : 'text-orange-800'}`}>
                Resultado Final
              </h3>
              <p className={`text-2xl font-bold ${isPositive ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(Math.abs(netCashFlow))}
              </p>
              <p className="text-sm mt-1">
                {isPositive ? 'Superávit' : 'Déficit'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FluxoCaixa;
