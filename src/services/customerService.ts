
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
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

export const createCustomer = async (customer: Omit<Customer, "id" | "created_at">) => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .insert([customer])
      .select();

    if (error) {
      throw error;
    }

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
