
import { supabase } from "@/integrations/supabase/client";

export const getAccountsPayable = async (filters: any = {}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  let query = supabase
    .from('accounts_payable')
    .select('*')
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

  const { data, error } = await query.order('due_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
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
