import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { CustomerDetails } from "@/components/customers/CustomerDetails";
import { getCustomerList } from "@/services/customerService";
import { Customer } from "@/types";

const Customers = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { data: customers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomerList
  });

  const handleNewCustomer = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      // deleteCustomer(id); // Implementar a função deleteCustomer
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus clientes e informações de contato
          </p>
        </div>
        <Button onClick={handleNewCustomer} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Lista de Clientes */}
      {isLoading ? (
        <p>Carregando clientes...</p>
      ) : error ? (
        <p>Erro ao carregar clientes.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <CustomerDetails
              key={customer.id}
              customer={customer}
              onEdit={() => handleEditCustomer(customer)}
              onDelete={() => handleDeleteCustomer(customer.id)}
            />
          ))}
        </div>
      )}

      {/* Modal do formulário */}
      <CustomerForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={() => {}}
        editingCustomer={editingCustomer}
      />
    </div>
  );
};

export default Customers;
