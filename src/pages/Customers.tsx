
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Filter, Download, Phone, Mail, ShoppingBag, Edit, Eye, Loader2, Plus, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Customer, getCustomers, createCustomer, updateCustomer, deleteCustomer, searchCustomers } from "@/services/customerService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [originFilter, setOriginFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const form = useForm<Omit<Customer, "id" | "created_at" | "updated_at">>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address1: "",
      address2: "",
      notes: "",
      origin: "manual"
    }
  });

  // Buscar clientes
  const fetchCustomers = async () => {
    setLoading(true);
    const data = await getCustomers();
    setCustomers(data);
    setLoading(false);
  };

  // Efeito inicial para carregar clientes
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Efeito para atualizar o formulário ao editar
  useEffect(() => {
    if (editingCustomer) {
      form.reset({
        name: editingCustomer.name,
        email: editingCustomer.email,
        phone: editingCustomer.phone,
        address1: editingCustomer.address1,
        address2: editingCustomer.address2,
        notes: editingCustomer.notes,
        origin: editingCustomer.origin
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        address1: "",
        address2: "",
        notes: "",
        origin: "manual"
      });
    }
  }, [editingCustomer, form]);

  // Filtragem por origem
  useEffect(() => {
    if (originFilter !== "all") {
      const filtered = customers.filter(customer => 
        customer.origin === originFilter
      );
      setCustomers(filtered);
    } else {
      fetchCustomers();
    }
  }, [originFilter]);

  // Busca por texto
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery) {
        const results = await searchCustomers(searchQuery);
        setCustomers(results);
      } else {
        fetchCustomers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Abrir diálogo para adicionar/editar cliente
  const openCustomerDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
    } else {
      setEditingCustomer(null);
    }
    setDialogOpen(true);
  };

  // Abrir diálogo para visualizar detalhes
  const openDetailsDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  // Abrir diálogo para confirmar exclusão
  const openDeleteDialog = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  // Salvar cliente (novo ou editado)
  const onSubmit = async (data: Omit<Customer, "id" | "created_at" | "updated_at">) => {
    if (editingCustomer) {
      const updated = await updateCustomer(editingCustomer.id, data);
      if (updated) {
        setCustomers(prev => prev.map(c => 
          c.id === editingCustomer.id ? updated : c
        ));
        setDialogOpen(false);
      }
    } else {
      const created = await createCustomer(data);
      if (created) {
        setCustomers(prev => [created, ...prev]);
        setDialogOpen(false);
      }
    }
  };

  // Excluir cliente
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

  // Exportar lista de clientes
  const exportCustomers = () => {
    // Criar um CSV com os dados dos clientes
    const headers = ["Nome", "Email", "Telefone", "Endereço 1", "Endereço 2", "Origem", "Notas"];
    const csvRows = [
      headers.join(','),
      ...customers.map(customer => [
        `"${customer.name}"`,
        `"${customer.email || ''}"`,
        `"${customer.phone || ''}"`,
        `"${customer.address1 || ''}"`,
        `"${customer.address2 || ''}"`,
        `"${customer.origin === 'site' ? 'Site' : 'Manual'}"`,
        `"${customer.notes || ''}"`
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Criar um link para download
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

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-poppins font-semibold">Clientes</h1>
            <p className="text-muted-foreground">Gerenciamento dos clientes cadastrados.</p>
          </div>
          <Button 
            className="bg-food-coral hover:bg-food-amber text-white"
            onClick={() => openCustomerDialog()}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por nome, email ou telefone..." 
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={originFilter} onValueChange={setOriginFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Origem" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="site">Site</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={exportCustomers}
              >
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-food-coral" />
                <span className="ml-2">Carregando clientes...</span>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Nenhum cliente encontrado</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery 
                    ? "Nenhum cliente corresponde à sua busca" 
                    : "Comece adicionando seu primeiro cliente"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          {customer.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{customer.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={customer.origin === 'site' 
                          ? "bg-green-100 text-green-800 hover:bg-green-200" 
                          : "bg-blue-100 text-blue-800 hover:bg-blue-200"}
                        >
                          {customer.origin === 'site' ? '🟢 Site' : '🔵 Manual'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => openDetailsDialog(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => openCustomerDialog(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => openDeleteDialog(customer)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo para adicionar/editar cliente */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            <DialogDescription>
              {editingCustomer 
                ? "Atualize as informações do cliente abaixo."
                : "Preencha as informações do novo cliente."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome*</Label>
              <Input 
                id="name" 
                placeholder="Nome completo"
                required
                {...form.register("name", { required: true })}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input 
                  id="phone" 
                  placeholder="(00) 00000-0000"
                  {...form.register("phone")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="email@exemplo.com"
                  {...form.register("email")}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address1">Endereço 1</Label>
              <Input 
                id="address1" 
                placeholder="Endereço principal"
                {...form.register("address1")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address2">Endereço 2</Label>
              <Input 
                id="address2" 
                placeholder="Endereço alternativo"
                {...form.register("address2")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea 
                id="notes" 
                placeholder="Observações sobre o cliente"
                {...form.register("notes")}
                rows={3}
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingCustomer ? "Salvar Alterações" : "Criar Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar detalhes do cliente */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{selectedCustomer.name}</h2>
                <Badge className={selectedCustomer.origin === 'site' 
                  ? "bg-green-100 text-green-800 hover:bg-green-200" 
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"}
                >
                  {selectedCustomer.origin === 'site' ? '🟢 Site' : '🔵 Manual'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground">Contato</Label>
                    <div className="mt-1">
                      {selectedCustomer.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedCustomer.phone}</span>
                        </div>
                      )}
                      {selectedCustomer.email && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedCustomer.email}</span>
                        </div>
                      )}
                      {!selectedCustomer.phone && !selectedCustomer.email && (
                        <p className="text-sm text-muted-foreground">Nenhum contato informado</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Criado em</Label>
                  <p className="mt-1">{new Date(selectedCustomer.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Endereços</Label>
                <div className="mt-1 space-y-2">
                  {selectedCustomer.address1 && (
                    <div className="p-2 border rounded-md">
                      <p className="text-sm font-medium">Endereço Principal</p>
                      <p className="text-sm">{selectedCustomer.address1}</p>
                    </div>
                  )}
                  {selectedCustomer.address2 && (
                    <div className="p-2 border rounded-md">
                      <p className="text-sm font-medium">Endereço Alternativo</p>
                      <p className="text-sm">{selectedCustomer.address2}</p>
                    </div>
                  )}
                  {!selectedCustomer.address1 && !selectedCustomer.address2 && (
                    <p className="text-sm text-muted-foreground">Nenhum endereço informado</p>
                  )}
                </div>
              </div>
              
              {selectedCustomer.notes && (
                <div>
                  <Label className="text-muted-foreground">Observações</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <p className="text-sm">{selectedCustomer.notes}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => openCustomerDialog(selectedCustomer)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                {selectedCustomer.phone && (
                  <Button 
                    variant="default"
                    onClick={() => {
                      const formattedPhone = selectedCustomer.phone?.replace(/\D/g, "");
                      window.open(`https://wa.me/${formattedPhone}`, "_blank");
                    }}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Contatar
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AlertDialog para confirmar exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente "{customerToDelete?.name}"?
              Esta ação não pode ser desfeita.
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
