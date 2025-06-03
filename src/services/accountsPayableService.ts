
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { AccountPayable, ExpenseCategory, AccountsPayableFilters } from "@/types/accountsPayable";

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    console.log("Buscando categorias para o usuário:", user.id);

    const { data, error } = await supabase
      .from("expense_categories")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) {
      console.error("Erro na consulta de categorias:", error);
      throw error;
    }
    
    console.log("Categorias encontradas:", data);
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
    if (!user) {
      console.error('Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    console.log("Buscando contas a pagar para o usuário:", user.id);
    console.log("Filtros aplicados:", filters);

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

    console.log("Executando consulta...");
    const { data, error } = await query;

    if (error) {
      console.error("Erro na consulta de contas a pagar:", error);
      throw error;
    }
    
    console.log("Dados brutos retornados:", data);
    console.log("Número de registros encontrados:", data?.length || 0);
    
    const mappedData = (data || []).map(account => ({
      ...account,
      status: account.status as 'pending' | 'paid' | 'overdue' | 'cancelled',
      payment_method: account.payment_method as 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'check' | undefined
    }));
    
    console.log("Dados mapeados:", mappedData);
    return mappedData;
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

    const accountData = {
      description: account.description,
      amount: account.amount,
      due_date: account.due_date,
      category_id: account.category_id,
      supplier: account.supplier,
      notes: account.notes,
      status: account.status || 'pending',
      payment_method: account.payment_method,
      payment_date: account.payment_date,
      attachment_url: account.attachment_url,
      user_id: user.id
    };

    const { error } = await supabase
      .from("accounts_payable")
      .insert([accountData]);

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

export async function createRecurringAccountsPayable(
  account: Omit<AccountPayable, 'id' | 'created_at' | 'updated_at' | 'user_id'>,
  installments: number,
  baseMonth: string
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Limitamos o número de parcelas para evitar o erro de stack depth
    if (installments > 48) {
      throw new Error('Número máximo de parcelas é 48');
    }

    const baseDate = new Date(baseMonth);
    const accounts = [];

    for (let i = 0; i < installments; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      const accountData = {
        description: `${account.description} (${i + 1}/${installments})`,
        amount: account.amount,
        due_date: dueDate.toISOString().split('T')[0],
        category_id: account.category_id,
        supplier: account.supplier,
        notes: account.notes,
        status: account.status || 'pending',
        payment_method: account.payment_method,
        user_id: user.id
      };

      accounts.push(accountData);
    }

    const { error } = await supabase
      .from("accounts_payable")
      .insert(accounts);

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    toast({
      title: "Sucesso",
      description: `${installments} contas recorrentes criadas com sucesso`,
    });
    return true;
  } catch (error: any) {
    console.error("Erro ao criar contas recorrentes:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível criar as contas recorrentes: ${error.message}`,
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
