
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, Users, Mail, Phone, MapPin, Edit, Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import CustomerForm from "@/components/customers/CustomerForm";
import CustomerDetails from "@/components/customers/CustomerDetails";
import { getCustomerList } from "@/services/customerService";
import { Customer } from "@/types";

const Customers = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomerList
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

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

  const handleFormSubmit = () => {
    refetch();
    setShowForm(false);
    setEditingCustomer(null);
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
        onClose={() => setSelectedCustomer(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        subtitle="Gerencie seus clientes e informações de contato"
        icon={Users}
        gradient="from-blue-500 to-cyan-600"
        actions={
          <Button onClick={handleNewCustomer} className="btn-gradient">
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.email).length}
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Telefone</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.phone).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 input-focus"
        />
      </div>

      {/* Lista de Clientes */}
      <Card className="custom-card">
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando clientes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Erro ao carregar clientes.</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>
                {searchTerm ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda."}
              </p>
              {!searchTerm && (
                <Button 
                  className="mt-4 btn-gradient"
                  onClick={handleNewCustomer}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Cliente
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{customer.name}</h3>
                        
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                        )}
                        
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        )}
                        
                        {customer.addresses && customer.addresses.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {customer.addresses.length} endereço(s)
                          </div>
                        )}
                      </div>
                      
                      <Badge variant="secondary" className="ml-2">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </Badge>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCustomer(customer);
                        }}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCustomer(customer);
                        }}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal do formulário */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <CustomerForm
            customer={editingCustomer}
            onSave={handleFormSubmit}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
