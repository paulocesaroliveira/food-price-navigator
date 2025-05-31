
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Mail
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
      toast({ title: "Sucesso", description: "Vendedor cadastrado com sucesso!" });
      setShowSellerForm(false);
      setNewSeller({ name: "", email: "", phone: "", commission_percentage: 15, notes: "" });
    },
    onError: (error) => {
      toast({ 
        title: "Erro", 
        description: `Erro ao cadastrar vendedor: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const deleteResellerMutation = useMutation({
    mutationFn: resaleService.deleteReseller,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resellers'] });
      toast({ title: "Sucesso", description: "Vendedor removido com sucesso!" });
    },
    onError: (error) => {
      toast({ 
        title: "Erro", 
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
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "inactive": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "delivered": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "paid": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
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
        title: "Erro", 
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

  const totalSales = transactions.reduce((sum, t) => sum + t.total_amount, 0);
  const totalCommissions = transactions.reduce((sum, t) => sum + t.commission_amount, 0);
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Central de Revenda
          </h1>
          <p className="text-muted-foreground">Gerencie vendedores e transações de revenda</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowSellerForm(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Vendedor
          </Button>
          <Button 
            onClick={() => setShowTransactionForm(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendedores</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resellers.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-medium">
                {resellers.filter(s => s.status === 'active').length} ativos
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1 text-green-500" />
              {transactions.length} transações
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões a Pagar</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCommissions)}</div>
            <p className="text-xs text-muted-foreground">
              Para {resellers.length} vendedores
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando entrega
            </p>
          </CardContent>
        </Card>
      </div>

      {showSellerForm && (
        <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Cadastrar Novo Vendedor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sellerName">Nome Completo</Label>
                <Input 
                  id="sellerName" 
                  placeholder="Nome do vendedor"
                  value={newSeller.name}
                  onChange={(e) => setNewSeller({ ...newSeller, name: e.target.value })}
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
                />
              </div>
              <div>
                <Label htmlFor="sellerPhone">Telefone</Label>
                <Input 
                  id="sellerPhone" 
                  placeholder="(11) 99999-9999"
                  value={newSeller.phone}
                  onChange={(e) => setNewSeller({ ...newSeller, phone: e.target.value })}
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
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="notes">Observações</Label>
              <Textarea 
                id="notes" 
                placeholder="Informações adicionais sobre o vendedor"
                value={newSeller.notes}
                onChange={(e) => setNewSeller({ ...newSeller, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={handleCreateSeller}
                disabled={createResellerMutation.isPending}
                className="bg-gradient-to-r from-green-500 to-green-600"
              >
                {createResellerMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Cadastrar Vendedor
              </Button>
              <Button variant="outline" onClick={() => setShowSellerForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar vendedores ou transações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="sellers">Vendedores</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Transações de Revenda
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma transação encontrada</h3>
                  <p>Crie uma nova transação para começar.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">#{transaction.id.slice(0, 8)}</span>
                            <Badge className={getStatusColor(transaction.status)}>
                              {getStatusLabel(transaction.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Users className="h-3 w-3" />
                            {transaction.reseller?.name} • 
                            <Calendar className="h-3 w-3 ml-1" />
                            {new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Total:</span>
                          <p className="font-semibold">{formatCurrency(transaction.total_amount)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Comissão:</span>
                          <p className="font-semibold text-green-600">{formatCurrency(transaction.commission_amount)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Itens:</span>
                          <p>{transaction.resale_transaction_items?.length || 0} itens</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Status:</span>
                          <p>{getStatusLabel(transaction.status)}</p>
                        </div>
                      </div>

                      {transaction.notes && (
                        <div className="mt-3 p-2 bg-muted rounded">
                          <span className="text-sm font-medium">Observações: </span>
                          <span className="text-sm">{transaction.notes}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sellers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Vendedores Cadastrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingResellers ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : resellers.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Nenhum vendedor cadastrado</h3>
                  <p>Cadastre um novo vendedor para começar.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resellers.map((seller) => (
                    <div key={seller.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{seller.name}</h3>
                            <Badge className={getStatusColor(seller.status)}>
                              {getStatusLabel(seller.status)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <div>
                                <span className="font-medium">Email:</span>
                                <p>{seller.email || 'Não informado'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <PhoneCall className="h-3 w-3" />
                              <div>
                                <span className="font-medium">Telefone:</span>
                                <p>{seller.phone || 'Não informado'}</p>
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Comissão:</span>
                              <p className="text-blue-600 font-semibold">{seller.commission_percentage}%</p>
                            </div>
                            <div>
                              <span className="font-medium">Total Vendas:</span>
                              <p className="text-green-600 font-semibold">{formatCurrency(seller.total_sales)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteSeller(seller.id)}
                            disabled={deleteResellerMutation.isPending}
                            className="text-destructive hover:text-destructive"
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
        onOpenChange={setShowTransactionForm}
        resellers={resellers}
      />
    </div>
  );
};

export default Resale;
