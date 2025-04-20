
import React from 'react';
import { CartItem, CustomerData } from '@/types/website';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash, Minus, Plus, Calendar, Clock, MapPin, User, Phone, Mail, ArrowRight, Send } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface CartProps {
  cart: CartItem[];
  updateCartItem: (id: string, quantity: number, notes?: string) => void;
  removeFromCart: (id: string) => void;
  customerData: CustomerData;
  setCustomerData: React.Dispatch<React.SetStateAction<CustomerData>>;
  onSubmitOrder: () => Promise<void>;
  onSendWhatsappOrder: () => void;
}

const Cart = ({ 
  cart, 
  updateCartItem, 
  removeFromCart, 
  customerData, 
  setCustomerData,
  onSubmitOrder,
  onSendWhatsappOrder
}: CartProps) => {
  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeliveryTypeChange = (value: string) => {
    setCustomerData(prev => ({ ...prev, deliveryType: value as 'Entrega' | 'Retirada' }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    setCustomerData(prev => ({ ...prev, scheduledDate: format(date, 'yyyy-MM-dd') }));
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-poppins font-bold text-gray-800 mb-8 text-center">Meu Pedido</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-poppins font-semibold mb-4">Itens do Pedido</h3>
            
            {cart.length > 0 ? (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-200">
                    <div className="flex-grow mb-3 sm:mb-0">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.notes && (
                        <p className="text-sm text-gray-500 mt-1">Obs: {item.notes}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </Button>
                        
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-sm font-medium whitespace-nowrap">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 h-8 w-8" 
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="text-xl font-semibold text-[#E76F51]">
                    R$ {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-gray-500 mb-4">Seu pedido está vazio</p>
                <Button
                  variant="outline"
                  className="font-quicksand"
                  onClick={() => window.location.hash = '#products'}
                >
                  Ver Produtos
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Customer Info Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-poppins font-semibold mb-4">Dados para Entrega</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="flex items-center gap-1">
                  <User size={16} className="text-gray-500" />
                  <span>Nome*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={customerData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  className="mt-1 font-quicksand"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="flex items-center gap-1">
                  <Phone size={16} className="text-gray-500" />
                  <span>Telefone*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={customerData.phone}
                  onChange={handleInputChange}
                  placeholder="DDD + número"
                  className="mt-1 font-quicksand"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="flex items-center gap-1">
                  <Mail size={16} className="text-gray-500" />
                  <span>E-mail</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  value={customerData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="mt-1 font-quicksand"
                />
              </div>
              
              <div>
                <Label className="flex items-center gap-1 mb-1">
                  <MapPin size={16} className="text-gray-500" />
                  <span>Tipo de Entrega*</span>
                </Label>
                <RadioGroup 
                  value={customerData.deliveryType} 
                  onValueChange={handleDeliveryTypeChange}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Retirada" id="retirada" />
                    <Label htmlFor="retirada">Retirada</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Entrega" id="entrega" />
                    <Label htmlFor="entrega">Entrega</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {customerData.deliveryType === 'Entrega' && (
                <div>
                  <Label htmlFor="address" className="flex items-center gap-1">
                    <MapPin size={16} className="text-gray-500" />
                    <span>Endereço de Entrega*</span>
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={customerData.address || ''}
                    onChange={handleInputChange}
                    placeholder="Rua, número, bairro, complemento, cidade"
                    className="mt-1 font-quicksand"
                    required
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledDate" className="flex items-center gap-1">
                    <Calendar size={16} className="text-gray-500" />
                    <span>Data Desejada</span>
                  </Label>
                  <div className="mt-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {customerData.scheduledDate ? (
                            format(new Date(customerData.scheduledDate), 'dd/MM/yyyy', { locale: ptBR })
                          ) : (
                            <span className="text-gray-400">Selecionar data...</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={customerData.scheduledDate ? new Date(customerData.scheduledDate) : undefined}
                          onSelect={handleDateChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="scheduledTime" className="flex items-center gap-1">
                    <Clock size={16} className="text-gray-500" />
                    <span>Horário</span>
                  </Label>
                  <Input
                    id="scheduledTime"
                    name="scheduledTime"
                    type="time"
                    value={customerData.scheduledTime || ''}
                    onChange={handleInputChange}
                    className="mt-1 font-quicksand"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes" className="flex items-center gap-1">
                  <span>Observações</span>
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={customerData.notes || ''}
                  onChange={handleInputChange}
                  placeholder="Alguma observação adicional para seu pedido?"
                  className="mt-1 font-quicksand"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-3 pt-2">
                <Button 
                  className="w-full bg-[#E76F51] hover:bg-[#E76F51]/90 font-quicksand"
                  onClick={onSubmitOrder}
                  disabled={cart.length === 0}
                >
                  <Send size={16} className="mr-2" /> Enviar Pedido
                </Button>
                
                <Button 
                  className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white font-quicksand"
                  onClick={onSendWhatsappOrder}
                  disabled={cart.length === 0}
                >
                  <svg
                    className="mr-2 h-4 w-4 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                  >
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                  </svg>
                  Enviar via WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
