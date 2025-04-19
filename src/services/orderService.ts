// Import the required modules and types
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderItem } from "@/types";
import { toast } from "@/hooks/use-toast";

// Create a new order
export const createOrder = async (
  orderData: Omit<Order, "id" | "order_number" | "created_at" | "updated_at">, 
  orderItems: Omit<OrderItem, "id" | "order_id" | "created_at">[]
): Promise<Order> => {
  try {
    // Insert the order first
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

    return order;
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
