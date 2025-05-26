
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface SalePoint {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const getSalePoints = async (): Promise<SalePoint[]> => {
  try {
    const { data, error } = await supabase
      .from("sale_points")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Erro ao buscar pontos de venda:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível carregar os pontos de venda: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

export const createSalePoint = async (salePoint: Omit<SalePoint, "id" | "created_at" | "updated_at">): Promise<SalePoint | null> => {
  try {
    const { data, error } = await supabase
      .from("sale_points")
      .insert(salePoint)
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Ponto de venda criado com sucesso!",
    });

    return data;
  } catch (error: any) {
    console.error("Erro ao criar ponto de venda:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível criar o ponto de venda: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

export const deleteSalePoint = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("sale_points")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Ponto de venda removido com sucesso!",
    });

    return true;
  } catch (error: any) {
    console.error("Erro ao remover ponto de venda:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível remover o ponto de venda: ${error.message}`,
      variant: "destructive",
    });
    return false;
  }
};
