import { supabase } from "@/integrations/supabase/client";
import { Product, ProductItem, ProductPackaging } from "@/types";
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
      // Get recipe items
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

      // Get additional packaging items
      const { data: packagingItems, error: packagingError } = await supabase
        .from("product_packaging")
        .select(`
          *,
          packaging:packaging_id (
            id,
            name,
            unit_cost
          )
        `)
        .eq("product_id", product.id);

      if (packagingError) {
        console.error("Erro ao buscar embalagens do produto:", packagingError);
        throw new Error(packagingError.message);
      }

      const formattedItems = (items || []).map((item) => ({
        id: item.id,
        recipeId: item.recipe_id,
        quantity: item.quantity,
        cost: item.cost,
      }));

      const formattedPackagingItems = (packagingItems || []).map((pkg) => ({
        id: pkg.id,
        packagingId: pkg.packaging_id,
        quantity: pkg.quantity,
        cost: pkg.cost,
        isPrimary: pkg.is_primary,
      }));

      return {
        id: product.id,
        name: product.name,
        items: formattedItems,
        packagingId: product.packaging_id,
        packagingCost: product.packaging_cost,
        packagingItems: formattedPackagingItems,
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
  const packagingItemsCost = product.packagingItems ? 
    product.packagingItems.reduce((acc, pkg) => acc + pkg.cost, 0) : 0;
  const totalCost = itemsCost + packagingItemsCost;

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

  if (productItems.length > 0) {
    const { error: itemsError } = await supabase
      .from("product_items")
      .insert(productItems);
  
    if (itemsError) {
      console.error("Erro ao adicionar itens ao produto:", itemsError);
      
      // Reverter a criação do produto em caso de erro
      await supabase.from("products").delete().eq("id", data.id);
      
      throw new Error(itemsError.message);
    }
  }

  // Inserir embalagens adicionais se existirem
  if (product.packagingItems && product.packagingItems.length > 0) {
    const packagingItems = product.packagingItems.map((pkg) => ({
      product_id: data.id,
      packaging_id: pkg.packagingId,
      quantity: pkg.quantity,
      cost: pkg.cost,
      is_primary: pkg.isPrimary || false,
    }));

    const { error: packagingError } = await supabase
      .from("product_packaging")
      .insert(packagingItems);

    if (packagingError) {
      console.error("Erro ao adicionar embalagens ao produto:", packagingError);
      
      // Reverter a criação do produto e itens em caso de erro
      await supabase.from("product_items").delete().eq("product_id", data.id);
      await supabase.from("products").delete().eq("id", data.id);
      
      throw new Error(packagingError.message);
    }
  }

  return {
    id: data.id,
    name: data.name,
    items: product.items,
    packagingId: data.packaging_id,
    packagingCost: data.packaging_cost,
    packagingItems: product.packagingItems,
    totalCost: data.total_cost,
  };
};

export const updateProduct = async (id: string, product: Omit<Product, "id">): Promise<Product> => {
  console.log("Atualizando produto:", id, product);
  
  // Calcular o custo total
  const itemsCost = product.items.reduce((acc, item) => acc + item.cost, 0);
  const packagingItemsCost = product.packagingItems ? 
    product.packagingItems.reduce((acc, pkg) => acc + pkg.cost, 0) : 0;
  const totalCost = itemsCost + packagingItemsCost;

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
  const { error: deleteItemsError } = await supabase
    .from("product_items")
    .delete()
    .eq("product_id", id);

  if (deleteItemsError) {
    console.error("Erro ao remover itens do produto:", deleteItemsError);
    throw new Error(deleteItemsError.message);
  }

  // Remover todas as embalagens existentes
  const { error: deletePackagingError } = await supabase
    .from("product_packaging")
    .delete()
    .eq("product_id", id);

  if (deletePackagingError) {
    console.error("Erro ao remover embalagens do produto:", deletePackagingError);
    throw new Error(deletePackagingError.message);
  }

  // Inserir os novos itens
  if (product.items.length > 0) {
    const productItems = product.items.map((item) => ({
      product_id: id,
      recipe_id: item.recipeId,
      quantity: item.quantity,
      cost: item.cost,
    }));

    const { error: insertItemsError } = await supabase
      .from("product_items")
      .insert(productItems);

    if (insertItemsError) {
      console.error("Erro ao adicionar itens ao produto:", insertItemsError);
      throw new Error(insertItemsError.message);
    }
  }

  // Inserir as novas embalagens
  if (product.packagingItems && product.packagingItems.length > 0) {
    const packagingItems = product.packagingItems.map((pkg) => ({
      product_id: id,
      packaging_id: pkg.packagingId,
      quantity: pkg.quantity,
      cost: pkg.cost,
      is_primary: pkg.isPrimary || false,
    }));

    const { error: insertPackagingError } = await supabase
      .from("product_packaging")
      .insert(packagingItems);

    if (insertPackagingError) {
      console.error("Erro ao adicionar embalagens ao produto:", insertPackagingError);
      throw new Error(insertPackagingError.message);
    }
  }

  return {
    id: data.id,
    name: data.name,
    items: product.items,
    packagingId: data.packaging_id,
    packagingCost: data.packaging_cost,
    packagingItems: product.packagingItems,
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
