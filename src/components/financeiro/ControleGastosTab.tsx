
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingDown, Package, Users, Zap, Car, Filter, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const ControleGastosTab = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("mes-atual");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [showNewExpenseDialog, setShowNewExpenseDialog] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "",
    costCenter: "",
    supplier: "",
    date: new Date(),
  });

  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("expenses")
        .insert({
          ...expenseData,
          user_id: user.id,
          amount: parseFloat(expenseData.amount.replace(",", ".")),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Gasto adicionado",
        description: "O novo gasto foi registrado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setShowNewExpenseDialog(false);
      setNewExpense({
        description: "",
        amount: "",
        category: "",
        costCenter: "",
        supplier: "",
        date: new Date(),
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar gasto",
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

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const expensesByCategory = expenses.reduce((acc: any, expense: any) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const pieChartData = Object.keys(expensesByCategory).map(category => ({
    name: category,
    value: expensesByCategory[category],
    color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random color for now
  }));

  const monthlyExpenses = [
    { month: "Jan", MateriaPrima: 2800, Fornecedores: 1600, Transporte: 800, Energia: 600 },
    { month: "Fev", MateriaPrima: 3200, Fornecedores: 1800, Transporte: 900, Energia: 650 },
    { month: "Mar", MateriaPrima: 2900, Fornecedores: 1700, Transporte: 850, Energia: 625 }
  ];

  const suppliers = expenses.reduce((acc: any, expense: any) => {
    if (expense.supplier) {
      acc[expense.supplier] = (acc[expense.supplier] || 0) + expense.amount;
    }
    return acc;
  }, {});

  const topSuppliers = Object.keys(suppliers).map(supplier => ({
    name: supplier,
    amount: suppliers[supplier],
    lastPayment: "N/A" // This would need to be fetched from transaction data
  })).sort((a, b) => b.amount - a.amount);

  const handleNewExpenseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpenseMutation.mutate(newExpense);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex gap-4">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mes-atual">Mês Atual</SelectItem>
            <SelectItem value="trimestre">Trimestre</SelectItem>
            <SelectItem value="semestre">Semestre</SelectItem>
            <SelectItem value="ano">Ano</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {Object.keys(expensesByCategory).map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
          onClick={() => setShowNewExpenseDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Gasto
        </Button>
      </div>

      {/* Cards de Resumo de Gastos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Total de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-red-500 mt-1">
              {/* +8% vs mês anterior */}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Maior Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {pieChartData.length > 0 ? pieChartData.sort((a, b) => b.value - a.value)[0].name : "N/A"}
            </div>
            <p className="text-sm text-muted-foreground">
              {pieChartData.length > 0 ? formatCurrency(pieChartData.sort((a, b) => b.value - a.value)[0].value) : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Fornecedores Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topSuppliers.length}</div>
            <p className="text-sm text-muted-foreground">
              {/* 3 novos este mês */}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Média Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses / (monthlyExpenses.length || 1))}</div>
            <p className="text-sm text-muted-foreground">
              {/* Últimos 3 meses */}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Gastos por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {pieChartData.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm">{category.name}</span>
                  <div className="text-sm font-medium">
                    {formatCurrency(category.value)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Evolução Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  {/* Dynamically render bars based on categories */}
                  {Object.keys(expensesByCategory).map(category => (
                    <Bar key={category} dataKey={category} stackId="a" fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} name={category} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Fornecedores */}
      <Card>
        <CardHeader>
          <CardTitle>Principais Fornecedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topSuppliers.map((supplier, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      {/* <span>{supplier.category}</span> */}
                      <span>•</span>
                      <span>Último pagamento: {supplier.lastPayment}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{formatCurrency(supplier.amount)}</div>
                  <div className="text-sm text-muted-foreground">Este mês</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Novo Gasto */}
      <Dialog open={showNewExpenseDialog} onOpenChange={setShowNewExpenseDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Novo Gasto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNewExpenseSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Descrição</Label>
              <Input
                id="description"
                name="description"
                value={newExpense.description}
                onChange={handleNewExpenseChange}
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
                value={newExpense.amount}
                onChange={handleNewExpenseChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Categoria</Label>
              <Input
                id="category"
                name="category"
                value={newExpense.category}
                onChange={handleNewExpenseChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="costCenter" className="text-right">Centro de Custo</Label>
              <Input
                id="costCenter"
                name="costCenter"
                value={newExpense.costCenter}
                onChange={handleNewExpenseChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right">Fornecedor</Label>
              <Input
                id="supplier"
                name="supplier"
                value={newExpense.supplier}
                onChange={handleNewExpenseChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-[240px] pl-3 text-left font-normal ${!newExpense.date && "text-muted-foreground"}`}
                  >
                    {newExpense.date ? (
                      format(newExpense.date, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newExpense.date}
                    onSelect={(date) => setNewExpense((prev) => ({ ...prev, date: date || new Date() }))}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={addExpenseMutation.isPending}>
                {addExpenseMutation.isPending ? "Adicionando..." : "Adicionar Gasto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ControleGastosTab;


