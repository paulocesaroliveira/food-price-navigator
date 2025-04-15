import { supabase } from "@/integrations/supabase/client";
import { Recipe, RecipeIngredient } from "@/types";

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

export const fetchIngredients = async () => {
  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .order("name");

  if (error) {
    console.error("Erro ao buscar ingredientes:", error);
    throw error;
  }

  return data || [];
};

export const fetchRecipeWithIngredients = async (recipeId: string) => {
  console.log("Fetching recipe with ID:", recipeId);
  
  // Buscar a receita
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

  console.log("Recipe data:", recipe);

  // Buscar ingredientes base
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

  console.log("Base ingredients:", baseIngredients);

  // Buscar ingredientes por porção
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

  console.log("Portion ingredients:", portionIngredients);

  // Formatar dados para o frontend
  return {
    ...recipe,
    baseIngredients: baseIngredients || [],
    portionIngredients: portionIngredients || []
  };
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
  // Primeiro, excluímos os ingredientes associados
  const { error: baseIngError } = await supabase
    .from("recipe_base_ingredients")
    .delete()
    .eq("recipe_id", id);

  if (baseIngError) {
    console.error("Erro ao excluir ingredientes base:", baseIngError);
    throw baseIngError;
  }

  const { error: portionIngError } = await supabase
    .from("recipe_portion_ingredients")
    .delete()
    .eq("recipe_id", id);

  if (portionIngError) {
    console.error("Erro ao excluir ingredientes por porção:", portionIngError);
    throw portionIngError;
  }

  // Agora, excluímos a receita
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
      ingredient_id: ing.ingredient_id,
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
      ingredient_id: ing.ingredient_id,
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

export const createRecipeCategory = async (name: string) => {
  const { data, error } = await supabase
    .from("recipe_categories")
    .insert([{ name }])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar categoria:", error);
    throw error;
  }

  return data;
};

export const updateRecipeCategory = async (id: string, name: string) => {
  const { data, error } = await supabase
    .from("recipe_categories")
    .update({ name })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar categoria:", error);
    throw error;
  }

  return data;
};

export const deleteRecipeCategory = async (id: string) => {
  // Verificar se a categoria está sendo usada em alguma receita
  const { data: recipes, error: checkError } = await supabase
    .from("recipes")
    .select("id")
    .eq("category_id", id);

  if (checkError) {
    console.error("Erro ao verificar uso da categoria:", checkError);
    throw checkError;
  }

  if (recipes && recipes.length > 0) {
    throw new Error("Esta categoria está sendo usada em receitas e não pode ser excluída.");
  }

  // Excluir a categoria
  const { error } = await supabase
    .from("recipe_categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir categoria:", error);
    throw error;
  }

  return true;
};
