
import { supabase } from "@/integrations/supabase/client";

export const getIngredientCategories = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('ingredient_categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const createIngredientCategory = async (name: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('ingredient_categories')
    .insert([{ name, user_id: user.id }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
