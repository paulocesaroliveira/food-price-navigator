
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Package } from "lucide-react";
import { formatCurrency } from "@/utils/calculations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resaleService } from "@/services/resaleService";
import { toast } from "@/hooks/use-toast";
import type { 
  Reseller, 
  ResaleTransaction, 
  CreateTransactionRequest,
  CreateTransactionItemRequest 
} from "@/types/resale";

interface ResaleTransactionItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Product {
  id: string;
  name: string;
  sellingPrice?: number;
  totalCost: number;
}

interface ResaleTransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resellers: Reseller[];
  transaction?: ResaleTransaction | null;
  onSuccess?: () => void;
}

const ResaleTransactionForm: React.FC<ResaleTransactionFormProps> = ({
  open,
  onOpenChange,
  resellers,
  transaction,
  onSuccess
}) => {
  const [resellerId, setResellerId] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryTime, setDeliveryTime] = useState("");
  const [items, setItems] = useState<ResaleTransactionItem[]>([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");

  const queryClient = useQueryClient();

  // Mock products data - in a real app this would come from props or a query
  const products: Product[] = [
    { id: "1", name: "Produto A", sellingPrice: 50, totalCost: 30 },
    { id: "2", name: "Produto B", sellingPrice: 100, totalCost: 60 },
    { id: "3", name: "Produto C", sellingPrice: 75, totalCost: 45 }
  ];

  const createTransactionMutation = useMutation({
    mutationFn: resaleService.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resale-transactions'] });
      toast({ title: "✨ Sucesso", description: "Transação criada com sucesso!" });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: "❌ Erro", 
        description: `Erro ao criar transação: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTransactionRequest> }) => 
      resaleService.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resale-transactions'] });
      toast({ title: "✨ Sucesso", description: "Transação atualizada com sucesso!" });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: "❌ Erro", 
        description: `Erro ao atualizar transação: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Load transaction data when editing
  useEffect(() => {
    if (transaction && open) {
      setResellerId(transaction.reseller_id || "");
      setTransactionDate(transaction.transaction_date || new Date().toISOString().split('T')[0]);
      setDeliveryTime(transaction.delivery_time || "");
      setItems(transaction.resale_transaction_items?.map(item => ({
        product_id: item.product_id,
        product_name: item.product?.name || "",
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      })) || []);
      setNotes(transaction.notes || "");
      setStatus(transaction.status || "pending");
    } else if (!transaction && open) {
      // Reset form for new transaction
      setResellerId("");
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setDeliveryTime("");
      setItems([]);
      setNotes("");
      setStatus("pending");
    }
  }, [transaction, open]);

  const addItem = () => {
    const newItem: ResaleTransactionItem = {
      product_id: "",
      product_name: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ResaleTransactionItem, value: any) => {
    const updatedItems = items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'product_id') {
          const product = products.find(p => p.id === value);
          if (product) {
            updatedItem.product_name = product.name;
            updatedItem.unit_price = product.sellingPrice || product.totalCost * 1.3;
          }
        }
        
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
        }
        
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0);
  const selectedReseller = resellers.find(r => r.id === resellerId);
  const commissionAmount = selectedReseller ? totalAmount * (selectedReseller.commission_percentage / 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resellerId || items.length === 0) {
      toast({ 
        title: "❌ Erro", 
        description: "Selecione um revendedor e adicione pelo menos um item",
        variant: "destructive"
      });
      return;
    }

    const transactionData: CreateTransactionRequest = {
      reseller_id: resellerId,
      transaction_date: transactionDate,
      delivery_time: deliveryTime || undefined,
      notes,
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
    };

    if (transaction) {
      updateTransactionMutation.mutate({ id: transaction.id, data: transactionData });
    } else {
      createTransactionMutation.mutate(transactionData);
    }
  };

  const isLoading = createTransactionMutation.isPending || updateTransactionMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Editar' : 'Nova'} Transação de Revenda
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reseller">Revendedor *</Label>
              <Select value={resellerId} onValueChange={setResellerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um revendedor" />
                </SelectTrigger>
                <SelectContent>
                  {resellers.map((reseller) => (
                    <SelectItem key={reseller.id} value={reseller.id}>
                      {reseller.name} ({reseller.commission_percentage}%)
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
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_time">Horário de Entrega</Label>
              <Input
                id="delivery_time"
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Itens da Transação</CardTitle>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum item adicionado</p>
                  <p className="text-sm">Clique em "Adicionar Item" para começar</p>
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
                    <div className="col-span-4">
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
                    
                    <div className="col-span-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label>Preço Unitário</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="col-span-3">
                      <Label>Total</Label>
                      <Input
                        value={formatCurrency(item.total_price)}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resumo da Transação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total da Venda</p>
                    <p className="text-xl font-semibold text-green-600">
                      {formatCurrency(totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Comissão</p>
                    <p className="text-xl font-semibold text-blue-600">
                      {formatCurrency(commissionAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Líquido</p>
                    <p className="text-xl font-semibold text-purple-600">
                      {formatCurrency(totalAmount - commissionAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre a transação..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !resellerId || items.length === 0}>
              {isLoading ? 'Salvando...' : (transaction ? 'Atualizar' : 'Salvar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResaleTransactionForm;
