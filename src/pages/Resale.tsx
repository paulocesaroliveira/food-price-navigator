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
  Activity,
  ArrowUp,
  ArrowDown,
  Filter
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resaleService } from "@/services/resaleService";
import ResaleTransactionForm from "@/components/resale/ResaleTransactionForm";
import SEOHead from "@/components/SEOHead";
import type { Reseller, ResaleTransaction, CreateResellerRequest } from "@/types/resale";

const Resale = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
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
      case "active": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "inactive": return "bg-gray-100 text-gray-700 border-gray-200";
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "delivered": return "bg-blue-100 text-blue-700 border-blue-200";
      case "paid": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
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
  const activeResellers = resellers.filter(r => r.status === 'active').length;

  const filteredTransactions = transactions.filter(t => 
    t.reseller?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResellers = resellers.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <SEOHead 
        title="Central de Revenda - TastyHub"
        description="Gerencie sua rede de revenda com facilidade. Controle vendedores, comissões, transações e performance de vendas."
        keywords="revenda, revendedores, comissões, vendas, gestão revenda"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container-responsive py-6 lg:py-8 spacing-responsive">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-8 lg:p-10 text-white shadow-2xl mb-6 lg:mb-8">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -right-4 -top-4 h-24 w-24 lg:h-32 lg:w-32 rounded-full bg-white/10"></div>
            <div className="absolute -left-4 -bottom-4 h-32 w-32 lg:h-40 lg:w-40 rounded-full bg-white/5"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-white/20 p-3 lg:p-4 backdrop-blur-sm">
                      <Users className="h-6 w-6 lg:h-8 lg:w-8" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Central de Revenda</h1>
                      <p className="text-blue-100 text-sm sm:text-base lg:text-lg">Gerencie sua rede de vendedores e transações</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-2 backdrop-blur-sm">
                      <Activity className="h-4 w-4" />
                      <span>Sistema Ativo</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-2 backdrop-blur-sm">
                      <Star className="h-4 w-4" />
                      <span>Gestão Completa</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button 
                    onClick={() => setShowSellerForm(true)}
                    className="gap-2 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/30 h-10 lg:h-12"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Novo Vendedor</span>
                    <span className="sm:hidden">Vendedor</span>
                  </Button>
                  <Button 
                    onClick={() => setShowTransactionForm(true)}
                    className="gap-2 bg-white text-blue-600 hover:bg-blue-50 h-10 lg:h-12"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span className="hidden sm:inline">Nova Transação</span>
                    <span className="sm:hidden">Transação</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {[
              {
                title: "Vendedores",
                value: resellers.length.toString(),
                subtitle: `${activeResellers} ativos`,
                icon: Users,
                color: "from-blue-500 to-blue-600",
                bgColor: "bg-blue-50",
                trend: "+2",
                trendUp: true
              },
              {
                title: "Vendas",
                value: formatCurrency(totalSales),
                subtitle: `${transactions.length} transações`,
                icon: Package,
                color: "from-emerald-500 to-emerald-600",
                bgColor: "bg-emerald-50",
                trend: "+12%",
                trendUp: true
              },
              {
                title: "Comissões",
                value: formatCurrency(totalCommissions),
                subtitle: "A pagar",
                icon: DollarSign,
                color: "from-purple-500 to-purple-600",
                bgColor: "bg-purple-50",
                trend: "+8%",
                trendUp: true
              },
              {
                title: "Pendentes",
                value: pendingTransactions.toString(),
                subtitle: "Aguardando",
                icon: Clock,
                color: "from-amber-500 to-amber-600",
                bgColor: "bg-amber-50",
                trend: "-3",
                trendUp: false
              }
            ].map((stat, index) => (
              <Card key={index} className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${stat.bgColor} group`}>
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`rounded-xl p-2 lg:p-3 bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stat.trendUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      <span>{stat.trend}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-lg lg:text-2xl font-bold text-gray-900 mb-1 truncate">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar vendedores ou transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 lg:h-12 border-0 shadow-lg bg-white"
              />
            </div>
            <Button variant="outline" className="gap-2 h-10 lg:h-12 border-0 shadow-lg bg-white">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
            </Button>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-white shadow-lg rounded-xl">
              <TabsTrigger value="dashboard" className="text-sm lg:text-base data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="transactions" className="text-sm lg:text-base data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Transações
              </TabsTrigger>
              <TabsTrigger value="sellers" className="text-sm lg:text-base data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Vendedores
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <Card className="border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Transações Recentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div>
                            <p className="font-medium text-sm">#{transaction.id.slice(0, 8)}</p>
                            <p className="text-xs text-gray-600">{transaction.reseller?.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{formatCurrency(transaction.total_amount)}</p>
                            <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                              {getStatusLabel(transaction.status)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Sellers */}
                <Card className="border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
                    <CardTitle className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-emerald-600" />
                      Top Vendedores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {resellers.slice(0, 5).map((seller, index) => (
                        <div key={seller.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{seller.name}</p>
                            <p className="text-xs text-gray-600">{seller.commission_percentage}% comissão</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{formatCurrency(seller.total_sales)}</p>
                            <Badge className={`text-xs ${getStatusColor(seller.status)}`}>
                              {getStatusLabel(seller.status)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

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

          {/* Quick Create Seller Form */}
          {showSellerForm && (
            <Card className="border-0 shadow-2xl bg-white fixed inset-4 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-2xl z-50 overflow-auto">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="flex items-center gap-3">
                  <UserPlus className="h-6 w-6" />
                  Cadastrar Novo Vendedor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sellerName">Nome Completo</Label>
                    <Input 
                      id="sellerName" 
                      placeholder="Nome do vendedor"
                      value={newSeller.name}
                      onChange={(e) => setNewSeller({ ...newSeller, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sellerEmail">Email</Label>
                    <Input 
                      id="sellerEmail" 
                      type="email" 
                      placeholder="email@exemplo.com"
                      value={newSeller.email}
                      onChange={(e) => setNewSeller({ ...newSeller, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sellerPhone">Telefone</Label>
                    <Input 
                      id="sellerPhone" 
                      placeholder="(11) 99999-9999"
                      value={newSeller.phone}
                      onChange={(e) => setNewSeller({ ...newSeller, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commission">Comissão (%)</Label>
                    <Input 
                      id="commission" 
                      type="number" 
                      placeholder="15"
                      value={newSeller.commission_percentage}
                      onChange={(e) => setNewSeller({ ...newSeller, commission_percentage: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Informações adicionais sobre o vendedor"
                    value={newSeller.notes}
                    onChange={(e) => setNewSeller({ ...newSeller, notes: e.target.value })}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleCreateSeller}
                    disabled={createResellerMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                  >
                    {createResellerMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Cadastrar
                  </Button>
                  <Button variant="outline" onClick={() => setShowSellerForm(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overlay for modal */}
          {showSellerForm && (
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowSellerForm(false)} />
          )}

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
    </>
  );
};

export default Resale;
