
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Download, Phone, Mail, MapPin, Edit, Eye, Trash2, Loader2, Users, UserCheck } from "lucide-react";
import { getCustomerList, deleteCustomer, searchCustomers } from "@/services/customerService";
import { Customer } from "@/types/customers";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import CustomerForm from "@/components/customers/CustomerForm";
import CustomerDetails from "@/components/customers/CustomerDetails";
import { PageHeader } from "@/components/shared/PageHeader";

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    const data = await getCustomerList();
    setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery) {
        setLoading(true);
        const results = await searchCustomers(searchQuery);
        setCustomers(results);
        setLoading(false);
      } else {
        fetchCustomers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const openCustomerForm = (customer?: Customer) => {
    setEditingCustomer(customer || null);
    setFormOpen(true);
  };

  const openDetailsDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  const openDeleteDialog = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleCustomerSaved = () => {
    fetchCustomers();
    setFormOpen(false);
    setEditingCustomer(null);
  };

  const confirmDelete = async () => {
    if (customerToDelete) {
      const success = await deleteCustomer(customerToDelete.id);
      if (success) {
        setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
      }
    }
  };

  const exportCustomers = () => {
    const headers = ["Nome", "Email", "Telefone", "Endereços", "Notas"];
    const csvRows = [
      headers.join(','),
      ...customers.map(customer => [
        `"${customer.name}"`,
        `"${customer.email || ''}"`,
        `"${customer.phone || ''}"`,
        `"${customer.addresses?.map(addr => `${addr.label}: ${addr.address}`).join('; ') || ''}"`,
        `"${customer.notes || ''}"`
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportação concluída",
      description: `${customers.length} clientes exportados com sucesso.`
    });
  };

  const getPrimaryAddress = (customer: Customer) => {
    return customer.addresses?.find(addr => addr.is_primary)?.address || 
           customer.addresses?.[0]?.address || 
           "Nenhum endereço";
  };

  // Calculate stats
  const totalCustomers = customers.length;
  const customersWithEmail = customers.filter(c => c.email).length;
  const customersWithPhone = customers.filter(c => c.phone).length;
  const totalAddresses = customers.reduce((sum, customer) => sum + (customer.addresses?.length || 0), 0);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Clientes"
        subtitle="Gerencie seus clientes e endereços de entrega"
        icon={Users}
        gradient="bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500"
        badges={[
          { icon: Users, text: `${totalCustomers} clientes` },
          { icon: Mail, text: `${customersWithEmail} com email` },
          { icon: MapPin, text: `${totalAddresses} endereços` }
        ]}
        actions={
          <>
            <Button 
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full sm:w-auto"
              onClick={exportCustomers}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
            <Button
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full sm:w-auto"
              onClick={() => openCustomerForm()}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </>
        }
      />

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{totalCustomers}</div>
            <p className="text-xs text-blue-600">Clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Com Email</CardTitle>
            <Mail className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{customersWithEmail}</div>
            <p className="text-xs text-green-600">Clientes com email</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Com Telefone</CardTitle>
            <Phone className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{customersWithPhone}</div>
            <p className="text-xs text-purple-600">Clientes com telefone</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Total Endereços</CardTitle>
            <MapPin className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{totalAddresses}</div>
            <p className="text-xs text-orange-600">Endereços cadastrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <Input
          placeholder="Buscar por nome, email ou telefone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>

      {/* Lista de Clientes */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Lista de Clientes ({customers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Carregando clientes...</span>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-xl font-semibold text-muted-foreground">Nenhum cliente encontrado</h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery 
                  ? "Nenhum cliente corresponde à sua busca" 
                  : "Comece adicionando seu primeiro cliente"}
              </p>
              {!searchQuery && (
                <Button 
                  className="mt-4 btn-gradient"
                  onClick={() => openCustomerForm()}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar Cliente
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {customers.map((customer) => (
                <Card key={customer.id} className="border border-border hover:border-primary/50 transition-colors card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-foreground">{customer.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {customer.addresses?.length || 0} endereço(s)
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {customer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-primary" />
                              <span className="text-muted-foreground">{customer.phone}</span>
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-primary" />
                              <span className="text-muted-foreground">{customer.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground truncate">
                              {getPrimaryAddress(customer)}
                            </span>
                          </div>
                        </div>
                        
                        {customer.notes && (
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                            {customer.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => openDetailsDialog(customer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-amber-50 hover:text-amber-600"
                          onClick={() => openCustomerForm(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          onClick={() => openDeleteDialog(customer)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog do Formulário */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <CustomerForm 
            customer={editingCustomer}
            onSave={handleCustomerSaved}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <CustomerDetails 
              customer={selectedCustomer}
              onEdit={() => {
                setDetailsOpen(false);
                openCustomerForm(selectedCustomer);
              }}
              onClose={() => setDetailsOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente "{customerToDelete?.name}"?
              Esta ação não pode ser desfeita e todos os endereços associados também serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomersPage;
