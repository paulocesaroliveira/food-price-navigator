
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

  console.log('ProductService - Loading product with ID:', productId);

  // Buscar o produto com detalhes completos
  const { data: product, error: productError } = await supabase
    .from('products')
    .select(`
      *,
      category:product_categories(id, name)
    `)
    .eq('id', productId)
    .eq('user_id', user.id)
    .single();

  if (productError) {
    console.error('ProductService - Error loading product:', productError);
    throw productError;
  }

  console.log('ProductService - Product loaded:', product);

  // Buscar itens do produto (receitas) com informações completas das receitas
  const { data: items, error: itemsError } = await supabase
    .from('product_items')
    .select(`
      *,
      recipe:recipes(id, name, unit_cost)
    `)
    .eq('product_id', productId);

  if (itemsError) {
    console.error('ProductService - Error loading product items:', itemsError);
    throw itemsError;
  }

  console.log('ProductService - Product items loaded:', items);

  // Buscar embalagens do produto com informações completas das embalagens
  const { data: packaging, error: packagingError } = await supabase
    .from('product_packaging')
    .select(`
      *,
      packaging:packaging(id, name, unit_cost, type)
    `)
    .eq('product_id', productId);

  if (packagingError) {
    console.error('ProductService - Error loading product packaging:', packagingError);
    throw packagingError;
  }

  console.log('ProductService - Product packaging loaded:', packaging);

  // Mapear os dados para corresponder aos tipos esperados
  const mappedItems = (items || []).map(item => ({
    id: item.id,
    recipeId: item.recipe_id,
    quantity: item.quantity,
    cost: item.cost,
    recipe: item.recipe
  }));

  const mappedPackaging = (packaging || []).map(pack => ({
    id: pack.id,
    packagingId: pack.packaging_id,
    quantity: pack.quantity,
    cost: pack.cost,
    isPrimary: pack.is_primary,
    packaging: pack.packaging
  }));

  const result = {
    ...product,
    items: mappedItems,
    packagingItems: mappedPackaging,
    totalCost: product.total_cost || 0
  };

  console.log('ProductService - Final product data:', result);
  return result;
};
