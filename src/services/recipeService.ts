
import { supabase } from "@/integrations/supabase/client";
import { Recipe, RecipeIngredient } from "@/types";

export const fetchRecipes = async () => {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_categories(name)
    `)
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const fetchRecipeCategories = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('recipe_categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const createRecipeCategory = async (name: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('recipe_categories')
    .insert({ 
      name,
      user_id: user.id
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateRecipeCategory = async (id: string, name: string) => {
  const { data, error } = await supabase
    .from('recipe_categories')
    .update({ name })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteRecipeCategory = async (id: string) => {
  const { data: recipes, error: checkError } = await supabase
    .from('recipes')
    .select('id')
    .eq('category_id', id)
    .limit(1);
  
  if (checkError) throw checkError;
  
  if (recipes && recipes.length > 0) {
    throw new Error("Não é possível excluir esta categoria pois existem receitas vinculadas a ela");
  }
  
  const { error } = await supabase
    .from('recipe_categories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const fetchIngredients = async () => {
  const { data, error } = await supabase
    .from('ingredients')
    .select(`
      *,
      ingredient_categories(name)
    `)
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const createRecipe = async (recipe: Omit<Recipe, "id">) => {
  const { data, error } = await supabase
    .from('recipes')
    .insert({
      name: recipe.name,
      image_url: recipe.image,
      category_id: recipe.categoryId,
      portions: recipe.portions,
      total_cost: 0, // Sempre iniciar com 0 - triggers irão calcular
      unit_cost: 0,  // Sempre iniciar com 0 - triggers irão calcular
      notes: recipe.notes
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateRecipe = async (id: string, recipe: Partial<Recipe>) => {
  const updateData: any = {
    name: recipe.name,
    image_url: recipe.image,
    category_id: recipe.categoryId,
    notes: recipe.notes
  };

  // Só incluir portions se foi alterado - triggers irão recalcular automaticamente
  if (recipe.portions !== undefined) {
    updateData.portions = recipe.portions;
  }

  const { data, error } = await supabase
    .from('recipes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteRecipe = async (id: string) => {
  // Deletar ingredientes primeiro
  await supabase.from('recipe_base_ingredients').delete().eq('recipe_id', id);
  await supabase.from('recipe_portion_ingredients').delete().eq('recipe_id', id);
  
  // Deletar receita
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const saveRecipeIngredients = async (
  recipeId: string, 
  baseIngredients: RecipeIngredient[], 
  portionIngredients: RecipeIngredient[]
) => {
  // Deletar ingredientes existentes
  await supabase.from('recipe_base_ingredients').delete().eq('recipe_id', recipeId);
  await supabase.from('recipe_portion_ingredients').delete().eq('recipe_id', recipeId);
  
  // Inserir ingredientes base
  if (baseIngredients.length > 0) {
    const { error: baseError } = await supabase
      .from('recipe_base_ingredients')
      .insert(
        baseIngredients.map(ing => ({
          recipe_id: recipeId,
          ingredient_id: ing.ingredient_id,
          quantity: ing.quantity,
          cost: ing.cost
        }))
      );
    
    if (baseError) throw baseError;
  }
  
  // Inserir ingredientes por porção
  if (portionIngredients.length > 0) {
    const { error: portionError } = await supabase
      .from('recipe_portion_ingredients')
      .insert(
        portionIngredients.map(ing => ({
          recipe_id: recipeId,
          ingredient_id: ing.ingredient_id,
          quantity: ing.quantity,
          cost: ing.cost
        }))
      );
    
    if (portionError) throw portionError;
  }
  
  // Os triggers calculam automaticamente - não fazemos nada mais
};

export const fetchRecipeWithIngredients = async (recipeId: string) => {
  console.log("Fetching recipe with ID:", recipeId);
  
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select(`
      *,
      recipe_categories(name)
    `)
    .eq("id", recipeId)
    .single();

  if (recipeError) {
    console.error("Erro ao buscar receita:", recipeError);
    throw recipeError;
  }

  const { data: baseIngredients, error: baseIngredientsError } = await supabase
    .from("recipe_base_ingredients")
    .select(`
      *,
      ingredients:ingredient_id(name, unit, unit_cost)
    `)
    .eq("recipe_id", recipeId);

  if (baseIngredientsError) {
    console.error("Erro ao buscar ingredientes base:", baseIngredientsError);
    throw baseIngredientsError;
  }

  const { data: portionIngredients, error: portionIngredientsError } = await supabase
    .from("recipe_portion_ingredients")
    .select(`
      *,
      ingredients:ingredient_id(name, unit, unit_cost)
    `)
    .eq("recipe_id", recipeId);

  if (portionIngredientsError) {
    console.error("Erro ao buscar ingredientes por porção:", portionIngredientsError);
    throw portionIngredientsError;
  }

  return {
    ...recipe,
    baseIngredients: baseIngredients || [],
    portionIngredients: portionIngredients || []
  };
};
