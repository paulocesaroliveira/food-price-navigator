
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Bar, Line, CartesianGrid } from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  UtensilsCrossed, 
  Egg,
  AlertTriangle
} from "lucide-react";
import { dashboardChartData, recipes } from "@/utils/mockData";
import { formatCurrency, formatPercentage } from "@/utils/calculations";

const Dashboard = () => {
  // Mock stats
  const stats = {
    avgProfit: 12.35,
    avgMargin: 38.5,
    avgRecipeCost: 8.75,
    totalRecipes: recipes.length,
    totalIngredients: 35,
  };
  
  // Recent recipes data
  const recentRecipes = recipes.slice(0, 3);
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrency(stats.avgProfit)}</div>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="w-4 h-4 text-food-green" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Margem média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatPercentage(stats.avgMargin)}</div>
              <div className="p-2 bg-green-100 rounded-full">
                <Percent className="w-4 h-4 text-food-green" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Custo médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrency(stats.avgRecipeCost)}</div>
              <div className="p-2 bg-orange-100 rounded-full">
                <DollarSign className="w-4 h-4 text-food-orange" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalRecipes}</div>
              <div className="p-2 bg-blue-100 rounded-full">
                <UtensilsCrossed className="w-4 h-4 text-food-blue" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingredientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalIngredients}</div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Egg className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas mais lucrativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardChartData.barChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="profit" fill="#4CAF50" name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Evolução dos preços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardChartData.lineChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#2196F3"
                    name="Preço médio"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Recipes */}
      <Card>
        <CardHeader>
          <CardTitle>Receitas recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Custo por unidade</th>
                  <th className="text-left p-3">Margem</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRecipes.map((recipe) => (
                  <tr key={recipe.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">{recipe.name}</td>
                    <td className="p-3">{formatCurrency(recipe.unitCost)}</td>
                    <td className="p-3">{formatPercentage(40)}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Ativo
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Alerts */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-orange-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-orange-700">
              <span className="mt-1">•</span>
              <span>Brigadeiro Tradicional está com margem abaixo do ideal (30%)</span>
            </li>
            <li className="flex items-start gap-2 text-orange-700">
              <span className="mt-1">•</span>
              <span>Leite Condensado teve aumento de preço recente (+5%)</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
