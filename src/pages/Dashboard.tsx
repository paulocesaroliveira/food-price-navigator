
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Plus,
  Eye,
  Calendar,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";

const Dashboard = () => {
  // Mock data - em produção viria da API
  const stats = {
    todayRevenue: 1250.50,
    todayOrders: 8,
    weekRevenue: 6750.30,
    weekOrders: 45,
    monthRevenue: 28500.00,
    monthOrders: 185,
    revenueGrowth: 12.5,
    ordersGrowth: 8.2,
    avgOrderValue: 67.50,
    totalCustomers: 234
  };

  const recentOrders = [
    { id: "#001", customer: "Maria Silva", value: 125.50, status: "Novo", time: "há 5 min" },
    { id: "#002", customer: "João Santos", value: 89.00, status: "Em preparo", time: "há 15 min" },
    { id: "#003", customer: "Ana Costa", value: 210.00, status: "Pronto", time: "há 30 min" },
    { id: "#004", customer: "Carlos Lima", value: 95.50, status: "Finalizado", time: "há 1h" }
  ];

  const alerts = [
    { type: "stock", message: "Chocolate em pó está acabando", level: "warning" },
    { type: "order", message: "3 pedidos aguardando confirmação", level: "info" },
    { type: "payment", message: "2 pagamentos pendentes", level: "error" }
  ];

  const salesData = [
    { day: "Seg", value: 1200 },
    { day: "Ter", value: 1890 },
    { day: "Qua", value: 1750 },
    { day: "Qui", value: 2100 },
    { day: "Sex", value: 2400 },
    { day: "Sáb", value: 3200 },
    { day: "Dom", value: 2800 }
  ];

  const productsSold = [
    { name: "Bolos", value: 45, color: "#E76F51" },
    { name: "Doces", value: 30, color: "#2A9D8F" },
    { name: "Salgados", value: 15, color: "#F4A261" },
    { name: "Bebidas", value: 10, color: "#264653" }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Novo": return "bg-blue-100 text-blue-800";
      case "Em preparo": return "bg-yellow-100 text-yellow-800";
      case "Pronto": return "bg-green-100 text-green-800";
      case "Finalizado": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Hoje
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Relatórios
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.todayRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.revenueGrowth}% em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.ordersGrowth}% em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              +5.2% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +12 novos este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vendas da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#E76F51" 
                  fill="#E76F51" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Products Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productsSold}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {productsSold.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pedidos Recentes</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/orders">
                <Eye className="h-4 w-4 mr-2" />
                Ver todos
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-medium">{order.id} - {order.customer}</span>
                    <span className="text-sm text-muted-foreground">{order.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatCurrency(order.value)}</span>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas e Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Alerts */}
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  alert.level === 'error' ? 'border-red-500 bg-red-50' :
                  alert.level === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${
                      alert.level === 'error' ? 'text-red-500' :
                      alert.level === 'warning' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    <span className="text-sm">{alert.message}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t">
              <Button variant="outline" size="sm" asChild>
                <Link to="/orders">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Pedido
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/products">
                  <Package className="h-4 w-4 mr-2" />
                  Produtos
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/customers">
                  <Users className="h-4 w-4 mr-2" />
                  Clientes
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/pricing">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Preços
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
