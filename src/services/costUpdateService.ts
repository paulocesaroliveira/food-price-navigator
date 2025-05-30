
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
  console.log('Iniciando recálculo completo de custos...');
  
  // Primeiro, recalcular os custos dos ingredientes nas receitas
  await recalculateRecipeIngredientCosts();
  
  // Depois, executar a função principal
  const { data, error } = await supabase.rpc('recalculate_all_costs');
  
  if (error) {
    console.error('Erro ao recalcular todos os custos:', error);
    throw error;
  }
  
  console.log('Recálculo completo concluído:', data[0]);
  return data[0] as UpdateAllResult;
};

export const recalculateIngredientChain = async (ingredientIds: string[]): Promise<UpdateChainResult> => {
  console.log('Iniciando recálculo da cadeia de ingredientes:', ingredientIds);
  
  // Primeiro, recalcular os custos dos ingredientes específicos nas receitas
  await recalculateRecipeIngredientCosts(ingredientIds);
  
  // Depois, executar a função da cadeia
  const { data, error } = await supabase.rpc('recalculate_ingredient_chain', {
    ingredient_ids: ingredientIds
  });
  
  if (error) {
    console.error('Erro ao recalcular cadeia de ingredientes:', error);
    throw error;
  }
  
  console.log('Recálculo da cadeia concluído:', data[0]);
  return data[0] as UpdateChainResult;
};

// Função para recalcular os custos dos ingredientes nas receitas
const recalculateRecipeIngredientCosts = async (specificIngredientIds?: string[]) => {
  console.log('Recalculando custos dos ingredientes nas receitas...');
  
  try {
    // Buscar todos os ingredientes base que precisam ser atualizados
    let baseIngredientsQuery = supabase
      .from('recipe_base_ingredients')
      .select(`
        id,
        recipe_id,
        ingredient_id,
        quantity,
        ingredients!inner(unit_cost)
      `);
    
    if (specificIngredientIds && specificIngredientIds.length > 0) {
      baseIngredientsQuery = baseIngredientsQuery.in('ingredient_id', specificIngredientIds);
    }
    
    const { data: baseIngredients, error: baseError } = await baseIngredientsQuery;
    
    if (baseError) {
      console.error('Erro ao buscar ingredientes base:', baseError);
      throw baseError;
    }
    
    // Atualizar custos dos ingredientes base
    if (baseIngredients && baseIngredients.length > 0) {
      for (const ingredient of baseIngredients) {
        const newCost = ingredient.quantity * ingredient.ingredients.unit_cost;
        console.log(`Atualizando ingrediente base ${ingredient.id}: quantidade=${ingredient.quantity}, custo_unitário=${ingredient.ingredients.unit_cost}, novo_custo=${newCost}`);
        
        const { error: updateError } = await supabase
          .from('recipe_base_ingredients')
          .update({ cost: newCost })
          .eq('id', ingredient.id);
        
        if (updateError) {
          console.error('Erro ao atualizar ingrediente base:', updateError);
          throw updateError;
        }
      }
    }
    
    // Buscar todos os ingredientes por porção que precisam ser atualizados
    let portionIngredientsQuery = supabase
      .from('recipe_portion_ingredients')
      .select(`
        id,
        recipe_id,
        ingredient_id,
        quantity,
        ingredients!inner(unit_cost)
      `);
    
    if (specificIngredientIds && specificIngredientIds.length > 0) {
      portionIngredientsQuery = portionIngredientsQuery.in('ingredient_id', specificIngredientIds);
    }
    
    const { data: portionIngredients, error: portionError } = await portionIngredientsQuery;
    
    if (portionError) {
      console.error('Erro ao buscar ingredientes por porção:', portionError);
      throw portionError;
    }
    
    // Atualizar custos dos ingredientes por porção
    if (portionIngredients && portionIngredients.length > 0) {
      for (const ingredient of portionIngredients) {
        const newCost = ingredient.quantity * ingredient.ingredients.unit_cost;
        console.log(`Atualizando ingrediente por porção ${ingredient.id}: quantidade=${ingredient.quantity}, custo_unitário=${ingredient.ingredients.unit_cost}, novo_custo=${newCost}`);
        
        const { error: updateError } = await supabase
          .from('recipe_portion_ingredients')
          .update({ cost: newCost })
          .eq('id', ingredient.id);
        
        if (updateError) {
          console.error('Erro ao atualizar ingrediente por porção:', updateError);
          throw updateError;
        }
      }
    }
    
    console.log('Custos dos ingredientes nas receitas atualizados com sucesso');
  } catch (error) {
    console.error('Erro ao recalcular custos dos ingredientes:', error);
    throw error;
  }
};

export const fetchIngredients = async () => {
  const { data, error } = await supabase
    .from('ingredients')
    .select('id, name, unit_cost, brand')
    .order('name');
  
  if (error) {
    console.error('Erro ao buscar ingredientes:', error);
    throw error;
  }
  
  return data || [];
};

export const getRecipesAffectedByIngredients = async (ingredientIds: string[]) => {
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
    console.error('Erro ao buscar receitas afetadas:', error);
    throw error;
  }
  
  return data || [];
};
