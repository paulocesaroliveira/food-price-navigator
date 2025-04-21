
import React from "react";
import { 
  CartItem as CartItemType, 
  CustomerData as CustomerDataType,
  WebsiteSettings
} from "@/types/website";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrency } from "@/utils/calculations";
import { Trash, Plus, Minus, ShoppingCart, Send } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CartProps {
  cart: CartItemType[];
  updateCartItem: (id: string, quantity: number, notes?: string) => void;
  removeFromCart: (id: string) => void;
  customerData: CustomerDataType;
  setCustomerData: React.Dispatch<React.SetStateAction<CustomerDataType>>;
  onSubmitOrder: () => Promise<void>;
  onSendWhatsappOrder: () => void;
  settings: WebsiteSettings;
}

const Cart = ({ 
  cart, 
  updateCartItem, 
  removeFromCart, 
  customerData, 
  setCustomerData, 
  onSubmitOrder,
  onSendWhatsappOrder,
  settings
}: CartProps) => {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Default payment methods if none are configured
  const paymentMethods = settings.accepted_payment_methods || [
    "Dinheiro", 
    "Cartão de Crédito", 
    "Cartão de Débito", 
    "PIX"
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-8 text-center text-food-dark dark:text-food-textdark">
        Seu Pedido
      </h2>
      
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-16 w-16 text-food-coral dark:text-food-coralDark mb-4" />
          <h3 className="text-xl font-medium text-food-dark dark:text-food-textdark mb-2">Seu carrinho está vazio</h3>
          <p className="text-food-dark/70 dark:text-food-textdark/70 mb-6">Adicione alguns produtos deliciosos para começar seu pedido.</p>
          <Button className="bg-food-coral hover:bg-food-coral/90 dark:bg-food-coralDark dark:hover:bg-food-coralDark/90 text-white" onClick={() => window.location.href = "#products"}>
            Ver Produtos
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Cart Items */}
          <div>
            <Card className="bg-white dark:bg-food-carddark shadow-md mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-food-dark dark:text-food-textdark">
                  Itens do Pedido ({totalItems})
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-gray-200 dark:divide-gray-700">
                {cart.map((item) => (
                  <div key={item.id} className="py-4 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-food-dark dark:text-food-textdark">{item.name}</h3>
                        <p className="text-sm text-food-dark/70 dark:text-food-textdark/70">
                          {formatCurrency(item.price)} x {item.quantity} = {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="w-1/2">
                        <Input
                          placeholder="Observações do item"
                          value={item.notes}
                          onChange={(e) => updateCartItem(item.id, item.quantity, e.target.value)}
                          className="text-sm h-8"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="py-4 flex justify-between items-center font-medium text-lg">
                  <span className="text-food-dark dark:text-food-textdark">Total</span>
                  <span className="text-food-coral dark:text-food-coralDark">{formatCurrency(totalAmount)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Customer Information */}
          <div>
            <Card className="bg-white dark:bg-food-carddark shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-food-dark dark:text-food-textdark">
                  Suas Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input 
                    id="name" 
                    value={customerData.name} 
                    onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                    className="bg-white dark:bg-food-dark"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={customerData.email} 
                    onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                    className="bg-white dark:bg-food-dark"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                  <Input 
                    id="phone" 
                    value={customerData.phone} 
                    onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                    className="bg-white dark:bg-food-dark"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Tipo de Entrega</Label>
                  <RadioGroup 
                    value={customerData.deliveryType} 
                    onValueChange={(value) => setCustomerData({...customerData, deliveryType: value as 'Entrega' | 'Retirada'})}
                    className="flex space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Retirada" id="retirada" />
                      <Label htmlFor="retirada" className="cursor-pointer">Retirada</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Entrega" id="entrega" />
                      <Label htmlFor="entrega" className="cursor-pointer">Entrega</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {customerData.deliveryType === 'Entrega' && (
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço de Entrega *</Label>
                    <Textarea 
                      id="address" 
                      value={customerData.address || ''} 
                      onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                      className="bg-white dark:bg-food-dark resize-none"
                      required
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Data Desejada</Label>
                    <Input 
                      id="scheduledDate" 
                      type="date" 
                      value={customerData.scheduledDate || ''} 
                      onChange={(e) => setCustomerData({...customerData, scheduledDate: e.target.value})}
                      className="bg-white dark:bg-food-dark"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledTime">Horário Desejado</Label>
                    <Input 
                      id="scheduledTime" 
                      type="time" 
                      value={customerData.scheduledTime || ''} 
                      onChange={(e) => setCustomerData({...customerData, scheduledTime: e.target.value})}
                      className="bg-white dark:bg-food-dark"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Forma de Pagamento *</Label>
                  <Select 
                    value={customerData.paymentMethod} 
                    onValueChange={(value) => setCustomerData({...customerData, paymentMethod: value})}
                  >
                    <SelectTrigger className="bg-white dark:bg-food-dark">
                      <SelectValue placeholder="Selecione uma forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações Adicionais</Label>
                  <Textarea 
                    id="notes" 
                    value={customerData.notes || ''} 
                    onChange={(e) => setCustomerData({...customerData, notes: e.target.value})}
                    className="bg-white dark:bg-food-dark resize-none min-h-[100px]"
                    placeholder="Instruções especiais, preferências, etc."
                  />
                </div>
                
                <div className="pt-4 space-y-3">
                  <Button 
                    className="w-full bg-food-coral hover:bg-food-coral/90 dark:bg-food-coralDark dark:hover:bg-food-coralDark/90 text-white"
                    onClick={onSubmitOrder}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Finalizar Pedido
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-food-coral text-food-coral hover:text-food-coral hover:bg-food-coral/10 dark:border-food-coralDark dark:text-food-coralDark dark:hover:bg-food-coralDark/10"
                    onClick={onSendWhatsappOrder}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Pedido via WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
