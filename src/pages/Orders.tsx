
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  ShoppingCart, 
  Filter, 
  Search, 
  RefreshCw, 
  Calendar, 
  MessageCircle, 
  Truck, 
  ClipboardList,
  ShoppingBag,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/utils/calculations";
import { Order, getOrders, filterOrders, updateOrderStatus, searchOrders } from "@/services/orderService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const statusColors = {
  "Novo": "bg-blue-500",
  "Em preparo": "bg-yellow-500",
  "Pronto": "bg-green-500",
  "Finalizado": "bg-purple-500",
  "Cancelado": "bg-red-500"
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Buscar pedidos
  const fetchOrders = async () => {
    setLoading(true);
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  };

  // Efeito inicial para carregar pedidos
  useEffect(() => {
    fetchOrders();
  }, []);

  // Aplicar filtros
  const applyFilters = async () => {
    setLoading(true);
    const filters: { status?: string; date?: string } = {};
    
    if (statusFilter !== "all") {
      filters.status = statusFilter;
    }
    
    if (dateFilter !== "all") {
      filters.date = dateFilter;
    }
    
    const filteredOrders = await filterOrders(filters);
    setOrders(filteredOrders);
    setLoading(false);
  };

  // Atualizar status do pedido
  const handleUpdateStatus = async (orderId: string, newStatus: Order["status"]) => {
    const updated = await updateOrderStatus(orderId, newStatus);
    if (updated) {
      // Atualizar o pedido na lista local
      setOrders(prev => prev.map(order => 
        order.id === orderId ? {...order, status: newStatus} : order
      ));
      
      // Se estiver visualizando os detalhes, atualizar também
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({...selectedOrder, status: newStatus});
      }
    }
  };

  // Buscar por texto
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchOrders();
      return;
    }
    
    setLoading(true);
    const results = await searchOrders(searchQuery);
    setOrders(results);
    setLoading(false);
  };

  // Executar busca após digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Mostrar detalhes do pedido
  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  // Enviar mensagem pelo WhatsApp
  const sendWhatsAppMessage = (phone: string | null, orderNumber: string) => {
    if (!phone) {
      toast({
        title: "Erro",
        description: "Cliente não possui telefone cadastrado",
        variant: "destructive"
      });
      return;
    }
    
    // Formatar o número removendo caracteres não numéricos
    const formattedPhone = phone.replace(/\D/g, "");
    
    // Criar a mensagem
    const message = `Olá! Estou entrando em contato sobre seu pedido ${orderNumber} na TastyHub.`;
    
    // Abrir o WhatsApp
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  // Formatação de data/hora
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy - HH:mm", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-poppins font-semibold">Pedidos</h1>
            <p className="text-muted-foreground">Gerencie os pedidos recebidos do site e criados manualmente.</p>
          </div>
          <Button className="bg-food-coral hover:bg-food-amber text-white">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Novo Pedido
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
                    placeholder="Buscar por cliente, número do pedido..." 
                    className="pl-8" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Novo">Novo</SelectItem>
                  <SelectItem value="Em preparo">Em preparo</SelectItem>
                  <SelectItem value="Pronto">Pronto</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <SelectValue placeholder="Data" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="yesterday">Ontem</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={applyFilters}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>Aplicar Filtros</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lista de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-food-coral" />
                <span className="ml-2">Carregando pedidos...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Nenhum pedido encontrado</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery 
                    ? "Nenhum pedido corresponde à sua busca" 
                    : "Comece criando um novo pedido ou aguarde pedidos do site"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Entrega</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{order.customer?.name}</TableCell>
                      <TableCell>{formatDateTime(order.created_at)}</TableCell>
                      <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={order.delivery_type === "Entrega" 
                          ? "bg-blue-50 text-blue-700 border-blue-200" 
                          : "bg-purple-50 text-purple-700 border-purple-200"}
                        >
                          {order.delivery_type === "Entrega" ? (
                            <Truck className="mr-1 h-3 w-3" />
                          ) : (
                            <ShoppingBag className="mr-1 h-3 w-3" />
                          )}
                          {order.delivery_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[order.status]} text-white`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => showOrderDetails(order)}
                          >
                            <ClipboardList className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => sendWhatsAppMessage(
                              order.customer?.phone || null, 
                              order.order_number
                            )}
                          >
                            <MessageCircle className="h-4 w-4" />
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

      {/* Dialog para detalhes do pedido */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Informações do Cliente</h3>
                  <div className="p-4 border rounded-md space-y-2">
                    <p><span className="font-medium">Nome:</span> {selectedOrder.customer?.name}</p>
                    <p><span className="font-medium">Telefone:</span> {selectedOrder.customer?.phone || "Não informado"}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.customer?.email || "Não informado"}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Informações do Pedido</h3>
                  <div className="p-4 border rounded-md space-y-2">
                    <p><span className="font-medium">Data:</span> {formatDateTime(selectedOrder.created_at)}</p>
                    <p><span className="font-medium">Origem:</span> {selectedOrder.origin === "site" ? "Site" : "Manual"}</p>
                    <p>
                      <span className="font-medium">Status:</span> 
                      <Badge className={`${statusColors[selectedOrder.status]} text-white ml-2`}>
                        {selectedOrder.status}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Detalhes da Entrega</h3>
                <div className="p-4 border rounded-md space-y-2">
                  <p>
                    <span className="font-medium">Tipo:</span> 
                    <Badge variant="outline" className={selectedOrder.delivery_type === "Entrega" 
                      ? "bg-blue-50 text-blue-700 border-blue-200 ml-2" 
                      : "bg-purple-50 text-purple-700 border-purple-200 ml-2"}
                    >
                      {selectedOrder.delivery_type === "Entrega" ? (
                        <Truck className="mr-1 h-3 w-3" />
                      ) : (
                        <ShoppingBag className="mr-1 h-3 w-3" />
                      )}
                      {selectedOrder.delivery_type}
                    </Badge>
                  </p>
                  {selectedOrder.delivery_type === "Entrega" && (
                    <p><span className="font-medium">Endereço:</span> {selectedOrder.delivery_address || "Não informado"}</p>
                  )}
                  {selectedOrder.scheduled_date && (
                    <p><span className="font-medium">Data agendada:</span> {selectedOrder.scheduled_date}</p>
                  )}
                  {selectedOrder.scheduled_time && (
                    <p><span className="font-medium">Horário agendado:</span> {selectedOrder.scheduled_time}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Itens do Pedido</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>Preço Un.</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.product?.name || "Produto não encontrado"}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatCurrency(item.price_at_order)}</TableCell>
                            <TableCell>{formatCurrency(item.total_price)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            Nenhum item encontrado
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                        <TableCell className="font-medium">{formatCurrency(selectedOrder.total_amount)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Observações</h3>
                  <div className="p-4 border rounded-md">
                    <p>{selectedOrder.notes}</p>
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Alterar Status</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(statusColors).map((status) => (
                    <Button 
                      key={status}
                      variant="outline"
                      size="sm"
                      className={selectedOrder.status === status ? "border-2 border-gray-900" : ""}
                      onClick={() => handleUpdateStatus(selectedOrder.id, status as Order["status"])}
                    >
                      <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white mr-2 h-2 w-2 rounded-full p-0`} />
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                {selectedOrder.customer?.phone && (
                  <Button 
                    variant="outline"
                    onClick={() => sendWhatsAppMessage(
                      selectedOrder.customer?.phone || null, 
                      selectedOrder.order_number
                    )}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Enviar WhatsApp
                  </Button>
                )}
                <Button 
                  variant="default"
                  onClick={() => setDetailsOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
