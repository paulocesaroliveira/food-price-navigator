
import { supabase } from "@/integrations/supabase/client";
import { Customer, CustomerAddress, CreateCustomerRequest, CreateCustomerAddressRequest } from "@/types/customers";
import { toast } from "@/hooks/use-toast";

export const getCustomerList = async (): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select(`
        *,
        customer_addresses (*)
      `)
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao buscar clientes:", error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      addresses: item.customer_addresses || []
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

export const getCustomers = getCustomerList;

export const createCustomer = async (customer: CreateCustomerRequest): Promise<Customer> => {
  try {
    const { data: customerData, error: customerError } = await supabase
      .from("customers")
      .insert({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        notes: customer.notes
      })
      .select()
      .single();

    if (customerError) {
      console.error("Erro ao criar cliente:", customerError);
      throw customerError;
    }

    // Criar endereços se fornecidos
    if (customer.addresses && customer.addresses.length > 0) {
      const addressesData = customer.addresses.map(address => ({
        customer_id: customerData.id,
        label: address.label,
        address: address.address,
        is_primary: address.is_primary
      }));

      const { error: addressError } = await supabase
        .from("customer_addresses")
        .insert(addressesData);

      if (addressError) {
        console.error("Erro ao criar endereços:", addressError);
        // Não falha se der erro nos endereços, apenas loga
      }
    }

    toast({
      title: "Sucesso",
      description: "Cliente criado com sucesso!",
    });
    
    // Buscar o cliente completo com endereços
    const completeCustomer = await getCustomerById(customerData.id);
    return completeCustomer || customerData;
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

export const getCustomerById = async (id: string): Promise<Customer | null> => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select(`
        *,
        customer_addresses (*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    return {
      ...data,
      addresses: data.customer_addresses || []
    };
  } catch (error: any) {
    console.error("Erro ao buscar cliente:", error.message);
    return null;
  }
};

export const updateCustomer = async (id: string, customer: Partial<CreateCustomerRequest>): Promise<Customer> => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .update({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        notes: customer.notes
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar cliente:", error);
      throw error;
    }

    // Se houver endereços para atualizar, remove os existentes e cria novos
    if (customer.addresses) {
      // Remove endereços existentes
      await supabase
        .from("customer_addresses")
        .delete()
        .eq("customer_id", id);

      // Cria novos endereços
      if (customer.addresses.length > 0) {
        const addressesData = customer.addresses.map(address => ({
          customer_id: id,
          label: address.label,
          address: address.address,
          is_primary: address.is_primary
        }));

        await supabase
          .from("customer_addresses")
          .insert(addressesData);
      }
    }

    toast({
      title: "Sucesso",
      description: "Cliente atualizado com sucesso!",
    });
    
    // Buscar o cliente completo com endereços
    const completeCustomer = await getCustomerById(id);
    return completeCustomer || data;
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
      .select(`
        *,
        customer_addresses (*)
      `)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao buscar clientes:", error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      addresses: item.customer_addresses || []
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
