
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  TrendingUp, 
  DollarSign,
  Package,
  Eye,
  Edit,
  ShoppingCart,
  Calendar,
  Users,
  Award,
  Activity,
  Star
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllSales } from "@/services/salesService";
import { SalesForm } from "@/components/sales/SalesForm";

const Sales = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: getAllSales
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "Concluída";
      case "pending": return "Pendente";
      case "cancelled": return "Cancelada";
      default: return status;
    }
  };

  const handleEditSale = (sale: any) => {
    setEditingSale(sale);
    setShowSalesForm(true);
  };

  const handleCloseSalesForm = () => {
    setShowSalesForm(false);
    setEditingSale(null);
  };

  // Calculate stats
  const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.gross_profit, 0);
  const completedSales = sales.filter(sale => sale.status === 'completed').length;
  const averageTicket = sales.length > 0 ? totalSales / sales.length : 0;

  const filteredSales = sales.filter(sale =>
    sale.sale_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-blue-600 to-green-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                    <ShoppingCart className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">Gestão de Vendas</h1>
                    <p className="text-green-100 text-lg">Controle completo das suas vendas e faturamento</p>
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                    <Activity className="h-4 w-4" />
                    <span>Sistema Ativo</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                    <Star className="h-4 w-4" />
                    <span>Gestão Avançada</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowSalesForm(true)}
                  className="gap-2 bg-white text-green-600 hover:bg-green-50"
                >
                  <Plus className="h-4 w-4" />
                  Nova Venda
                </Button>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
          <div className="absolute -left-4 -bottom-4 h-32 w-32 rounded-full bg-white/5"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: "Total de Vendas",
              value: formatCurrency(totalSales),
              subtitle: `${sales.length} transações`,
              icon: DollarSign,
              color: "from-green-500 to-green-600",
              bgColor: "bg-green-50"
            },
            {
              title: "Lucro Total",
              value: formatCurrency(totalProfit),
              subtitle: "Margem média",
              icon: TrendingUp,
              color: "from-blue-500 to-blue-600",
              bgColor: "bg-blue-50"
            },
            {
              title: "Vendas Concluídas",
              value: completedSales.toString(),
              subtitle: `${sales.length - completedSales} pendentes`,
              icon: Package,
              color: "from-purple-500 to-purple-600",
              bgColor: "bg-purple-50"
            },
            {
              title: "Ticket Médio",
              value: formatCurrency(averageTicket),
              subtitle: "Por transação",
              icon: Award,
              color: "from-orange-500 to-orange-600",
              bgColor: "bg-orange-50"
            }
          ].map((stat, index) => (
            <Card key={index} className={`border-0 shadow-lg hover:shadow-xl transition-all ${stat.bgColor}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`rounded-xl p-3 bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar vendas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-lg border-0 shadow-lg"
          />
        </div>

        {/* Sales List */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle className="flex items-center gap-3 text-xl">
              <ShoppingCart className="h-6 w-6 text-green-600" />
              Vendas Realizadas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="text-center p-12 text-gray-500">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">Nenhuma venda encontrada</h3>
                <p>Registre uma nova venda para começar.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredSales.map((sale) => (
                  <div key={sale.id} className="border rounded-xl p-6 hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-lg">{sale.sale_number}</span>
                          <Badge className={`${getStatusColor(sale.status)} border`}>
                            {getStatusLabel(sale.status)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(sale.sale_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="hover:bg-blue-50">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditSale(sale)}
                          className="hover:bg-green-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <span className="font-medium text-green-700">Total:</span>
                        <p className="font-bold text-lg text-green-800">{formatCurrency(sale.total_amount)}</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <span className="font-medium text-blue-700">Lucro:</span>
                        <p className="font-bold text-lg text-blue-800">{formatCurrency(sale.gross_profit)}</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <span className="font-medium text-purple-700">Custo:</span>
                        <p className="font-bold text-lg text-purple-800">{formatCurrency(sale.total_cost)}</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <span className="font-medium text-orange-700">Itens:</span>
                        <p className="font-bold text-lg text-orange-800">{sale.sale_items?.length || 0} itens</p>
                      </div>
                    </div>

                    {sale.notes && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <span className="font-medium text-yellow-800">Observações: </span>
                        <span className="text-yellow-700">{sale.notes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <SalesForm
          open={showSalesForm}
          onOpenChange={handleCloseSalesForm}
          sale={editingSale}
          onSuccess={() => {
            handleCloseSalesForm();
          }}
        />
      </div>
    </div>
  );
};

export default Sales;
