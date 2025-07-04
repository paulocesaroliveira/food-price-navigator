
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const FluxoCaixaTab = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [transactionType, setTransactionType] = useState<"entrada" | "saida">("entrada");
  const [filterPeriod, setFilterPeriod] = useState("mes-atual");
  const [showNewTransactionDialog, setShowNewTransactionDialog] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    category: "",
    type: "entrada",
    paymentMethod: "",
    date: new Date(),
  });

  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("transactions")
        .insert({
          ...transactionData,
          user_id: user.id,
          amount: parseFloat(transactionData.amount.replace(",", ".")),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Transação adicionada",
        description: "A nova transação foi registrada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setShowNewTransactionDialog(false);
      setNewTransaction({
        description: "",
        amount: "",
        category: "",
        type: "entrada",
        paymentMethod: "",
        date: new Date(),
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar transação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const totalEntradas = transactions
    .filter((t) => t.type === "entrada")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSaidas = transactions
    .filter((t) => t.type === "saida")
    .reduce((sum, t) => sum + t.amount, 0);

  const saldoLiquido = totalEntradas - totalSaidas;

  const handleNewTransactionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTransaction((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransactionMutation.mutate(newTransaction);
  };

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

        <Button 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          onClick={() => setShowNewTransactionDialog(true)}
        >
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
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando transações...
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma transação encontrada. Comece adicionando uma!
              </div>
            ) : (
              transactions.map((transaction) => (
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
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Nova Transação */}
      <Dialog open={showNewTransactionDialog} onOpenChange={setShowNewTransactionDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNewTransactionSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Descrição</Label>
              <Input
                id="description"
                name="description"
                value={newTransaction.description}
                onChange={handleNewTransactionChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Valor</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={newTransaction.amount}
                onChange={handleNewTransactionChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Categoria</Label>
              <Input
                id="category"
                name="category"
                value={newTransaction.category}
                onChange={handleNewTransactionChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Tipo</Label>
              <Select
                name="type"
                value={newTransaction.type}
                onValueChange={(value) => setNewTransaction((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentMethod" className="text-right">Método de Pagamento</Label>
              <Input
                id="paymentMethod"
                name="paymentMethod"
                value={newTransaction.paymentMethod}
                onChange={handleNewTransactionChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-[240px] pl-3 text-left font-normal ${!newTransaction.date && "text-muted-foreground"}`}
                  >
                    {newTransaction.date ? (
                      format(newTransaction.date, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newTransaction.date}
                    onSelect={(date) => setNewTransaction((prev) => ({ ...prev, date: date || new Date() }))}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={addTransactionMutation.isPending}>
                {addTransactionMutation.isPending ? "Adicionando..." : "Adicionar Transação"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FluxoCaixaTab;


