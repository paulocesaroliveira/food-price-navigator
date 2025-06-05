import { supabase } from "@/integrations/supabase/client";
import { Recipe, RecipeIngredient } from "@/types";

export const fetchRecipes = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_categories(name)
    `)
    .eq('user_id', user.id)
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('recipe_categories')
    .update({ name })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteRecipeCategory = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data: recipes, error: checkError } = await supabase
    .from('recipes')
    .select('id')
    .eq('category_id', id)
    .eq('user_id', user.id)
    .limit(1);
  
  if (checkError) throw checkError;
  
  if (recipes && recipes.length > 0) {
    throw new Error("Não é possível excluir esta categoria pois existem receitas vinculadas a ela");
  }
  
  const { error } = await supabase
    .from('recipe_categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  
  if (error) throw error;
};

export const fetchIngredients = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  console.log("Fetching ingredients for user:", user.id);

  const { data, error } = await supabase
    .from('ingredients')
    .select(`
      *,
      ingredient_categories(name)
    `)
    .eq('user_id', user.id)
    .order('name');
  
  if (error) {
    console.error("Error fetching ingredients:", error);
    throw error;
  }
  
  console.log("Fetched ingredients:", data);
  return data || [];
};

export const createRecipe = async (recipe: Omit<Recipe, "id">) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Inserir receita com custos iniciais zerados
  const { data: newRecipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      user_id: user.id,
      name: recipe.name,
      image_url: recipe.image,
      category_id: recipe.categoryId,
      portions: recipe.portions,
      total_cost: 0,
      unit_cost: 0,
      notes: recipe.notes
    })
    .select()
    .single();
  
  if (recipeError) throw recipeError;

  // Inserir ingredientes base
  if (recipe.baseIngredients && recipe.baseIngredients.length > 0) {
    const { error: baseError } = await supabase
      .from('recipe_base_ingredients')
      .insert(
        recipe.baseIngredients.map(ing => ({
          recipe_id: newRecipe.id,
          ingredient_id: ing.ingredient_id,
          quantity: ing.quantity,
          cost: ing.cost
        }))
      );
    
    if (baseError) throw baseError;
  }
  
  // Inserir ingredientes por porção
  if (recipe.portionIngredients && recipe.portionIngredients.length > 0) {
    const { error: portionError } = await supabase
      .from('recipe_portion_ingredients')
      .insert(
        recipe.portionIngredients.map(ing => ({
          recipe_id: newRecipe.id,
          ingredient_id: ing.ingredient_id,
          quantity: ing.quantity,
          cost: ing.cost
        }))
      );
    
    if (portionError) throw portionError;
  }
  
  // Aguardar um pouco para os triggers processarem
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Buscar a receita atualizada com os custos calculados pelos triggers
  const { data: updatedRecipe, error: fetchError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', newRecipe.id)
    .eq('user_id', user.id)
    .single();
  
  if (fetchError) throw fetchError;
  return updatedRecipe;
};

export const updateRecipe = async (id: string, recipe: Partial<Recipe>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Atualizar dados básicos da receita
  const { error: updateError } = await supabase
    .from('recipes')
    .update({
      name: recipe.name,
      image_url: recipe.image,
      category_id: recipe.categoryId,
      portions: recipe.portions,
      notes: recipe.notes
    })
    .eq('id', id)
    .eq('user_id', user.id);
  
  if (updateError) throw updateError;

  // Deletar ingredientes existentes
  await supabase.from('recipe_base_ingredients').delete().eq('recipe_id', id);
  await supabase.from('recipe_portion_ingredients').delete().eq('recipe_id', id);

  // Inserir novos ingredientes base
  if (recipe.baseIngredients && recipe.baseIngredients.length > 0) {
    const { error: baseError } = await supabase
      .from('recipe_base_ingredients')
      .insert(
        recipe.baseIngredients.map(ing => ({
          recipe_id: id,
          ingredient_id: ing.ingredient_id,
          quantity: ing.quantity,
          cost: ing.cost
        }))
      );
    
    if (baseError) throw baseError;
  }

  // Inserir novos ingredientes por porção
  if (recipe.portionIngredients && recipe.portionIngredients.length > 0) {
    const { error: portionError } = await supabase
      .from('recipe_portion_ingredients')
      .insert(
        recipe.portionIngredients.map(ing => ({
          recipe_id: id,
          ingredient_id: ing.ingredient_id,
          quantity: ing.quantity,
          cost: ing.cost
        }))
      );
    
    if (portionError) throw portionError;
  }
  
  // Aguardar um pouco para os triggers processarem
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Buscar a receita atualizada com os custos calculados pelos triggers
  const { data: updatedRecipe, error: fetchError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();
  
  if (fetchError) throw fetchError;
  return updatedRecipe;
};

export const deleteRecipe = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Deletar ingredientes primeiro
  await supabase.from('recipe_base_ingredients').delete().eq('recipe_id', id);
  await supabase.from('recipe_portion_ingredients').delete().eq('recipe_id', id);
  
  // Deletar receita
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  
  if (error) throw error;
};

export const fetchRecipeWithIngredients = async (recipeId: string) => {
  console.log("Fetching recipe with ID:", recipeId);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');
  
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select(`
      *,
      recipe_categories(name)
    `)
    .eq("id", recipeId)
    .eq('user_id', user.id)
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
