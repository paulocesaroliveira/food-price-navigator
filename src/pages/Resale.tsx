
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Users, 
  Package,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  ShoppingCart,
  Loader2,
  Calendar,
  PhoneCall,
  Mail,
  Clock,
  Star,
  Activity
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resaleService } from "@/services/resaleService";
import { ResaleTransactionForm } from "@/components/resale/ResaleTransactionForm";
import type { Reseller, ResaleTransaction, CreateResellerRequest } from "@/types/resale";

const Resale = () => {
  const [activeTab, setActiveTab] = useState("transactions");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSellerForm, setShowSellerForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ResaleTransaction | null>(null);
  const [newSeller, setNewSeller] = useState<CreateResellerRequest>({
    name: "",
    email: "",
    phone: "",
    commission_percentage: 15,
    notes: ""
  });

  const queryClient = useQueryClient();

  const { data: resellers = [], isLoading: loadingResellers } = useQuery({
    queryKey: ['resellers'],
    queryFn: resaleService.getResellers
  });

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['resale-transactions'],
    queryFn: resaleService.getTransactions
  });

  const createResellerMutation = useMutation({
    mutationFn: resaleService.createReseller,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resellers'] });
      toast({ title: "✨ Sucesso", description: "Vendedor cadastrado com sucesso!" });
      setShowSellerForm(false);
      setNewSeller({ name: "", email: "", phone: "", commission_percentage: 15, notes: "" });
    },
    onError: (error) => {
      toast({ 
        title: "❌ Erro", 
        description: `Erro ao cadastrar vendedor: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const deleteResellerMutation = useMutation({
    mutationFn: resaleService.deleteReseller,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resellers'] });
      toast({ title: "✨ Sucesso", description: "Vendedor removido com sucesso!" });
    },
    onError: (error) => {
      toast({ 
        title: "❌ Erro", 
        description: `Erro ao remover vendedor: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "inactive": return "bg-gray-100 text-gray-800 border-gray-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "delivered": return "bg-blue-100 text-blue-800 border-blue-200";
      case "paid": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Ativo";
      case "inactive": return "Inativo";
      case "pending": return "Pendente";
      case "delivered": return "Entregue";
      case "paid": return "Pago";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  const handleCreateSeller = () => {
    if (!newSeller.name.trim()) {
      toast({ 
        title: "❌ Erro", 
        description: "Nome é obrigatório",
        variant: "destructive"
      });
      return;
    }
    createResellerMutation.mutate(newSeller);
  };

  const handleDeleteSeller = (id: string) => {
    if (confirm("Tem certeza que deseja remover este vendedor?")) {
      deleteResellerMutation.mutate(id);
    }
  };

  const handleEditTransaction = (transaction: ResaleTransaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleCloseTransactionForm = () => {
    setShowTransactionForm(false);
    setEditingTransaction(null);
  };

  const totalSales = transactions.reduce((sum, t) => sum + t.total_amount, 0);
  const totalCommissions = transactions.reduce((sum, t) => sum + t.commission_amount, 0);
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                    <Users className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">Central de Revenda</h1>
                    <p className="text-blue-100 text-lg">Gerencie vendedores e transações de revenda</p>
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                    <Activity className="h-4 w-4" />
                    <span>Sistema Ativo</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                    <Star className="h-4 w-4" />
                    <span>Gestão Completa</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowSellerForm(true)}
                  className="gap-2 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/30"
                >
                  <UserPlus className="h-4 w-4" />
                  Novo Vendedor
                </Button>
                <Button 
                  onClick={() => setShowTransactionForm(true)}
                  className="gap-2 bg-white text-blue-600 hover:bg-blue-50"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Nova Transação
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
              title: "Total Vendedores",
              value: resellers.length.toString(),
              subtitle: `${resellers.filter(s => s.status === 'active').length} ativos`,
              icon: Users,
              color: "from-blue-500 to-blue-600",
              bgColor: "bg-blue-50"
            },
            {
              title: "Vendas do Mês",
              value: formatCurrency(totalSales),
              subtitle: `${transactions.length} transações`,
              icon: Package,
              color: "from-green-500 to-green-600",
              bgColor: "bg-green-50"
            },
            {
              title: "Comissões a Pagar",
              value: formatCurrency(totalCommissions),
              subtitle: `Para ${resellers.length} vendedores`,
              icon: DollarSign,
              color: "from-purple-500 to-purple-600",
              bgColor: "bg-purple-50"
            },
            {
              title: "Pendentes",
              value: pendingTransactions.toString(),
              subtitle: "Aguardando entrega",
              icon: Clock,
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

        {/* Seller Form */}
        {showSellerForm && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <UserPlus className="h-6 w-6" />
                Cadastrar Novo Vendedor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="sellerName" className="text-lg font-semibold">Nome Completo</Label>
                  <Input 
                    id="sellerName" 
                    placeholder="Nome do vendedor"
                    value={newSeller.name}
                    onChange={(e) => setNewSeller({ ...newSeller, name: e.target.value })}
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="sellerEmail" className="text-lg font-semibold">Email</Label>
                  <Input 
                    id="sellerEmail" 
                    type="email" 
                    placeholder="email@exemplo.com"
                    value={newSeller.email}
                    onChange={(e) => setNewSeller({ ...newSeller, email: e.target.value })}
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="sellerPhone" className="text-lg font-semibold">Telefone</Label>
                  <Input 
                    id="sellerPhone" 
                    placeholder="(11) 99999-9999"
                    value={newSeller.phone}
                    onChange={(e) => setNewSeller({ ...newSeller, phone: e.target.value })}
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="commission" className="text-lg font-semibold">Comissão (%)</Label>
                  <Input 
                    id="commission" 
                    type="number" 
                    placeholder="15"
                    value={newSeller.commission_percentage}
                    onChange={(e) => setNewSeller({ ...newSeller, commission_percentage: Number(e.target.value) })}
                    className="h-12 text-lg"
                  />
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <Label htmlFor="notes" className="text-lg font-semibold">Observações</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Informações adicionais sobre o vendedor"
                  value={newSeller.notes}
                  onChange={(e) => setNewSeller({ ...newSeller, notes: e.target.value })}
                  rows={4}
                  className="text-lg"
                />
              </div>
              <div className="flex gap-4 mt-8">
                <Button 
                  onClick={handleCreateSeller}
                  disabled={createResellerMutation.isPending}
                  className="h-12 px-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  {createResellerMutation.isPending && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                  Cadastrar Vendedor
                </Button>
                <Button variant="outline" onClick={() => setShowSellerForm(false)} className="h-12 px-8">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar vendedores ou transações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-lg border-0 shadow-lg"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-white shadow-lg rounded-xl">
            <TabsTrigger value="transactions" className="text-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Transações
            </TabsTrigger>
            <TabsTrigger value="sellers" className="text-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Vendedores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                  Transações de Revenda
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {loadingTransactions ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center p-12 text-gray-500">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-medium mb-2">Nenhuma transação encontrada</h3>
                    <p>Crie uma nova transação para começar.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="border rounded-xl p-6 hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-lg">#{transaction.id.slice(0, 8)}</span>
                              <Badge className={`${getStatusColor(transaction.status)} border`}>
                                {getStatusLabel(transaction.status)}
                              </Badge>
                            </div>
                            <p className="text-gray-600 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {transaction.reseller?.name} • 
                              <Calendar className="h-4 w-4 ml-2" />
                              {new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}
                              {transaction.delivery_time && (
                                <>
                                  <Clock className="h-4 w-4 ml-2" />
                                  {transaction.delivery_time}
                                </>
                              )}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="hover:bg-blue-50">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditTransaction(transaction)}
                              className="hover:bg-purple-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <span className="font-medium text-blue-700">Total:</span>
                            <p className="font-bold text-lg text-blue-800">{formatCurrency(transaction.total_amount)}</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <span className="font-medium text-green-700">Comissão:</span>
                            <p className="font-bold text-lg text-green-800">{formatCurrency(transaction.commission_amount)}</p>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <span className="font-medium text-purple-700">Itens:</span>
                            <p className="font-bold text-lg text-purple-800">{transaction.resale_transaction_items?.length || 0} itens</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium text-gray-700">Status:</span>
                            <p className="font-bold text-lg text-gray-800">{getStatusLabel(transaction.status)}</p>
                          </div>
                        </div>

                        {transaction.notes && (
                          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <span className="font-medium text-yellow-800">Observações: </span>
                            <span className="text-yellow-700">{transaction.notes}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sellers" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Users className="h-6 w-6 text-purple-600" />
                  Vendedores Cadastrados
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {loadingResellers ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                  </div>
                ) : resellers.length === 0 ? (
                  <div className="text-center p-12 text-gray-500">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-medium mb-2">Nenhum vendedor cadastrado</h3>
                    <p>Cadastre um novo vendedor para começar.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {resellers.map((seller) => (
                      <div key={seller.id} className="border rounded-xl p-6 hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-bold text-xl">{seller.name}</h3>
                              <Badge className={`${getStatusColor(seller.status)} border`}>
                                {getStatusLabel(seller.status)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                                <Mail className="h-4 w-4 text-blue-600" />
                                <div>
                                  <span className="font-medium text-blue-700">Email:</span>
                                  <p className="text-blue-800">{seller.email || 'Não informado'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                                <PhoneCall className="h-4 w-4 text-green-600" />
                                <div>
                                  <span className="font-medium text-green-700">Telefone:</span>
                                  <p className="text-green-800">{seller.phone || 'Não informado'}</p>
                                </div>
                              </div>
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <span className="font-medium text-purple-700">Comissão:</span>
                                <p className="text-lg font-bold text-purple-800">{seller.commission_percentage}%</p>
                              </div>
                              <div className="bg-yellow-50 p-3 rounded-lg">
                                <span className="font-medium text-yellow-700">Total Vendas:</span>
                                <p className="text-lg font-bold text-yellow-800">{formatCurrency(seller.total_sales)}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="hover:bg-blue-50">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteSeller(seller.id)}
                              disabled={deleteResellerMutation.isPending}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ResaleTransactionForm
          open={showTransactionForm}
          onOpenChange={handleCloseTransactionForm}
          resellers={resellers}
          transaction={editingTransaction}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['resale-transactions'] });
          }}
        />
      </div>
    </div>
  );
};

export default Resale;
