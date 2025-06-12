
import { supabase } from "@/integrations/supabase/client";

export const getCustomerList = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      addresses:customer_addresses(*)
    `)
    .eq('user_id', user.id)
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const getCustomerById = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      addresses:customer_addresses(*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createCustomer = async (customerData: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('customers')
    .insert([{
      ...customerData,
      user_id: user.id,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCustomer = async (id: string, customerData: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('customers')
    .update(customerData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
