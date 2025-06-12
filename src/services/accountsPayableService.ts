
import { supabase } from '@/integrations/supabase/client';
import { AccountPayable, CreateAccountPayable, ExpenseCategory } from '@/types/accountsPayable';
import { toast } from '@/hooks/use-toast';

export const getAccountsPayable = async (filters: any = {}): Promise<AccountPayable[]> => {
  try {
    let query = supabase
      .from('accounts_payable')
      .select(`
        *,
        category:expense_categories(*)
      `)
      .order('due_date', { ascending: true });

    if (filters.startDate) {
      query = query.gte('due_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('due_date', filters.endDate);
    }
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'overdue') {
        query = query.eq('status', 'pending').lt('due_date', new Date().toISOString().split('T')[0]);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    // Type cast and ensure proper status typing
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'pending' | 'paid' | 'cancelled',
      payment_method: item.payment_method as 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'check' | undefined
    }));
  } catch (error: any) {
    console.error('Error fetching accounts payable:', error);
    toast({
      title: "Erro",
      description: "Não foi possível carregar as contas a pagar",
      variant: "destructive"
    });
    return [];
  }
};

export const createAccountPayable = async (data: CreateAccountPayable): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('accounts_payable')
      .insert([{ ...data, user_id: (await supabase.auth.getUser()).data.user?.id }]);

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Conta criada com sucesso!"
    });
    return true;
  } catch (error: any) {
    console.error('Error creating account payable:', error);
    toast({
      title: "Erro",
      description: "Não foi possível criar a conta",
      variant: "destructive"
    });
    return false;
  }
};

export const updateAccountPayable = async (id: string, data: Partial<CreateAccountPayable>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('accounts_payable')
      .update(data)
      .eq('id', id);

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Conta atualizada com sucesso!"
    });
    return true;
  } catch (error: any) {
    console.error('Error updating account payable:', error);
    toast({
      title: "Erro",
      description: "Não foi possível atualizar a conta",
      variant: "destructive"
    });
    return false;
  }
};

export const deleteAccountPayable = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('accounts_payable')
      .delete()
      .eq('id', id);

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Conta excluída com sucesso!"
    });
    return true;
  } catch (error: any) {
    console.error('Error deleting account payable:', error);
    toast({
      title: "Erro",
      description: "Não foi possível excluir a conta",
      variant: "destructive"
    });
    return false;
  }
};

export const markAsPaid = async (id: string, paymentDate: string, paymentMethod: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('accounts_payable')
      .update({
        status: 'paid',
        payment_date: paymentDate,
        payment_method: paymentMethod
      })
      .eq('id', id);

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Conta marcada como paga!"
    });
    return true;
  } catch (error: any) {
    console.error('Error marking as paid:', error);
    toast({
      title: "Erro",
      description: "Não foi possível marcar como paga",
      variant: "destructive"
    });
    return false;
  }
};

export const reversePayment = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('accounts_payable')
      .update({
        status: 'pending',
        payment_date: null,
        payment_method: null
      })
      .eq('id', id);

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Pagamento revertido com sucesso!"
    });
    return true;
  } catch (error: any) {
    console.error('Error reversing payment:', error);
    toast({
      title: "Erro",
      description: "Não foi possível reverter o pagamento",
      variant: "destructive"
    });
    return false;
  }
};

export const createRecurringAccounts = async (
  account: CreateAccountPayable,
  installments: number,
  startDate: string
): Promise<boolean> => {
  try {
    const accounts = [];
    const baseDate = new Date(startDate);
    
    for (let i = 0; i < installments; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      accounts.push({
        ...account,
        description: `${account.description} (${i + 1}/${installments})`,
        due_date: dueDate.toISOString().split('T')[0],
        amount: account.amount / installments,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });
    }

    const { error } = await supabase
      .from('accounts_payable')
      .insert(accounts);

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: `${installments} contas recorrentes criadas com sucesso!`
    });
    return true;
  } catch (error: any) {
    console.error('Error creating recurring accounts:', error);
    toast({
      title: "Erro",
      description: "Não foi possível criar as contas recorrentes",
      variant: "destructive"
    });
    return false;
  }
};

export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .order('name');

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    console.error('Error fetching expense categories:', error);
    return [];
  }
};

export const createExpenseCategory = async (category: Omit<ExpenseCategory, 'id' | 'created_at' | 'updated_at'>): Promise<ExpenseCategory | null> => {
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .insert([{ ...category, user_id: (await supabase.auth.getUser()).data.user?.id }])
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Categoria criada com sucesso!"
    });
    return data;
  } catch (error: any) {
    console.error('Error creating expense category:', error);
    toast({
      title: "Erro",
      description: "Não foi possível criar a categoria",
      variant: "destructive"
    });
    return null;
  }
};

export const updateExpenseCategory = async (id: string, category: Partial<ExpenseCategory>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('expense_categories')
      .update(category)
      .eq('id', id);

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Categoria atualizada com sucesso!"
    });
    return true;
  } catch (error: any) {
    console.error('Error updating expense category:', error);
    toast({
      title: "Erro",
      description: "Não foi possível atualizar a categoria",
      variant: "destructive"
    });
    return false;
  }
};

export const deleteExpenseCategory = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('expense_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Categoria excluída com sucesso!"
    });
    return true;
  } catch (error: any) {
    console.error('Error deleting expense category:', error);
    toast({
      title: "Erro",
      description: "Não foi possível excluir a categoria",
      variant: "destructive"
    });
    return false;
  }
};
