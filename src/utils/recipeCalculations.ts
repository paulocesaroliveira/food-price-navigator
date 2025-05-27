
import { supabase } from "@/integrations/supabase/client";

/**
 * Calcula os custos de uma receita corretamente
 */
export async function calculateRecipeCosts(recipeId: string) {
  console.log("Calculating costs for recipe:", recipeId);
  
  // Buscar dados da receita
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('portions')
    .eq('id', recipeId)
    .single();
    
  if (recipeError) throw recipeError;
  
  // Buscar ingredientes base
  const { data: baseIngredients, error: baseError } = await supabase
    .from('recipe_base_ingredients')
    .select('quantity, cost')
    .eq('recipe_id', recipeId);
    
  if (baseError) throw baseError;
  
  // Buscar ingredientes por porção
  const { data: portionIngredients, error: portionError } = await supabase
    .from('recipe_portion_ingredients')
    .select('quantity, cost')
    .eq('recipe_id', recipeId);
    
  if (portionError) throw portionError;
  
  // Calcular custos
  const baseIngredientsCost = baseIngredients?.reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0;
  const portionIngredientsCost = portionIngredients?.reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0;
  
  // Custo total = ingredientes base + (ingredientes por porção * número de porções)
  const totalCost = baseIngredientsCost + (portionIngredientsCost * recipe.portions);
  
  // Custo por porção = custo total / número de porções
  const unitCost = totalCost / recipe.portions;
  
  console.log("Recipe calculations:", {
    baseIngredientsCost,
    portionIngredientsCost,
    portions: recipe.portions,
    totalCost,
    unitCost
  });
  
  // Atualizar a receita
  const { error: updateError } = await supabase
    .from('recipes')
    .update({
      total_cost: totalCost,
      unit_cost: unitCost
    })
    .eq('id', recipeId);
    
  if (updateError) throw updateError;
  
  return { totalCost, unitCost };
}
