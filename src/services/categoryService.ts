
import { supabase } from "@/integrations/supabase/client";

export const getIngredientCategories = async () => {
  const { data, error } = await supabase
    .from('ingredient_categories')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
};
