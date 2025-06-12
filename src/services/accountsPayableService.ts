
import { supabase } from "@/integrations/supabase/client";
import type { CreateAccountPayable, ExpenseCategory } from "@/types/accountsPayable";

export const getAccountsPayable = async (filters: any = {}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  let query = supabase
    .from('accounts_payable')
    .select(`
      *,
      category:expense_categories(id, name, color)
    `)
    .eq('user_id', user.id);

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

  if (filters.category && filters.category !== 'all') {
    query = query.eq('category_id', filters.category);
  }

  if (filters.search) {
    query = query.or(`description.ilike.%${filters.search}%,supplier.ilike.%${filters.search}%`);
  }

  const { data, error } = await query.order('due_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const createAccountPayable = async (accountData: CreateAccountPayable) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('accounts_payable')
    .insert([{
      ...accountData,
      user_id: user.id,
      status: accountData.status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAccountPayable = async (id: string, updates: Partial<CreateAccountPayable>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('accounts_payable')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAccountPayable = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { error } = await supabase
    .from('accounts_payable')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  return true;
};

export const markAsPaid = async (id: string, paymentDate: string, paymentMethod: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { error } = await supabase
    .from('accounts_payable')
    .update({
      status: 'paid',
      payment_date: paymentDate,
      payment_method: paymentMethod,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  return true;
};

export const reversePayment = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { error } = await supabase
    .from('accounts_payable')
    .update({
      status: 'pending',
      payment_date: null,
      payment_method: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  return true;
};

export const createRecurringAccounts = async (account: CreateAccountPayable, installments: number, startDate: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const accounts = [];
  const baseDate = new Date(startDate);

  for (let i = 0; i < installments; i++) {
    const dueDate = new Date(baseDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    accounts.push({
      ...account,
      description: `${account.description} (${i + 1}/${installments})`,
      due_date: dueDate.toISOString().split('T')[0],
      user_id: user.id,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  const { data, error } = await supabase
    .from('accounts_payable')
    .insert(accounts)
    .select();

  if (error) throw error;
  return data;
};

export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name');

  if (error) throw error;
  return data || [];
};

export const createExpenseCategory = async (category: Omit<ExpenseCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('expense_categories')
    .insert([{
      ...category,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateExpenseCategory = async (id: string, updates: Partial<ExpenseCategory>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('expense_categories')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteExpenseCategory = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { error } = await supabase
    .from('expense_categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  return true;
};
