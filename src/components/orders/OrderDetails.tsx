
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Order } from "@/types";
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Package, 
  DollarSign,
  MessageCircle,
  Edit,
  Truck,
  Store,
  Receipt
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/utils/calculations";
import { toast } from "@/hooks/use-toast";

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onEdit: (order: Order) => void;
  onStatusUpdate: (orderId: string, newStatus: Order["status"]) => void;
}

const statusColors = {
  "Novo": "bg-blue-500 hover:bg-blue-600",
  "Em preparo": "bg-yellow-500 hover:bg-yellow-600", 
  "Pronto": "bg-green-500 hover:bg-green-600",
  "Finalizado": "bg-purple-500 hover:bg-purple-600",
  "Cancelado": "bg-red-500 hover:bg-red-600"
};

const OrderDetails: React.FC<OrderDetailsProps> = ({ 
  order, 
  onClose, 
  onEdit, 
  onStatusUpdate 
}) => {
  const handleWhatsApp = () => {
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

  const getExpenseTypeLabel = (type: string) => {
    switch (type) {
      case 'expense': return 'Despesa';
      case 'tax': return 'Taxa';
      case 'fee': return 'Comissão';
      case 'delivery': return 'Entrega';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">{order.order_number}</h2>
            <Badge className={`${statusColors[order.status as keyof typeof statusColors]} text-white`}>
              {order.status}
            </Badge>
          </div>
          <p className="text-gray-600">
            Criado em {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onEdit(order)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          {order.customer?.phone && (
            <Button 
              variant="outline"
              onClick={handleWhatsApp}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{order.customer?.name}</span>
              </div>
              
              {order.customer?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{order.customer.phone}</span>
                </div>
              )}
              
              {order.customer?.email && (
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 text-gray-400">@</span>
                  <span>{order.customer.email}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detalhes da Entrega */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {order.delivery_type === "Entrega" ? (
                  <Truck className="h-5 w-5" />
                ) : (
                  <Store className="h-5 w-5" />
                )}
                Detalhes da Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{order.delivery_type}</span>
              </div>
              
              {order.delivery_address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <span>{order.delivery_address}</span>
                </div>
              )}
              
              {order.scheduled_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>
                    {format(new Date(order.scheduled_date), "dd/MM/yyyy", { locale: ptBR })}
                    {order.scheduled_time && ` às ${order.scheduled_time}`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Itens do Pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Itens do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.order_items && order.order_items.length > 0 ? (
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <h4 className="font-medium">{item.product?.name || "Produto não encontrado"}</h4>
                          {item.notes && (
                            <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                          )}
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Quantidade</p>
                          <p className="font-medium">{item.quantity}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-medium">{formatCurrency(item.total_price)}</p>
                          <p className="text-xs text-gray-400">
                            {formatCurrency(item.price_at_order)} cada
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">Nenhum item encontrado</p>
              )}
            </CardContent>
          </Card>

          {/* Despesas */}
          {order.order_expenses && order.order_expenses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Despesas e Taxas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.order_expenses.map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{expense.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{getExpenseTypeLabel(expense.type)}</span>
                          {expense.description && (
                            <>
                              <span>•</span>
                              <span>{expense.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="font-medium text-red-600">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Resumo e Ações */}
        <div className="space-y-6">
          {/* Resumo Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {order.order_items && (
                  <div className="flex justify-between text-sm">
                    <span>Subtotal dos Produtos:</span>
                    <span className="font-medium">
                      {formatCurrency(order.order_items.reduce((sum, item) => sum + item.total_price, 0))}
                    </span>
                  </div>
                )}
                
                {order.order_expenses && order.order_expenses.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Total de Despesas:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(order.order_expenses.reduce((sum, expense) => sum + expense.amount, 0))}
                    </span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-lg">Total do Pedido:</span>
                    <span className="font-bold text-xl text-blue-600">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alterar Status */}
          <Card>
            <CardHeader>
              <CardTitle>Alterar Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={order.status} 
                onValueChange={(value) => onStatusUpdate(order.id, value as Order["status"])}
              >
                <SelectTrigger>
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
            </CardContent>
          </Card>

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Origem:</p>
                <p className="font-medium">{order.origin === "site" ? "Site" : "Manual"}</p>
              </div>
              
              <div>
                <p className="text-gray-500">Criado em:</p>
                <p className="font-medium">
                  {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </p>
              </div>
              
              <div>
                <p className="text-gray-500">Atualizado em:</p>
                <p className="font-medium">
                  {format(new Date(order.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onClose}
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
