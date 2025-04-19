
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types";
import { toast } from "@/hooks/use-toast";

export const getCustomerList = async (): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao buscar clientes:", error);
      throw error;
    }

    // Ensure we cast origin correctly to the limited string types expected by Customer
    return (data || []).map(item => ({
      ...item,
      origin: (item.origin === "site" ? "site" : "manual") as "site" | "manual"
    }));
  } catch (error: any) {
    console.error("Erro ao buscar clientes:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível carregar os clientes: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

// Alias for getCustomers (to maintain compatibility with existing code)
export const getCustomers = getCustomerList;

export const createCustomer = async (customer: Omit<Customer, "id" | "created_at" | "updated_at">): Promise<Customer> => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .insert({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        address1: customer.address1,
        address2: customer.address2,
        notes: customer.notes,
        origin: customer.origin || "manual"
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar cliente:", error);
      throw error;
    }

    toast({
      title: "Sucesso",
      description: "Cliente criado com sucesso!",
    });
    
    // Ensure we cast origin correctly
    return {
      ...data,
      origin: (data.origin === "site" ? "site" : "manual") as "site" | "manual"
    };
  } catch (error: any) {
    console.error("Erro ao criar cliente:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível criar o cliente: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const updateCustomer = async (id: string, customer: Partial<Omit<Customer, "id" | "created_at" | "updated_at">>): Promise<Customer> => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .update({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        address1: customer.address1,
        address2: customer.address2,
        notes: customer.notes,
        origin: customer.origin
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar cliente:", error);
      throw error;
    }

    toast({
      title: "Sucesso",
      description: "Cliente atualizado com sucesso!",
    });
    
    // Ensure we cast origin correctly
    return {
      ...data,
      origin: (data.origin === "site" ? "site" : "manual") as "site" | "manual"
    };
  } catch (error: any) {
    console.error("Erro ao atualizar cliente:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível atualizar o cliente: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const deleteCustomer = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao excluir cliente:", error);
      throw error;
    }

    toast({
      title: "Sucesso",
      description: "Cliente excluído com sucesso!",
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
};

export const searchCustomers = async (query: string): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao buscar clientes:", error);
      throw error;
    }

    // Ensure we cast origin correctly
    return (data || []).map(item => ({
      ...item,
      origin: (item.origin === "site" ? "site" : "manual") as "site" | "manual"
    }));
  } catch (error: any) {
    console.error("Erro ao buscar clientes:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível realizar a busca: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};
