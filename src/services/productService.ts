
import { supabase } from "@/integrations/supabase/client";
import { Product, ProductItem } from "@/types";
import { calculateProductTotalCost } from "@/utils/calculations";

export const getProductList = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar produtos:", error);
    throw new Error(error.message);
  }

  // Buscar os itens de cada produto
  const products = await Promise.all(
    (data || []).map(async (product) => {
      const { data: items, error: itemsError } = await supabase
        .from("product_items")
        .select(`
          *,
          recipes:recipe_id (
            id,
            name,
            image_url,
            unit_cost
          )
        `)
        .eq("product_id", product.id);

      if (itemsError) {
        console.error("Erro ao buscar itens do produto:", itemsError);
        throw new Error(itemsError.message);
      }

      const formattedItems = (items || []).map((item) => ({
        id: item.id,
        recipeId: item.recipe_id,
        quantity: item.quantity,
        cost: item.cost,
      }));

      return {
        id: product.id,
        name: product.name,
        items: formattedItems,
        packagingId: product.packaging_id,
        packagingCost: product.packaging_cost,
        totalCost: product.total_cost,
      };
    })
  );

  return products;
};

export const createProduct = async (product: Omit<Product, "id">): Promise<Product> => {
  console.log("Criando produto:", product);
  
  // Calcular o custo total
  const itemsCost = product.items.reduce((acc, item) => acc + item.cost, 0);
  const totalCost = calculateProductTotalCost(itemsCost, product.packagingCost);

  // Inserir o produto
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: product.name,
      packaging_id: product.packagingId,
      packaging_cost: product.packagingCost,
      total_cost: totalCost,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar produto:", error);
    throw new Error(error.message);
  }

  // Inserir os itens do produto
  const productItems = product.items.map((item) => ({
    product_id: data.id,
    recipe_id: item.recipeId,
    quantity: item.quantity,
    cost: item.cost,
  }));

  const { error: itemsError } = await supabase
    .from("product_items")
    .insert(productItems);

  if (itemsError) {
    console.error("Erro ao adicionar itens ao produto:", itemsError);
    
    // Reverter a criação do produto em caso de erro
    await supabase.from("products").delete().eq("id", data.id);
    
    throw new Error(itemsError.message);
  }

  return {
    id: data.id,
    name: data.name,
    items: product.items,
    packagingId: data.packaging_id,
    packagingCost: data.packaging_cost,
    totalCost: data.total_cost,
  };
};

export const updateProduct = async (id: string, product: Omit<Product, "id">): Promise<Product> => {
  console.log("Atualizando produto:", id, product);
  
  // Calcular o custo total
  const itemsCost = product.items.reduce((acc, item) => acc + item.cost, 0);
  const totalCost = calculateProductTotalCost(itemsCost, product.packagingCost);

  // Atualizar o produto
  const { data, error } = await supabase
    .from("products")
    .update({
      name: product.name,
      packaging_id: product.packagingId,
      packaging_cost: product.packagingCost,
      total_cost: totalCost,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar produto:", error);
    throw new Error(error.message);
  }

  // Remover todos os itens existentes
  const { error: deleteError } = await supabase
    .from("product_items")
    .delete()
    .eq("product_id", id);

  if (deleteError) {
    console.error("Erro ao remover itens do produto:", deleteError);
    throw new Error(deleteError.message);
  }

  // Inserir os novos itens
  const productItems = product.items.map((item) => ({
    product_id: id,
    recipe_id: item.recipeId,
    quantity: item.quantity,
    cost: item.cost,
  }));

  if (productItems.length > 0) {
    const { error: insertError } = await supabase
      .from("product_items")
      .insert(productItems);

    if (insertError) {
      console.error("Erro ao adicionar itens ao produto:", insertError);
      throw new Error(insertError.message);
    }
  }

  return {
    id: data.id,
    name: data.name,
    items: product.items,
    packagingId: data.packaging_id,
    packagingCost: data.packaging_cost,
    totalCost: data.total_cost,
  };
};

export const deleteProduct = async (id: string): Promise<void> => {
  // Primeiro remover os itens do produto
  const { error: itemsError } = await supabase
    .from("product_items")
    .delete()
    .eq("product_id", id);

  if (itemsError) {
    console.error("Erro ao remover itens do produto:", itemsError);
    throw new Error(itemsError.message);
  }

  // Remover o produto
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir produto:", error);
    throw new Error(error.message);
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar produtos:", error);
    throw new Error(error.message);
  }

  // Buscar os itens de cada produto
  const products = await Promise.all(
    (data || []).map(async (product) => {
      const { data: items, error: itemsError } = await supabase
        .from("product_items")
        .select(`
          *,
          recipes:recipe_id (
            id,
            name,
            unit_cost
          )
        `)
        .eq("product_id", product.id);

      if (itemsError) {
        console.error("Erro ao buscar itens do produto:", itemsError);
        throw new Error(itemsError.message);
      }

      const formattedItems = (items || []).map((item) => ({
        id: item.id,
        recipeId: item.recipe_id,
        quantity: item.quantity,
        cost: item.cost,
      }));

      return {
        id: product.id,
        name: product.name,
        items: formattedItems,
        packagingId: product.packaging_id,
        packagingCost: product.packaging_cost,
        totalCost: product.total_cost,
      };
    })
  );

  return products;
};
