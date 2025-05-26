
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, MapPin, Phone, Mail, User } from "lucide-react";
import { createCustomer, updateCustomer } from "@/services/customerService";
import { Customer, CreateCustomerRequest, CreateCustomerAddressRequest } from "@/types/customers";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface CustomerFormProps {
  customer?: Customer | null;
  onSave: () => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CreateCustomerRequest>({
    name: "",
    email: "",
    phone: "",
    notes: "",
    addresses: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
        notes: customer.notes || "",
        addresses: customer.addresses?.map(addr => ({
          label: addr.label,
          address: addr.address,
          is_primary: addr.is_primary
        })) || []
      });
    }
  }, [customer]);

  const addAddress = () => {
    const newAddress: CreateCustomerAddressRequest = {
      label: "",
      address: "",
      is_primary: formData.addresses?.length === 0
    };
    
    setFormData(prev => ({
      ...prev,
      addresses: [...(prev.addresses || []), newAddress]
    }));
  };

  const removeAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses?.filter((_, i) => i !== index) || []
    }));
  };

  const updateAddress = (index: number, field: keyof CreateCustomerAddressRequest, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses?.map((addr, i) => 
        i === index ? { ...addr, [field]: value } : addr
      ) || []
    }));
  };

  const setPrimaryAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses?.map((addr, i) => ({
        ...addr,
        is_primary: i === index
      })) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do cliente é obrigatório",
        variant: "destructive"
      });
      return;
    }

    // Validar se há pelo menos um endereço primário se houver endereços
    if (formData.addresses && formData.addresses.length > 0) {
      const hasValidAddresses = formData.addresses.every(addr => 
        addr.label.trim() && addr.address.trim()
      );
      
      if (!hasValidAddresses) {
        toast({
          title: "Erro",
          description: "Todos os endereços devem ter rótulo e endereço preenchidos",
          variant: "destructive"
        });
        return;
      }

      const primaryCount = formData.addresses.filter(addr => addr.is_primary).length;
      if (primaryCount === 0) {
        // Se não há endereço primário, define o primeiro como primário
        formData.addresses[0].is_primary = true;
      } else if (primaryCount > 1) {
        toast({
          title: "Erro",
          description: "Apenas um endereço pode ser definido como principal",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);
    try {
      if (customer) {
        await updateCustomer(customer.id, formData);
      } else {
        await createCustomer(formData);
      }
      onSave();
    } catch (error) {
      // Erro já é tratado no serviço
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados Básicos */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-food-coral" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <span>Nome *</span>
            </Label>
            <Input 
              id="name" 
              placeholder="Nome completo do cliente"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="border-2 focus:border-food-coral"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone
              </Label>
              <Input 
                id="phone" 
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="border-2 focus:border-food-coral"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="border-2 focus:border-food-coral"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea 
              id="notes" 
              placeholder="Observações sobre o cliente"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="border-2 focus:border-food-coral"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Endereços */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-food-coral" />
              Endereços de Entrega
            </CardTitle>
            <Button 
              type="button"
              variant="outline"
              size="sm"
              onClick={addAddress}
              className="border-2 border-food-coral text-food-coral hover:bg-food-coral hover:text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Endereço
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.addresses && formData.addresses.length > 0 ? (
            formData.addresses.map((address, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Endereço {index + 1}</Label>
                      {address.is_primary && (
                        <Badge className="bg-food-coral text-white text-xs">Principal</Badge>
                      )}
                    </div>
                    <Button 
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAddress(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm">Rótulo</Label>
                      <Input 
                        placeholder="Ex: Casa, Trabalho"
                        value={address.label}
                        onChange={(e) => updateAddress(index, 'label', e.target.value)}
                        className="border-2 focus:border-food-coral"
                      />
                    </div>
                    
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-sm">Endereço Completo</Label>
                      <Input 
                        placeholder="Rua, número, bairro, cidade"
                        value={address.address}
                        onChange={(e) => updateAddress(index, 'address', e.target.value)}
                        className="border-2 focus:border-food-coral"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id={`primary-${index}`}
                      checked={address.is_primary}
                      onCheckedChange={() => setPrimaryAddress(index)}
                    />
                    <Label htmlFor={`primary-${index}`} className="text-sm">
                      Definir como endereço principal
                    </Label>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Nenhum endereço adicionado ainda
              </p>
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={addAddress}
                className="mt-2 border-food-coral text-food-coral hover:bg-food-coral hover:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Endereço
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-food-coral to-food-amber hover:from-food-amber hover:to-food-coral text-white"
        >
          {loading ? "Salvando..." : customer ? "Salvar Alterações" : "Criar Cliente"}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
