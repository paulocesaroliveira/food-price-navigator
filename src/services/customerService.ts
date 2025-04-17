
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address1: string | null;
  address2: string | null;
  notes: string | null;
  origin: "site" | "manual";
  created_at: string;
  updated_at: string;
}

export async function getCustomers() {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data as Customer[];
  } catch (error: any) {
    console.error("Erro ao buscar clientes:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível carregar os clientes: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
}

export async function getCustomerById(id: string) {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return data as Customer;
  } catch (error: any) {
    console.error("Erro ao buscar cliente:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível carregar o cliente: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
}

export async function createCustomer(customer: Omit<Customer, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase
      .from("customers")
      .insert([customer])
      .select();

    if (error) {
      throw error;
    }

    toast({
      title: "Sucesso",
      description: "Cliente criado com sucesso",
    });

    return data[0] as Customer;
  } catch (error: any) {
    console.error("Erro ao criar cliente:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível criar o cliente: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
}

export async function updateCustomer(id: string, customer: Partial<Omit<Customer, "id" | "created_at" | "updated_at">>) {
  try {
    const { data, error } = await supabase
      .from("customers")
      .update(customer)
      .eq("id", id)
      .select();

    if (error) {
      throw error;
    }

    toast({
      title: "Sucesso",
      description: "Cliente atualizado com sucesso",
    });

    return data[0] as Customer;
  } catch (error: any) {
    console.error("Erro ao atualizar cliente:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível atualizar o cliente: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
}

export async function deleteCustomer(id: string) {
  try {
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    toast({
      title: "Sucesso",
      description: "Cliente excluído com sucesso",
    });

    return true;
  } catch (error: any) {
    console.error("Erro ao excluir cliente:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível excluir o cliente: ${error.message}`,
      variant: "destructive",
    });
    return false;
  }
}

export async function searchCustomers(query: string) {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data as Customer[];
  } catch (error: any) {
    console.error("Erro na busca de clientes:", error.message);
    toast({
      title: "Erro",
      description: `Erro na busca: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
}
