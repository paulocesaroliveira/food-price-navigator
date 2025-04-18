
import React, { useState, useEffect } from "react";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { createOrder } from "@/services/orderService";
import { getCustomerList } from "@/services/customerService";
import { getProductList } from "@/services/productService";
import { Card, CardContent } from "@/components/ui/card";
import { type Customer, type Product } from "@/types";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/calculations";

interface NewOrderFormProps {
  onOrderCreated: () => void;
  onCancel?: () => void;
}

interface OrderItem {
  product_id: string;
  quantity: number;
  price_at_order: number;
  total_price: number;
  notes?: string;
}

interface AdditionalCost {
  name: string;
  value: number;
}

const deliveryTypes = ["Entrega", "Retirada"];

const NewOrderForm: React.FC<NewOrderFormProps> = ({ onOrderCreated, onCancel }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const form = useForm({
    defaultValues: {
      customer_id: "",
      delivery_type: deliveryTypes[0],
      delivery_address: "",
      scheduled_date: "",
      scheduled_time: "",
      total_amount: 0,
      notes: "",
      origin: "manual",
      status: "Novo"
    }
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      const data = await getCustomerList();
      setCustomers(data);
    };

    const fetchProducts = async () => {
      const data = await getProductList();
      setProducts(data);
    };

    fetchCustomers();
    fetchProducts();
  }, []);

  // Calculate total amount when order items or additional costs change
  useEffect(() => {
    const itemsTotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);
    const costsTotal = additionalCosts.reduce((sum, cost) => sum + cost.value, 0);
    const newTotal = itemsTotal + costsTotal;
    
    setTotalAmount(newTotal);
    form.setValue("total_amount", newTotal);
  }, [orderItems, additionalCosts, form]);

  const handleAddOrderItem = () => {
    setOrderItems([
      ...orderItems,
      {
        product_id: "",
        quantity: 1,
        price_at_order: 0,
        total_price: 0
      }
    ]);
  };

  const handleRemoveOrderItem = (index: number) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };

  const handleOrderItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...orderItems];
    const item = { ...updatedItems[index], [field]: value };
    
    // Automatically calculate total price when quantity or price changes
    if (field === 'quantity' || field === 'price_at_order') {
      item.total_price = item.quantity * item.price_at_order;
    }
    
    updatedItems[index] = item;
    setOrderItems(updatedItems);
  };

  const handleAddAdditionalCost = () => {
    setAdditionalCosts([
      ...additionalCosts,
      { name: "", value: 0 }
    ]);
  };

  const handleRemoveAdditionalCost = (index: number) => {
    const updatedCosts = [...additionalCosts];
    updatedCosts.splice(index, 1);
    setAdditionalCosts(updatedCosts);
  };

  const handleAdditionalCostChange = (index: number, field: keyof AdditionalCost, value: any) => {
    const updatedCosts = [...additionalCosts];
    updatedCosts[index] = { ...updatedCosts[index], [field]: value };
    setAdditionalCosts(updatedCosts);
  };

  const onSubmit = async (values: any) => {
    if (orderItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um produto ao pedido",
        variant: "destructive",
      });
      return;
    }

    // Validate products have been selected
    const invalidItems = orderItems.some(item => !item.product_id || item.quantity <= 0 || item.price_at_order <= 0);
    if (invalidItems) {
      toast({
        title: "Erro",
        description: "Verifique se todos os produtos foram selecionados e têm quantidade e preço válidos",
        variant: "destructive",
      });
      return;
    }

    const formattedDate = scheduledDate ? format(scheduledDate, "yyyy-MM-dd") : null;
    const payload = {
      ...values,
      scheduled_date: formattedDate,
      total_amount: totalAmount,
    };

    try {
      const createdOrder = await createOrder(payload, orderItems);
      toast({
        title: "Sucesso",
        description: "Pedido criado com sucesso!",
      });
      form.reset();
      setScheduledDate(undefined);
      setOrderItems([]);
      setAdditionalCosts([]);
      setTotalAmount(0);
      onOrderCreated();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Não foi possível criar o pedido: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Get product details by ID
  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="customer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="delivery_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Entrega</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de entrega" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {deliveryTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {form.watch("delivery_type") === "Entrega" && (
          <FormField
            control={form.control}
            name="delivery_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço de Entrega</FormLabel>
                <FormControl>
                  <Input placeholder="Rua, número, complemento" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="flex flex-col md:flex-row gap-4">
          <FormField
            control={form.control}
            name="scheduled_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Agendar Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !scheduledDate && "text-muted-foreground"
                        )}
                      >
                        {scheduledDate ? (
                          format(scheduledDate, "PPP")
                        ) : (
                          <span>Escolher uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={date => {
                        setScheduledDate(date)
                        if (date) {
                          field.onChange(format(date, "yyyy-MM-dd"))
                        } else {
                          field.onChange(undefined)
                        }
                      }}
                      disabled={date =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduled_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agendar Horário</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Products Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Produtos</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAddOrderItem}
              className="flex items-center"
            >
              <Plus className="mr-1 h-4 w-4" />
              Adicionar Produto
            </Button>
          </div>

          {orderItems.length === 0 && (
            <div className="text-center p-4 border rounded-md text-muted-foreground">
              Nenhum produto adicionado. Clique em "Adicionar Produto" para começar.
            </div>
          )}

          {orderItems.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-4">
                    <FormLabel>Produto</FormLabel>
                    <Select 
                      value={item.product_id} 
                      onValueChange={(value) => {
                        const product = getProductById(value);
                        const suggestedPrice = product?.calculatedPrice || 0;
                        handleOrderItemChange(index, 'product_id', value);
                        handleOrderItemChange(index, 'price_at_order', suggestedPrice);
                        handleOrderItemChange(index, 'total_price', suggestedPrice * item.quantity);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
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
                  
                  <div className="col-span-6 md:col-span-2">
                    <FormLabel>Quantidade</FormLabel>
                    <Input 
                      type="number" 
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleOrderItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="col-span-6 md:col-span-2">
                    <FormLabel>Preço Unitário</FormLabel>
                    <Input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={item.price_at_order}
                      onChange={(e) => handleOrderItemChange(index, 'price_at_order', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="col-span-9 md:col-span-2">
                    <FormLabel>Total do Item</FormLabel>
                    <Input 
                      type="text" 
                      value={formatCurrency(item.total_price)}
                      disabled
                    />
                  </div>
                  
                  <div className="col-span-3 md:col-span-2 flex items-end justify-end">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveOrderItem(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Costs Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Custos Adicionais</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAddAdditionalCost}
              className="flex items-center"
            >
              <Plus className="mr-1 h-4 w-4" />
              Adicionar Custo
            </Button>
          </div>

          {additionalCosts.map((cost, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-7">
                    <FormLabel>Descrição</FormLabel>
                    <Input 
                      value={cost.name}
                      placeholder="Ex: Taxa de entrega, embalagem especial..."
                      onChange={(e) => handleAdditionalCostChange(index, 'name', e.target.value)}
                    />
                  </div>
                  
                  <div className="col-span-9 md:col-span-3">
                    <FormLabel>Valor</FormLabel>
                    <Input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={cost.value}
                      onChange={(e) => handleAdditionalCostChange(index, 'value', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="col-span-3 md:col-span-2 flex items-end justify-end">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveAdditionalCost(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Total Amount */}
        <div className="bg-muted p-4 rounded-md">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Total do Pedido</h3>
            <span className="text-2xl font-bold">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações sobre o pedido"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit">Criar Pedido</Button>
        </div>
      </form>
    </Form>
  );
};

export default NewOrderForm;
