
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSales, deleteSale } from "@/services/salesService";
import { Sale } from "@/types/sales";
import { Plus, Search, Eye, Trash2, DollarSign, TrendingUp, Calendar, ShoppingBag, Target, Zap } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import SalesForm from "@/components/sales/SalesForm";
import SalesDetail from "@/components/sales/SalesDetail";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const Sales = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const queryClient = useQueryClient();

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: getSales
  });

  const filteredSales = sales.filter(sale =>
    sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    const success = await deleteSale(id);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  // Calcular estatísticas
  const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.net_profit, 0);
  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_date);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });

  if (showForm) {
    return (
      <SalesForm
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false);
          queryClient.invalidateQueries({ queryKey: ['sales'] });
        }}
      />
    );
  }

  if (selectedSale) {
    return (
      <SalesDetail
        sale={selectedSale}
        onClose={() => setSelectedSale(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-blue-600 to-green-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">Central de Vendas</h1>
                    <p className="text-green-100 text-lg">Gerencie todas as suas vendas de forma inteligente</p>
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                    <Target className="h-4 w-4" />
                    <span>Controle Total</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>Análise Detalhada</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                    <Zap className="h-4 w-4" />
                    <span>Resultados Rápidos</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => setShowForm(true)}
                className="gap-3 h-12 px-8 text-lg bg-white text-green-600 hover:bg-green-50"
              >
                <Plus className="h-5 w-5" />
                Nova Venda
              </Button>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
          <div className="absolute -left-4 -bottom-4 h-32 w-32 rounded-full bg-white/5"></div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Vendas Totais",
              value: `R$ ${totalSales.toFixed(2)}`,
              subtitle: `${sales.length} vendas registradas`,
              icon: DollarSign,
              color: "from-blue-500 to-blue-600",
              bgColor: "bg-blue-50"
            },
            {
              title: "Lucro Líquido",
              value: `R$ ${totalProfit.toFixed(2)}`,
              subtitle: `Margem: ${totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0}%`,
              icon: TrendingUp,
              color: "from-green-500 to-green-600",
              bgColor: "bg-green-50"
            },
            {
              title: "Vendas Hoje",
              value: todaySales.length.toString(),
              subtitle: `R$ ${todaySales.reduce((sum, sale) => sum + sale.total_amount, 0).toFixed(2)}`,
              icon: Calendar,
              color: "from-purple-500 to-purple-600",
              bgColor: "bg-purple-50"
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
            placeholder="Buscar por número da venda ou observações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-lg border-0 shadow-lg"
          />
        </div>

        {/* Sales List */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle className="text-xl">Lista de Vendas</CardTitle>
            <CardDescription>Gerencie e visualize todas as suas vendas</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-pulse">Carregando vendas...</div>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">
                  {searchTerm ? "Nenhuma venda encontrada para sua busca." : "Nenhuma venda registrada ainda."}
                </h3>
                <p>Comece registrando sua primeira venda.</p>
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
                            {getStatusText(sale.status)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(sale.sale_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSale(sale)}
                          className="hover:bg-blue-50"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Detalhes
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="hover:bg-red-50 text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir a venda {sale.sale_number}? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(sale.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <span className="font-medium text-blue-700">Total da Venda</span>
                        <p className="font-bold text-lg text-blue-800">R$ {sale.total_amount.toFixed(2)}</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <span className="font-medium text-red-700">Custo Total</span>
                        <p className="font-bold text-lg text-red-800">R$ {sale.total_cost.toFixed(2)}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <span className="font-medium text-green-700">Lucro Bruto</span>
                        <p className="font-bold text-lg text-green-800">R$ {sale.gross_profit.toFixed(2)}</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <span className="font-medium text-purple-700">Lucro Líquido</span>
                        <p className="font-bold text-lg text-purple-800">R$ {sale.net_profit.toFixed(2)}</p>
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
      </div>
    </div>
  );
};

export default Sales;
