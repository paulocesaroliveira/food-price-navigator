
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
