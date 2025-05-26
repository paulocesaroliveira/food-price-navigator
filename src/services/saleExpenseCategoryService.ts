
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { SaleExpenseCategory, CreateSaleExpenseCategoryRequest } from "@/types/saleExpenseCategories";

export async function getSaleExpenseCategories(): Promise<SaleExpenseCategory[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from("sale_expense_categories")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Erro ao buscar categorias de despesa:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível carregar as categorias de despesa",
      variant: "destructive",
    });
    return [];
  }
}

export async function createSaleExpenseCategory(category: CreateSaleExpenseCategoryRequest): Promise<SaleExpenseCategory | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from("sale_expense_categories")
      .insert([{
        ...category,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Categoria de despesa criada com sucesso",
    });
    return data;
  } catch (error: any) {
    console.error("Erro ao criar categoria de despesa:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível criar a categoria de despesa",
      variant: "destructive",
    });
    return null;
  }
}

export async function deleteSaleExpenseCategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("sale_expense_categories")
      .delete()
      .eq("id", id);

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Categoria de despesa excluída com sucesso",
    });
    return true;
  } catch (error: any) {
    console.error("Erro ao excluir categoria de despesa:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível excluir a categoria de despesa",
      variant: "destructive",
    });
    return false;
  }
}
