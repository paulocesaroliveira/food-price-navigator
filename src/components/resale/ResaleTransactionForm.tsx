
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resaleService } from "@/services/resaleService";
import { 
  Reseller, 
  ResaleTransaction, 
  CreateTransactionRequest,
  CreateTransactionItemRequest 
} from "@/types/resale";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/calculations";
import { Trash2, Plus } from "lucide-react";

interface ResaleTransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: ResaleTransaction | null;
  onSuccess?: () => void;
}

export const ResaleTransactionForm: React.FC<ResaleTransactionFormProps> = ({
  open,
  onOpenChange,
  transaction,
  onSuccess
}) => {
  const [formData, setFormData] = useState<{
    reseller_id: string;
    transaction_date: string;
    delivery_time?: string;
    notes?: string;
    items: CreateTransactionItemRequest[];
  }>({
    reseller_id: "",
    transaction_date: new Date().toISOString().split('T')[0],
    delivery_time: "",
    notes: "",
    items: [{ product_id: "", quantity: 1, unit_price: 0 }]
  });

  const queryClient = useQueryClient();

  const { data: resellers = [] } = useQuery({
    queryKey: ['resellers'],
    queryFn: resaleService.getResellers
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, selling_price')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Populate form when editing
  useEffect(() => {
    if (transaction && open) {
      setFormData({
        reseller_id: transaction.reseller_id,
        transaction_date: transaction.transaction_date,
        delivery_time: transaction.delivery_time || "",
        notes: transaction.notes || "",
        items: transaction.resale_transaction_items?.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        })) || [{ product_id: "", quantity: 1, unit_price: 0 }]
      });
    } else if (!transaction && open) {
      setFormData({
        reseller_id: "",
        transaction_date: new Date().toISOString().split('T')[0],
        delivery_time: "",
        notes: "",
        items: [{ product_id: "", quantity: 1, unit_price: 0 }]
      });
    }
  }, [transaction, open]);

  const createMutation = useMutation({
    mutationFn: resaleService.createTransaction,
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Transação criada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['resale-transactions'] });
      onSuccess?.();
      onOpenChange(false);
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
    mutationFn: async (data: CreateTransactionRequest) => {
      if (!transaction?.id) throw new Error('ID da transação não encontrado');
      return resaleService.updateTransaction(transaction.id, data);
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Transação atualizada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['resale-transactions'] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar transação: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reseller_id || formData.items.length === 0) {
      toast({
        title: "Erro",
        description: "Revendedor e pelo menos um item são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const requestData: CreateTransactionRequest = {
      reseller_id: formData.reseller_id,
      transaction_date: formData.transaction_date,
      delivery_time: formData.delivery_time,
      notes: formData.notes,
      items: formData.items.filter(item => item.product_id && item.quantity > 0)
    };

    if (transaction) {
      updateMutation.mutate(requestData);
    } else {
      createMutation.mutate(requestData);
    }
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

  const updateItem = (index: number, field: keyof CreateTransactionItemRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {transaction ? 'Editar' : 'Nova'} Transação de Revenda
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="reseller">Revendedor *</Label>
              <Select 
                value={formData.reseller_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, reseller_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um revendedor" />
                </SelectTrigger>
                <SelectContent>
                  {resellers.map((reseller) => (
                    <SelectItem key={reseller.id} value={reseller.id}>
                      {reseller.name} - {reseller.commission_percentage}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_date">Data da Transação *</Label>
              <Input
                id="transaction_date"
                type="date"
                value={formData.transaction_date}
                onChange={(e) => setFormData(prev => ({ ...prev, transaction_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_time">Horário de Entrega</Label>
              <Input
                id="delivery_time"
                type="time"
                value={formData.delivery_time}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_time: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-semibold">Itens da Transação</Label>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Produto *</Label>
                  <Select 
                    value={item.product_id} 
                    onValueChange={(value) => {
                      updateItem(index, 'product_id', value);
                      const product = products.find(p => p.id === value);
                      if (product) {
                        updateItem(index, 'unit_price', product.selling_price || 0);
                      }
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

                <div className="space-y-2">
                  <Label>Quantidade *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preço Unitário (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total</Label>
                  <Input
                    value={formatCurrency(item.quantity * item.unit_price)}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={formData.items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="text-right text-lg font-bold">
              Total da Transação: {formatCurrency(totalAmount)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações sobre esta transação..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : (transaction ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
