
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock, Plus, Trash2, Save, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { resaleService } from "@/services/resaleService";
import { getProductList } from "@/services/productService";
import type { Reseller, CreateResaleTransactionRequest } from "@/types/resale";

interface ResaleTransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resellers: Reseller[];
  transaction?: any;
  onSuccess?: () => void;
}

export const ResaleTransactionForm: React.FC<ResaleTransactionFormProps> = ({
  open,
  onOpenChange,
  resellers,
  transaction,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    reseller_id: transaction?.reseller_id || "",
    transaction_date: transaction?.transaction_date ? new Date(transaction.transaction_date) : new Date(),
    delivery_time: transaction?.delivery_time || "",
    status: transaction?.status || "pending",
    notes: transaction?.notes || "",
    items: transaction?.resale_transaction_items || [{ product_id: "", quantity: 1, unit_price: 0 }]
  });

  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProductList
  });

  const createMutation = useMutation({
    mutationFn: resaleService.createTransaction,
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Transação criada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['resale-transactions'] });
      onSuccess?.();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar transação: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => resaleService.updateTransaction(id, data),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Transação atualizada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['resale-transactions'] });
      onSuccess?.();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar transação: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      reseller_id: "",
      transaction_date: new Date(),
      delivery_time: "",
      status: "pending",
      notes: "",
      items: [{ product_id: "", quantity: 1, unit_price: 0 }]
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: "", quantity: 1, unit_price: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reseller_id) {
      toast({
        title: "Erro",
        description: "Selecione um vendedor",
        variant: "destructive"
      });
      return;
    }

    if (formData.items.some(item => !item.product_id || item.quantity <= 0 || item.unit_price <= 0)) {
      toast({
        title: "Erro", 
        description: "Todos os itens devem ter produto, quantidade e preço válidos",
        variant: "destructive"
      });
      return;
    }

    const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const selectedReseller = resellers.find(r => r.id === formData.reseller_id);
    const commissionAmount = selectedReseller ? totalAmount * (selectedReseller.commission_percentage / 100) : 0;

    const transactionData = {
      reseller_id: formData.reseller_id,
      transaction_date: format(formData.transaction_date, 'yyyy-MM-dd'),
      delivery_time: formData.delivery_time,
      total_amount: totalAmount,
      commission_amount: commissionAmount,
      status: formData.status,
      notes: formData.notes,
      items: formData.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      }))
    };

    if (transaction) {
      updateMutation.mutate({ id: transaction.id, data: transactionData });
    } else {
      createMutation.mutate(transactionData);
    }
  };

  const selectedReseller = resellers.find(r => r.id === formData.reseller_id);
  const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const commissionAmount = selectedReseller ? totalAmount * (selectedReseller.commission_percentage / 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {transaction ? 'Editar' : 'Nova'} Transação de Revenda
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="reseller">Vendedor *</Label>
              <Select value={formData.reseller_id} onValueChange={(value) => setFormData(prev => ({ ...prev, reseller_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {resellers.map((reseller) => (
                    <SelectItem key={reseller.id} value={reseller.id}>
                      {reseller.name} ({reseller.commission_percentage}% comissão)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data da Transação *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.transaction_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.transaction_date ? format(formData.transaction_date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.transaction_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, transaction_date: date || new Date() }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hora de Entrega Desejada
              </Label>
              <Input
                id="delivery_time"
                type="time"
                value={formData.delivery_time}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_time: e.target.value }))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Itens da Venda</Label>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg bg-gray-50">
                <div className="col-span-5">
                  <Label>Produto *</Label>
                  <Select 
                    value={item.product_id} 
                    onValueChange={(value) => updateItem(index, 'product_id', value)}
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

                <div className="col-span-2">
                  <Label>Quantidade *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="col-span-3">
                  <Label>Preço Unitário (R$) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="col-span-1">
                  <Label>Total</Label>
                  <div className="text-sm font-semibold p-2 bg-white rounded border">
                    R$ {(item.quantity * item.unit_price).toFixed(2)}
                  </div>
                </div>

                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={formData.items.length === 1}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
            <div>
              <span className="text-sm text-gray-600">Total da Venda:</span>
              <p className="text-lg font-bold text-blue-600">R$ {totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Comissão ({selectedReseller?.commission_percentage || 0}%):</span>
              <p className="text-lg font-bold text-green-600">R$ {commissionAmount.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Valor para o Cliente:</span>
              <p className="text-lg font-bold text-gray-800">R$ {(totalAmount - commissionAmount).toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações sobre a transação..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : (transaction ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
