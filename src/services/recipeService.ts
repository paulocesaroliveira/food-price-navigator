
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types";

export const fetchRecipes = async () => {
  const { data, error } = await supabase
    .from("recipes")
    .select(`
      *,
      recipe_categories(name)
    `)
    .order("name");

  if (error) {
    console.error("Erro ao buscar receitas:", error);
    throw error;
  }

  return data || [];
};

export const fetchRecipeCategories = async () => {
  const { data, error } = await supabase
    .from("recipe_categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("Erro ao buscar categorias:", error);
    throw error;
  }

  return data || [];
};

export const createRecipe = async (recipe: Omit<Recipe, "id">) => {
  const { data, error } = await supabase
    .from("recipes")
    .insert([
      {
        name: recipe.name,
        image_url: recipe.image,
        category_id: recipe.categoryId,
        portions: recipe.portions,
        total_cost: recipe.totalCost,
        unit_cost: recipe.unitCost,
        notes: recipe.notes
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar receita:", error);
    throw error;
  }

  return data;
};

export const updateRecipe = async (id: string, recipe: Partial<Recipe>) => {
  const { data, error } = await supabase
    .from("recipes")
    .update({
      name: recipe.name,
      image_url: recipe.image,
      category_id: recipe.categoryId,
      portions: recipe.portions,
      total_cost: recipe.totalCost,
      unit_cost: recipe.unitCost,
      notes: recipe.notes
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar receita:", error);
    throw error;
  }

  return data;
};

export const deleteRecipe = async (id: string) => {
  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir receita:", error);
    throw error;
  }

  return true;
};

export const saveRecipeIngredients = async (
  recipeId: string, 
  baseIngredients: any[], 
  portionIngredients: any[]
) => {
  // Primeiro, excluímos os ingredientes existentes
  const { error: deleteBaseError } = await supabase
    .from("recipe_base_ingredients")
    .delete()
    .eq("recipe_id", recipeId);

  if (deleteBaseError) {
    console.error("Erro ao excluir ingredientes base:", deleteBaseError);
    throw deleteBaseError;
  }

  const { error: deletePortionError } = await supabase
    .from("recipe_portion_ingredients")
    .delete()
    .eq("recipe_id", recipeId);

  if (deletePortionError) {
    console.error("Erro ao excluir ingredientes de porção:", deletePortionError);
    throw deletePortionError;
  }

  // Inserimos os novos ingredientes base
  if (baseIngredients.length > 0) {
    const baseIngredientsData = baseIngredients.map(ing => ({
      recipe_id: recipeId,
      ingredient_id: ing.ingredientId,
      quantity: ing.quantity,
      cost: ing.cost
    }));

    const { error: insertBaseError } = await supabase
      .from("recipe_base_ingredients")
      .insert(baseIngredientsData);

    if (insertBaseError) {
      console.error("Erro ao inserir ingredientes base:", insertBaseError);
      throw insertBaseError;
    }
  }

  // Inserimos os novos ingredientes de porção
  if (portionIngredients.length > 0) {
    const portionIngredientsData = portionIngredients.map(ing => ({
      recipe_id: recipeId,
      ingredient_id: ing.ingredientId,
      quantity: ing.quantity,
      cost: ing.cost
    }));

    const { error: insertPortionError } = await supabase
      .from("recipe_portion_ingredients")
      .insert(portionIngredientsData);

    if (insertPortionError) {
      console.error("Erro ao inserir ingredientes de porção:", insertPortionError);
      throw insertPortionError;
    }
  }

  return true;
};
