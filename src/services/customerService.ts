
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  // Added fields to match how they're used in Customers.tsx
  updated_at?: string;
  address1?: string | null;
  address2?: string | null;
  notes?: string | null;
  origin?: "site" | "manual";
}

export const getCustomerList = async (): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name");

    if (error) {
      console.error("Erro ao buscar clientes:", error);
      throw error;
    }

    return data || [];
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

// Alias for getCustomerList for compatibility
export const getCustomers = getCustomerList;

export const createCustomer = async (customer: Omit<Customer, "id" | "created_at">) => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .insert([{
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address || customer.address1,
        // Include other fields being used
        notes: customer.notes,
        origin: customer.origin || "manual"
      }])
      .select();

    if (error) {
      throw error;
    }

    toast({
      title: "Sucesso",
      description: "Cliente criado com sucesso!",
    });
    
    return data[0];
  } catch (error: any) {
    console.error("Erro ao criar cliente:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível criar o cliente: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

export const updateCustomer = async (id: string, customer: Omit<Customer, "id" | "created_at">) => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .update({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address || customer.address1,
        notes: customer.notes,
        origin: customer.origin
      })
      .eq("id", id)
      .select();

    if (error) {
      throw error;
    }

    toast({
      title: "Sucesso",
      description: "Cliente atualizado com sucesso!",
    });

    return data[0];
  } catch (error: any) {
    console.error("Erro ao atualizar cliente:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível atualizar o cliente: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

export const deleteCustomer = async (id: string): Promise<boolean> => {
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
      .order("name");

    if (error) {
      throw error;
    }

    return data || [];
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
