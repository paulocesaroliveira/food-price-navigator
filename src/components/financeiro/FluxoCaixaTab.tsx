
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, TrendingUp, TrendingDown, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const FluxoCaixaTab = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [transactionType, setTransactionType] = useState<"entrada" | "saida">("entrada");
  const [filterPeriod, setFilterPeriod] = useState("mes-atual");

  // Dados mock para demonstração
  const transactions = [
    {
      id: 1,
      date: "2024-01-15",
      description: "Venda de Produtos",
      category: "Vendas",
      type: "entrada",
      amount: 1250.00,
      paymentMethod: "Pix"
    },
    {
      id: 2,
      date: "2024-01-14",
      description: "Compra de Ingredientes",
      category: "Matéria Prima",
      type: "saida",
      amount: 480.00,
      paymentMethod: "Cartão"
    },
    {
      id: 3,
      date: "2024-01-13",
      description: "Pagamento de Fornecedor",
      category: "Fornecedores",
      type: "saida",
      amount: 320.00,
      paymentMethod: "Transferência"
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalEntradas = transactions
    .filter(t => t.type === "entrada")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSaidas = transactions
    .filter(t => t.type === "saida")
    .reduce((sum, t) => sum + t.amount, 0);

  const saldoLiquido = totalEntradas - totalSaidas;

  return (
    <div className="space-y-6">
      {/* Resumo do Fluxo de Caixa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total de Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalEntradas)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Total de Saídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalSaidas)}
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${saldoLiquido >= 0 ? 'border-blue-200 bg-blue-50' : 'border-orange-200 bg-orange-50'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium flex items-center gap-2 ${saldoLiquido >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              Saldo Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatCurrency(saldoLiquido)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Nova Transação */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex gap-2">
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes-atual">Mês Atual</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${transaction.type === 'entrada' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                      <Badge variant="outline">{transaction.category}</Badge>
                      <span>•</span>
                      <span>{transaction.paymentMethod}</span>
                    </div>
                  </div>
                </div>
                <div className={`font-bold text-lg ${transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'entrada' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FluxoCaixaTab;
