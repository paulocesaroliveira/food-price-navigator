
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AccountPayableForm from "@/components/accounts-payable/AccountPayableForm";
import AccountPayablesList from "@/components/accounts-payable/AccountPayablesList";
import {
  getExpenseCategories,
  getAccountsPayable,
  createAccountPayable,
  updateAccountPayable,
  deleteAccountPayable,
  markAsPaid
} from "@/services/accountsPayableService";
import type { AccountPayable, AccountsPayableFilters } from "@/types/accountsPayable";

const AccountsPayable = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountPayable | null>(null);
  const [filters, setFilters] = useState<AccountsPayableFilters>({});
  const [searchTerm, setSearchTerm] = useState("");

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: getExpenseCategories,
  });

  const { data: accounts = [], isLoading: accountsLoading, refetch } = useQuery({
    queryKey: ['accounts-payable', filters],
    queryFn: () => getAccountsPayable(filters),
  });

  const handleCreateAccount = async (accountData: Omit<AccountPayable, 'id' | 'created_at' | 'updated_at'>) => {
    const success = await createAccountPayable(accountData);
    if (success) {
      refetch();
    }
  };

  const handleUpdateAccount = async (accountData: Omit<AccountPayable, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingAccount) {
      const success = await updateAccountPayable(editingAccount.id, accountData);
      if (success) {
        setEditingAccount(null);
        refetch();
      }
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta conta?")) {
      const success = await deleteAccountPayable(id);
      if (success) {
        refetch();
      }
    }
  };

  const handleMarkAsPaid = async (id: string, paymentDate: string, paymentMethod: string) => {
    const success = await markAsPaid(id, paymentDate, paymentMethod);
    if (success) {
      refetch();
    }
  };

  const handleEdit = (account: AccountPayable) => {
    setEditingAccount(account);
    setFormOpen(true);
  };

  const filteredAccounts = accounts.filter(account => 
    !searchTerm || 
    account.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Estatísticas
  const totalPending = accounts
    .filter(a => a.status === 'pending')
    .reduce((sum, a) => sum + a.amount, 0);

  const totalOverdue = accounts
    .filter(a => a.status === 'overdue')
    .reduce((sum, a) => sum + a.amount, 0);

  const totalPaid = accounts
    .filter(a => a.status === 'paid')
    .reduce((sum, a) => sum + a.amount, 0);

  const overdueCount = accounts.filter(a => a.status === 'overdue').length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contas a Pagar</h1>
          <p className="text-muted-foreground">Gerencie as despesas e contas da sua confeitaria</p>
        </div>
        
        <Button onClick={() => {
          setEditingAccount(null);
          setFormOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totalPending)}
            </div>
            <p className="text-xs text-muted-foreground">
              Contas aguardando pagamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vencido</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalOverdue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {overdueCount} conta(s) em atraso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              Contas pagas este período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalPending + totalOverdue + totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              Soma de todas as contas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar por descrição ou fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={filters.status || ""}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  status: value || undefined 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <Select
                value={filters.category || ""}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  category: value || undefined 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">De</label>
                <Input
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    startDate: e.target.value || undefined 
                  }))}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Até</label>
                <Input
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    endDate: e.target.value || undefined 
                  }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contas */}
      <Card>
        <CardHeader>
          <CardTitle>Contas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {accountsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Carregando contas...</div>
            </div>
          ) : (
            <AccountPayablesList
              accounts={filteredAccounts}
              onEdit={handleEdit}
              onDelete={handleDeleteAccount}
              onMarkAsPaid={handleMarkAsPaid}
            />
          )}
        </CardContent>
      </Card>

      {/* Formulário */}
      <AccountPayableForm
        categories={categories}
        onSubmit={editingAccount ? handleUpdateAccount : handleCreateAccount}
        initialData={editingAccount || undefined}
        isOpen={formOpen}
        onOpenChange={setFormOpen}
      />
    </div>
  );
};

export default AccountsPayable;
