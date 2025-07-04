
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingDown, Package, Users, Zap, Car, Filter } from "lucide-react";

const ControleGastosTab = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("mes-atual");
  const [selectedCategory, setSelectedCategory] = useState("todas");

  // Dados mock para gráficos
  const expensesByCategory = [
    { name: "Matéria Prima", value: 3200, color: "#ef4444", percentage: 45 },
    { name: "Fornecedores", value: 1800, color: "#f97316", percentage: 25 },
    { name: "Transporte", value: 900, color: "#eab308", percentage: 13 },
    { name: "Energia", value: 650, color: "#22c55e", percentage: 9 },
    { name: "Outros", value: 570, color: "#6366f1", percentage: 8 }
  ];

  const monthlyExpenses = [
    { month: "Jan", MateriaPrima: 2800, Fornecedores: 1600, Transporte: 800, Energia: 600 },
    { month: "Fev", MateriaPrima: 3200, Fornecedores: 1800, Transporte: 900, Energia: 650 },
    { month: "Mar", MateriaPrima: 2900, Fornecedores: 1700, Transporte: 850, Energia: 625 }
  ];

  const suppliers = [
    { name: "Fornecedor A", amount: 1200, category: "Matéria Prima", lastPayment: "2024-01-10" },
    { name: "Fornecedor B", amount: 850, category: "Embalagens", lastPayment: "2024-01-08" },
    { name: "Transportadora XYZ", amount: 650, category: "Logística", lastPayment: "2024-01-12" }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalExpenses = expensesByCategory.reduce((sum, cat) => sum + cat.value, 0);

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
            <SelectItem value="materia-prima">Matéria Prima</SelectItem>
            <SelectItem value="fornecedores">Fornecedores</SelectItem>
            <SelectItem value="transporte">Transporte</SelectItem>
            <SelectItem value="energia">Energia</SelectItem>
          </SelectContent>
        </Select>
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
              +8% vs mês anterior
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
            <div className="text-lg font-bold">Matéria Prima</div>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(3200)} (45%)
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
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">
              3 novos este mês
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
            <div className="text-2xl font-bold">{formatCurrency(6850)}</div>
            <p className="text-sm text-muted-foreground">
              Últimos 3 meses
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
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {expensesByCategory.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency(category.value)} ({category.percentage}%)
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
                  <Bar dataKey="MateriaPrima" stackId="a" fill="#ef4444" name="Matéria Prima" />
                  <Bar dataKey="Fornecedores" stackId="a" fill="#f97316" name="Fornecedores" />
                  <Bar dataKey="Transporte" stackId="a" fill="#eab308" name="Transporte" />
                  <Bar dataKey="Energia" stackId="a" fill="#22c55e" name="Energia" />
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
            {suppliers.map((supplier, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Badge variant="outline">{supplier.category}</Badge>
                      <span>•</span>
                      <span>Último pagamento: {new Date(supplier.lastPayment).toLocaleDateString('pt-BR')}</span>
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
    </div>
  );
};

export default ControleGastosTab;
