
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, Calendar, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { fetchOrders } from "@/services/orderService";
import { fetchCustomers } from "@/services/customerService";
import OrderForm from "@/components/orders/OrderForm";
import OrderDetails from "@/components/orders/OrderDetails";
import PageHeader from "@/components/shared/PageHeader";

const Orders = () => {
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast();

  const { data: orders = [], isLoading: isLoadingOrders, refetch: refetchOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  });

  const handleOrderSuccess = () => {
    setIsOrderDialogOpen(false);
    refetchOrders();
    toast({
      title: "Pedido criado",
      description: "O pedido foi criado com sucesso.",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'confirmed': return 'secondary';
      case 'in_production': return 'outline';
      case 'ready': return 'default';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'in_production': return 'Em Produção';
      case 'ready': return 'Pronto';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filteredOrders = orders.filter(order => {
    const customer = customers.find(c => c.id === order.customer_id);
    const matchesSearch = !searchTerm || 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalValue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);

  if (isLoadingOrders) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        description="Gerencie todos os seus pedidos e acompanhe o status"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por número ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="in_production">Em Produção</SelectItem>
              <SelectItem value="ready">Pronto</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Pedido</DialogTitle>
            </DialogHeader>
            <OrderForm
              customers={customers}
              onSuccess={handleOrderSuccess}
              onCancel={() => setIsOrderDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {orders.length === 0 ? "Nenhum pedido registrado ainda." : "Nenhum pedido encontrado com os filtros aplicados."}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const customer = customers.find(c => c.id === order.customer_id);
                return (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.order_number}</span>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {customer?.name || 'Cliente não encontrado'}
                      </div>
                      {order.scheduled_date && (
                        <div className="text-sm text-muted-foreground">
                          Agendado para: {formatDate(order.scheduled_date)}
                          {order.scheduled_time && ` às ${order.scheduled_time}`}
                        </div>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-medium">{formatCurrency(Number(order.total_amount))}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Pedido</DialogTitle>
            </DialogHeader>
            <OrderDetails
              order={selectedOrder}
              customer={customers.find(c => c.id === selectedOrder.customer_id)}
              onClose={() => setSelectedOrder(null)}
              onUpdate={refetchOrders}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Orders;
