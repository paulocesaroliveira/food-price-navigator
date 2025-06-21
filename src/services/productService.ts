
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
    .order('name'); // Ordenação alfabética
  
  if (error) throw error;
  return data?.map(product => ({
    ...product,
    calculatedPrice: product.selling_price || 0
  })).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR')) || []; // Dupla ordenação para garantir
};
