
import { supabase } from "@/integrations/supabase/client";
import { Packaging } from "@/types";
import { toast } from "@/hooks/use-toast";

export const getPackagingList = async (): Promise<Packaging[]> => {
  try {
    const { data, error } = await supabase
      .from("packaging")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao buscar embalagens:", error);
      throw new Error(error.message);
    }

    return (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      bulkQuantity: item.bulk_quantity,
      bulkPrice: item.bulk_price,
      unitCost: item.unit_cost,
      imageUrl: item.image_url,
      notes: item.notes,
    }));
  } catch (error: any) {
    console.error("Erro ao buscar embalagens:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível carregar as embalagens: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

export const createPackaging = async (packaging: Omit<Packaging, "id">): Promise<Packaging> => {
  try {
    const { data, error } = await supabase
      .from("packaging")
      .insert({
        name: packaging.name,
        type: packaging.type,
        bulk_quantity: packaging.bulkQuantity,
        bulk_price: packaging.bulkPrice,
        unit_cost: packaging.bulkQuantity > 0 ? packaging.bulkPrice / packaging.bulkQuantity : 0,
        image_url: packaging.imageUrl || null,
        notes: packaging.notes,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar embalagem:", error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      type: data.type,
      bulkQuantity: data.bulk_quantity,
      bulkPrice: data.bulk_price,
      unitCost: data.unit_cost,
      imageUrl: data.image_url,
      notes: data.notes,
    };
  } catch (error: any) {
    console.error("Erro ao criar embalagem:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível criar a embalagem: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const updatePackaging = async (id: string, packaging: Partial<Omit<Packaging, "id">>): Promise<Packaging> => {
  try {
    // Calcular o custo unitário se os valores necessários forem fornecidos
    let unitCost = undefined;
    if (packaging.bulkQuantity && packaging.bulkPrice) {
      unitCost = packaging.bulkPrice / packaging.bulkQuantity;
    } else if (packaging.bulkQuantity && !packaging.bulkPrice) {
      // Buscar o preço atual para calcular
      const { data: currentData } = await supabase
        .from("packaging")
        .select("bulk_price")
        .eq("id", id)
        .single();
      
      if (currentData) {
        unitCost = currentData.bulk_price / packaging.bulkQuantity;
      }
    } else if (!packaging.bulkQuantity && packaging.bulkPrice) {
      // Buscar a quantidade atual para calcular
      const { data: currentData } = await supabase
        .from("packaging")
        .select("bulk_quantity")
        .eq("id", id)
        .single();
      
      if (currentData) {
        unitCost = packaging.bulkPrice / currentData.bulk_quantity;
      }
    }

    const updateData: any = {
      name: packaging.name,
      type: packaging.type,
      bulk_quantity: packaging.bulkQuantity,
      bulk_price: packaging.bulkPrice,
      unit_cost: unitCost,
      image_url: packaging.imageUrl,
      notes: packaging.notes,
    };

    // Remover propriedades indefinidas
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { data, error } = await supabase
      .from("packaging")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar embalagem:", error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      type: data.type,
      bulkQuantity: data.bulk_quantity,
      bulkPrice: data.bulk_price,
      unitCost: data.unit_cost,
      imageUrl: data.image_url,
      notes: data.notes,
    };
  } catch (error: any) {
    console.error("Erro ao atualizar embalagem:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível atualizar a embalagem: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const deletePackaging = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("packaging")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao excluir embalagem:", error);
      throw new Error(error.message);
    }

    toast({
      title: "Sucesso",
      description: "Embalagem excluída com sucesso!",
    });
    
    return true;
  } catch (error: any) {
    console.error("Erro ao excluir embalagem:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível excluir a embalagem: ${error.message}`,
      variant: "destructive",
    });
    return false;
  }
};

export const searchPackaging = async (query: string): Promise<Packaging[]> => {
  try {
    const { data, error } = await supabase
      .from("packaging")
      .select("*")
      .or(`name.ilike.%${query}%,type.ilike.%${query}%`)
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao buscar embalagens:", error);
      throw new Error(error.message);
    }

    return (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      bulkQuantity: item.bulk_quantity,
      bulkPrice: item.bulk_price,
      unitCost: item.unit_cost,
      imageUrl: item.image_url,
      notes: item.notes,
    }));
  } catch (error: any) {
    console.error("Erro ao buscar embalagens:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível realizar a busca: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};
