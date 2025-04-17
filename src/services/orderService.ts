
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Customer } from "./customerService";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_order: number;
  total_price: number;
  notes: string | null;
  created_at: string;
  product?: {
    name: string;
  };
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: "Novo" | "Em preparo" | "Pronto" | "Finalizado" | "Cancelado";
  delivery_type: "Entrega" | "Retirada";
  delivery_address: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  total_amount: number;
  notes: string | null;
  origin: "site" | "manual";
  created_at: string;
  updated_at: string;
  customer?: Customer;
  items?: OrderItem[];
}

export async function getOrders() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        customer:customers(*),
        items:order_items(*, product:products(name))
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data as Order[];
  } catch (error: any) {
    console.error("Erro ao buscar pedidos:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível carregar os pedidos: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
}

export async function getOrderById(id: string) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        customer:customers(*),
        items:order_items(*, product:products(name))
      `)
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return data as Order;
  } catch (error: any) {
    console.error("Erro ao buscar pedido:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível carregar o pedido: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
}

export async function createOrder(
  order: Omit<Order, "id" | "order_number" | "created_at" | "updated_at">,
  items: Omit<OrderItem, "id" | "order_id" | "created_at">[]
) {
  try {
    // Inserir o pedido
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([order])
      .select();

    if (orderError) {
      throw orderError;
    }

    const newOrder = orderData[0] as Order;

    // Inserir os itens do pedido
    if (items.length > 0) {
      const itemsWithOrderId = items.map(item => ({
        ...item,
        order_id: newOrder.id
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsWithOrderId);

      if (itemsError) {
        throw itemsError;
      }
    }

    toast({
      title: "Sucesso",
      description: "Pedido criado com sucesso",
    });

    return newOrder;
  } catch (error: any) {
    console.error("Erro ao criar pedido:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível criar o pedido: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) {
      throw error;
    }

    toast({
      title: "Sucesso",
      description: `Status atualizado para ${status}`,
    });

    return data[0] as Order;
  } catch (error: any) {
    console.error("Erro ao atualizar status:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível atualizar o status: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
}

export async function filterOrders(filters: { status?: string; date?: string }) {
  try {
    let query = supabase
      .from("orders")
      .select(`
        *,
        customer:customers(*),
        items:order_items(*, product:products(name))
      `);

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters.date) {
      const now = new Date();
      let startDate, endDate;

      switch (filters.date) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
          endDate = new Date(now.setHours(23, 59, 59, 999)).toISOString();
          query = query.gte("created_at", startDate).lte("created_at", endDate);
          break;
        case "yesterday":
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          startDate = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
          endDate = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();
          query = query.gte("created_at", startDate).lte("created_at", endDate);
          break;
        case "week":
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          query = query.gte("created_at", lastWeek.toISOString());
          break;
        case "month":
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          query = query.gte("created_at", lastMonth.toISOString());
          break;
        // Implementação de datas personalizadas poderia ser adicionada aqui
      }
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data as Order[];
  } catch (error: any) {
    console.error("Erro ao filtrar pedidos:", error.message);
    toast({
      title: "Erro",
      description: `Erro ao filtrar pedidos: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
}

export async function searchOrders(query: string) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        customer:customers(*),
        items:order_items(*, product:products(name))
      `)
      .or(`order_number.ilike.%${query}%,customers.name.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data as Order[];
  } catch (error: any) {
    console.error("Erro na busca de pedidos:", error.message);
    toast({
      title: "Erro",
      description: `Erro na busca: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
}
