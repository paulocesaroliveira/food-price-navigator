
import { supabase } from "@/integrations/supabase/client";

export const getSalePoints = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('sale_points')
    .select('*')
    .eq('user_id', user.id)
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const createSalePoint = async (salePointData: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('sale_points')
    .insert([{
      ...salePointData,
      user_id: user.id,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteSalePoint = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { error } = await supabase
    .from('sale_points')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  return true;
};
