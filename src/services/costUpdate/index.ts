
import { UpdateAllResult, UpdateChainResult } from "./types";
import { updateAllIngredientCosts, updateSpecificIngredientCosts } from "./ingredientUpdater";
import { updateAllPackagingCosts, updateSpecificPackagingCosts } from "./packagingUpdater";
import { recalculateRecipeCost, recalculateProductCost } from "./costCalculator";
import { 
  getRecipesAffectedByIngredients, 
  getProductsAffectedByRecipes, 
  getProductsAffectedByPackaging 
} from "./dataService";
import { supabase } from "@/integrations/supabase/client";

export * from "./types";
export * from "./dataService";

export const recalculateAllCosts = async (): Promise<UpdateAllResult> => {
  console.log('🔄 Iniciando recálculo completo de custos...');
  
  try {
    // 1. Atualizar todos os custos dos ingredientes nas receitas
    await updateAllIngredientCosts();
    
    // 2. Atualizar todos os custos das embalagens nos produtos
    await updateAllPackagingCosts();
    
    // 3. Recalcular custos usando a função do banco
    const { data, error } = await supabase.rpc('recalculate_all_costs');
    
    if (error) {
      console.error('❌ Erro ao recalcular custos:', error);
      throw error;
    }
    
    console.log('✅ Recálculo completo concluído:', data[0]);
    return data[0] as UpdateAllResult;
  } catch (error) {
    console.error('❌ Erro geral no recálculo:', error);
    throw error;
  }
};

export const recalculateIngredientChain = async (ingredientIds: string[]): Promise<UpdateChainResult> => {
  console.log('🔄 Iniciando recálculo da cadeia de ingredientes:', ingredientIds);
  
  try {
    // 1. Atualizar custos dos ingredientes específicos
    await updateSpecificIngredientCosts(ingredientIds);
    
    // 2. Buscar receitas afetadas
    const affectedRecipes = await getRecipesAffectedByIngredients(ingredientIds);
    const recipeIds = affectedRecipes.map(r => r.id);
    
    // 3. Recalcular receitas afetadas
    for (const recipe of affectedRecipes) {
      await recalculateRecipeCost(recipe.id);
    }
    
    // 4. Buscar produtos afetados pelas receitas
    const affectedProducts = await getProductsAffectedByRecipes(recipeIds);
    const productIds = affectedProducts.map(p => p.id);
    
    console.log('✅ Recálculo da cadeia de ingredientes concluído');
    return {
      affected_recipes: affectedRecipes.length,
      affected_products: affectedProducts.length,
      recipe_ids: recipeIds,
      product_ids: productIds
    } as UpdateChainResult;
  } catch (error) {
    console.error('❌ Erro geral na cadeia de ingredientes:', error);
    throw error;
  }
};

export const recalculatePackagingChain = async (packagingIds: string[]): Promise<UpdateChainResult> => {
  console.log('🔄 Iniciando recálculo da cadeia de embalagens:', packagingIds);
  
  try {
    // 1. Atualizar custos das embalagens específicas
    await updateSpecificPackagingCosts(packagingIds);
    
    // 2. Buscar produtos afetados
    const affectedProducts = await getProductsAffectedByPackaging(packagingIds);
    
    // 3. Recalcular produtos afetados
    for (const product of affectedProducts) {
      await recalculateProductCost(product.id);
    }
    
    console.log('✅ Recálculo da cadeia de embalagens concluído');
    return {
      affected_recipes: 0,
      affected_products: affectedProducts.length,
      recipe_ids: [],
      product_ids: affectedProducts.map(p => p.id)
    } as UpdateChainResult;
  } catch (error) {
    console.error('❌ Erro geral na cadeia de embalagens:', error);
    throw error;
  }
};
