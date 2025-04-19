
// Import the required modules and types
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderItem } from "@/types";
import { toast } from "@/hooks/use-toast";

// Get all orders with their customer data
export const getOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        customer:customers(id, name, email, phone),
        items:order_items(
          *,
          product:products(name)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar pedidos:", error);
      toast({
        title: "Erro",
        description: `Não foi possível carregar os pedidos: ${error.message}`,
        variant: "destructive",
      });
      return [];
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
};

// Filter orders by status and date
export const filterOrders = async (
  filters: { status?: string; date?: string }
): Promise<Order[]> => {
  try {
    let query = supabase
      .from("orders")
      .select(`
        *,
        customer:customers(id, name, email, phone),
        items:order_items(
          *,
          product:products(name)
        )
      `);

    // Apply status filter
    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    // Apply date filter
    if (filters.date) {
      const now = new Date();
      let startDate: Date;

      switch (filters.date) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          query = query.gte("created_at", startDate.toISOString());
          break;
        case "yesterday":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          query = query
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString());
          break;
        case "week":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          query = query.gte("created_at", startDate.toISOString());
          break;
        case "month":
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 1);
          query = query.gte("created_at", startDate.toISOString());
          break;
      }
    }

    // Complete the query and order by creation date
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao filtrar pedidos:", error);
      toast({
        title: "Erro",
        description: `Não foi possível filtrar os pedidos: ${error.message}`,
        variant: "destructive",
      });
      return [];
    }

    return data as Order[];
  } catch (error: any) {
    console.error("Erro ao filtrar pedidos:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível filtrar os pedidos: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

// Search orders by text
export const searchOrders = async (searchQuery: string): Promise<Order[]> => {
  try {
    // Search in order number, customer name, or customer email
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        customer:customers(id, name, email, phone),
        items:order_items(
          *,
          product:products(name)
        )
      `)
      .or(`order_number.ilike.%${searchQuery}%,customer.name.ilike.%${searchQuery}%,customer.email.ilike.%${searchQuery}%`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar pedidos:", error);
      toast({
        title: "Erro",
        description: `Não foi possível buscar os pedidos: ${error.message}`,
        variant: "destructive",
      });
      return [];
    }

    return data as Order[];
  } catch (error: any) {
    console.error("Erro ao buscar pedidos:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível buscar os pedidos: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

// Update order status
export const updateOrderStatus = async (
  orderId: string, 
  newStatus: Order["status"]
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      console.error("Erro ao atualizar status do pedido:", error);
      toast({
        title: "Erro",
        description: `Não foi possível atualizar o status: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Sucesso",
      description: `Status do pedido atualizado para ${newStatus}`,
    });
    return true;
  } catch (error: any) {
    console.error("Erro ao atualizar status do pedido:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível atualizar o status: ${error.message}`,
      variant: "destructive",
    });
    return false;
  }
};

// Create a new order
export const createOrder = async (
  orderData: Omit<Order, "id" | "order_number" | "created_at" | "updated_at">, 
  orderItems: Omit<OrderItem, "id" | "order_id" | "created_at">[]
): Promise<Order> => {
  try {
    // Insert the order first - we're not providing order_number as it's auto-generated by a DB trigger
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: orderData.customer_id,
        status: orderData.status || "Novo",
        delivery_type: orderData.delivery_type,
        delivery_address: orderData.delivery_address,
        scheduled_date: orderData.scheduled_date,
        scheduled_time: orderData.scheduled_time,
        total_amount: orderData.total_amount,
        notes: orderData.notes,
        origin: orderData.origin || "manual"
      })
      .select()
      .single();

    if (orderError) {
      console.error("Erro ao criar pedido:", orderError);
      throw orderError;
    }

    // Insert the order items
    const itemsWithOrderId = orderItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_order: item.price_at_order,
      total_price: item.total_price,
      notes: item.notes || null // Make notes nullable
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsWithOrderId);

    if (itemsError) {
      console.error("Erro ao adicionar itens ao pedido:", itemsError);
      throw itemsError;
    }

    toast({
      title: "Sucesso",
      description: `Pedido ${order.order_number} criado com sucesso!`,
    });

    return order as Order;
  } catch (error: any) {
    console.error("Erro ao criar pedido:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível criar o pedido: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};
