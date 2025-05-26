
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAccountsPayable, 
  getExpenseCategories, 
  createAccountPayable, 
  updateAccountPayable, 
  deleteAccountPayable, 
  markAsPaid 
} from "@/services/accountsPayableService";
import AccountPayableForm from "@/components/accounts-payable/AccountPayableForm";
import AccountPayablesList from "@/components/accounts-payable/AccountPayablesList";
import { ExpenseCategoryManager } from "@/components/accounts-payable/ExpenseCategoryManager";
import type { AccountPayable, AccountsPayableFilters } from "@/types/accountsPayable";

const AccountsPayable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showPayableForm, setShowPayableForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingPayable, setEditingPayable] = useState<AccountPayable | undefined>(undefined);

  const queryClient = useQueryClient();

  // Queries
  const { data: payables = [], isLoading: loadingPayables, refetch: refetchPayables } = useQuery({
    queryKey: ['accounts-payable', { status: statusFilter !== 'all' ? statusFilter : undefined, category: categoryFilter !== 'all' ? categoryFilter : undefined }],
    queryFn: () => getAccountsPayable({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined
    }),
  });

  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: getExpenseCategories,
  });

  // Mutations
  const createPayableMutation = useMutation({
    mutationFn: createAccountPayable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      setShowPayableForm(false);
      setEditingPayable(undefined);
    }
  });

  const updatePayableMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AccountPayable> }) =>
      updateAccountPayable(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      setShowPayableForm(false);
      setEditingPayable(undefined);
    }
  });

  const deletePayableMutation = useMutation({
    mutationFn: deleteAccountPayable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
    }
  });

  const markAsPaidMutation = useMutation({
    mutationFn: ({ id, paymentDate, paymentMethod }: { id: string; paymentDate: string; paymentMethod: string }) =>
      markAsPaid(id, paymentDate, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status === 'pending' && new Date(dueDate) < new Date();
  };

  // Filter payables based on search term
  const filteredPayables = payables.filter(payable => {
    const matchesSearch = payable.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payable.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Calculate stats
  const totalPending = payables.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payables.filter(p => isOverdue(p.due_date, p.status)).reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = payables.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const overdueCount = payables.filter(p => isOverdue(p.due_date, p.status)).length;

  const handleCreatePayable = (data: Omit<AccountPayable, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    createPayableMutation.mutate(data);
  };

  const handleUpdatePayable = (data: Omit<AccountPayable, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (editingPayable) {
      updatePayableMutation.mutate({
        id: editingPayable.id,
        updates: data
      });
    }
  };

  const handleEditPayable = (payable: AccountPayable) => {
    setEditingPayable(payable);
    setShowPayableForm(true);
  };

  const handleDeletePayable = (id: string) => {
    deletePayableMutation.mutate(id);
  };

  const handleMarkAsPaid = (id: string, paymentDate: string, paymentMethod: string) => {
    markAsPaidMutation.mutate({ id, paymentDate, paymentMethod });
  };

  const handleCategoriesChange = () => {
    refetchCategories();
  };

  const openCreateForm = () => {
    setEditingPayable(undefined);
    setShowPayableForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contas a Pagar</h1>
          <p className="text-muted-foreground">Gerencie suas despesas e pagamentos</p>
        </div>
        
        <Button onClick={openCreateForm}>
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
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Accounts List */}
      <AccountPayablesList
        accounts={filteredPayables}
        onEdit={handleEditPayable}
        onDelete={handleDeletePayable}
        onMarkAsPaid={handleMarkAsPaid}
      />

      {/* Form Dialog */}
      <AccountPayableForm
        categories={categories}
        onSubmit={editingPayable ? handleUpdatePayable : handleCreatePayable}
        initialData={editingPayable}
        isOpen={showPayableForm}
        onOpenChange={setShowPayableForm}
        onManageCategories={() => setShowCategoryManager(true)}
      />

      {/* Category Manager */}
      <ExpenseCategoryManager
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
        onCategoriesChange={handleCategoriesChange}
      />
    </div>
  );
};

export default AccountsPayable;
