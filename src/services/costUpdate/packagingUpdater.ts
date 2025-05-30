
import { supabase } from "@/integrations/supabase/client";

export const updateAllPackagingCosts = async () => {
  console.log('🔄 Atualizando TODOS os custos das embalagens...');
  
  await updateProductPackagingCosts();
  
  console.log('✅ Todos os custos das embalagens atualizados');
};

export const updateSpecificPackagingCosts = async (packagingIds: string[]) => {
  console.log('🔄 Atualizando custos de embalagens específicas:', packagingIds);
  
  await updateProductPackagingCosts(packagingIds);
  
  console.log('✅ Custos das embalagens específicas atualizados');
};

const updateProductPackagingCosts = async (specificPackagingIds?: string[]) => {
  console.log('🔄 Atualizando embalagens nos produtos...');
  
  let query = supabase
    .from('product_packaging')
    .select(`
      id,
      product_id,
      packaging_id,
      quantity,
      packaging!inner(id, name, unit_cost)
    `);
  
  if (specificPackagingIds && specificPackagingIds.length > 0) {
    query = query.in('packaging_id', specificPackagingIds);
  }
  
  const { data: productPackaging, error } = await query;
  
  if (error) {
    console.error('❌ Erro ao buscar embalagens dos produtos:', error);
    throw error;
  }
  
  if (!productPackaging || productPackaging.length === 0) {
    console.log('ℹ️ Nenhuma embalagem de produto encontrada');
    return;
  }
  
  for (const packaging of productPackaging) {
    const newCost = Number(packaging.quantity) * Number(packaging.packaging.unit_cost);
    
    console.log(`📦 Embalagem - ${packaging.packaging.name}: ${packaging.quantity} × ${packaging.packaging.unit_cost} = ${newCost}`);
    
    const { error: updateError } = await supabase
      .from('product_packaging')
      .update({ cost: newCost })
      .eq('id', packaging.id);
    
    if (updateError) {
      console.error('❌ Erro ao atualizar embalagem do produto:', updateError);
      throw updateError;
    }
  }
  
  console.log(`✅ ${productPackaging.length} embalagens de produtos atualizadas`);
};
