
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAccountsPayable,
  getExpenseCategories,
  createAccountPayable,
  updateAccountPayable,
  deleteAccountPayable,
  markAsPaid,
  createRecurringAccounts
} from "@/services/accountsPayableService";
import type { AccountsPayableFilterData, CreateAccountPayable } from "@/types/accountsPayable";

export const useAccountsPayable = (initialFilters: AccountsPayableFilterData = {}) => {
  const [filters, setFilters] = useState<AccountsPayableFilterData>(initialFilters);
  const queryClient = useQueryClient();

  const {
    data: accounts = [],
    isLoading: accountsLoading,
    error: accountsError,
    refetch: refetchAccounts
  } = useQuery({
    queryKey: ['accounts-payable', filters],
    queryFn: () => getAccountsPayable(filters),
    refetchOnWindowFocus: false
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: getExpenseCategories,
    refetchOnWindowFocus: false
  });

  const createMutation = useMutation({
    mutationFn: createAccountPayable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAccountPayable> }) =>
      updateAccountPayable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccountPayable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
    }
  });

  const markAsPaidMutation = useMutation({
    mutationFn: ({ id, paymentDate, paymentMethod }: {
      id: string;
      paymentDate: string;
      paymentMethod: string;
    }) => markAsPaid(id, paymentDate, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
    }
  });

  const createRecurringMutation = useMutation({
    mutationFn: ({ account, installments, startDate }: {
      account: CreateAccountPayable;
      installments: number;
      startDate: string;
    }) => createRecurringAccounts(account, installments, startDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
    }
  });

  // Calcular estatísticas
  const stats = {
    totalPending: accounts
      .filter(acc => acc.status === 'pending')
      .reduce((sum, acc) => sum + acc.amount, 0),
    totalPaid: accounts
      .filter(acc => acc.status === 'paid')
      .reduce((sum, acc) => sum + acc.amount, 0),
    overdueCount: accounts
      .filter(acc => acc.status === 'pending' && new Date(acc.due_date) < new Date())
      .length,
    totalCount: accounts.length
  };

  return {
    // Data
    accounts,
    categories,
    stats,
    filters,
    
    // Loading states
    accountsLoading,
    categoriesLoading,
    
    // Errors
    accountsError,
    
    // Actions
    setFilters,
    refetchAccounts,
    refetchCategories,
    
    // Mutations
    createAccount: createMutation.mutate,
    updateAccount: updateMutation.mutate,
    deleteAccount: deleteMutation.mutate,
    markAccountAsPaid: markAsPaidMutation.mutate,
    createRecurringAccounts: createRecurringMutation.mutate,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isMarkingAsPaid: markAsPaidMutation.isPending,
    isCreatingRecurring: createRecurringMutation.isPending
  };
};
