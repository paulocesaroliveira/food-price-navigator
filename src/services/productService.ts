
import { supabase } from "@/integrations/supabase/client";
import { Product, ProductItem, ProductPackaging, ProductCategory, Packaging } from "@/types";
import { toast } from "@/hooks/use-toast";

export const getProductCategories = async (): Promise<ProductCategory[]> => {
  try {
    const { data, error } = await supabase
      .from("product_categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao buscar categorias de produtos:", error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error: any) {
    console.error("Erro ao buscar categorias de produtos:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível carregar as categorias: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

export const getProductList = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_categories:category_id (
          id,
          name
        )
      `)
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao buscar produtos:", error);
      throw new Error(error.message);
    }

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

        const { data: packagingItems, error: packagingError } = await supabase
          .from("product_packaging")
          .select(`
            *,
            packaging:packaging_id (
              id,
              name,
              type,
              bulk_quantity,
              bulk_price,
              unit_cost,
              image_url,
              notes
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
          recipe: item.recipes ? {
            id: item.recipes.id,
            name: item.recipes.name,
            image: item.recipes.image_url,
            unitCost: item.recipes.unit_cost
          } : undefined
        }));

        const formattedPackagingItems = (packagingItems || []).map((pkg) => {
          const packagingData = pkg.packaging ? {
            id: pkg.packaging.id,
            name: pkg.packaging.name,
            type: pkg.packaging.type,
            bulkQuantity: pkg.packaging.bulk_quantity,
            bulkPrice: pkg.packaging.bulk_price,
            unitCost: pkg.packaging.unit_cost,
            imageUrl: pkg.packaging.image_url,
            notes: pkg.packaging.notes
          } : undefined;
          
          return {
            id: pkg.id,
            packagingId: pkg.packaging_id,
            quantity: pkg.quantity,
            cost: pkg.cost,
            isPrimary: pkg.is_primary,
            packaging: packagingData
          };
        });

        const primaryPackaging = formattedPackagingItems.find(pkg => pkg.isPrimary);
        
        return {
          id: product.id,
          name: product.name,
          categoryId: product.category_id,
          category: product.product_categories,
          items: formattedItems,
          packagingId: primaryPackaging?.packagingId || product.packaging_id,
          packagingCost: primaryPackaging?.cost || product.packaging_cost,
          packagingItems: formattedPackagingItems,
          totalCost: product.total_cost,
          sellingPrice: product.selling_price || 0, // Incluir campo
          imageUrl: primaryPackaging?.packaging?.imageUrl || null
        };
      })
    );

    return products;
  } catch (error: any) {
    console.error("Erro ao buscar produtos:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível carregar os produtos: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

export const createProduct = async (product: Omit<Product, "id">): Promise<Product> => {
  try {
    console.log("Criando produto:", product);
    
    const itemsCost = product.items.reduce((acc, item) => acc + item.cost, 0);
    const packagingItemsCost = product.packagingItems ? 
      product.packagingItems.reduce((acc, pkg) => acc + pkg.cost, 0) : 0;
    const totalCost = itemsCost + packagingItemsCost;

    const primaryPackaging = product.packagingItems?.find(pkg => pkg.isPrimary);
    const categoryId = product.categoryId && product.categoryId !== "" ? product.categoryId : null;

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: product.name,
        category_id: categoryId,
        packaging_id: primaryPackaging?.packagingId || product.packagingId,
        packaging_cost: primaryPackaging?.cost || product.packagingCost,
        total_cost: totalCost,
        selling_price: product.sellingPrice || 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar produto:", error);
      throw new Error(error.message);
    }

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
        await supabase.from("products").delete().eq("id", data.id);
        throw new Error(itemsError.message);
      }
    }

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
        await supabase.from("product_items").delete().eq("product_id", data.id);
        await supabase.from("products").delete().eq("id", data.id);
        throw new Error(packagingError.message);
      }
    }

    // Os triggers agora recalculam automaticamente os custos quando necessário
    // Não precisamos mais fazer recálculo manual aqui

    return {
      id: data.id,
      name: data.name,
      categoryId: data.category_id,
      category: null,
      items: product.items,
      packagingId: data.packaging_id,
      packagingCost: data.packaging_cost,
      packagingItems: product.packagingItems,
      totalCost: data.total_cost,
      sellingPrice: data.selling_price,
      imageUrl: null
    };
  } catch (error: any) {
    console.error("Erro ao criar produto:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível criar o produto: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const updateProduct = async (id: string, product: Omit<Product, "id">): Promise<Product> => {
  try {
    console.log("Atualizando produto:", id, product);
    
    const itemsCost = product.items.reduce((acc, item) => acc + item.cost, 0);
    const packagingItemsCost = product.packagingItems ? 
      product.packagingItems.reduce((acc, pkg) => acc + pkg.cost, 0) : 0;
    const totalCost = itemsCost + packagingItemsCost;

    const primaryPackaging = product.packagingItems?.find(pkg => pkg.isPrimary);
    const categoryId = product.categoryId && product.categoryId !== "" ? product.categoryId : null;

    const { data, error } = await supabase
      .from("products")
      .update({
        name: product.name,
        category_id: categoryId,
        packaging_id: primaryPackaging?.packagingId || product.packagingId,
        packaging_cost: primaryPackaging?.cost || product.packagingCost,
        total_cost: totalCost,
        selling_price: product.sellingPrice || 0,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar produto:", error);
      throw new Error(error.message);
    }

    // Remover itens e embalagens existentes
    const { error: deleteItemsError } = await supabase
      .from("product_items")
      .delete()
      .eq("product_id", id);

    if (deleteItemsError) {
      console.error("Erro ao remover itens do produto:", deleteItemsError);
      throw new Error(deleteItemsError.message);
    }

    const { error: deletePackagingError } = await supabase
      .from("product_packaging")
      .delete()
      .eq("product_id", id);

    if (deletePackagingError) {
      console.error("Erro ao remover embalagens do produto:", deletePackagingError);
      throw new Error(deletePackagingError.message);
    }

    // Inserir novos itens
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

    // Inserir novas embalagens
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

    // Os triggers agora recalculam automaticamente os custos quando necessário

    return {
      id: data.id,
      name: data.name,
      categoryId: data.category_id,
      category: null,
      items: product.items,
      packagingId: data.packaging_id,
      packagingCost: data.packaging_cost,
      packagingItems: product.packagingItems,
      totalCost: data.total_cost,
      sellingPrice: data.selling_price,
      imageUrl: null
    };
  } catch (error: any) {
    console.error("Erro ao atualizar produto:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível atualizar o produto: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    // Primeiro, verificar se o produto está referenciado em outras tabelas
    const { data: publishedProducts, error: publishedError } = await supabase
      .from("published_products")
      .select("id")
      .eq("product_id", id);

    if (publishedError) {
      console.error("Erro ao verificar produtos publicados:", publishedError);
    }

    // Se houver produtos publicados, removê-los primeiro
    if (publishedProducts && publishedProducts.length > 0) {
      const { error: deletePublishedError } = await supabase
        .from("published_products")
        .delete()
        .eq("product_id", id);

      if (deletePublishedError) {
        console.error("Erro ao remover produtos publicados:", deletePublishedError);
        throw new Error(`Erro ao remover produtos publicados: ${deletePublishedError.message}`);
      }
    }

    // Verificar se há itens de pedido relacionados
    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select("id")
      .eq("product_id", id);

    if (orderItemsError) {
      console.error("Erro ao verificar itens de pedido:", orderItemsError);
    }

    // Se houver itens de pedido, não permitir exclusão
    if (orderItems && orderItems.length > 0) {
      throw new Error("Não é possível excluir este produto pois ele possui pedidos associados.");
    }

    // Verificar se há configurações de preços relacionadas
    const { data: pricingConfigs, error: pricingError } = await supabase
      .from("pricing_configs")
      .select("id")
      .eq("product_id", id);

    if (pricingError) {
      console.error("Erro ao verificar configurações de preços:", pricingError);
    }

    // Se houver configurações de preços, removê-las primeiro
    if (pricingConfigs && pricingConfigs.length > 0) {
      const { error: deletePricingError } = await supabase
        .from("pricing_configs")
        .delete()
        .eq("product_id", id);

      if (deletePricingError) {
        console.error("Erro ao remover configurações de preços:", deletePricingError);
        throw new Error(`Erro ao remover configurações de preços: ${deletePricingError.message}`);
      }
    }

    // Remover itens do produto
    const { error: itemsError } = await supabase
      .from("product_items")
      .delete()
      .eq("product_id", id);

    if (itemsError) {
      console.error("Erro ao remover itens do produto:", itemsError);
      throw new Error(itemsError.message);
    }
    
    // Remover embalagens do produto
    const { error: packagingError } = await supabase
      .from("product_packaging")
      .delete()
      .eq("product_id", id);

    if (packagingError) {
      console.error("Erro ao remover embalagens do produto:", packagingError);
      throw new Error(packagingError.message);
    }

    // Finalmente, remover o produto
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao excluir produto:", error);
      throw new Error(error.message);
    }
  } catch (error: any) {
    console.error("Erro ao excluir produto:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível excluir o produto: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .ilike("name", `%${query}%`)
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao buscar produtos:", error);
      throw new Error(error.message);
    }

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
        
        const { data: packagingItems, error: packagingError } = await supabase
          .from("product_packaging")
          .select(`
            *,
            packaging:packaging_id (
              id,
              name,
              type,
              bulk_quantity,
              bulk_price,
              unit_cost,
              image_url,
              notes
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
          recipe: item.recipes ? {
            id: item.recipes.id,
            name: item.recipes.name,
            image: item.recipes.image_url,
            unitCost: item.recipes.unit_cost
          } : undefined
        }));
        
        const formattedPackagingItems = (packagingItems || []).map((pkg) => {
          const packagingData = pkg.packaging ? {
            id: pkg.packaging.id,
            name: pkg.packaging.name,
            type: pkg.packaging.type,
            bulkQuantity: pkg.packaging.bulk_quantity,
            bulkPrice: pkg.packaging.bulk_price,
            unitCost: pkg.packaging.unit_cost,
            imageUrl: pkg.packaging.image_url,
            notes: pkg.packaging.notes
          } : undefined;
          
          return {
            id: pkg.id,
            packagingId: pkg.packaging_id,
            quantity: pkg.quantity,
            cost: pkg.cost,
            isPrimary: pkg.is_primary,
            packaging: packagingData
          };
        });

        const primaryPackaging = formattedPackagingItems.find(pkg => pkg.isPrimary);
        
        const { data: categoryData } = await supabase
          .from("product_categories")
          .select("id, name")
          .eq("id", product.category_id)
          .single();

        return {
          id: product.id,
          name: product.name,
          categoryId: product.category_id,
          category: categoryData || null,
          items: formattedItems,
          packagingId: primaryPackaging?.packagingId || product.packaging_id,
          packagingCost: primaryPackaging?.cost || product.packaging_cost,
          packagingItems: formattedPackagingItems,
          totalCost: product.total_cost,
          sellingPrice: product.selling_price || 0, // Incluir campo
          imageUrl: primaryPackaging?.packaging?.imageUrl || null
        };
      })
    );

    return products;
  } catch (error: any) {
    console.error("Erro ao buscar produtos:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível realizar a busca: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};
