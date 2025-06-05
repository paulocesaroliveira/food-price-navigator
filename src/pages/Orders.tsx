
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Package, 
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingCart
} from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/calculations";
import { PageHeader } from "@/components/shared/PageHeader";

// Mock data - replace with actual data fetching
const mockOrders = [
  {
    id: "1",
    orderNumber: "PED-001",
    customerName: "João Silva",
    status: "pending",
    totalAmount: 150.00,
    createdAt: "2024-01-15",
    deliveryDate: "2024-01-20",
    items: 3
  },
  {
    id: "2",
    orderNumber: "PED-002",
    customerName: "Maria Santos",
    status: "confirmed",
    totalAmount: 320.50,
    createdAt: "2024-01-16",
    deliveryDate: "2024-01-22",
    items: 5
  },
  {
    id: "3",
    orderNumber: "PED-003",
    customerName: "Pedro Costa",
    status: "delivered",
    totalAmount: 89.90,
    createdAt: "2024-01-10",
    deliveryDate: "2024-01-15",
    items: 2
  }
];

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders] = useState(mockOrders);

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'confirmed': return CheckCircle;
      case 'delivered': return Package;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Pedidos"
        subtitle="Gerencie pedidos e acompanhe entregas"
        icon={ShoppingCart}
        gradient="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500"
        badges={[
          { icon: ShoppingCart, text: `${totalOrders} pedidos` },
          { icon: Clock, text: `${pendingOrders} pendentes` },
          { icon: DollarSign, text: `Receita: ${formatCurrency(totalRevenue)}` }
        ]}
        actions={
          <Button
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Pedido
          </Button>
        }
      />

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{totalOrders}</div>
            <p className="text-xs text-blue-600">Pedidos cadastrados</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Pedidos Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{pendingOrders}</div>
            <p className="text-xs text-yellow-600">Aguardando processamento</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-green-600">Valor total dos pedidos</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Ticket Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{formatCurrency(averageOrderValue)}</div>
            <p className="text-xs text-purple-600">Valor médio por pedido</p>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <Input
          placeholder="Buscar por número do pedido ou cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-sm"
        />
      </div>

      {/* Lista de Pedidos */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Lista de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Tente alterar os termos de busca" : "Comece criando seu primeiro pedido"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead>Data Entrega</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                            <StatusIcon className="h-3 w-3" />
                            {getStatusText(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.items} itens</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>{formatDate(order.deliveryDate)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
