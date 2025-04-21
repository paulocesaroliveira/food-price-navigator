import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Customer } from "@/types";

export interface WebsiteSettings {
  id: string;
  name: string;
  domain: string | null;
  subdomain: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  description: string | null;
  is_active: boolean;
  contact_whatsapp: string | null;
  contact_instagram: string | null;
  contact_facebook: string | null;
  store_address: string | null;
  created_at: string;
  updated_at: string;
  accepted_payment_methods?: string[];
}

export interface PublishedProduct {
  id: string;
  product_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  is_featured: boolean;
  category: string | null;
  tags: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderData {
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
    address?: string | null;
    origin: "site" | "manual";
  };
  order: {
    delivery_type: "Entrega" | "Retirada";
    delivery_address: string | null;
    scheduled_date: string | null;
    scheduled_time: string | null;
    total_amount: number;
    notes: string | null;
    origin: "site" | "manual";
    status: "Novo" | "Em preparo" | "Pronto" | "Finalizado" | "Cancelado";
    payment_method?: string | null;
  };
  items: Array<{
    product_id: string;
    quantity: number;
    price_at_order: number;
    total_price: number;
    notes: string | null;
  }>;
}

export async function getWebsiteSettings() {
  try {
    const { data, error } = await supabase
      .from("website_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 é o código para "nenhum registro encontrado"
      throw error;
    }

    return data as WebsiteSettings || null;
  } catch (error: any) {
    console.error("Erro ao buscar configurações do site:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível carregar as configurações do site: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
}

export async function saveWebsiteSettings(settings: Omit<WebsiteSettings, "id" | "created_at" | "updated_at">) {
  try {
    // Verificar se já existe uma configuração
    const existingSettings = await getWebsiteSettings();

    let response;
    if (existingSettings) {
      // Atualizar configuração existente
      const { data, error } = await supabase
        .from("website_settings")
        .update(settings)
        .eq("id", existingSettings.id)
        .select();

      if (error) throw error;
      response = data[0];
    } else {
      // Criar nova configuração
      const { data, error } = await supabase
        .from("website_settings")
        .insert([settings])
        .select();

      if (error) throw error;
      response = data[0];
    }

    toast({
      title: "Sucesso",
      description: "Configurações do site salvas com sucesso",
    });

    return response as WebsiteSettings;
  } catch (error: any) {
    console.error("Erro ao salvar configurações do site:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível salvar as configurações: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
}

export async function getPublishedProducts() {
  try {
    const { data, error } = await supabase
      .from("published_products")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data as PublishedProduct[];
  } catch (error: any) {
    console.error("Erro ao buscar produtos publicados:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível carregar os produtos publicados: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
}

export async function publishProduct(product: Omit<PublishedProduct, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase
      .from("published_products")
      .insert([product])
      .select();

    if (error) {
      throw error;
    }

    toast({
      title: "Sucesso",
      description: "Produto publicado com sucesso",
    });

    return data[0] as PublishedProduct;
  } catch (error: any) {
    console.error("Erro ao publicar produto:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível publicar o produto: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
}

export async function unpublishProduct(id: string) {
  try {
    const { error } = await supabase
      .from("published_products")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    toast({
      title: "Sucesso",
      description: "Produto removido do site com sucesso",
    });

    return true;
  } catch (error: any) {
    console.error("Erro ao remover produto do site:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível remover o produto: ${error.message}`,
      variant: "destructive",
    });
    return false;
  }
}

export async function submitOrder(orderData: OrderData) {
  try {
    // 1. Create or update customer
    let customerId;
    
    // Check if customer exists by email or phone
    const customerIdentifier = orderData.customer.email || orderData.customer.phone;
    let existingCustomer = null;
    
    if (customerIdentifier) {
      const { data: customers } = await supabase
        .from("customers")
        .select("*")
        .or(`email.eq.${orderData.customer.email || ""},phone.eq.${orderData.customer.phone || ""}`)
        .limit(1);
      
      if (customers && customers.length > 0) {
        existingCustomer = customers[0];
      }
    }
    
    if (existingCustomer) {
      // Update existing customer
      const { data: updatedCustomer, error: customerUpdateError } = await supabase
        .from("customers")
        .update({
          name: orderData.customer.name,
          email: orderData.customer.email,
          phone: orderData.customer.phone,
          address: orderData.customer.address,
          origin: orderData.customer.origin
        })
        .eq("id", existingCustomer.id)
        .select()
        .single();
      
      if (customerUpdateError) throw customerUpdateError;
      customerId = updatedCustomer.id;
    } else {
      // Create new customer
      const { data: newCustomer, error: customerCreateError } = await supabase
        .from("customers")
        .insert({
          name: orderData.customer.name,
          email: orderData.customer.email,
          phone: orderData.customer.phone,
          address: orderData.customer.address,
          origin: orderData.customer.origin
        })
        .select()
        .single();
      
      if (customerCreateError) throw customerCreateError;
      customerId = newCustomer.id;
    }
    
    // 2. Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        delivery_type: orderData.order.delivery_type,
        delivery_address: orderData.order.delivery_address,
        scheduled_date: orderData.order.scheduled_date,
        scheduled_time: orderData.order.scheduled_time,
        total_amount: orderData.order.total_amount,
        notes: orderData.order.notes,
        status: orderData.order.status,
        origin: orderData.order.origin,
        payment_method: orderData.order.payment_method,
        order_number: '' // This will be auto-generated by the database trigger
      })
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // 3. Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_order: item.price_at_order,
      total_price: item.total_price,
      notes: item.notes
    }));
    
    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems);
    
    if (orderItemsError) throw orderItemsError;
    
    return {
      success: true,
      order_id: order.id,
      order_number: order.order_number
    };
  } catch (error: any) {
    console.error("Erro ao enviar pedido:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível enviar o pedido: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
}

export async function getWebsiteByDomain(domain: string) {
  try {
    const { data, error } = await supabase
      .from("website_settings")
      .select("*")
      .or(`domain.eq.${domain},subdomain.eq.${domain}`)
      .eq("is_active", true)
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") { // No rows found
        return null;
      }
      throw error;
    }

    return data as WebsiteSettings;
  } catch (error: any) {
    console.error("Erro ao buscar site por domínio:", error.message);
    return null;
  }
}
