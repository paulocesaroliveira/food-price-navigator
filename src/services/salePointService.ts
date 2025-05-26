
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface SalePoint {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSalePointRequest {
  name: string;
  is_active: boolean;
}

export async function getSalePoints() {
  try {
    const { data, error } = await supabase
      .from("sale_points")
      .select("*")
      .order("name");

    if (error) throw error;
    return data as SalePoint[];
  } catch (error: any) {
    console.error("Erro ao buscar pontos de venda:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível carregar os pontos de venda: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
}

export async function createSalePoint(salePointData: CreateSalePointRequest) {
  try {
    const { data, error } = await supabase
      .from("sale_points")
      .insert(salePointData)
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "Ponto de venda criado",
      description: `${data.name} foi criado com sucesso`,
    });

    return data as SalePoint;
  } catch (error: any) {
    console.error("Erro ao criar ponto de venda:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível criar o ponto de venda: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
}

export async function deleteSalePoint(id: string) {
  try {
    const { error } = await supabase
      .from("sale_points")
      .delete()
      .eq("id", id);

    if (error) throw error;

    toast({
      title: "Ponto de venda excluído",
      description: "O ponto de venda foi excluído com sucesso",
    });

    return true;
  } catch (error: any) {
    console.error("Erro ao excluir ponto de venda:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível excluir o ponto de venda: ${error.message}`,
      variant: "destructive",
    });
    return false;
  }
}
