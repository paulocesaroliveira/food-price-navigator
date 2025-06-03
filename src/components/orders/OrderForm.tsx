import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { createOrder } from "@/services/orderService";
import { getCustomerList, getCustomerById } from "@/services/customerService";
import { getProductList } from "@/services/productService";
import { Order, Customer, Product, OrderItem } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CalendarIcon, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Receipt, 
  User,
  MapPin,
  Clock,
  Package,
  CreditCard,
  Printer
} from "lucide-react";
import { formatCurrency } from "@/utils/calculations";
import { toast } from "@/hooks/use-toast";

interface OrderFormProps {
  order?: Order | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface OrderItemInput {
  product_id: string;
  quantity: number;
  price_at_order: number;
  total_price: number;
  notes: string | null;
}

interface OrderExpenseInput {
  name: string;
  amount: number;
  type: 'expense' | 'tax' | 'fee' | 'delivery';
  description?: string;
}

const OrderForm: React.FC<OrderFormProps> = ({ order, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    customer_id: "",
    delivery_type: "Entrega" as "Entrega" | "Retirada",
    delivery_address: "",
    scheduled_date: "",
    scheduled_time: "",
    notes: "",
    status: "Novo" as "Novo" | "Em preparo" | "Pronto" | "Finalizado" | "Cancelado",
    origin: "manual" as "manual",
    payment_method: "dinheiro" as "dinheiro" | "pix" | "cartao_credito" | "cartao_debito" | "transferencia",
    payment_status: "pending" as "pending" | "paid" | "overdue" | "cancelled"
  });

  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([]);
  const [orderExpenses, setOrderExpenses] = useState<OrderExpenseInput[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomerList
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProductList
  });

  // Buscar endereços do cliente quando selecionado
  useEffect(() => {
    const fetchCustomerAddresses = async () => {
      if (formData.customer_id) {
        try {
          const customer = await getCustomerById(formData.customer_id);
          if (customer) {
            setSelectedCustomer(customer);
            setCustomerAddresses(customer.addresses || []);
            
            // Se só tem um endereço, seleciona automaticamente
            if (customer.addresses && customer.addresses.length === 1) {
              setFormData(prev => ({
                ...prev,
                delivery_address: customer.addresses[0].address
              }));
            }
            // Se tem endereço primário, seleciona ele
            else if (customer.addresses && customer.addresses.length > 0) {
              const primaryAddress = customer.addresses.find(addr => addr.is_primary);
              if (primaryAddress) {
                setFormData(prev => ({
                  ...prev,
                  delivery_address: primaryAddress.address
                }));
              }
            }
          }
        } catch (error) {
          console.error("Erro ao buscar dados do cliente:", error);
        }
      } else {
        setSelectedCustomer(null);
        setCustomerAddresses([]);
      }
    };

    fetchCustomerAddresses();
  }, [formData.customer_id]);

  const addOrderItem = () => {
    setOrderItems([...orderItems, {
      product_id: "",
      quantity: 1,
      price_at_order: 0,
      total_price: 0,
      notes: null
    }]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, field: keyof OrderItemInput, value: any) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'price_at_order') {
      updatedItems[index].total_price = updatedItems[index].quantity * updatedItems[index].price_at_order;
    }
    
    setOrderItems(updatedItems);
  };

  const addOrderExpense = () => {
    setOrderExpenses([...orderExpenses, {
      name: "",
      amount: 0,
      type: "expense",
      description: ""
    }]);
  };

  const removeOrderExpense = (index: number) => {
    setOrderExpenses(orderExpenses.filter((_, i) => i !== index));
  };

  const updateOrderExpense = (index: number, field: keyof OrderExpenseInput, value: any) => {
    const updatedExpenses = [...orderExpenses];
    updatedExpenses[index] = { ...updatedExpenses[index], [field]: value };
    setOrderExpenses(updatedExpenses);
  };

  const getTotalItems = () => {
    return orderItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const getTotalExpenses = () => {
    return orderExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getTotalAmount = () => {
    return getTotalItems() + getTotalExpenses();
  };

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_id) {
      toast({
        title: "Erro",
        description: "Selecione um cliente",
        variant: "destructive"
      });
      return;
    }

    if (orderItems.length === 0) {
      toast({
        title: "Erro", 
        description: "Adicione pelo menos um produto",
        variant: "destructive"
      });
      return;
    }

    const invalidItems = orderItems.some(item => !item.product_id || item.quantity <= 0 || item.price_at_order <= 0);
    if (invalidItems) {
      toast({
        title: "Erro",
        description: "Verifique se todos os produtos têm quantidade e preço válidos",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        ...formData,
        scheduled_date: scheduledDate ? format(scheduledDate, "yyyy-MM-dd") : null,
        total_amount: getTotalAmount()
      };

      const createdOrder = await createOrder(orderPayload, orderItems);
      
      if (orderExpenses.length > 0) {
        console.log("Despesas a serem criadas:", orderExpenses);
      }

      toast({
        title: "Sucesso",
        description: `Pedido ${createdOrder.order_number} criado com sucesso!`
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Não foi possível criar o pedido: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintOrder = () => {
    // Implementação básica para impressão
    const printContent = `
      Resumo do Pedido
      ================
      
      Cliente: ${selectedCustomer?.name || 'N/A'}
      Tipo: ${formData.delivery_type}
      ${formData.delivery_address ? `Endereço: ${formData.delivery_address}` : ''}
      
      Produtos:
      ${orderItems.map(item => {
        const product = getProductById(item.product_id);
        return `- ${product?.name || 'N/A'} x${item.quantity} = ${formatCurrency(item.total_price)}`;
      }).join('\n')}
      
      ${orderExpenses.length > 0 ? `\nDespesas:\n${orderExpenses.map(exp => `- ${exp.name}: ${formatCurrency(exp.amount)}`).join('\n')}` : ''}
      
      Forma de Pagamento: ${formData.payment_method}
      Status Pagamento: ${formData.payment_status}
      
      Total: ${formatCurrency(getTotalAmount())}
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<pre>${printContent}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Básicas */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer_id">Cliente *</Label>
                <Select value={formData.customer_id} onValueChange={(value) => setFormData({...formData, customer_id: value, delivery_address: ""})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex flex-col">
                          <span>{customer.name}</span>
                          {customer.phone && (
                            <span className="text-sm text-gray-500">{customer.phone}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delivery_type">Tipo de Entrega</Label>
                  <Select value={formData.delivery_type} onValueChange={(value) => setFormData({...formData, delivery_type: value as "Entrega" | "Retirada"})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entrega">Entrega</SelectItem>
                      <SelectItem value="Retirada">Retirada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as "Novo" | "Em preparo" | "Pronto" | "Finalizado" | "Cancelado"})}>
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
                </div>
              </div>

              {formData.delivery_type === "Entrega" && (
                <div className="space-y-3">
                  {customerAddresses.length > 0 && (
                    <div>
                      <Label htmlFor="saved_address">Endereços Salvos</Label>
                      <Select value={formData.delivery_address} onValueChange={(value) => setFormData({...formData, delivery_address: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um endereço salvo" />
                        </SelectTrigger>
                        <SelectContent>
                          {customerAddresses.map((address) => (
                            <SelectItem key={address.id} value={address.address}>
                              <div className="flex flex-col">
                                <span className="font-medium">{address.label}</span>
                                <span className="text-sm text-gray-500">{address.address}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="delivery_address">
                      {customerAddresses.length > 0 ? "Ou digite um endereço personalizado" : "Endereço de Entrega"}
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="delivery_address"
                        value={formData.delivery_address}
                        onChange={(e) => setFormData({...formData, delivery_address: e.target.value})}
                        placeholder="Endereço completo para entrega"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Data Agendada</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !scheduledDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate ? format(scheduledDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="scheduled_time">Horário Agendado</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="scheduled_time"
                      type="time"
                      value={formData.scheduled_time}
                      onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Observações sobre o pedido..."
                  rows={3}
                />
              </div>

              {/* Campos de Pagamento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_method">Forma de Pagamento</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Select value={formData.payment_method} onValueChange={(value) => setFormData({...formData, payment_method: value as any})}>
                      <SelectTrigger className="pl-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                        <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="payment_status">Status do Pagamento</Label>
                  <Select value={formData.payment_status} onValueChange={(value) => setFormData({...formData, payment_status: value as "pending" | "paid" | "overdue" | "cancelled"})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="overdue">Vencido</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Produtos */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produtos do Pedido
                </CardTitle>
                <Button type="button" onClick={addOrderItem} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Produto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {orderItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum produto adicionado</p>
                  <p className="text-sm">Clique em "Adicionar Produto" para começar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-2">
                          <Label>Produto</Label>
                          <Select 
                            value={item.product_id} 
                            onValueChange={(value) => {
                              const product = getProductById(value);
                              updateOrderItem(index, 'product_id', value);
                              if (product?.calculatedPrice) {
                                updateOrderItem(index, 'price_at_order', product.calculatedPrice);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um produto" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  <div className="flex flex-col">
                                    <span>{product.name}</span>
                                    {product.calculatedPrice && (
                                      <span className="text-sm text-gray-500">
                                        {formatCurrency(product.calculatedPrice)}
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Quantidade</Label>
                          <Input 
                            type="number" 
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        
                        <div>
                          <Label>Preço Unitário</Label>
                          <Input 
                            type="number" 
                            min="0"
                            step="0.01"
                            value={item.price_at_order}
                            onChange={(e) => updateOrderItem(index, 'price_at_order', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeOrderItem(index)}
                            className="w-full text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Total do Item</Label>
                          <Input 
                            value={formatCurrency(item.total_price)}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        
                        <div>
                          <Label>Observações do Item</Label>
                          <Input 
                            value={item.notes || ""}
                            onChange={(e) => updateOrderItem(index, 'notes', e.target.value || null)}
                            placeholder="Observações específicas do item"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Despesas e Taxas */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Despesas e Taxas
                </CardTitle>
                <Button type="button" onClick={addOrderExpense} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Despesa
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {orderExpenses.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Receipt className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p>Nenhuma despesa adicionada</p>
                  <p className="text-sm">Adicione taxas de entrega, comissões, etc.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderExpenses.map((expense, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <Label>Nome</Label>
                          <Input 
                            value={expense.name}
                            onChange={(e) => updateOrderExpense(index, 'name', e.target.value)}
                            placeholder="Ex: Taxa de entrega"
                          />
                        </div>
                        
                        <div>
                          <Label>Tipo</Label>
                          <Select 
                            value={expense.type} 
                            onValueChange={(value) => updateOrderExpense(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="expense">Despesa</SelectItem>
                              <SelectItem value="tax">Taxa</SelectItem>
                              <SelectItem value="fee">Comissão</SelectItem>
                              <SelectItem value="delivery">Entrega</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Valor</Label>
                          <Input 
                            type="number" 
                            min="0"
                            step="0.01"
                            value={expense.amount}
                            onChange={(e) => updateOrderExpense(index, 'amount', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div>
                          <Label>Descrição</Label>
                          <Input 
                            value={expense.description || ""}
                            onChange={(e) => updateOrderExpense(index, 'description', e.target.value)}
                            placeholder="Opcional"
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeOrderExpense(index)}
                            className="w-full text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumo */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal dos Produtos:</span>
                  <span className="font-medium">{formatCurrency(getTotalItems())}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Total de Despesas:</span>
                  <span className="font-medium text-red-600">{formatCurrency(getTotalExpenses())}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-lg">Total:</span>
                    <span className="font-bold text-xl text-blue-600">{formatCurrency(getTotalAmount())}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Forma de Pagamento:</span>
                    <span className="font-medium capitalize">{formData.payment_method.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Status:</span>
                    <span className={`font-medium ${formData.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                      {formData.payment_status === 'paid' ? 'Pago' : formData.payment_status === 'pending' ? 'Pendente' : formData.payment_status === 'overdue' ? 'Vencido' : 'Cancelado'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting || orderItems.length === 0}
                >
                  {isSubmitting ? "Salvando..." : order ? "Atualizar Pedido" : "Criar Pedido"}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handlePrintOrder}
                  disabled={orderItems.length === 0}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir Resumo
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
};

export default OrderForm;
