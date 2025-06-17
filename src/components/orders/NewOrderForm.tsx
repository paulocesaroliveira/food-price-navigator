
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createOrder } from "@/services/orderService";
import { getCustomerList } from "@/services/customerService";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/calculations";
import CustomerAddressSelector from "./CustomerAddressSelector";

interface NewOrderFormProps {
  onOrderCreated: () => void;
  onCancel: () => void;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  total: number;
  productName?: string;
}

const NewOrderForm: React.FC<NewOrderFormProps> = ({ onOrderCreated, onCancel }) => {
  const [customerId, setCustomerId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([
    { productId: "", quantity: 1, price: 0, total: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomerList
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('products')
        .select('id, name, selling_price')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  useEffect(() => {
    if (customerId) {
      const customer = customers.find(c => c.id === customerId);
      setSelectedCustomer(customer);
      setDeliveryAddress("");
    } else {
      setSelectedCustomer(null);
      setDeliveryAddress("");
    }
  }, [customerId, customers]);

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1, price: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].price = product.selling_price || 0;
        newItems[index].productName = product.name;
      }
    }
    
    if (field === 'quantity' || field === 'price') {
      newItems[index].total = newItems[index].quantity * newItems[index].price;
    }
    
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId || items.some(item => !item.productId || item.quantity <= 0)) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (deliveryType === "delivery" && !deliveryAddress) {
      toast({
        title: "Erro",
        description: "Selecione um endereço de entrega",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customer_id: customerId,
        delivery_type: deliveryType,
        delivery_address: deliveryType === "delivery" ? deliveryAddress : null,
        scheduled_date: scheduledDate || null,
        scheduled_time: scheduledTime || null,
        total_amount: totalAmount,
        notes,
        status: "Novo",
        origin: "Manual"
      };

      const orderItems = items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        price_at_order: item.price,
        total_price: item.total
      }));

      await createOrder(orderData, orderItems);
      
      toast({
        title: "Sucesso!",
        description: "Pedido criado com sucesso"
      });
      
      onOrderCreated();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Cliente *</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryType">Tipo de Entrega *</Label>
            <Select value={deliveryType} onValueChange={setDeliveryType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delivery">Entrega</SelectItem>
                <SelectItem value="pickup">Retirada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {deliveryType === "delivery" && (
          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Endereço de Entrega *</Label>
            {selectedCustomer?.addresses?.length > 0 ? (
              <CustomerAddressSelector
                addresses={selectedCustomer.addresses}
                value={deliveryAddress}
                onValueChange={setDeliveryAddress}
                placeholder="Selecione um endereço cadastrado"
              />
            ) : (
              <Textarea
                id="deliveryAddress"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Digite o endereço de entrega"
                rows={2}
              />
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Data de Entrega</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="scheduledDate"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledTime">Horário</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="scheduledTime"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Itens do Pedido</CardTitle>
            <Button type="button" onClick={addItem} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-4">
                  <Label>Produto</Label>
                  <Select
                    value={item.productId}
                    onValueChange={(value) => updateItem(index, 'productId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Label>Qtd.</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label>Preço Unit.</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="col-span-3">
                  <Label>Total</Label>
                  <Input
                    value={formatCurrency(item.total)}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div className="col-span-1">
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <div className="flex justify-end pt-4 border-t">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total do Pedido</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações adicionais sobre o pedido..."
            rows={3}
          />
        </div>

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Criando..." : "Criar Pedido"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewOrderForm;
