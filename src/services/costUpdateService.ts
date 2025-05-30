
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
    
    // 2. Depois, recalcular os custos totais das receitas usando a função do banco
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
    
    // 2. Executar a função da cadeia no banco
    const { data, error } = await supabase.rpc('recalculate_ingredient_chain', {
      ingredient_ids: ingredientIds
    });
    
    if (error) {
      console.error('❌ Erro ao recalcular cadeia:', error);
      throw error;
    }
    
    console.log('✅ Recálculo da cadeia concluído:', data[0]);
    return data[0] as UpdateChainResult;
  } catch (error) {
    console.error('❌ Erro geral na cadeia:', error);
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
