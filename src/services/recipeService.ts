
import { supabase } from "@/integrations/supabase/client";
import { Recipe, RecipeIngredient } from "@/types";
import { toast } from "@/hooks/use-toast";

export const getRecipes = async (): Promise<Recipe[]> => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        category:recipe_categories(*),
        recipe_base_ingredients(*),
        recipe_portion_ingredients(*)
      `)
      .order('name');

    if (error) throw error;

    return (data || []).map(recipe => ({
      ...recipe,
      category: recipe.category?.[0] || null,
      baseIngredients: recipe.recipe_base_ingredients || [],
      portionIngredients: recipe.recipe_portion_ingredients || []
    }));
  } catch (error) {
    console.error('Error fetching recipes:', error);
    toast({
      title: "Erro",
      description: "Não foi possível carregar as receitas",
      variant: "destructive",
    });
    return [];
  }
};

export const getRecipeById = async (id: string): Promise<Recipe | null> => {
  try {
    console.log('Loading recipe with ID:', id);
    
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        category:recipe_categories(*),
        recipe_base_ingredients(*),
        recipe_portion_ingredients(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching recipe:', error);
      throw error;
    }

    console.log('Recipe data loaded:', data);

    const recipe = {
      ...data,
      category: data.category?.[0] || null,
      baseIngredients: data.recipe_base_ingredients || [],
      portionIngredients: data.recipe_portion_ingredients || []
    };

    console.log('Processed recipe:', recipe);
    return recipe;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }
};

export const createRecipe = async (recipe: Omit<Recipe, 'id'>): Promise<Recipe | null> => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    const recipeData = {
      name: recipe.name,
      unit_cost: recipe.unit_cost,
      total_cost: recipe.total_cost,
      portions: recipe.portions,
      category_id: recipe.category?.id,
      image_url: recipe.image,
      user_id: user.data.user.id,
      notes: recipe.notes
    };

    const { data, error } = await supabase
      .from('recipes')
      .insert(recipeData)
      .select()
      .single();

    if (error) throw error;

    // Handle base ingredients
    if (recipe.baseIngredients && recipe.baseIngredients.length > 0) {
      const ingredientsToInsert = recipe.baseIngredients.map(ingredient => ({
        recipe_id: data.id,
        ingredient_id: ingredient.ingredient_id,
        quantity: ingredient.quantity,
        cost: ingredient.cost
      }));

      await supabase
        .from('recipe_base_ingredients')
        .insert(ingredientsToInsert);
    }

    // Handle portion ingredients
    if (recipe.portionIngredients && recipe.portionIngredients.length > 0) {
      const ingredientsToInsert = recipe.portionIngredients.map(ingredient => ({
        recipe_id: data.id,
        ingredient_id: ingredient.ingredient_id,
        quantity: ingredient.quantity,
        cost: ingredient.cost
      }));

      await supabase
        .from('recipe_portion_ingredients')
        .insert(ingredientsToInsert);
    }

    toast({
      title: "Sucesso",
      description: "Receita criada com sucesso!",
    });

    return data;
  } catch (error) {
    console.error('Error creating recipe:', error);
    toast({
      title: "Erro",
      description: "Não foi possível criar a receita",
      variant: "destructive",
    });
    return null;
  }
};

export const updateRecipe = async (id: string, recipe: Partial<Recipe>): Promise<Recipe | null> => {
  try {
    const recipeData = {
      name: recipe.name,
      unit_cost: recipe.unit_cost,
      total_cost: recipe.total_cost,
      portions: recipe.portions,
      category_id: recipe.category?.id,
      image_url: recipe.image,
      notes: recipe.notes
    };

    const { data, error } = await supabase
      .from('recipes')
      .update(recipeData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update ingredients
    await supabase
      .from('recipe_base_ingredients')
      .delete()
      .eq('recipe_id', id);

    await supabase
      .from('recipe_portion_ingredients')
      .delete()
      .eq('recipe_id', id);

    // Handle base ingredients
    if (recipe.baseIngredients && recipe.baseIngredients.length > 0) {
      const ingredientsToInsert = recipe.baseIngredients.map(ingredient => ({
        recipe_id: id,
        ingredient_id: ingredient.ingredient_id,
        quantity: ingredient.quantity,
        cost: ingredient.cost
      }));

      await supabase
        .from('recipe_base_ingredients')
        .insert(ingredientsToInsert);
    }

    // Handle portion ingredients
    if (recipe.portionIngredients && recipe.portionIngredients.length > 0) {
      const ingredientsToInsert = recipe.portionIngredients.map(ingredient => ({
        recipe_id: id,
        ingredient_id: ingredient.ingredient_id,
        quantity: ingredient.quantity,
        cost: ingredient.cost
      }));

      await supabase
        .from('recipe_portion_ingredients')
        .insert(ingredientsToInsert);
    }

    toast({
      title: "Sucesso",
      description: "Receita atualizada com sucesso!",
    });

    return data;
  } catch (error) {
    console.error('Error updating recipe:', error);
    toast({
      title: "Erro",
      description: "Não foi possível atualizar a receita",
      variant: "destructive",
    });
    return null;
  }
};

export const deleteRecipe = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Receita excluída com sucesso!",
    });

    return true;
  } catch (error) {
    console.error('Error deleting recipe:', error);
    toast({
      title: "Erro",
      description: "Não foi possível excluir a receita",
      variant: "destructive",
    });
    return false;
  }
};

// Recipe Categories functions
export const fetchRecipeCategories = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('recipe_categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recipe categories:', error);
    return [];
  }
};

export const createRecipeCategory = async (name: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('recipe_categories')
      .insert({ name, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating recipe category:', error);
    throw error;
  }
};

export const updateRecipeCategory = async (id: string, name: string) => {
  try {
    const { data, error } = await supabase
      .from('recipe_categories')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating recipe category:', error);
    throw error;
  }
};

export const deleteRecipeCategory = async (id: string) => {
  try {
    const { error } = await supabase
      .from('recipe_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting recipe category:', error);
    throw error;
  }
};
