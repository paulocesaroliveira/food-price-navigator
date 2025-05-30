
import { supabase } from "@/integrations/supabase/client";

export const fetchIngredients = async () => {
  console.log('🔍 Buscando ingredientes...');
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
  console.log('🔍 Buscando embalagens...');
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
  
  return data || [];
};
