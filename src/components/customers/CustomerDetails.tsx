
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Edit, Calendar, MessageCircle } from "lucide-react";
import { Customer } from "@/types/customers";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CustomerDetailsProps {
  customer: Customer;
  onEdit: () => void;
  onClose: () => void;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer, onEdit, onClose }) => {
  const sendWhatsAppMessage = (phone: string) => {
    const formattedPhone = phone.replace(/\D/g, "");
    const message = `Olá ${customer.name}! Estou entrando em contato sobre seus pedidos na TastyHub.`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header com nome e ações */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
          <Badge variant="outline" className="text-sm">
            {customer.addresses?.length || 0} endereço(s)
          </Badge>
        </div>
        <div className="flex gap-2">
          {customer.phone && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => sendWhatsAppMessage(customer.phone!)}
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
          )}
          <Button 
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="border-food-coral text-food-coral hover:bg-food-coral hover:text-white"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      {/* Informações de Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações de Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {customer.phone ? (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-food-coral" />
                  <span className="text-gray-700">{customer.phone}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone className="h-4 w-4" />
                  <span>Telefone não informado</span>
                </div>
              )}
              
              {customer.email ? (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-food-coral" />
                  <span className="text-gray-700">{customer.email}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span>Email não informado</span>
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-food-coral" />
                <span className="text-sm text-gray-600">
                  Cliente desde {format(new Date(customer.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereços */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-food-coral" />
            Endereços de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customer.addresses && customer.addresses.length > 0 ? (
            <div className="space-y-3">
              {customer.addresses.map((address, index) => (
                <div key={address.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{address.label}</h4>
                      {address.is_primary && (
                        <Badge className="bg-food-coral text-white text-xs">Principal</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600">{address.address}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">Nenhum endereço cadastrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Observações */}
      {customer.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão Fechar */}
      <div className="flex justify-end pt-4">
        <Button onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
};

export default CustomerDetails;
