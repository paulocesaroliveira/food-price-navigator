
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, Users, Mail, Phone, MapPin, Edit, Eye, MessageCircle } from "lucide-react";
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

  const sendWhatsAppMessage = (phone: string, name: string) => {
    const formattedPhone = phone.replace(/\D/g, "");
    const message = `Olá ${name}! Estou entrando em contato sobre seus pedidos.`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, "_blank");
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
          <Button onClick={handleNewCustomer} className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg">
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{customers.length}</div>
            <p className="text-xs text-blue-600 mt-1">
              {customers.length > 0 ? '+' + Math.round((customers.length / 30) * 100) + '% este mês' : 'Comece cadastrando clientes'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Com Email</CardTitle>
            <Mail className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">
              {customers.filter(c => c.email).length}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {customers.length > 0 ? Math.round((customers.filter(c => c.email).length / customers.length) * 100) + '% do total' : '0%'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Com Telefone</CardTitle>
            <Phone className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">
              {customers.filter(c => c.phone).length}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              {customers.length > 0 ? Math.round((customers.filter(c => c.phone).length / customers.length) * 100) + '% do total' : '0%'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Com Endereços</CardTitle>
            <MapPin className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">
              {customers.filter(c => c.addresses && c.addresses.length > 0).length}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              {customers.length > 0 ? Math.round((customers.filter(c => c.addresses && c.addresses.length > 0).length / customers.length) * 100) + '% do total' : '0%'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button 
          onClick={handleNewCustomer} 
          className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg whitespace-nowrap"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Cliente
        </Button>
      </div>

      {/* Customer Cards */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Lista de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Carregando clientes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>Erro ao carregar clientes.</p>
              <Button onClick={() => refetch()} className="mt-4">
                Tentar Novamente
              </Button>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
              </h3>
              <p className="mb-6">
                {searchTerm 
                  ? `Nenhum cliente corresponde à busca "${searchTerm}"`
                  : "Comece adicionando seu primeiro cliente ao sistema"
                }
              </p>
              {!searchTerm && (
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg"
                  onClick={handleNewCustomer}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Cliente
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="group hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-blue-300 bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                          {customer.name}
                        </h3>
                        
                        <div className="space-y-2 mb-4">
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-3 w-3 text-blue-500" />
                              <span className="truncate">{customer.email}</span>
                            </div>
                          )}
                          
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-3 w-3 text-green-500" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-3 w-3 text-orange-500" />
                            <span>
                              {customer.addresses && customer.addresses.length > 0 
                                ? `${customer.addresses.length} endereço(s)` 
                                : 'Sem endereços'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-600 border-blue-200">
                        {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewCustomer(customer)}
                        className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCustomer(customer)}
                        className="flex-1 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      {customer.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendWhatsAppMessage(customer.phone!, customer.name)}
                          className="hover:bg-green-50 hover:border-green-300 hover:text-green-600"
                        >
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
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
