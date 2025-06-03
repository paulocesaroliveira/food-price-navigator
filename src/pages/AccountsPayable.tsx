
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PlusCircle, 
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Settings,
  TrendingUp,
  Clock,
  BarChart3
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

const AccountsPayable = () => {
  const [showForm, setShowForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const queryClient = useQueryClient();

  // Default filter for current month
  const currentMonth = new Date();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
  const defaultFilters = {
    startDate: firstDay.toISOString().split('T')[0],
    endDate: lastDay.toISOString().split('T')[0]
  };

  // Adicionando filtros por status para as abas
  const getTabFilters = () => {
    switch (activeTab) {
      case "pending":
        return { ...defaultFilters, status: "pending" };
      case "paid":
        return { ...defaultFilters, status: "paid" };
      case "overdue":
        return { ...defaultFilters, status: "overdue" };
      default:
        return defaultFilters;
    }
  };

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts-payable', getTabFilters(), refreshTrigger],
    queryFn: () => getAccountsPayable(getTabFilters())
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

  const deleteMutation = useMutation({
    mutationFn: deleteAccountPayable,
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Conta excluída com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      setRefreshTrigger(prev => prev + 1);
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
    }
  });

  const createRecurringMutation = useMutation({
    mutationFn: ({ data, installments, baseMonth }) => 
      createRecurringAccountsPayable(data, installments, baseMonth),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Contas recorrentes criadas com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      setShowForm(false);
      setEditingAccount(null);
      setRefreshTrigger(prev => prev + 1);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAccountPayable(id, data),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Conta atualizada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      setShowForm(false);
      setEditingAccount(null);
      setRefreshTrigger(prev => prev + 1);
    }
  });

  // Calculate summary data
  const totalPending = accounts
    .filter(account => account.status === 'pending')
    .reduce((sum, account) => sum + (account.amount || 0), 0);

  const totalPaid = accounts
    .filter(account => account.status === 'paid')
    .reduce((sum, account) => sum + (account.amount || 0), 0);

  const overdueCount = accounts
    .filter(account => account.status === 'pending' && new Date(account.due_date) < new Date())
    .length;

  const totalAccounts = accounts.length;

  const handleDeleteAccount = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta conta?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleNewAccount = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  const handleFormSubmit = (data) => {
    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleRecurringFormSubmit = (data, installments, baseMonth) => {
    createRecurringMutation.mutate({ data, installments, baseMonth });
  };

  const handleCategoriesChange = () => {
    queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
  };

  // Função para agrupar contas por categorias
  const getExpensesByCategory = () => {
    const categoryMap = {};
    
    accounts.forEach(account => {
      const categoryName = account.category?.name || "Sem categoria";
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = {
          name: categoryName,
          color: account.category?.color || "#718096",
          amount: 0,
          count: 0
        };
      }
      
      categoryMap[categoryName].amount += account.amount || 0;
      categoryMap[categoryName].count += 1;
    });
    
    return Object.values(categoryMap).sort((a, b) => b.amount - a.amount);
  };

  return (
    <div className="space-y-6">
      {/* Header com gradiente melhorado */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-800 to-indigo-700 rounded-lg p-6 shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Contas a Pagar
          </h1>
          <p className="text-purple-200 mt-1">
            Gerencie suas despesas e compromissos financeiros
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary"
            className="gap-2" 
            onClick={() => setShowCategoryManager(true)}
          >
            <Settings className="h-4 w-4" />
            Categorias
          </Button>
          <Button 
            className="gap-2 bg-white text-purple-800 hover:bg-purple-100"
            onClick={handleNewAccount}
          >
            <PlusCircle className="h-4 w-4" />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all" className="text-sm">Todas as Contas</TabsTrigger>
          <TabsTrigger value="pending" className="text-sm">Pendentes</TabsTrigger>
          <TabsTrigger value="overdue" className="text-sm">Vencidas</TabsTrigger>
          <TabsTrigger value="paid" className="text-sm">Pagas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          {/* Summary Cards Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500 rounded-bl-full opacity-20"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-pink-700">Total Pendente</CardTitle>
                <DollarSign className="h-4 w-4 text-pink-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-pink-800">{formatCurrency(totalPending)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {accounts.filter(a => a.status === 'pending').length} contas aguardando pagamento
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-green-500 rounded-bl-full opacity-20"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Total Pago</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-800">{formatCurrency(totalPaid)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {accounts.filter(a => a.status === 'paid').length} contas quitadas
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500 rounded-bl-full opacity-20"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-700">Contas Vencidas</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-800">{overdueCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Necessitam atenção imediata
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500 rounded-bl-full opacity-20"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Total de Contas</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-800">{totalAccounts}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  No período selecionado
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Análise por categorias */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" /> 
                  Despesas por Categoria
                </CardTitle>
                <CardDescription>Distribuição de gastos por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getExpensesByCategory().map((category, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <span className="text-sm font-semibold">{formatCurrency(category.amount)}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (category.amount / (totalPaid + totalPending) * 100) || 0)}%`,
                            backgroundColor: category.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {getExpensesByCategory().length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p>Sem dados para exibir</p>
                      <p className="text-sm text-gray-400">
                        Adicione contas para ver estatísticas por categoria
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" /> 
                  Próximos Vencimentos
                </CardTitle>
                <CardDescription>Contas com vencimento nos próximos 7 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accounts
                    .filter(account => {
                      const dueDate = new Date(account.due_date);
                      const today = new Date();
                      const sevenDaysFromNow = new Date();
                      sevenDaysFromNow.setDate(today.getDate() + 7);
                      return account.status === 'pending' && dueDate <= sevenDaysFromNow && dueDate >= today;
                    })
                    .slice(0, 5)
                    .map((account) => (
                      <div key={account.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex flex-col">
                          <div className="font-medium">{account.description}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> 
                            {new Date(account.due_date).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <span className="font-bold text-red-600">{formatCurrency(account.amount)}</span>
                      </div>
                    ))}
                  
                  {accounts.filter(account => {
                    const dueDate = new Date(account.due_date);
                    const today = new Date();
                    const sevenDaysFromNow = new Date();
                    sevenDaysFromNow.setDate(today.getDate() + 7);
                    return account.status === 'pending' && dueDate <= sevenDaysFromNow && dueDate >= today;
                  }).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p>Nenhum vencimento próximo</p>
                      <p className="text-sm text-gray-400">
                        Não há contas vencendo nos próximos 7 dias
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Accounts List with Pagination */}
          <AccountsPayableListPaginated
            onEdit={handleEditAccount}
            onDelete={handleDeleteAccount}
            refresh={refreshTrigger}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <AccountsPayableListPaginated
            onEdit={handleEditAccount}
            onDelete={handleDeleteAccount}
            refresh={refreshTrigger}
            defaultStatus="pending"
          />
        </TabsContent>

        <TabsContent value="overdue" className="space-y-6">
          <AccountsPayableListPaginated
            onEdit={handleEditAccount}
            onDelete={handleDeleteAccount}
            refresh={refreshTrigger}
            defaultStatus="overdue"
          />
        </TabsContent>

        <TabsContent value="paid" className="space-y-6">
          <AccountsPayableListPaginated
            onEdit={handleEditAccount}
            onDelete={handleDeleteAccount}
            refresh={refreshTrigger}
            defaultStatus="paid"
          />
        </TabsContent>
      </Tabs>

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
