
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
    .order('name', { ascending: true });
  
  if (error) throw error;
  
  // Garantir ordenação alfabética no frontend também
  const sortedData = (data || []).sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    return nameA.localeCompare(nameB, 'pt-BR');
  });

  return sortedData.map(product => ({
    ...product,
    calculatedPrice: product.selling_price || 0,
    totalCost: product.total_cost || 0
  }));
};

export const getProductById = async (productId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Buscar o produto
  const { data: product, error: productError } = await supabase
    .from('products')
    .select(`
      *,
      category:product_categories(id, name)
    `)
    .eq('id', productId)
    .eq('user_id', user.id)
    .single();

  if (productError) throw productError;

  // Buscar itens do produto (receitas)
  const { data: items, error: itemsError } = await supabase
    .from('product_items')
    .select('*')
    .eq('product_id', productId);

  if (itemsError) throw itemsError;

  // Buscar embalagens do produto
  const { data: packaging, error: packagingError } = await supabase
    .from('product_packaging')
    .select('*')
    .eq('product_id', productId);

  if (packagingError) throw packagingError;

  return {
    ...product,
    items: items || [],
    packagingItems: packaging || [],
    totalCost: product.total_cost || 0
  };
};
