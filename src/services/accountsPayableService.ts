
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { 
  AccountPayable, 
  ExpenseCategory, 
  AccountsPayableFilterData,
  CreateAccountPayable 
} from "@/types/accountsPayable";

// Categorias de Despesas
export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
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
    console.error("Erro ao buscar categorias:", error);
    toast({
      title: "Erro",
      description: "Não foi possível carregar as categorias",
      variant: "destructive",
    });
    return [];
  }
};

export const createExpenseCategory = async (name: string, description?: string, color?: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from("expense_categories")
      .insert({
        user_id: user.id,
        name,
        description,
        color: color || '#E76F51'
      });

    if (error) throw error;
    
    toast({
      title: "Sucesso",
      description: "Categoria criada com sucesso",
    });
    return true;
  } catch (error: any) {
    console.error("Erro ao criar categoria:", error);
    toast({
      title: "Erro",
      description: "Não foi possível criar a categoria",
      variant: "destructive",
    });
    return false;
  }
};

// Contas a Pagar
export const getAccountsPayable = async (filters: AccountsPayableFilterData = {}): Promise<AccountPayable[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    let query = supabase
      .from("accounts_payable")
      .select(`
        *,
        category:expense_categories(*)
      `)
      .eq("user_id", user.id);

    // Aplicar filtros
    if (filters.status && filters.status !== "all") {
      if (filters.status === "overdue") {
        query = query
          .eq("status", "pending")
          .lt("due_date", new Date().toISOString().split('T')[0]);
      } else {
        query = query.eq("status", filters.status);
      }
    }

    if (filters.category && filters.category !== "all") {
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

    if (filters.search) {
      query = query.or(`description.ilike.%${filters.search}%,supplier.ilike.%${filters.search}%`);
    }

    query = query.order("due_date", { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    
    // Garantir que os tipos estão corretos
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'pending' | 'paid' | 'overdue' | 'cancelled',
      payment_method: item.payment_method as 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'check' | undefined
    }));
  } catch (error: any) {
    console.error("Erro ao buscar contas:", error);
    toast({
      title: "Erro",
      description: "Não foi possível carregar as contas",
      variant: "destructive",
    });
    return [];
  }
};

export const createAccountPayable = async (account: CreateAccountPayable): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from("accounts_payable")
      .insert({
        user_id: user.id,
        ...account
      });

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: "Conta criada com sucesso",
    });
    return true;
  } catch (error: any) {
    console.error("Erro ao criar conta:", error);
    toast({
      title: "Erro",
      description: "Não foi possível criar a conta",
      variant: "destructive",
    });
    return false;
  }
};

export const updateAccountPayable = async (id: string, updates: Partial<CreateAccountPayable>): Promise<boolean> => {
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
    console.error("Erro ao atualizar conta:", error);
    toast({
      title: "Erro",
      description: "Não foi possível atualizar a conta",
      variant: "destructive",
    });
    return false;
  }
};

export const deleteAccountPayable = async (id: string): Promise<boolean> => {
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
    console.error("Erro ao excluir conta:", error);
    toast({
      title: "Erro",
      description: "Não foi possível excluir a conta",
      variant: "destructive",
    });
    return false;
  }
};

export const markAsPaid = async (
  id: string, 
  paymentDate: string, 
  paymentMethod: string
): Promise<boolean> => {
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
    console.error("Erro ao marcar como paga:", error);
    toast({
      title: "Erro",
      description: "Não foi possível marcar como paga",
      variant: "destructive",
    });
    return false;
  }
};

export const createRecurringAccounts = async (
  account: CreateAccountPayable,
  installments: number,
  startDate: string
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const accounts = [];
    const baseDate = new Date(startDate + 'T00:00:00'); // Garantir horário local

    for (let i = 0; i < installments; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      // Garantir que mantém o mesmo dia do mês
      const targetDay = baseDate.getDate();
      const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
      const finalDay = Math.min(targetDay, lastDayOfMonth);
      
      dueDate.setDate(finalDay);
      
      accounts.push({
        user_id: user.id,
        ...account,
        description: `${account.description} (${i + 1}/${installments})`,
        due_date: dueDate.toISOString().split('T')[0] // Formato YYYY-MM-DD
      });
    }

    const { error } = await supabase
      .from("accounts_payable")
      .insert(accounts);

    if (error) throw error;

    toast({
      title: "Sucesso",
      description: `${installments} contas recorrentes criadas`,
    });
    return true;
  } catch (error: any) {
    console.error("Erro ao criar contas recorrentes:", error);
    toast({
      title: "Erro",
      description: "Não foi possível criar as contas recorrentes",
      variant: "destructive",
    });
    return false;
  }
};
