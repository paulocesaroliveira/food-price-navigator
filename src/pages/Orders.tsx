
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrders, updateOrderStatus } from "@/services/orderService";
import { Order } from "@/types";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  MapPin,
  Phone,
  Package,
  DollarSign,
  User,
  Truck,
  Store,
  Eye,
  Edit,
  MessageCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/utils/calculations";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import OrderForm from "@/components/orders/OrderForm";
import OrderDetails from "@/components/orders/OrderDetails";

const statusColors = {
  "Novo": "bg-blue-500 hover:bg-blue-600",
  "Em preparo": "bg-yellow-500 hover:bg-yellow-600", 
  "Pronto": "bg-green-500 hover:bg-green-600",
  "Finalizado": "bg-purple-500 hover:bg-purple-600",
  "Cancelado": "bg-red-500 hover:bg-red-600"
};

const statusIcons = {
  "Novo": Package,
  "Em preparo": Clock,
  "Pronto": Package,
  "Finalizado": Package,
  "Cancelado": Package
};

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [dateFilter, setDateFilter] = useState<string>("todos");
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "todos" || order.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== "todos") {
      const orderDate = new Date(order.created_at);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (dateFilter) {
        case "hoje":
          matchesDate = orderDate >= today;
          break;
        case "ontem":
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          matchesDate = orderDate >= yesterday && orderDate < today;
          break;
        case "semana":
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = orderDate >= weekAgo;
          break;
        case "mes":
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          matchesDate = orderDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleStatusUpdate = async (orderId: string, newStatus: Order["status"]) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Status atualizado",
        description: `Pedido atualizado para ${newStatus}`,
      });
    }
  };

  const handleOrderSuccess = () => {
    setShowForm(false);
    setEditingOrder(null);
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  const handleWhatsApp = (order: Order) => {
    if (!order.customer?.phone) {
      toast({
        title: "Telefone não encontrado",
        description: "Cliente não possui telefone cadastrado",
        variant: "destructive"
      });
      return;
    }
    
    const phone = order.customer.phone.replace(/\D/g, "");
    const message = `Olá ${order.customer.name}! Estou entrando em contato sobre seu pedido ${order.order_number}.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const getTotalSales = () => {
    return orders.reduce((sum, order) => sum + order.total_amount, 0);
  };

  const getTodayOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orders.filter(order => new Date(order.created_at) >= today);
  };

  const getPendingOrders = () => {
    return orders.filter(order => ["Novo", "Em preparo"].includes(order.status));
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pedidos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie todos os pedidos recebidos
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Novo Pedido
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total em Vendas</p>
                <p className="text-2xl font-bold">{formatCurrency(getTotalSales())}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Pedidos Hoje</p>
                <p className="text-2xl font-bold">{getTodayOrders().length}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Pendentes</p>
                <p className="text-2xl font-bold">{getPendingOrders().length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total de Pedidos</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <Package className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Buscar por número, cliente ou telefone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="Novo">Novo</SelectItem>
                <SelectItem value="Em preparo">Em preparo</SelectItem>
                <SelectItem value="Pronto">Pronto</SelectItem>
                <SelectItem value="Finalizado">Finalizado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Períodos</SelectItem>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="ontem">Ontem</SelectItem>
                <SelectItem value="semana">Esta semana</SelectItem>
                <SelectItem value="mes">Este mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
              <p className="text-gray-500">
                {searchTerm ? "Nenhum pedido corresponde à sua busca" : "Comece criando um novo pedido"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const StatusIcon = statusIcons[order.status as keyof typeof statusIcons];
            return (
              <Card key={order.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {order.order_number}
                        </h3>
                        <Badge className={`${statusColors[order.status as keyof typeof statusColors]} text-white`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {order.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {order.customer?.name}
                          </span>
                        </div>

                        {order.customer?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {order.customer.phone}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {order.delivery_type === "Entrega" ? (
                            <Truck className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Store className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-gray-600 dark:text-gray-400">
                            {order.delivery_type}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(order.total_amount)}
                          </span>
                        </div>
                      </div>

                      {order.delivery_address && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {order.delivery_address}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detalhes
                      </Button>

                      {order.customer?.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWhatsApp(order)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
                      )}

                      <Select value={order.status} onValueChange={(value) => handleStatusUpdate(order.id, value as Order["status"])}>
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Novo">Novo</SelectItem>
                          <SelectItem value="Em preparo">Em preparo</SelectItem>
                          <SelectItem value="Pronto">Pronto</SelectItem>
                          <SelectItem value="Finalizado">Finalizado</SelectItem>
                          <SelectItem value="Cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOrder ? `Editar Pedido ${editingOrder.order_number}` : "Novo Pedido"}
            </DialogTitle>
            <DialogDescription>
              {editingOrder ? "Edite as informações do pedido" : "Crie um novo pedido preenchendo as informações abaixo"}
            </DialogDescription>
          </DialogHeader>
          <OrderForm
            order={editingOrder}
            onSuccess={handleOrderSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingOrder(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      {selectedOrder && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Pedido {selectedOrder.order_number}</DialogTitle>
            </DialogHeader>
            <OrderDetails
              order={selectedOrder}
              onClose={() => {
                setShowDetails(false);
                setSelectedOrder(null);
              }}
              onEdit={(order) => {
                setEditingOrder(order);
                setShowDetails(false);
                setShowForm(true);
              }}
              onStatusUpdate={handleStatusUpdate}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Orders;
