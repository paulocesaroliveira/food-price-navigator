
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  CreditCard, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingDown,
  Calendar,
  Settings,
  Star,
  Activity
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAccountsPayable } from "@/services/accountsPayableService";
import { AccountPayableForm } from "@/components/accounts-payable/AccountPayableForm";
import { AccountPayablesList } from "@/components/accounts-payable/AccountPayablesList";
import { ExpenseCategoryManager } from "@/components/accounts-payable/ExpenseCategoryManager";

const AccountsPayable = () => {
  const [activeTab, setActiveTab] = useState("accounts");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts-payable'],
    queryFn: getAccountsPayable
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid": return "Pago";
      case "pending": return "Pendente";
      case "overdue": return "Vencido";
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return CheckCircle;
      case "pending": return Clock;
      case "overdue": return AlertTriangle;
      default: return Clock;
    }
  };

  const handleEditAccount = (account: any) => {
    setEditingAccount(account);
    setShowAccountForm(true);
  };

  const handleCloseAccountForm = () => {
    setShowAccountForm(false);
    setEditingAccount(null);
  };

  // Calculate stats
  const totalPending = accounts.filter(acc => acc.status === 'pending').reduce((sum, acc) => sum + acc.amount, 0);
  const totalOverdue = accounts.filter(acc => acc.status === 'overdue').reduce((sum, acc) => sum + acc.amount, 0);
  const totalPaid = accounts.filter(acc => acc.status === 'paid').reduce((sum, acc) => sum + acc.amount, 0);
  const totalAccounts = accounts.length;

  const filteredAccounts = accounts.filter(account =>
    account.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-orange-600 to-red-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                    <CreditCard className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">Contas a Pagar</h1>
                    <p className="text-red-100 text-lg">Gestão financeira completa dos seus compromissos</p>
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                    <Activity className="h-4 w-4" />
                    <span>Controle Total</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                    <Star className="h-4 w-4" />
                    <span>Gestão Inteligente</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowCategoryManager(true)}
                  className="gap-2 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/30"
                >
                  <Settings className="h-4 w-4" />
                  Categorias
                </Button>
                <Button 
                  onClick={() => setShowAccountForm(true)}
                  className="gap-2 bg-white text-red-600 hover:bg-red-50"
                >
                  <Plus className="h-4 w-4" />
                  Nova Conta
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
              title: "Total Pendente",
              value: formatCurrency(totalPending),
              subtitle: `${accounts.filter(acc => acc.status === 'pending').length} contas`,
              icon: Clock,
              color: "from-yellow-500 to-yellow-600",
              bgColor: "bg-yellow-50"
            },
            {
              title: "Total Vencido",
              value: formatCurrency(totalOverdue),
              subtitle: `${accounts.filter(acc => acc.status === 'overdue').length} vencidas`,
              icon: AlertTriangle,
              color: "from-red-500 to-red-600",
              bgColor: "bg-red-50"
            },
            {
              title: "Total Pago",
              value: formatCurrency(totalPaid),
              subtitle: `${accounts.filter(acc => acc.status === 'paid').length} quitadas`,
              icon: CheckCircle,
              color: "from-green-500 to-green-600",
              bgColor: "bg-green-50"
            },
            {
              title: "Total de Contas",
              value: totalAccounts.toString(),
              subtitle: "Todas as categorias",
              icon: CreditCard,
              color: "from-blue-500 to-blue-600",
              bgColor: "bg-blue-50"
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
            placeholder="Buscar contas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-lg border-0 shadow-lg"
          />
        </div>

        {/* Accounts List */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
            <CardTitle className="flex items-center gap-3 text-xl">
              <CreditCard className="h-6 w-6 text-red-600" />
              Contas Cadastradas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="text-center p-12 text-gray-500">
                <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">Nenhuma conta encontrada</h3>
                <p>Cadastre uma nova conta para começar.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredAccounts.map((account) => {
                  const StatusIcon = getStatusIcon(account.status);
                  return (
                    <div key={account.id} className="border rounded-xl p-6 hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <StatusIcon className="h-5 w-5 text-gray-600" />
                            <span className="font-bold text-lg">{account.description}</span>
                            <Badge className={`${getStatusColor(account.status)} border`}>
                              {getStatusLabel(account.status)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Vencimento: {new Date(account.due_date).toLocaleDateString('pt-BR')}
                            {account.supplier && (
                              <>
                                <span className="mx-2">•</span>
                                {account.supplier}
                              </>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-red-600">{formatCurrency(account.amount)}</p>
                          {account.payment_date && (
                            <p className="text-sm text-green-600">
                              Pago em {new Date(account.payment_date).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {account.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                          <span className="font-medium text-gray-700">Observações: </span>
                          <span className="text-gray-600">{account.notes}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <AccountPayableForm
          open={showAccountForm}
          onOpenChange={handleCloseAccountForm}
          account={editingAccount}
          onSuccess={() => {
            handleCloseAccountForm();
          }}
        />

        <ExpenseCategoryManager
          open={showCategoryManager}
          onOpenChange={setShowCategoryManager}
        />
      </div>
    </div>
  );
};

export default AccountsPayable;
