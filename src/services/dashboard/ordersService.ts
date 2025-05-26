
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { RecentOrder } from "./types";

export async function getRecentOrders(): Promise<RecentOrder[]> {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        customer:customers(name)
      `)
      .order("created_at", { ascending: false })
      .limit(4);

    if (error) throw error;

    return orders?.map(order => ({
      id: order.order_number,
      customer: order.customer?.name || 'Cliente não encontrado',
      value: order.total_amount,
      status: order.status,
      time: new Date(order.created_at).toLocaleString('pt-BR')
    })) || [];

  } catch (error: any) {
    console.error("Erro ao buscar pedidos recentes:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível carregar pedidos recentes: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
}
