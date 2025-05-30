
import { supabase } from "@/integrations/supabase/client";

export const updateAllIngredientCosts = async () => {
  console.log('🔄 Atualizando TODOS os custos dos ingredientes...');
  
  await updateBaseIngredientsCosts();
  await updatePortionIngredientsCosts();
  
  console.log('✅ Todos os custos dos ingredientes atualizados');
};

export const updateSpecificIngredientCosts = async (ingredientIds: string[]) => {
  console.log('🔄 Atualizando custos de ingredientes específicos:', ingredientIds);
  
  await updateBaseIngredientsCosts(ingredientIds);
  await updatePortionIngredientsCosts(ingredientIds);
  
  console.log('✅ Custos dos ingredientes específicos atualizados');
};

const updateBaseIngredientsCosts = async (specificIngredientIds?: string[]) => {
  console.log('🔄 Atualizando ingredientes base...');
  
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

const updatePortionIngredientsCosts = async (specificIngredientIds?: string[]) => {
  console.log('🔄 Atualizando ingredientes por porção...');
  
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
