
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  PlusCircle, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings
} from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/calculations";
import { getAccountsPayable, deleteAccountPayable } from "@/services/accountsPayableService";
import AccountPayableForm from "@/components/accounts-payable/AccountPayableForm";
import ExpenseCategoryManager from "@/components/accounts-payable/ExpenseCategoryManager";
import { toast } from "@/hooks/use-toast";

const AccountsPayable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts-payable'],
    queryFn: getAccountsPayable
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccountPayable,
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Conta excluída com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir conta: ${error.message}`,
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

  // Filter accounts based on search term
  const filteredAccounts = Array.isArray(accounts) ? accounts.filter(account =>
    account.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

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

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Pago</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Vencido</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
    }
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

      {/* Accounts Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl">Lista de Contas</CardTitle>
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar contas..."
                className="pl-9 md:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando contas...</p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium">Nenhuma conta encontrada</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Tente alterar os termos de busca" : "Comece criando sua primeira conta a pagar"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.description}</TableCell>
                      <TableCell>{account.supplier || '-'}</TableCell>
                      <TableCell className="font-semibold text-red-600">
                        {formatCurrency(account.amount)}
                      </TableCell>
                      <TableCell>{formatDate(account.due_date)}</TableCell>
                      <TableCell>
                        {getStatusBadge(account.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditAccount(account)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteAccount(account.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Form Dialog */}
      <AccountPayableForm
        open={showForm}
        onOpenChange={handleFormClose}
        account={editingAccount}
      />

      {/* Category Manager Dialog */}
      <ExpenseCategoryManager
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
      />
    </div>
  );
};

export default AccountsPayable;
