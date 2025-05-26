
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Sale, CreateSaleRequest, SaleItem, SaleExpense } from "@/types/sales";

export async function getSales() {
  try {
    const { data, error } = await supabase
      .from("sales")
      .select(`
        *,
        sale_items (
          *,
          products (
            id,
            name,
            total_cost
          )
        ),
        sale_expenses (*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Sale[];
  } catch (error: any) {
    console.error("Erro ao buscar vendas:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível carregar as vendas: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
}

export async function getSaleById(id: string) {
  try {
    const { data, error } = await supabase
      .from("sales")
      .select(`
        *,
        sale_items (
          *,
          products (
            id,
            name,
            total_cost
          )
        ),
        sale_expenses (*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Sale;
  } catch (error: any) {
    console.error("Erro ao buscar venda:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível carregar a venda: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
}

export async function createSale(saleData: CreateSaleRequest) {
  try {
    // Calcular totais dos itens
    let totalAmount = 0;
    let totalCost = 0;

    // Buscar custos dos produtos
    const productIds = saleData.items.map(item => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, total_cost")
      .in("id", productIds);

    if (productsError) throw productsError;

    const productCosts = products?.reduce((acc, product) => {
      acc[product.id] = product.total_cost;
      return acc;
    }, {} as Record<string, number>) || {};

    // Calcular totais dos itens
    const itemsWithCosts = saleData.items.map(item => {
      const itemTotalPrice = item.quantity * item.unit_price;
      const itemUnitCost = productCosts[item.product_id] || 0;
      const itemTotalCost = item.quantity * itemUnitCost;
      
      totalAmount += itemTotalPrice;
      totalCost += itemTotalCost;

      return {
        ...item,
        total_price: itemTotalPrice,
        unit_cost: itemUnitCost,
        total_cost: itemTotalCost,
      };
    });

    // Calcular total de despesas
    const totalExpenses = saleData.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

    // Calcular lucros
    const grossProfit = totalAmount - totalCost;
    const netProfit = grossProfit - totalExpenses;

    // Criar venda
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert([{
        sale_date: saleData.sale_date,
        total_amount: totalAmount,
        total_cost: totalCost,
        gross_profit: grossProfit,
        net_profit: netProfit,
        notes: saleData.notes,
      }])
      .select()
      .single();

    if (saleError) throw saleError;

    // Criar itens da venda
    if (itemsWithCosts.length > 0) {
      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(itemsWithCosts.map(item => ({
          sale_id: sale.id,
          ...item,
        })));

      if (itemsError) throw itemsError;
    }

    // Criar despesas da venda
    if (saleData.expenses && saleData.expenses.length > 0) {
      const { error: expensesError } = await supabase
        .from("sale_expenses")
        .insert(saleData.expenses.map(expense => ({
          sale_id: sale.id,
          ...expense,
        })));

      if (expensesError) throw expensesError;
    }

    toast({
      title: "Venda criada",
      description: `Venda ${sale.sale_number} foi criada com sucesso`,
    });

    return sale;
  } catch (error: any) {
    console.error("Erro ao criar venda:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível criar a venda: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
}

export async function deleteSale(id: string) {
  try {
    const { error } = await supabase
      .from("sales")
      .delete()
      .eq("id", id);

    if (error) throw error;

    toast({
      title: "Venda excluída",
      description: "A venda foi excluída com sucesso",
    });

    return true;
  } catch (error: any) {
    console.error("Erro ao excluir venda:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível excluir a venda: ${error.message}`,
      variant: "destructive",
    });
    return false;
  }
}
