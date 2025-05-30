
import { supabase } from "@/integrations/supabase/client";

export const recalculateRecipeCost = async (recipeId: string) => {
  console.log('🔄 Recalculando custo da receita:', recipeId);
  
  try {
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('portions')
      .eq('id', recipeId)
      .single();
    
    if (recipeError) {
      console.error('❌ Erro ao buscar receita:', recipeError);
      throw recipeError;
    }
    
    const { data: baseCosts, error: baseError } = await supabase
      .from('recipe_base_ingredients')
      .select('cost')
      .eq('recipe_id', recipeId);
    
    if (baseError) {
      console.error('❌ Erro ao buscar custos base:', baseError);
      throw baseError;
    }
    
    const { data: portionCosts, error: portionError } = await supabase
      .from('recipe_portion_ingredients')
      .select('cost')
      .eq('recipe_id', recipeId);
    
    if (portionError) {
      console.error('❌ Erro ao buscar custos por porção:', portionError);
      throw portionError;
    }
    
    const totalBaseCost = baseCosts?.reduce((sum, item) => sum + Number(item.cost), 0) || 0;
    const totalPortionCost = portionCosts?.reduce((sum, item) => sum + Number(item.cost), 0) || 0;
    const portions = recipe.portions || 1;
    
    const totalCost = totalBaseCost + (totalPortionCost * portions);
    const unitCost = totalCost / portions;
    
    const { error: updateError } = await supabase
      .from('recipes')
      .update({
        total_cost: totalCost,
        unit_cost: unitCost,
        updated_at: new Date().toISOString()
      })
      .eq('id', recipeId);
    
    if (updateError) {
      console.error('❌ Erro ao recalcular custo da receita:', updateError);
      throw updateError;
    }
    
    // Atualizar custos dos itens dos produtos que usam esta receita
    await updateProductItemsCosts(recipeId, unitCost);
    
    console.log(`✅ Custo da receita recalculado: Total R$ ${totalCost.toFixed(2)}, Unitário R$ ${unitCost.toFixed(2)}`);
  } catch (error) {
    console.error('❌ Erro ao recalcular custo da receita:', error);
    throw error;
  }
};

const updateProductItemsCosts = async (recipeId: string, newUnitCost: number) => {
  console.log('🔄 Atualizando custos dos itens dos produtos para receita:', recipeId);
  
  try {
    const { data: productItems, error } = await supabase
      .from('product_items')
      .select('id, quantity, product_id')
      .eq('recipe_id', recipeId);
    
    if (error) {
      console.error('❌ Erro ao buscar itens dos produtos:', error);
      throw error;
    }
    
    if (!productItems || productItems.length === 0) {
      console.log('ℹ️ Nenhum item de produto encontrado para esta receita');
      return;
    }
    
    for (const item of productItems) {
      const newCost = Number(item.quantity) * newUnitCost;
      
      console.log(`📝 Atualizando item ${item.id}: ${item.quantity} × ${newUnitCost} = ${newCost}`);
      
      const { error: updateError } = await supabase
        .from('product_items')
        .update({ cost: newCost })
        .eq('id', item.id);
      
      if (updateError) {
        console.error('❌ Erro ao atualizar item do produto:', updateError);
        throw updateError;
      }
    }
    
    console.log(`✅ ${productItems.length} itens de produtos atualizados`);
    
    // Recalcular custos dos produtos afetados
    const uniqueProductIds = [...new Set(productItems.map(item => item.product_id))];
    for (const productId of uniqueProductIds) {
      await recalculateProductCost(productId);
    }
    
  } catch (error) {
    console.error('❌ Erro ao atualizar custos dos itens dos produtos:', error);
    throw error;
  }
};

export const recalculateProductCost = async (productId: string) => {
  console.log('🔄 Recalculando custo do produto:', productId);
  
  try {
    const { data: itemsCost, error: itemsError } = await supabase
      .from('product_items')
      .select('cost')
      .eq('product_id', productId);
    
    if (itemsError) {
      console.error('❌ Erro ao buscar custos dos itens:', itemsError);
      throw itemsError;
    }
    
    const { data: packagingCost, error: packagingError } = await supabase
      .from('product_packaging')
      .select('cost')
      .eq('product_id', productId);
    
    if (packagingError) {
      console.error('❌ Erro ao buscar custos das embalagens:', packagingError);
      throw packagingError;
    }
    
    const totalItemsCost = itemsCost?.reduce((sum, item) => sum + Number(item.cost), 0) || 0;
    const totalPackagingCost = packagingCost?.reduce((sum, pkg) => sum + Number(pkg.cost), 0) || 0;
    const totalCost = totalItemsCost + totalPackagingCost;
    
    const { error: updateError } = await supabase
      .from('products')
      .update({
        total_cost: totalCost,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);
    
    if (updateError) {
      console.error('❌ Erro ao recalcular custo do produto:', updateError);
      throw updateError;
    }
    
    console.log(`✅ Custo do produto recalculado: R$ ${totalCost.toFixed(2)}`);
  } catch (error) {
    console.error('❌ Erro ao recalcular custo do produto:', error);
    throw error;
  }
};
