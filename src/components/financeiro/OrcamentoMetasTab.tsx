
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Target, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  DollarSign,
  Edit
} from "lucide-react";

const OrcamentoMetasTab = () => {
  // Dados mock para orçamentos
  const budgets = [
    {
      id: 1,
      category: "Matéria Prima",
      planned: 3000,
      actual: 3200,
      percentage: 107,
      status: "over"
    },
    {
      id: 2,
      category: "Marketing",
      planned: 800,
      actual: 450,
      percentage: 56,
      status: "under"
    },
    {
      id: 3,
      category: "Transporte",
      planned: 1000,
      actual: 900,
      percentage: 90,
      status: "ok"
    },
    {
      id: 4,
      category: "Energia",
      planned: 700,
      actual: 650,
      percentage: 93,
      status: "ok"
    }
  ];

  // Dados mock para metas
  const goals = [
    {
      id: 1,
      title: "Meta de Receita Mensal",
      target: 20000,
      current: 15250,
      percentage: 76,
      deadline: "2024-01-31",
      status: "in-progress"
    },
    {
      id: 2,
      title: "Redução de Custos",
      target: 5000,
      current: 6100,
      percentage: 82,
      deadline: "2024-03-31",
      status: "attention"
    },
    {
      id: 3,
      title: "Novos Clientes",
      target: 50,
      current: 47,
      percentage: 94,
      deadline: "2024-01-31",
      status: "near-complete"
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "over": return "text-red-600 bg-red-50 border-red-200";
      case "under": return "text-blue-600 bg-blue-50 border-blue-200";
      case "ok": return "text-green-600 bg-green-50 border-green-200";
      case "in-progress": return "text-blue-600 bg-blue-50 border-blue-200";
      case "attention": return "text-orange-600 bg-orange-50 border-orange-200";
      case "near-complete": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "over": return <AlertTriangle className="h-4 w-4" />;
      case "under": return <TrendingUp className="h-4 w-4" />;
      case "ok": return <CheckCircle className="h-4 w-4" />;
      case "in-progress": return <Target className="h-4 w-4" />;
      case "attention": return <AlertTriangle className="h-4 w-4" />;
      case "near-complete": return <CheckCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const totalPlanned = budgets.reduce((sum, budget) => sum + budget.planned, 0);
  const totalActual = budgets.reduce((sum, budget) => sum + budget.actual, 0);
  const overallBudgetPerformance = (totalActual / totalPlanned) * 100;

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Orçamento Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalPlanned)}
            </div>
            <p className="text-xs text-blue-500 mt-1">
              Planejado para este mês
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Realizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(totalActual)}
            </div>
            <p className="text-xs text-purple-500 mt-1">
              {overallBudgetPerformance.toFixed(1)}% do orçamento
            </p>
          </CardContent>
        </Card>

        <Card className={`border-2 ${overallBudgetPerformance > 100 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium flex items-center gap-2 ${overallBudgetPerformance > 100 ? 'text-red-700' : 'text-green-700'}`}>
              <TrendingUp className="h-4 w-4" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overallBudgetPerformance > 100 ? 'text-red-600' : 'text-green-600'}`}>
              {overallBudgetPerformance.toFixed(1)}%
            </div>
            <p className={`text-xs mt-1 ${overallBudgetPerformance > 100 ? 'text-red-500' : 'text-green-500'}`}>
              {overallBudgetPerformance > 100 ? 'Acima do orçamento' : 'Dentro do orçamento'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orçamentos por Categoria */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Orçamento por Categoria
          </CardTitle>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgets.map((budget) => (
              <div key={budget.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{budget.category}</h3>
                    <Badge className={getStatusColor(budget.status)} variant="outline">
                      {getStatusIcon(budget.status)}
                      <span className="ml-1">
                        {budget.status === 'over' && 'Acima'}
                        {budget.status === 'under' && 'Abaixo'}
                        {budget.status === 'ok' && 'No Alvo'}
                      </span>
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Planejado: {formatCurrency(budget.planned)}</span>
                  <span>Realizado: {formatCurrency(budget.actual)}</span>
                </div>
                
                <Progress 
                  value={Math.min(budget.percentage, 100)} 
                  className={`h-2 ${budget.percentage > 100 ? '[&>div]:bg-red-500' : '[&>div]:bg-green-500'}`}
                />
                
                <div className="text-center text-sm font-medium">
                  {budget.percentage.toFixed(1)}% do orçamento utilizado
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas e Objetivos
          </CardTitle>
          <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Meta
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{goal.title}</h3>
                    <Badge className={getStatusColor(goal.status)} variant="outline">
                      {getStatusIcon(goal.status)}
                      <span className="ml-1">
                        {goal.status === 'in-progress' && 'Em Andamento'}
                        {goal.status === 'attention' && 'Atenção'}
                        {goal.status === 'near-complete' && 'Quase Completa'}
                      </span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Atual: {goal.title.includes('Cliente') ? goal.current : formatCurrency(goal.current)}</span>
                  <span>Meta: {goal.title.includes('Cliente') ? goal.target : formatCurrency(goal.target)}</span>
                </div>
                
                <Progress 
                  value={goal.percentage} 
                  className="h-3"
                />
                
                <div className="text-center text-sm font-medium text-blue-600">
                  {goal.percentage.toFixed(1)}% da meta alcançada
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrcamentoMetasTab;
