
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { MinusCircle, PlusCircle, User, ShoppingBag, Truck, CalendarClock } from "lucide-react";
import { getProductList } from "@/services/productService";
import { getCustomerList } from "@/services/customerService";
import { formatCurrency } from "@/utils/calculations";
import { Product, Customer } from "@/types";

const orderSchema = z.object({
  customer_id: z.string().min(1, "Cliente é obrigatório"),
  delivery_type: z.string().min(1, "Tipo de entrega é obrigatório"),
  delivery_address: z.string().optional(),
  scheduled_date: z.string().optional(),
  scheduled_time: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().default("Novo"),
  origin: z.string().default("manual"),
  total_amount: z.number().min(0),
});

type OrderItemState = {
  product_id: string;
  quantity: number;
  price_at_order: number;
  total_price: number;
  notes?: string;
  product?: Product;
};

type NewOrderFormProps = {
  onSubmit: (data: any) => void;
  onCancel: () => void;
};

export const NewOrderForm = ({ onSubmit, onCancel }: NewOrderFormProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemState[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  const form = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_id: "",
      delivery_type: "Retirada",
      delivery_address: "",
      scheduled_date: "",
      scheduled_time: "",
      notes: "",
      status: "Novo",
      origin: "manual",
      total_amount: 0,
    },
  });

  // Fetch products and customers
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productsData = await getProductList();
        const customersData = await getCustomerList();
        setProducts(productsData);
        setCustomers(customersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update total amount when items change
  useEffect(() => {
    const total = orderItems.reduce((sum, item) => sum + item.total_price, 0);
    setTotalAmount(total);
    form.setValue("total_amount", total);
  }, [orderItems, form]);

  const addOrderItem = () => {
    if (products.length === 0) return;

    const defaultProduct = products[0];
    // Get calculated price from pricing module if available, otherwise use product cost
    const price = defaultProduct?.calculatedPrice || defaultProduct.totalCost || 0;

    const newItem: OrderItemState = {
      product_id: defaultProduct.id,
      quantity: 1,
      price_at_order: price,
      total_price: price,
      product: defaultProduct,
    };

    setOrderItems([...orderItems, newItem]);
  };

  const removeOrderItem = (index: number) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const updateItemProduct = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const price = product?.calculatedPrice || product.totalCost || 0;
    const quantity = orderItems[index].quantity;

    const newItems = [...orderItems];
    newItems[index] = {
      ...newItems[index],
      product_id: productId,
      price_at_order: price,
      total_price: price * quantity,
      product: product,
    };

    setOrderItems(newItems);
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...orderItems];
    const price = newItems[index].price_at_order;
    newItems[index] = {
      ...newItems[index],
      quantity,
      total_price: price * quantity,
    };

    setOrderItems(newItems);
  };

  const updateItemNotes = (index: number, notes: string) => {
    const newItems = [...orderItems];
    newItems[index] = {
      ...newItems[index],
      notes,
    };

    setOrderItems(newItems);
  };

  const handleFormSubmit = (values: z.infer<typeof orderSchema>) => {
    if (orderItems.length === 0) {
      return;
    }

    onSubmit({
      ...values,
      items: orderItems,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                  <User className="h-5 w-5" />
                  Informações do Cliente
                </h3>

                <FormField
                  control={form.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                  <ShoppingBag className="h-5 w-5" />
                  Entrega
                </h3>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="delivery_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Entrega</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de entrega" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Retirada">
                              <div className="flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4" />
                                Retirada
                              </div>
                            </SelectItem>
                            <SelectItem value="Entrega">
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                Entrega
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
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
                            <Textarea placeholder="Digite o endereço de entrega" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="scheduled_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Agendada</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scheduled_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                  <CalendarClock className="h-5 w-5" />
                  Observações
                </h3>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações do Pedido</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Digite observações ou instruções especiais" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Itens do Pedido</h3>
                  <Button
                    type="button"
                    onClick={addOrderItem}
                    size="sm"
                    variant="outline"
                    className="gap-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Adicionar Item
                  </Button>
                </div>

                <div className="space-y-3 mb-6">
                  {orderItems.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>Nenhum item adicionado</p>
                      <p className="text-sm">Adicione produtos ao pedido clicando no botão acima</p>
                    </div>
                  ) : (
                    orderItems.map((item, index) => (
                      <Card key={index} className="border border-muted">
                        <CardContent className="p-3">
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-5">
                              <FormLabel className="text-xs">Produto</FormLabel>
                              <Select
                                value={item.product_id}
                                onValueChange={(value) => updateItemProduct(index, value)}
                              >
                                <SelectTrigger className="w-full h-9">
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
                            <div className="col-span-2">
                              <FormLabel className="text-xs">Qtd</FormLabel>
                              <Input
                                type="number"
                                min="1"
                                className="h-9"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(index, parseInt(e.target.value))}
                              />
                            </div>
                            <div className="col-span-2">
                              <FormLabel className="text-xs">Preço</FormLabel>
                              <div className="h-9 flex items-center px-2 border rounded-md bg-muted/50 text-sm">
                                {formatCurrency(item.price_at_order)}
                              </div>
                            </div>
                            <div className="col-span-2">
                              <FormLabel className="text-xs">Total</FormLabel>
                              <div className="h-9 flex items-center px-2 border rounded-md bg-muted/50 text-sm">
                                {formatCurrency(item.total_price)}
                              </div>
                            </div>
                            <div className="col-span-1 flex items-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-destructive"
                                onClick={() => removeOrderItem(index)}
                              >
                                <MinusCircle className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="col-span-12 mt-2">
                              <FormLabel className="text-xs">Observações do Item</FormLabel>
                              <Input
                                placeholder="Observações sobre o item (opcional)"
                                value={item.notes || ""}
                                onChange={(e) => updateItemNotes(index, e.target.value)}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                <div className="flex flex-col pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Valor Total:</span>
                    <span className="text-xl font-bold">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={orderItems.length === 0}
                className="bg-food-coral hover:bg-food-amber text-white"
              >
                Criar Pedido
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};
