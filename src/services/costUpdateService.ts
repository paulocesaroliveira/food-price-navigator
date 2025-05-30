import { supabase } from "@/integrations/supabase/client";

export interface UpdateAllResult {
  updated_recipes: number;
  updated_products: number;
  errors: string[];
}

export interface UpdateChainResult {
  affected_recipes: number;
  affected_products: number;
  recipe_ids: string[];
  product_ids: string[];
}

export const recalculateAllCosts = async (): Promise<UpdateAllResult> => {
  console.log('🔄 Iniciando recálculo completo de custos...');
  
  try {
    // 1. Primeiro, atualizar TODOS os custos dos ingredientes nas receitas
    await updateAllRecipeIngredientCosts();
    
    // 2. Atualizar TODOS os custos das embalagens nos produtos
    await updateAllProductPackagingCosts();
    
    // 3. Depois, recalcular os custos totais das receitas e produtos usando a função do banco
    const { data, error } = await supabase.rpc('recalculate_all_costs');
    
    if (error) {
      console.error('❌ Erro ao recalcular custos:', error);
      throw error;
    }
    
    console.log('✅ Recálculo completo concluído:', data[0]);
    return data[0] as UpdateAllResult;
  } catch (error) {
    console.error('❌ Erro geral no recálculo:', error);
    throw error;
  }
};

export const recalculateIngredientChain = async (ingredientIds: string[]): Promise<UpdateChainResult> => {
  console.log('🔄 Iniciando recálculo da cadeia de ingredientes:', ingredientIds);
  
  try {
    // 1. Atualizar custos dos ingredientes específicos nas receitas
    await updateSpecificRecipeIngredientCosts(ingredientIds);
    
    // 2. Buscar receitas afetadas pelos ingredientes
    const affectedRecipes = await getRecipesAffectedByIngredients(ingredientIds);
    const recipeIds = affectedRecipes.map(r => r.id);
    
    // 3. Recalcular custos das receitas afetadas
    for (const recipe of affectedRecipes) {
      await recalculateRecipeCost(recipe.id);
    }
    
    // 4. Buscar produtos afetados pelas receitas e recalcular seus custos
    const affectedProducts = await getProductsAffectedByRecipes(recipeIds);
    const productIds = affectedProducts.map(p => p.id);
    
    // 5. Recalcular custos dos produtos afetados
    for (const product of affectedProducts) {
      await recalculateProductCost(product.id);
    }
    
    console.log('✅ Recálculo da cadeia de ingredientes concluído');
    return {
      affected_recipes: affectedRecipes.length,
      affected_products: affectedProducts.length,
      recipe_ids: recipeIds,
      product_ids: productIds
    } as UpdateChainResult;
  } catch (error) {
    console.error('❌ Erro geral na cadeia de ingredientes:', error);
    throw error;
  }
};

export const recalculatePackagingChain = async (packagingIds: string[]): Promise<UpdateChainResult> => {
  console.log('🔄 Iniciando recálculo da cadeia de embalagens:', packagingIds);
  
  try {
    // 1. Atualizar custos das embalagens específicas nos produtos
    await updateSpecificProductPackagingCosts(packagingIds);
    
    // 2. Buscar produtos afetados pelas embalagens
    const affectedProducts = await getProductsAffectedByPackaging(packagingIds);
    
    // 3. Recalcular custos dos produtos afetados
    for (const product of affectedProducts) {
      await recalculateProductCost(product.id);
    }
    
    console.log('✅ Recálculo da cadeia de embalagens concluído');
    return {
      affected_recipes: 0,
      affected_products: affectedProducts.length,
      recipe_ids: [],
      product_ids: affectedProducts.map(p => p.id)
    } as UpdateChainResult;
  } catch (error) {
    console.error('❌ Erro geral na cadeia de embalagens:', error);
    throw error;
  }
};

// Função para atualizar TODOS os custos dos ingredientes nas receitas
const updateAllRecipeIngredientCosts = async () => {
  console.log('🔄 Atualizando TODOS os custos dos ingredientes nas receitas...');
  
  try {
    // Atualizar ingredientes base
    await updateBaseIngredientsCosts();
    
    // Atualizar ingredientes por porção
    await updatePortionIngredientsCosts();
    
    console.log('✅ Todos os custos dos ingredientes atualizados');
  } catch (error) {
    console.error('❌ Erro ao atualizar custos dos ingredientes:', error);
    throw error;
  }
};

// Função para atualizar TODOS os custos das embalagens nos produtos
const updateAllProductPackagingCosts = async () => {
  console.log('🔄 Atualizando TODOS os custos das embalagens nos produtos...');
  
  try {
    await updateProductPackagingCosts();
    console.log('✅ Todos os custos das embalagens atualizados');
  } catch (error) {
    console.error('❌ Erro ao atualizar custos das embalagens:', error);
    throw error;
  }
};

// Função para atualizar custos de ingredientes específicos nas receitas
const updateSpecificRecipeIngredientCosts = async (ingredientIds: string[]) => {
  console.log('🔄 Atualizando custos de ingredientes específicos nas receitas:', ingredientIds);
  
  try {
    // Atualizar ingredientes base específicos
    await updateBaseIngredientsCosts(ingredientIds);
    
    // Atualizar ingredientes por porção específicos
    await updatePortionIngredientsCosts(ingredientIds);
    
    console.log('✅ Custos dos ingredientes específicos atualizados');
  } catch (error) {
    console.error('❌ Erro ao atualizar custos específicos:', error);
    throw error;
  }
};

// Função para atualizar custos de embalagens específicas nos produtos
const updateSpecificProductPackagingCosts = async (packagingIds: string[]) => {
  console.log('🔄 Atualizando custos de embalagens específicas nos produtos:', packagingIds);
  
  try {
    await updateProductPackagingCosts(packagingIds);
    console.log('✅ Custos das embalagens específicas atualizados');
  } catch (error) {
    console.error('❌ Erro ao atualizar custos específicos de embalagens:', error);
    throw error;
  }
};

// Atualizar custos dos ingredientes base
const updateBaseIngredientsCosts = async (specificIngredientIds?: string[]) => {
  console.log('🔄 Atualizando ingredientes base...');
  
  // Buscar ingredientes base
  let query = supabase
    .from('recipe_base_ingredients')
    .select(`
      id,
      recipe_id,
      ingredient_id,
      quantity,
      ingredients!inner(id, name, unit_cost)
    `);
  
  if (specificIngredientIds && specificIngredientIds.length > 0) {
    query = query.in('ingredient_id', specificIngredientIds);
  }
  
  const { data: baseIngredients, error } = await query;
  
  if (error) {
    console.error('❌ Erro ao buscar ingredientes base:', error);
    throw error;
  }
  
  if (!baseIngredients || baseIngredients.length === 0) {
    console.log('ℹ️ Nenhum ingrediente base encontrado');
    return;
  }
  
  // Atualizar cada ingrediente
  for (const ingredient of baseIngredients) {
    const newCost = Number(ingredient.quantity) * Number(ingredient.ingredients.unit_cost);
    
    console.log(`📝 Base - ${ingredient.ingredients.name}: ${ingredient.quantity} × ${ingredient.ingredients.unit_cost} = ${newCost}`);
    
    const { error: updateError } = await supabase
      .from('recipe_base_ingredients')
      .update({ cost: newCost })
      .eq('id', ingredient.id);
    
    if (updateError) {
      console.error('❌ Erro ao atualizar ingrediente base:', updateError);
      throw updateError;
    }
  }
  
  console.log(`✅ ${baseIngredients.length} ingredientes base atualizados`);
};

// Atualizar custos dos ingredientes por porção
const updatePortionIngredientsCosts = async (specificIngredientIds?: string[]) => {
  console.log('🔄 Atualizando ingredientes por porção...');
  
  // Buscar ingredientes por porção
  let query = supabase
    .from('recipe_portion_ingredients')
    .select(`
      id,
      recipe_id,
      ingredient_id,
      quantity,
      ingredients!inner(id, name, unit_cost)
    `);
  
  if (specificIngredientIds && specificIngredientIds.length > 0) {
    query = query.in('ingredient_id', specificIngredientIds);
  }
  
  const { data: portionIngredients, error } = await query;
  
  if (error) {
    console.error('❌ Erro ao buscar ingredientes por porção:', error);
    throw error;
  }
  
  if (!portionIngredients || portionIngredients.length === 0) {
    console.log('ℹ️ Nenhum ingrediente por porção encontrado');
    return;
  }
  
  // Atualizar cada ingrediente
  for (const ingredient of portionIngredients) {
    const newCost = Number(ingredient.quantity) * Number(ingredient.ingredients.unit_cost);
    
    console.log(`📝 Porção - ${ingredient.ingredients.name}: ${ingredient.quantity} × ${ingredient.ingredients.unit_cost} = ${newCost}`);
    
    const { error: updateError } = await supabase
      .from('recipe_portion_ingredients')
      .update({ cost: newCost })
      .eq('id', ingredient.id);
    
    if (updateError) {
      console.error('❌ Erro ao atualizar ingrediente por porção:', updateError);
      throw updateError;
    }
  }
  
  console.log(`✅ ${portionIngredients.length} ingredientes por porção atualizados`);
};

// Atualizar custos das embalagens nos produtos
const updateProductPackagingCosts = async (specificPackagingIds?: string[]) => {
  console.log('🔄 Atualizando embalagens nos produtos...');
  
  // Buscar embalagens dos produtos
  let query = supabase
    .from('product_packaging')
    .select(`
      id,
      product_id,
      packaging_id,
      quantity,
      packaging!inner(id, name, unit_cost)
    `);
  
  if (specificPackagingIds && specificPackagingIds.length > 0) {
    query = query.in('packaging_id', specificPackagingIds);
  }
  
  const { data: productPackaging, error } = await query;
  
  if (error) {
    console.error('❌ Erro ao buscar embalagens dos produtos:', error);
    throw error;
  }
  
  if (!productPackaging || productPackaging.length === 0) {
    console.log('ℹ️ Nenhuma embalagem de produto encontrada');
    return;
  }
  
  // Atualizar cada embalagem
  for (const packaging of productPackaging) {
    const newCost = Number(packaging.quantity) * Number(packaging.packaging.unit_cost);
    
    console.log(`📦 Embalagem - ${packaging.packaging.name}: ${packaging.quantity} × ${packaging.packaging.unit_cost} = ${newCost}`);
    
    const { error: updateError } = await supabase
      .from('product_packaging')
      .update({ cost: newCost })
      .eq('id', packaging.id);
    
    if (updateError) {
      console.error('❌ Erro ao atualizar embalagem do produto:', updateError);
      throw updateError;
    }
  }
  
  console.log(`✅ ${productPackaging.length} embalagens de produtos atualizadas`);
};

// Recalcular custo total de uma receita específica
const recalculateRecipeCost = async (recipeId: string) => {
  console.log('🔄 Recalculando custo da receita:', recipeId);
  
  try {
    // Buscar receita para obter número de porções
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('portions')
      .eq('id', recipeId)
      .single();
    
    if (recipeError) {
      console.error('❌ Erro ao buscar receita:', recipeError);
      throw recipeError;
    }
    
    // Buscar soma dos custos dos ingredientes base
    const { data: baseCosts, error: baseError } = await supabase
      .from('recipe_base_ingredients')
      .select('cost')
      .eq('recipe_id', recipeId);
    
    if (baseError) {
      console.error('❌ Erro ao buscar custos base:', baseError);
      throw baseError;
    }
    
    // Buscar soma dos custos dos ingredientes por porção
    const { data: portionCosts, error: portionError } = await supabase
      .from('recipe_portion_ingredients')
      .select('cost')
      .eq('recipe_id', recipeId);
    
    if (portionError) {
      console.error('❌ Erro ao buscar custos por porção:', portionError);
      throw portionError;
    }
    
    // Calcular custos
    const totalBaseCost = baseCosts?.reduce((sum, item) => sum + Number(item.cost), 0) || 0;
    const totalPortionCost = portionCosts?.reduce((sum, item) => sum + Number(item.cost), 0) || 0;
    const portions = recipe.portions || 1;
    
    const totalCost = totalBaseCost + (totalPortionCost * portions);
    const unitCost = totalCost / portions;
    
    // Atualizar receita
    const { error: updateError } = await supabase
      .from('recipes')
      .update({
        total_cost: totalCost,
        unit_cost: unitCost,
        updated_at: new Date().toISOString()
      })
      .eq('id', recipeId);
    
    if (updateError) {
      console.error('❌ Erro ao recalcular custo da receita:', updateError);
      throw updateError;
    }
    
    // CRÍTICO: Atualizar custos dos itens dos produtos que usam esta receita
    await updateProductItemsCosts(recipeId, unitCost);
    
    console.log(`✅ Custo da receita recalculado: Total R$ ${totalCost}, Unitário R$ ${unitCost}`);
  } catch (error) {
    console.error('❌ Erro ao recalcular custo da receita:', error);
    throw error;
  }
};

// FUNÇÃO CRÍTICA: Atualizar custos dos itens dos produtos que usam uma receita específica
const updateProductItemsCosts = async (recipeId: string, newUnitCost: number) => {
  console.log('🔄 Atualizando custos dos itens dos produtos para receita:', recipeId);
  
  try {
    // Buscar todos os itens de produtos que usam esta receita
    const { data: productItems, error } = await supabase
      .from('product_items')
      .select('id, quantity, product_id')
      .eq('recipe_id', recipeId);
    
    if (error) {
      console.error('❌ Erro ao buscar itens dos produtos:', error);
      throw error;
    }
    
    if (!productItems || productItems.length === 0) {
      console.log('ℹ️ Nenhum item de produto encontrado para esta receita');
      return;
    }
    
    // Atualizar cada item
    for (const item of productItems) {
      const newCost = Number(item.quantity) * newUnitCost;
      
      console.log(`📝 Atualizando item ${item.id}: ${item.quantity} × ${newUnitCost} = ${newCost}`);
      
      const { error: updateError } = await supabase
        .from('product_items')
        .update({ cost: newCost })
        .eq('id', item.id);
      
      if (updateError) {
        console.error('❌ Erro ao atualizar item do produto:', updateError);
        throw updateError;
      }
    }
    
    console.log(`✅ ${productItems.length} itens de produtos atualizados`);
    
    // Recalcular o custo total dos produtos afetados
    const uniqueProductIds = [...new Set(productItems.map(item => item.product_id))];
    for (const productId of uniqueProductIds) {
      await recalculateProductCost(productId);
    }
    
  } catch (error) {
    console.error('❌ Erro ao atualizar custos dos itens dos produtos:', error);
    throw error;
  }
};

// Recalcular custo total de um produto específico
const recalculateProductCost = async (productId: string) => {
  console.log('🔄 Recalculando custo do produto:', productId);
  
  try {
    // Buscar soma dos custos dos itens (receitas) do produto
    const { data: itemsCost, error: itemsError } = await supabase
      .from('product_items')
      .select('cost')
      .eq('product_id', productId);
    
    if (itemsError) {
      console.error('❌ Erro ao buscar custos dos itens:', itemsError);
      throw itemsError;
    }
    
    // Buscar soma dos custos das embalagens do produto
    const { data: packagingCost, error: packagingError } = await supabase
      .from('product_packaging')
      .select('cost')
      .eq('product_id', productId);
    
    if (packagingError) {
      console.error('❌ Erro ao buscar custos das embalagens:', packagingError);
      throw packagingError;
    }
    
    // Calcular custo total
    const totalItemsCost = itemsCost?.reduce((sum, item) => sum + Number(item.cost), 0) || 0;
    const totalPackagingCost = packagingCost?.reduce((sum, pkg) => sum + Number(pkg.cost), 0) || 0;
    const totalCost = totalItemsCost + totalPackagingCost;
    
    // Atualizar produto
    const { error: updateError } = await supabase
      .from('products')
      .update({
        total_cost: totalCost,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);
    
    if (updateError) {
      console.error('❌ Erro ao recalcular custo do produto:', updateError);
      throw updateError;
    }
    
    console.log(`✅ Custo do produto recalculado: R$ ${totalCost}`);
  } catch (error) {
    console.error('❌ Erro ao recalcular custo do produto:', error);
    throw error;
  }
};

export const fetchIngredients = async () => {
  const { data, error } = await supabase
    .from('ingredients')
    .select('id, name, unit_cost, brand, unit')
    .order('name');
  
  if (error) {
    console.error('❌ Erro ao buscar ingredientes:', error);
    throw error;
  }
  
  return data || [];
};

export const fetchPackaging = async () => {
  const { data, error } = await supabase
    .from('packaging')
    .select('id, name, unit_cost, type')
    .order('name');
  
  if (error) {
    console.error('❌ Erro ao buscar embalagens:', error);
    throw error;
  }
  
  return data || [];
};

export const getRecipesAffectedByIngredients = async (ingredientIds: string[]) => {
  console.log('🔍 Buscando receitas afetadas pelos ingredientes:', ingredientIds);
  
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      id, 
      name,
      recipe_base_ingredients!inner(ingredient_id),
      recipe_portion_ingredients!inner(ingredient_id)
    `)
    .or(`recipe_base_ingredients.ingredient_id.in.(${ingredientIds.join(',')}),recipe_portion_ingredients.ingredient_id.in.(${ingredientIds.join(',')})`);
  
  if (error) {
    console.error('❌ Erro ao buscar receitas afetadas:', error);
    throw error;
  }
  
  console.log(`📋 ${data?.length || 0} receitas encontradas`);
  return data || [];
};

export const getProductsAffectedByRecipes = async (recipeIds: string[]) => {
  console.log('🔍 Buscando produtos afetados pelas receitas:', recipeIds);
  
  if (!recipeIds || recipeIds.length === 0) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, 
      name,
      product_items!inner(recipe_id)
    `)
    .in('product_items.recipe_id', recipeIds);
  
  if (error) {
    console.error('❌ Erro ao buscar produtos afetados pelas receitas:', error);
    throw error;
  }
  
  console.log(`📦 ${data?.length || 0} produtos encontrados`);
  return data || [];
};

export const getProductsAffectedByPackaging = async (packagingIds: string[]) => {
  console.log('🔍 Buscando produtos afetados pelas embalagens:', packagingIds);
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, 
      name,
      product_packaging!inner(packaging_id)
    `)
    .in('product_packaging.packaging_id', packagingIds);
  
  if (error) {
    console.error('❌ Erro ao buscar produtos afetados:', error);
    throw error;
  }
  
  console.log(`📦 ${data?.length || 0} produtos encontrados`);
  return data || [];
};
