import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { AccountPayable, ExpenseCategory, AccountsPayableFilters } from "@/types/accountsPayable";

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from("expense_categories")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Erro ao buscar categorias:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível carregar as categorias",
      variant: "destructive",
    });
    return [];
  }
}

export async function getAccountsPayable(filters: AccountsPayableFilters = {}): Promise<AccountPayable[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    let query = supabase
      .from("accounts_payable")
      .select(`
        *,
        category:expense_categories(*)
      `)
      .eq("user_id", user.id)
      .order("due_date", { ascending: true });

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.category) {
      query = query.eq("category_id", filters.category);
    }

    if (filters.startDate) {
      query = query.gte("due_date", filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte("due_date", filters.endDate);
    }

    if (filters.supplier) {
      query = query.ilike("supplier", `%${filters.supplier}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    return (data || []).map(account => ({
      ...account,
      status: account.status as 'pending' | 'paid' | 'overdue' | 'cancelled',
      payment_method: account.payment_method as 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'check' | undefined
    }));
  } catch (error: any) {
    console.error("Erro ao buscar contas:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível carregar as contas",
      variant: "destructive",
    });
    return [];
  }
}

export async function createAccountPayable(account: Omit<AccountPayable, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    console.log("Creating account with user_id:", user.id);
    console.log("Account data:", account);

    const { error } = await supabase
      .from("accounts_payable")
      .insert([{
        ...account,
        user_id: user.id
      }]);

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    toast({
      title: "Sucesso",
      description: "Conta cadastrada com sucesso",
    });
    return true;
  } catch (error: any) {
    console.error("Erro ao criar conta:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível cadastrar a conta: ${error.message}`,
      variant: "destructive",
    });
    return false;
  }
}

export async function updateAccountPayable(id: string, updates: Partial<AccountPayable>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("accounts_payable")
      .update(updates)
      .eq("id", id);

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Conta atualizada com sucesso",
    });
    return true;
  } catch (error: any) {
    console.error("Erro ao atualizar conta:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível atualizar a conta",
      variant: "destructive",
    });
    return false;
  }
}

export async function deleteAccountPayable(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("accounts_payable")
      .delete()
      .eq("id", id);

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Conta excluída com sucesso",
    });
    return true;
  } catch (error: any) {
    console.error("Erro ao excluir conta:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível excluir a conta",
      variant: "destructive",
    });
    return false;
  }
}

export async function markAsPaid(id: string, paymentDate: string, paymentMethod: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("accounts_payable")
      .update({
        status: 'paid',
        payment_date: paymentDate,
        payment_method: paymentMethod
      })
      .eq("id", id);

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Conta marcada como paga",
    });
    return true;
  } catch (error: any) {
    console.error("Erro ao marcar como paga:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível marcar como paga",
      variant: "destructive",
    });
    return false;
  }
}
