
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Settings
} from "lucide-react";
import { formatCurrency } from "@/utils/calculations";
import { 
  getAccountsPayable, 
  deleteAccountPayable, 
  createAccountPayable, 
  updateAccountPayable,
  createRecurringAccountsPayable
} from "@/services/accountsPayableService";
import AccountPayableForm from "@/components/accounts-payable/AccountPayableForm";
import AccountsPayableListPaginated from "@/components/accounts-payable/AccountsPayableListPaginated";
import { ExpenseCategoryManager } from "@/components/accounts-payable/ExpenseCategoryManager";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AccountsPayable = () => {
  const [showForm, setShowForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const queryClient = useQueryClient();

  // Default filter for current month
  const currentMonth = new Date();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
  const defaultFilters = {
    startDate: firstDay.toISOString().split('T')[0],
    endDate: lastDay.toISOString().split('T')[0]
  };

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts-payable', defaultFilters],
    queryFn: () => getAccountsPayable(defaultFilters)
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('user_id', user?.id)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccountPayable,
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Conta excluída com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      setRefreshTrigger(prev => prev + 1);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir conta: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const createMutation = useMutation({
    mutationFn: createAccountPayable,
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Conta criada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      setShowForm(false);
      setEditingAccount(null);
      setRefreshTrigger(prev => prev + 1);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar conta: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const createRecurringMutation = useMutation({
    mutationFn: ({ data, installments, baseMonth }: { data: any, installments: number, baseMonth: string }) => 
      createRecurringAccountsPayable(data, installments, baseMonth),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Contas recorrentes criadas com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      setShowForm(false);
      setEditingAccount(null);
      setRefreshTrigger(prev => prev + 1);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar contas recorrentes: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateAccountPayable(id, data),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Conta atualizada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      setShowForm(false);
      setEditingAccount(null);
      setRefreshTrigger(prev => prev + 1);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar conta: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Calculate summary data
  const totalPending = Array.isArray(accounts) ? accounts
    .filter(account => account.status === 'pending')
    .reduce((sum, account) => sum + (account.amount || 0), 0) : 0;

  const totalPaid = Array.isArray(accounts) ? accounts
    .filter(account => account.status === 'paid')
    .reduce((sum, account) => sum + (account.amount || 0), 0) : 0;

  const overdueCount = Array.isArray(accounts) ? accounts
    .filter(account => account.status === 'pending' && new Date(account.due_date) < new Date())
    .length : 0;

  const totalAccounts = Array.isArray(accounts) ? accounts.length : 0;

  const handleDeleteAccount = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta conta?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditAccount = (account: any) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleNewAccount = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  const handleFormSubmit = (data: any) => {
    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleRecurringFormSubmit = (data: any, installments: number, baseMonth: string) => {
    createRecurringMutation.mutate({ data, installments, baseMonth });
  };

  const handleCategoriesChange = () => {
    queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          Contas a Pagar
        </h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => setShowCategoryManager(true)}
          >
            <Settings className="h-4 w-4" />
            Categorias
          </Button>
          <Button 
            className="gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600" 
            onClick={handleNewAccount}
          >
            <PlusCircle className="h-4 w-4" />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Total Pendente</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{formatCurrency(totalPending)}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Pago</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Contas Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{overdueCount}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total de Contas</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{totalAccounts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List with Pagination */}
      <AccountsPayableListPaginated
        onEdit={handleEditAccount}
        onDelete={handleDeleteAccount}
        refresh={refreshTrigger}
      />

      {/* Account Form Dialog */}
      {showForm && (
        <AccountPayableForm
          categories={categories}
          onSubmit={handleFormSubmit}
          onSubmitRecurring={handleRecurringFormSubmit}
          initialData={editingAccount}
          isOpen={showForm}
          onOpenChange={setShowForm}
        />
      )}

      {/* Category Manager Dialog */}
      {showCategoryManager && (
        <ExpenseCategoryManager
          open={showCategoryManager}
          onOpenChange={setShowCategoryManager}
          onCategoriesChange={handleCategoriesChange}
        />
      )}
    </div>
  );
};

export default AccountsPayable;
