
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Settings } from "lucide-react";
import { useAccountsPayable } from "@/hooks/useAccountsPayable";
import { AccountsPayableStats } from "@/components/accounts-payable/AccountsPayableStats";
import { AccountsPayableFilters } from "@/components/accounts-payable/AccountsPayableFilters";
import { AccountsPayableTable } from "@/components/accounts-payable/AccountsPayableTable";
import { AccountPayableFormModal } from "@/components/accounts-payable/AccountPayableFormModal";
import { PaymentConfirmationDialog } from "@/components/accounts-payable/PaymentConfirmationDialog";
import { ExpenseCategoryManager } from "@/components/accounts-payable/ExpenseCategoryManager";
import type { AccountPayable, AccountsPayableFilterData } from "@/types/accountsPayable";

const AccountsPayable = () => {
  const [showForm, setShowForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountPayable | null>(null);
  const [payingAccount, setPayingAccount] = useState<AccountPayable | null>(null);

  // Filtros padrão para o mês atual
  const currentDate = new Date();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const defaultFilters: AccountsPayableFilterData = {
    startDate: firstDay.toISOString().split('T')[0],
    endDate: lastDay.toISOString().split('T')[0]
  };

  const {
    accounts,
    categories,
    stats,
    filters,
    accountsLoading,
    categoriesLoading,
    setFilters,
    refetchCategories,
    createAccount,
    updateAccount,
    deleteAccount,
    markAccountAsPaid,
    createRecurringAccounts,
    isCreating,
    isUpdating,
    isMarkingAsPaid
  } = useAccountsPayable(defaultFilters);

  const handleNewAccount = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  const handleEditAccount = (account: AccountPayable) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta conta?")) {
      deleteAccount(id);
    }
  };

  const handleMarkAsPaid = (account: AccountPayable) => {
    setPayingAccount(account);
    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = (paymentDate: string, paymentMethod: string) => {
    if (payingAccount) {
      markAccountAsPaid(payingAccount.id, paymentDate, paymentMethod);
      setPayingAccount(null);
    }
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };

  const handleCategoriesChange = () => {
    refetchCategories();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contas a Pagar</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas despesas e compromissos financeiros
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => setShowCategoryManager(true)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Categorias
          </Button>
          <Button onClick={handleNewAccount} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <AccountsPayableStats
        totalPending={stats.totalPending}
        totalPaid={stats.totalPaid}
        overdueCount={stats.overdueCount}
        totalCount={stats.totalCount}
      />

      {/* Filtros */}
      <AccountsPayableFilters
        filters={filters}
        categories={categories}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Tabela de contas */}
      <AccountsPayableTable
        accounts={accounts}
        onEdit={handleEditAccount}
        onDelete={handleDeleteAccount}
        onMarkAsPaid={handleMarkAsPaid}
        isLoading={accountsLoading}
      />

      {/* Modal do formulário */}
      <AccountPayableFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={createAccount}
        onUpdate={updateAccount}
        onSubmitRecurring={createRecurringAccounts}
        categories={categories}
        editingAccount={editingAccount}
        isLoading={isCreating || isUpdating}
      />

      {/* Modal de confirmação de pagamento */}
      <PaymentConfirmationDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        onConfirm={handleConfirmPayment}
        accountDescription={payingAccount?.description || ""}
        accountAmount={payingAccount?.amount || 0}
        isLoading={isMarkingAsPaid}
      />

      {/* Modal de gerenciamento de categorias */}
      <ExpenseCategoryManager
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
        onCategoriesChange={handleCategoriesChange}
      />
    </div>
  );
};

export default AccountsPayable;
