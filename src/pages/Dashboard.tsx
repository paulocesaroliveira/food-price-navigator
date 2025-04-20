
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, 
  LineChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Bar, 
  Line, 
  CartesianGrid,
  Cell,
  PieChart,
  Pie 
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  UtensilsCrossed, 
  Egg,
  AlertTriangle,
  ShoppingCart,
  Users,
  Calendar,
  ArrowRight,
  Package
} from "lucide-react";
import { dashboardChartData, recipes } from "@/utils/mockData";
import { formatCurrency, formatPercentage } from "@/utils/calculations";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock stats
  const stats = {
    avgProfit: 12.35,
    avgMargin: 38.5,
    avgRecipeCost: 8.75,
    totalRecipes: recipes.length,
    totalIngredients: 35,
    totalOrders: 28,
    totalCustomers: 54,
    weeklyRevenue: 3750.45,
    monthlyRevenue: 14280.90,
    growthRate: 12.5,
  };
  
  // Recent recipes data
  const recentRecipes = recipes.slice(0, 3);

  // Mock inventory warnings
  const inventoryWarnings = [
    { id: 1, name: "Leite Condensado", status: "low", current: 3, min: 5 },
    { id: 2, name: "Chocolate em Pó", status: "low", current: 2, min: 4 },
  ];

  // Mock recent orders
  const recentOrders = [
    { id: "#ORD-001", customer: "Ana Silva", total: 125.50, date: "2023-05-18", status: "Finalizado" },
    { id: "#ORD-002", customer: "Carlos Mendes", total: 97.80, date: "2023-05-17", status: "Em preparo" },
    { id: "#ORD-003", customer: "Maria Oliveira", total: 210.35, date: "2023-05-17", status: "Novo" },
  ];

  // Sales by product category (for pie chart)
  const salesByCategory = [
    { name: "Bolos", value: 45 },
    { name: "Doces", value: 30 },
    { name: "Salgados", value: 15 },
    { name: "Bebidas", value: 10 },
  ];

  // Colors for pie chart
  const COLORS = ['#E76F51', '#2A9D8F', '#F4A261', '#264653'];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Este Mês
          </Button>
          <Button variant="outline" size="sm">
            Exportar
          </Button>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-food-coral/10 to-food-coral/5 border-food-coral/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-food-textlight flex justify-between items-center">
              <span>Faturamento Mensal</span>
              <DollarSign className="w-4 h-4 text-food-coral" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
              <div className="flex items-center text-sm text-food-coral mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+{stats.growthRate}% em relação ao mês anterior</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-food-mint/10 to-food-mint/5 border-food-mint/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-food-textlight flex justify-between items-center">
              <span>Pedidos</span>
              <ShoppingCart className="w-4 h-4 text-food-mint" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <div className="flex items-center text-sm text-food-mint mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+5 novos pedidos hoje</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-food-amber/10 to-food-amber/5 border-food-amber/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-food-textlight flex justify-between items-center">
              <span>Clientes</span>
              <Users className="w-4 h-4 text-food-amber" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <div className="flex items-center text-sm text-food-amber mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+3 novos clientes esta semana</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-100 to-purple-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-food-textlight flex justify-between items-center">
              <span>Margem Média</span>
              <Percent className="w-4 h-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="text-2xl font-bold">{formatPercentage(stats.avgMargin)}</div>
              <div className="flex items-center text-sm text-purple-600 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+2.5% em relação ao trimestre anterior</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
            <CardDescription>Análise dos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardChartData.barChart}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#E76F51" name="Receita" />
                  <Bar dataKey="profit" fill="#2A9D8F" name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Vendas</CardTitle>
            <CardDescription>Por categoria de produto</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent activities and alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Pedidos Recentes</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/orders" className="flex items-center gap-1 text-food-coral">
                  Ver todos <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2 font-medium">Pedido</th>
                    <th className="p-2 font-medium">Cliente</th>
                    <th className="p-2 font-medium">Valor</th>
                    <th className="p-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{order.id}</td>
                      <td className="p-2">{order.customer}</td>
                      <td className="p-2">{formatCurrency(order.total)}</td>
                      <td className="p-2">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${order.status === 'Finalizado' ? 'bg-green-100 text-green-800' : 
                              order.status === 'Em preparo' ? 'bg-blue-100 text-blue-800' : 
                              'bg-amber-100 text-amber-800'}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {/* Alerts & Inventory */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Alertas</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/ingredients" className="flex items-center gap-1 text-food-coral">
                  Gerenciar <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Inventory Warnings */}
            <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
              <h3 className="font-medium flex items-center gap-2 text-amber-800 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Estoque Baixo
              </h3>
              <ul className="space-y-2">
                {inventoryWarnings.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm text-amber-700">
                    <span>{item.name}</span>
                    <span className="font-medium">{item.current} unidades (mín. {item.min})</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Margin Warnings */}
            <div className="border rounded-lg p-4 bg-red-50 border-red-200">
              <h3 className="font-medium flex items-center gap-2 text-red-800 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Margens Abaixo do Ideal
              </h3>
              <ul className="space-y-2">
                <li className="flex justify-between text-sm text-red-700">
                  <span>Brigadeiro Tradicional</span>
                  <span className="font-medium">28% (meta: 35%)</span>
                </li>
                <li className="flex justify-between text-sm text-red-700">
                  <span>Bolo de Cenoura</span>
                  <span className="font-medium">32% (meta: 40%)</span>
                </li>
              </ul>
            </div>
            
            {/* Price Update Reminders */}
            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <h3 className="font-medium flex items-center gap-2 text-blue-800 mb-2">
                <Calendar className="w-4 h-4" />
                Atualizações Pendentes
              </h3>
              <ul className="space-y-2">
                <li className="flex justify-between text-sm text-blue-700">
                  <span>Atualização de preço do leite condensado</span>
                  <Button size="sm" variant="outline" className="h-6 text-xs py-0 px-2">Atualizar</Button>
                </li>
                <li className="flex justify-between text-sm text-blue-700">
                  <span>Revisão mensal de preços</span>
                  <Button size="sm" variant="outline" className="h-6 text-xs py-0 px-2">Agendar</Button>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Access & Recent Recipes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/recipes" className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" />
                Nova Receita
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/products" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Novo Produto
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/orders" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Registrar Venda
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/customers" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Novo Cliente
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/pricing" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Calcular Preço
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Receitas Recentes</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/recipes" className="flex items-center gap-1 text-food-coral">
                  Ver todas <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-left border-b">
                    <th className="p-2 font-medium">Nome</th>
                    <th className="p-2 font-medium">Custo</th>
                    <th className="p-2 font-medium">Margem</th>
                    <th className="p-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRecipes.map((recipe) => (
                    <tr key={recipe.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{recipe.name}</td>
                      <td className="p-2">{formatCurrency(recipe.unitCost)}</td>
                      <td className="p-2">{formatPercentage(40)}</td>
                      <td className="p-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Ativo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Button variant="default" size="sm" className="bg-food-coral" asChild>
                <Link to="/recipes/new" className="flex items-center gap-1">
                  Nova Receita
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
