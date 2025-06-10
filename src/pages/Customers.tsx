
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Users, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchCustomers } from "@/services/customerService";
import CustomerForm from "@/components/customers/CustomerForm";
import CustomerDetails from "@/components/customers/CustomerDetails";
import PageHeader from "@/components/shared/PageHeader";

const Customers = () => {
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

  const { data: customers = [], isLoading: isLoadingCustomers, refetch: refetchCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  });

  const handleCustomerSuccess = () => {
    setIsCustomerDialogOpen(false);
    setSelectedCustomer(null);
    setIsEditMode(false);
    refetchCustomers();
    toast({
      title: isEditMode ? "Cliente atualizado" : "Cliente criado",
      description: `O cliente foi ${isEditMode ? 'atualizado' : 'criado'} com sucesso.`,
    });
  };

  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsEditMode(true);
    setIsCustomerDialogOpen(true);
  };

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsEditMode(false);
  };

  const filteredCustomers = customers.filter(customer => 
    !searchTerm || 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const totalCustomers = customers.length;
  const customersWithEmail = customers.filter(c => c.email).length;
  const customersWithPhone = customers.filter(c => c.phone).length;

  if (isLoadingCustomers) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gerencie sua base de clientes"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Email</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersWithEmail}</div>
            <p className="text-xs text-muted-foreground">
              {totalCustomers > 0 ? Math.round((customersWithEmail / totalCustomers) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Telefone</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersWithPhone}</div>
            <p className="text-xs text-muted-foreground">
              {totalCustomers > 0 ? Math.round((customersWithPhone / totalCustomers) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isCustomerDialogOpen} onOpenChange={(open) => {
          setIsCustomerDialogOpen(open);
          if (!open) {
            setSelectedCustomer(null);
            setIsEditMode(false);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Editar' : 'Novo'} Cliente</DialogTitle>
            </DialogHeader>
            <CustomerForm
              onSuccess={handleCustomerSuccess}
              onCancel={() => setIsCustomerDialogOpen(false)}
              customer={selectedCustomer}
              isEditMode={isEditMode}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {customers.length === 0 ? "Nenhum cliente cadastrado ainda." : "Nenhum cliente encontrado com os filtros aplicados."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => (
                <div 
                  key={customer.id} 
                  className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleViewCustomer(customer)}
                >
                  <div className="space-y-2">
                    <div className="font-medium">{customer.name}</div>
                    {customer.email && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {customer.email}
                      </div>
                    )}
                    {customer.phone && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    )}
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCustomer(customer);
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCustomer && !isEditMode && (
        <Dialog open={!!selectedCustomer && !isEditMode} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Cliente</DialogTitle>
            </DialogHeader>
            <CustomerDetails
              customer={selectedCustomer}
              onEdit={() => {
                setIsEditMode(true);
                setIsCustomerDialogOpen(true);
              }}
              onClose={() => setSelectedCustomer(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Customers;
