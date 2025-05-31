
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface CostSyncResult {
  updatedRecipes: number;
  updatedProducts: number;
  errors: string[];
}

export const syncAllCosts = async (): Promise<CostSyncResult> => {
  console.log('🔄 Iniciando sincronização completa de custos...');
  
  try {
    const result = {
      updatedRecipes: 0,
      updatedProducts: 0,
      errors: [] as string[]
    };

    // 1. Buscar todas as receitas
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, portions');

    if (recipesError) {
      console.error('❌ Erro ao buscar receitas:', recipesError);
      result.errors.push(`Erro ao buscar receitas: ${recipesError.message}`);
      return result;
    }

    // 2. Recalcular cada receita
    for (const recipe of recipes || []) {
      try {
        await recalculateRecipeCosts(recipe.id, recipe.portions);
        result.updatedRecipes++;
        console.log(`✅ Receita ${recipe.id} recalculada`);
      } catch (error: any) {
        console.error(`❌ Erro ao recalcular receita ${recipe.id}:`, error);
        result.errors.push(`Receita ${recipe.id}: ${error.message}`);
      }
    }

    // 3. Buscar todos os produtos
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id');

    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError);
      result.errors.push(`Erro ao buscar produtos: ${productsError.message}`);
      return result;
    }

    // 4. Recalcular cada produto
    for (const product of products || []) {
      try {
        await recalculateProductCosts(product.id);
        result.updatedProducts++;
        console.log(`✅ Produto ${product.id} recalculado`);
      } catch (error: any) {
        console.error(`❌ Erro ao recalcular produto ${product.id}:`, error);
        result.errors.push(`Produto ${product.id}: ${error.message}`);
      }
    }

    console.log('✅ Sincronização completa concluída:', result);
    return result;

  } catch (error: any) {
    console.error('❌ Erro geral na sincronização:', error);
    throw error;
  }
};

const recalculateRecipeCosts = async (recipeId: string, portions: number) => {
  // Buscar ingredientes base
  const { data: baseIngredients, error: baseError } = await supabase
    .from('recipe_base_ingredients')
    .select(`
      quantity,
      ingredients:ingredient_id (unit_cost)
    `)
    .eq('recipe_id', recipeId);

  if (baseError) throw baseError;

  // Buscar ingredientes por porção
  const { data: portionIngredients, error: portionError } = await supabase
    .from('recipe_portion_ingredients')
    .select(`
      quantity,
      ingredients:ingredient_id (unit_cost)
    `)
    .eq('recipe_id', recipeId);

  if (portionError) throw portionError;

  // Calcular custos
  const baseCost = (baseIngredients || []).reduce((sum, item) => {
    const unitCost = item.ingredients?.unit_cost || 0;
    const cost = Number(item.quantity) * Number(unitCost);
    return sum + cost;
  }, 0);

  const portionCost = (portionIngredients || []).reduce((sum, item) => {
    const unitCost = item.ingredients?.unit_cost || 0;
    const cost = Number(item.quantity) * Number(unitCost);
    return sum + cost;
  }, 0);

  const totalCost = baseCost + (portionCost * portions);
  const unitCost = totalCost / portions;

  console.log(`📊 Receita ${recipeId}: Base R$ ${baseCost.toFixed(2)}, Porção R$ ${portionCost.toFixed(2)} × ${portions}, Total R$ ${totalCost.toFixed(2)}, Unitário R$ ${unitCost.toFixed(2)}`);

  // Atualizar custos dos ingredientes nas tabelas de relacionamento
  for (const item of baseIngredients || []) {
    const newCost = Number(item.quantity) * Number(item.ingredients?.unit_cost || 0);
    await supabase
      .from('recipe_base_ingredients')
      .update({ cost: newCost })
      .eq('recipe_id', recipeId)
      .eq('ingredient_id', (item as any).ingredient_id);
  }

  for (const item of portionIngredients || []) {
    const newCost = Number(item.quantity) * Number(item.ingredients?.unit_cost || 0);
    await supabase
      .from('recipe_portion_ingredients')
      .update({ cost: newCost })
      .eq('recipe_id', recipeId)
      .eq('ingredient_id', (item as any).ingredient_id);
  }

  // Atualizar receita
  const { error: updateError } = await supabase
    .from('recipes')
    .update({
      total_cost: totalCost,
      unit_cost: unitCost,
      updated_at: new Date().toISOString()
    })
    .eq('id', recipeId);

  if (updateError) throw updateError;

  // Atualizar custos dos itens dos produtos que usam esta receita
  await updateProductItemsCosts(recipeId, unitCost);
};

const updateProductItemsCosts = async (recipeId: string, newUnitCost: number) => {
  console.log(`🔄 Atualizando custos dos itens dos produtos para receita ${recipeId}...`);

  const { data: productItems, error } = await supabase
    .from('product_items')
    .select('id, quantity, product_id')
    .eq('recipe_id', recipeId);

  if (error) throw error;

  for (const item of productItems || []) {
    const newCost = Number(item.quantity) * newUnitCost;
    
    console.log(`📝 Atualizando item ${item.id}: ${item.quantity} × ${newUnitCost} = ${newCost}`);
    
    const { error: updateError } = await supabase
      .from('product_items')
      .update({ cost: newCost })
      .eq('id', item.id);

    if (updateError) throw updateError;
  }

  console.log(`✅ ${productItems?.length || 0} itens de produtos atualizados`);
};

const recalculateProductCosts = async (productId: string) => {
  // Buscar custos dos itens
  const { data: items, error: itemsError } = await supabase
    .from('product_items')
    .select('cost')
    .eq('product_id', productId);

  if (itemsError) throw itemsError;

  // Buscar custos das embalagens
  const { data: packaging, error: packagingError } = await supabase
    .from('product_packaging')
    .select('cost')
    .eq('product_id', productId);

  if (packagingError) throw packagingError;

  const itemsCost = (items || []).reduce((sum, item) => sum + Number(item.cost), 0);
  const packagingCost = (packaging || []).reduce((sum, pkg) => sum + Number(pkg.cost), 0);
  const totalCost = itemsCost + packagingCost;

  console.log(`📊 Produto ${productId}: Itens R$ ${itemsCost.toFixed(2)}, Embalagens R$ ${packagingCost.toFixed(2)}, Total R$ ${totalCost.toFixed(2)}`);

  // Atualizar produto
  const { error: updateError } = await supabase
    .from('products')
    .update({
      total_cost: totalCost,
      updated_at: new Date().toISOString()
    })
    .eq('id', productId);

  if (updateError) throw updateError;
};
