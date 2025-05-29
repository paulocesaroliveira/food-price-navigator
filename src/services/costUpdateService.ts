
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
  const { data, error } = await supabase.rpc('recalculate_all_costs');
  
  if (error) {
    console.error('Erro ao recalcular todos os custos:', error);
    throw error;
  }
  
  return data[0] as UpdateAllResult;
};

export const recalculateIngredientChain = async (ingredientIds: string[]): Promise<UpdateChainResult> => {
  const { data, error } = await supabase.rpc('recalculate_ingredient_chain', {
    ingredient_ids: ingredientIds
  });
  
  if (error) {
    console.error('Erro ao recalcular cadeia de ingredientes:', error);
    throw error;
  }
  
  return data[0] as UpdateChainResult;
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
