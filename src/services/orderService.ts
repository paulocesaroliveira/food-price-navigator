
import { supabase } from "@/integrations/supabase/client";

export const createOrder = async (orderData: any, orderItems: any[]) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Generate order number
  const orderNumber = `PED-${Date.now()}`;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      ...orderData,
      user_id: user.id,
      order_number: orderNumber,
    }])
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order items
  const itemsWithOrderId = orderItems.map(item => ({
    ...item,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsWithOrderId);

  if (itemsError) throw itemsError;

  return order;
};
