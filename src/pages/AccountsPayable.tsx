
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
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Receipt,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AccountPayable, ExpenseCategory } from "@/types/accountsPayable";

const AccountsPayable = () => {
  const [activeTab, setActiveTab] = useState("payables");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPayableForm, setShowPayableForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [newPayable, setNewPayable] = useState({
    description: "",
    amount: 0,
    due_date: "",
    category_id: "",
    supplier: "",
    notes: "",
    payment_method: ""
  });

  const queryClient = useQueryClient();

  // Queries
  const { data: payables = [], isLoading: loadingPayables } = useQuery({
    queryKey: ['accounts-payable'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_payable')
        .select(`
          *,
          category:expense_categories(*)
        `)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Mutations
  const createPayableMutation = useMutation({
    mutationFn: async (payable: typeof newPayable) => {
      const { data, error } = await supabase
        .from('accounts_payable')
        .insert([payable])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      toast({ title: "Sucesso", description: "Conta a pagar cadastrada com sucesso!" });
      setShowPayableForm(false);
      setNewPayable({
        description: "",
        amount: 0,
        due_date: "",
        category_id: "",
        supplier: "",
        notes: "",
        payment_method: ""
      });
    },
    onError: (error) => {
      toast({ 
        title: "Erro", 
        description: `Erro ao cadastrar conta: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updatePayableStatusMutation = useMutation({
    mutationFn: async ({ id, status, payment_date }: { id: string, status: string, payment_date?: string }) => {
      const updates: any = { status };
      if (payment_date) updates.payment_date = payment_date;
      
      const { error } = await supabase
        .from('accounts_payable')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      toast({ title: "Sucesso", description: "Status atualizado com sucesso!" });
    },
    onError: (error) => {
      toast({ 
        title: "Erro", 
        description: `Erro ao atualizar status: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const deletePayableMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('accounts_payable')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      toast({ title: "Sucesso", description: "Conta removida com sucesso!" });
    },
    onError: (error) => {
      toast({ 
        title: "Erro", 
        description: `Erro ao remover conta: ${error.message}`,
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
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "paid": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Pendente";
      case "paid": return "Pago";
      case "overdue": return "Atrasado";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Calendar className="h-4 w-4" />;
      case "paid": return <CheckCircle className="h-4 w-4" />;
      case "overdue": return <AlertTriangle className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status === 'pending' && new Date(dueDate) < new Date() && status !== 'paid';
  };

  const filteredPayables = payables.filter(payable => {
    const matchesSearch = payable.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payable.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payable.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalPending = payables.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payables.filter(p => isOverdue(p.due_date, p.status)).reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = payables.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const overdueCount = payables.filter(p => isOverdue(p.due_date, p.status)).length;

  const handleCreatePayable = () => {
    if (!newPayable.description.trim() || !newPayable.due_date || newPayable.amount <= 0) {
      toast({ 
        title: "Erro", 
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    createPayableMutation.mutate(newPayable);
  };

  const handleMarkAsPaid = (id: string) => {
    updatePayableStatusMutation.mutate({
      id,
      status: 'paid',
      payment_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDeletePayable = (id: string) => {
    if (confirm("Tem certeza que deseja remover esta conta?")) {
      deletePayableMutation.mutate(id);
    }
  };

  const PayableForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Nova Conta a Pagar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Input 
              id="description" 
              placeholder="Descrição da despesa"
              value={newPayable.description}
              onChange={(e) => setNewPayable({ ...newPayable, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="amount">Valor *</Label>
            <Input 
              id="amount" 
              type="number" 
              step="0.01"
              placeholder="0,00"
              value={newPayable.amount}
              onChange={(e) => setNewPayable({ ...newPayable, amount: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="due_date">Data de Vencimento *</Label>
            <Input 
              id="due_date" 
              type="date"
              value={newPayable.due_date}
              onChange={(e) => setNewPayable({ ...newPayable, due_date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select 
              value={newPayable.category_id} 
              onValueChange={(value) => setNewPayable({ ...newPayable, category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="supplier">Fornecedor</Label>
            <Input 
              id="supplier" 
              placeholder="Nome do fornecedor"
              value={newPayable.supplier}
              onChange={(e) => setNewPayable({ ...newPayable, supplier: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="payment_method">Forma de Pagamento</Label>
            <Select 
              value={newPayable.payment_method} 
              onValueChange={(value) => setNewPayable({ ...newPayable, payment_method: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="check">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="notes">Observações</Label>
          <Textarea 
            id="notes" 
            placeholder="Informações adicionais"
            value={newPayable.notes}
            onChange={(e) => setNewPayable({ ...newPayable, notes: e.target.value })}
          />
        </div>
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={handleCreatePayable}
            disabled={createPayableMutation.isPending}
          >
            {createPayableMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Cadastrar Conta
          </Button>
          <Button variant="outline" onClick={() => setShowPayableForm(false)}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contas a Pagar</h1>
          <p className="text-muted-foreground">Gerencie suas despesas e pagamentos</p>
        </div>
        
        <Button onClick={() => setShowPayableForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-muted-foreground">
              {payables.filter(p => p.status === 'pending').length} contas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Atrasadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue)}</div>
            <p className="text-xs text-muted-foreground">
              {overdueCount} contas em atraso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagas este Mês</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {payables.filter(p => p.status === 'paid').length} contas pagas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPending + totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {payables.length} contas no total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Forms */}
      {showPayableForm && <PayableForm />}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="overdue">Atrasado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payables List */}
      <Card>
        <CardHeader>
          <CardTitle>Contas a Pagar</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPayables ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredPayables.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              {payables.length === 0 
                ? "Nenhuma conta cadastrada. Crie uma nova conta para começar."
                : "Nenhuma conta encontrada com os filtros aplicados."
              }
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayables.map((payable) => (
                <div key={payable.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{payable.description}</h3>
                        <Badge className={getStatusColor(payable.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(payable.status)}
                            {getStatusLabel(payable.status)}
                          </div>
                        </Badge>
                        {isOverdue(payable.due_date, payable.status) && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Atrasado
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {payable.supplier && `Fornecedor: ${payable.supplier} • `}
                        Vencimento: {new Date(payable.due_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {payable.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleMarkAsPaid(payable.id)}
                          disabled={updatePayableStatusMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Marcar como Pago
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeletePayable(payable.id)}
                        disabled={deletePayableMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Valor:</span>
                      <p className="text-lg font-semibold">{formatCurrency(payable.amount)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Categoria:</span>
                      <p>{payable.category?.name || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Forma de Pagamento:</span>
                      <p>{payable.payment_method || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Data de Pagamento:</span>
                      <p>{payable.payment_date ? new Date(payable.payment_date).toLocaleDateString('pt-BR') : 'Não pago'}</p>
                    </div>
                  </div>

                  {payable.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">Observações: </span>
                      <span className="text-sm">{payable.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountsPayable;
