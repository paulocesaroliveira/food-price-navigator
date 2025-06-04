
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

    console.log("=== INÍCIO DA BUSCA DE CONTAS ===");
    console.log("Usuário ID:", user.id);
    console.log("Filtros recebidos:", filters);

    let query = supabase
      .from("accounts_payable")
      .select(`
        *,
        category:expense_categories(*)
      `)
      .eq("user_id", user.id);

    // Aplicar filtros apenas se não forem vazios ou "all"
    if (filters.status && filters.status !== "all" && filters.status !== "") {
      console.log("Aplicando filtro de status:", filters.status);
      if (filters.status === "overdue") {
        // Para contas vencidas, buscar contas pendentes com data de vencimento passada
        query = query
          .eq("status", "pending")
          .lt("due_date", new Date().toISOString().split('T')[0]);
      } else {
        query = query.eq("status", filters.status);
      }
    }

    if (filters.category && filters.category !== "all" && filters.category !== "") {
      console.log("Aplicando filtro de categoria:", filters.category);
      query = query.eq("category_id", filters.category);
    }

    if (filters.startDate) {
      console.log("Aplicando filtro de data inicial:", filters.startDate);
      query = query.gte("due_date", filters.startDate);
    }

    if (filters.endDate) {
      console.log("Aplicando filtro de data final:", filters.endDate);
      query = query.lte("due_date", filters.endDate);
    }

    if (filters.supplier) {
      console.log("Aplicando filtro de fornecedor:", filters.supplier);
      query = query.ilike("supplier", `%${filters.supplier}%`);
    }

    // Adicionar ordenação
    query = query.order("due_date", { ascending: true });

    console.log("Executando consulta...");
    const { data, error } = await query;

    if (error) {
      console.error("Erro na consulta de contas a pagar:", error);
      throw error;
    }
    
    console.log("Dados brutos retornados:", data);
    console.log("Número de registros encontrados:", data?.length || 0);
    
    if (!data || data.length === 0) {
      console.log("=== NENHUMA CONTA ENCONTRADA ===");
      console.log("Vamos verificar se existem contas sem filtros...");
      
      // Fazer uma busca sem filtros para verificar se existem contas
      const { data: allData, error: allError } = await supabase
        .from("accounts_payable")
        .select("*")
        .eq("user_id", user.id);
      
      console.log("Total de contas no banco para este usuário:", allData?.length || 0);
      if (allData && allData.length > 0) {
        console.log("Primeiras 3 contas encontradas:", allData.slice(0, 3));
      }
    }
    
    const mappedData = (data || []).map(account => ({
      ...account,
      status: account.status as 'pending' | 'paid' | 'overdue' | 'cancelled',
      payment_method: account.payment_method as 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'check' | undefined
    }));
    
    console.log("Dados mapeados:", mappedData);
    console.log("=== FIM DA BUSCA DE CONTAS ===");
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

    console.log("=== CRIANDO NOVA CONTA ===");
    console.log("Usuário ID:", user.id);
    console.log("Dados da conta:", account);

    // Preparar os dados de forma mais limpa
    const accountData: any = {
      description: account.description,
      amount: account.amount,
      due_date: account.due_date,
      supplier: account.supplier || null,
      notes: account.notes || null,
      status: account.status || 'pending',
      user_id: user.id
    };

    // Só adicionar category_id se tiver valor válido (não vazio, não "none", não undefined)
    if (account.category_id && account.category_id !== "none" && account.category_id !== "") {
      accountData.category_id = account.category_id;
    }

    // Só adicionar payment_method se tiver valor válido (não vazio, não "none", não undefined)
    if (account.payment_method && account.payment_method !== "none" && account.payment_method !== "") {
      accountData.payment_method = account.payment_method;
    }

    // Só adicionar payment_date se tiver valor
    if (account.payment_date) {
      accountData.payment_date = account.payment_date;
    }

    // Só adicionar attachment_url se tiver valor
    if (account.attachment_url) {
      accountData.attachment_url = account.attachment_url;
    }

    console.log("Dados finais para inserção:", accountData);

    const { data, error } = await supabase
      .from("accounts_payable")
      .insert([accountData])
      .select();

    if (error) {
      console.error("Erro do Supabase:", error);
      throw error;
    }

    console.log("Conta criada com sucesso:", data);
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

    console.log("=== CRIANDO CONTAS RECORRENTES ===");
    console.log("Número de parcelas:", installments);
    console.log("Mês base:", baseMonth);

    // Limitamos o número de parcelas para evitar o erro de stack depth
    if (installments > 48) {
      throw new Error('Número máximo de parcelas é 48');
    }

    const baseDate = new Date(baseMonth + '-01');
    const accounts = [];

    for (let i = 0; i < installments; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      const accountData: any = {
        description: `${account.description} (${i + 1}/${installments})`,
        amount: account.amount,
        due_date: dueDate.toISOString().split('T')[0],
        supplier: account.supplier || null,
        notes: account.notes || null,
        status: account.status || 'pending',
        user_id: user.id
      };

      // Só adicionar category_id se tiver valor válido (não vazio, não "none", não undefined)
      if (account.category_id && account.category_id !== "none" && account.category_id !== "") {
        accountData.category_id = account.category_id;
      }

      // Só adicionar payment_method se tiver valor válido (não vazio, não "none", não undefined)
      if (account.payment_method && account.payment_method !== "none" && account.payment_method !== "") {
        accountData.payment_method = account.payment_method;
      }

      accounts.push(accountData);
    }

    console.log("Contas a serem criadas:", accounts);

    const { data, error } = await supabase
      .from("accounts_payable")
      .insert(accounts)
      .select();

    if (error) {
      console.error("Erro do Supabase:", error);
      throw error;
    }

    console.log("Contas recorrentes criadas:", data);
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
