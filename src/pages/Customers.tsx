
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import CustomerForm from "@/components/customers/CustomerForm";
import CustomerDetails from "@/components/customers/CustomerDetails";
import { getCustomerList } from "@/services/customerService";
import { Customer } from "@/types";

const Customers = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

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

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      // deleteCustomer(id); // Implementar a função deleteCustomer
    }
  };

  const handleFormSubmit = () => {
    refetch();
    setShowForm(false);
  };

  const handleCloseDetails = () => {
    setSelectedCustomer(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  if (selectedCustomer) {
    return (
      <CustomerDetails
        customer={selectedCustomer}
        onEdit={() => handleEditCustomer(selectedCustomer)}
        onClose={handleCloseDetails}
      />
    );
  }

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
            <div
              key={customer.id}
              className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleViewCustomer(customer)}
            >
              <h3 className="font-medium">{customer.name}</h3>
              <p className="text-sm text-gray-500">{customer.email}</p>
              <p className="text-sm text-gray-500">{customer.phone}</p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCustomer(customer);
                  }}
                >
                  Editar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal do formulário */}
      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onSave={handleFormSubmit}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
};

export default Customers;
