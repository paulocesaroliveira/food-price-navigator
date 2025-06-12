
import { supabase } from "@/integrations/supabase/client";

export const getCustomerList = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .order('name');
  
  if (error) throw error;
  return data || [];
};
