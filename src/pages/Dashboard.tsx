
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  Utensils, 
  ShoppingCart, 
  BarChart3,
  Plus,
  TrendingUp,
  Users,
  DollarSign
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Produtos",
      description: "Gerencie seus produtos",
      icon: Package,
      action: () => navigate("/products"),
      color: "text-blue-600"
    },
    {
      title: "Ingredientes", 
      description: "Controle ingredientes",
      icon: Utensils,
      action: () => navigate("/ingredients"),
      color: "text-green-600"
    },
    {
      title: "Pedidos",
      description: "Gerencie pedidos",
      icon: ShoppingCart,
      action: () => navigate("/orders"),
      color: "text-orange-600"
    },
    {
      title: "Relatórios",
      description: "Veja relatórios",
      icon: BarChart3,
      action: () => navigate("/relatorios"),
      color: "text-purple-600"
    }
  ];

  const stats = [
    {
      title: "Total de Produtos",
      value: "0",
      icon: Package,
      change: "+0%"
    },
    {
      title: "Pedidos Hoje",
      value: "0",
      icon: ShoppingCart,
      change: "+0%"
    },
    {
      title: "Receita",
      value: "R$ 0,00",
      icon: DollarSign,
      change: "+0%"
    },
    {
      title: "Clientes",
      value: "0",
      icon: Users,
      change: "+0%"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Bem-vindo ao TastyHub</p>
          </div>
          <Button onClick={() => navigate("/auth")} variant="outline">
            Login
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change} em relação ao mês passado
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={action.action}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                  <span>{action.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{action.description}</p>
                <div className="mt-4">
                  <Button size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Acessar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma atividade recente</p>
              <p className="text-sm">Comece criando seus primeiros produtos!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
