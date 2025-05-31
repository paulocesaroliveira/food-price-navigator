
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { resaleService } from "@/services/resaleService";
import { supabase } from "@/integrations/supabase/client";
import type { Reseller, CreateTransactionRequest, CreateTransactionItemRequest } from "@/types/resale";

interface ResaleTransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resellers: Reseller[];
}

export const ResaleTransactionForm: React.FC<ResaleTransactionFormProps> = ({
  open,
  onOpenChange,
  resellers
}) => {
  const [formData, setFormData] = useState({
    reseller_id: "",
    transaction_date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  const [items, setItems] = useState<CreateTransactionItemRequest[]>([
    { product_id: "", quantity: 1, unit_price: 0 }
  ]);

  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, selling_price')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const createTransactionMutation = useMutation({
    mutationFn: resaleService.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resale-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['resellers'] });
      toast({ title: "Sucesso", description: "Transação criada com sucesso!" });
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

  const resetForm = () => {
    setFormData({
      reseller_id: "",
      transaction_date: new Date().toISOString().split('T')[0],
      notes: ""
    });
    setItems([{ product_id: "", quantity: 1, unit_price: 0 }]);
  };

  const addItem = () => {
    setItems([...items, { product_id: "", quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof CreateTransactionItemRequest, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-fill price when product is selected
    if (field === 'product_id' && value) {
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].unit_price = product.selling_price || 0;
      }
    }
    
    setItems(updatedItems);
  };

  const handleSubmit = () => {
    if (!formData.reseller_id) {
      toast({ title: "Erro", description: "Vendedor é obrigatório", variant: "destructive" });
      return;
    }

    const validItems = items.filter(item => item.product_id && item.quantity > 0 && item.unit_price > 0);
    
    if (validItems.length === 0) {
      toast({ title: "Erro", description: "Adicione pelo menos um item válido", variant: "destructive" });
      return;
    }

    const transactionData: CreateTransactionRequest = {
      ...formData,
      items: validItems
    };

    createTransactionMutation.mutate(transactionData);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Nova Transação de Revenda
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="reseller">Vendedor</Label>
              <Select value={formData.reseller_id} onValueChange={(value) => setFormData({...formData, reseller_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {resellers.filter(r => r.status === 'active').map((reseller) => (
                    <SelectItem key={reseller.id} value={reseller.id}>
                      {reseller.name} ({reseller.commission_percentage}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Data da Transação</Label>
              <Input
                id="date"
                type="date"
                value={formData.transaction_date}
                onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Informações adicionais sobre a transação"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Itens da Transação</CardTitle>
                <Button onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Item {index + 1}</span>
                    {items.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeItem(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label>Produto</Label>
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

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <Label>Preço Unitário</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-medium">
                      Subtotal: R$ {(item.quantity * item.unit_price).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total da Transação:</span>
                  <span>R$ {totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createTransactionMutation.isPending}
          >
            {createTransactionMutation.isPending ? "Criando..." : "Criar Transação"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
