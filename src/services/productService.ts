
import { supabase } from "@/integrations/supabase/client";

export const getProductList = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:product_categories(id, name)
    `)
    .eq('user_id', user.id)
    .order('name');
  
  if (error) throw error;
  return data?.map(product => ({
    ...product,
    calculatedPrice: product.selling_price || 0
  })) || [];
};
