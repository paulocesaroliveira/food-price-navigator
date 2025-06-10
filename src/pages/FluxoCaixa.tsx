import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, DollarSign, TrendingUp, TrendingDown, PlusCircle, MinusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { addDays, format, startOfMonth, endOfMonth } from "date-fns";
import { pt } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { getSales } from "@/services/salesService";
import { getAccountsPayable } from "@/services/accountsPayableService";
import { PageHeader } from "@/components/shared/PageHeader";

const FluxoCaixa = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  
  const { toast } = useToast();

  const { data: sales = [], isLoading: isLoadingSales } = useQuery({
    queryKey: ['sales', dateRange],
    queryFn: () => getSales(),
  });

  const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['accounts-payable', dateRange],
    queryFn: () => getAccountsPayable(),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: pt });
  };

  const isLoading = isLoadingSales || isLoadingExpenses;

  // Filtrar dados por período selecionado
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_date);
    if (!dateRange?.from || !dateRange?.to) return true;
    return saleDate >= dateRange.from && saleDate <= dateRange.to;
  });

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.due_date);
    if (!dateRange?.from || !dateRange?.to) return true;
    return expenseDate >= dateRange.from && expenseDate <= dateRange.to;
  });

  // Calcular totais
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const totalExpenses = filteredExpenses
    .filter(expense => expense.status === 'paid')
    .reduce((sum, expense) => sum + Number(expense.amount), 0);
  const netCashFlow = totalRevenue - totalExpenses;
  const pendingExpenses = filteredExpenses
    .filter(expense => expense.status === 'pending')
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  // Agrupar transações por data
  const dailyTransactions = new Map();

  filteredSales.forEach(sale => {
    const date = sale.sale_date;
    if (!dailyTransactions.has(date)) {
      dailyTransactions.set(date, { revenue: 0, expenses: 0, date });
    }
    dailyTransactions.get(date).revenue += Number(sale.total_amount);
  });

  filteredExpenses
    .filter(expense => expense.status === 'paid')
    .forEach(expense => {
      const date = expense.payment_date || expense.due_date;
      if (!dailyTransactions.has(date)) {
        dailyTransactions.set(date, { revenue: 0, expenses: 0, date });
      }
      dailyTransactions.get(date).expenses += Number(expense.amount);
    });

  const sortedTransactions = Array.from(dailyTransactions.values())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Fluxo de Caixa" 
        icon={DollarSign}
        gradient="bg-gradient-to-r from-emerald-600 to-cyan-600"
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <DateRangePicker
          date={dateRange}
          onDateChange={handleDateChange}
          className="w-full sm:w-auto"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredSales.length} vendas no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Pagas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredExpenses.filter(e => e.status === 'paid').length} despesas pagas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fluxo Líquido</CardTitle>
            <DollarSign className={`h-4 w-4 ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netCashFlow)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {netCashFlow >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(pendingExpenses)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredExpenses.filter(e => e.status === 'pending').length} contas pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimentação Diária</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma movimentação encontrada no período selecionado.
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTransactions.map((transaction, index) => {
                const dailyBalance = transaction.revenue - transaction.expenses;
                return (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{formatDate(transaction.date)}</div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {transaction.revenue > 0 && (
                          <div className="flex items-center gap-1">
                            <PlusCircle className="h-3 w-3 text-green-600" />
                            Receita: {formatCurrency(transaction.revenue)}
                          </div>
                        )}
                        {transaction.expenses > 0 && (
                          <div className="flex items-center gap-1">
                            <MinusCircle className="h-3 w-3 text-red-600" />
                            Despesa: {formatCurrency(transaction.expenses)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${dailyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {dailyBalance >= 0 ? '+' : ''}{formatCurrency(dailyBalance)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FluxoCaixa;
