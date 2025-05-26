
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { DiscountCategory, CreateDiscountCategoryRequest } from "@/types/discountCategories";

export async function getDiscountCategories(): Promise<DiscountCategory[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from("discount_categories")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Erro ao buscar categorias de desconto:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível carregar as categorias de desconto",
      variant: "destructive",
    });
    return [];
  }
}

export async function createDiscountCategory(category: CreateDiscountCategoryRequest): Promise<DiscountCategory | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from("discount_categories")
      .insert([{
        ...category,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Categoria de desconto criada com sucesso",
    });
    return data;
  } catch (error: any) {
    console.error("Erro ao criar categoria de desconto:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível criar a categoria de desconto",
      variant: "destructive",
    });
    return null;
  }
}

export async function deleteDiscountCategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("discount_categories")
      .delete()
      .eq("id", id);

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Categoria de desconto excluída com sucesso",
    });
    return true;
  } catch (error: any) {
    console.error("Erro ao excluir categoria de desconto:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível excluir a categoria de desconto",
      variant: "destructive",
    });
    return false;
  }
}
