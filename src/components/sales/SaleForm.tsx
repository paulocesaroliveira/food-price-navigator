
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { PlusCircle, Minus, Search, Package } from "lucide-react";
import { Sale, Product, SaleItem } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface SaleFormProps {
  onSubmit: (sale: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) => void;
  editingSale?: Sale | null;
  onCancel: () => void;
}

interface SaleItemForm extends Omit<SaleItem, 'id' | 'sale_id' | 'created_at'> {
  id?: string;
  tempId: string;
}

const SaleForm: React.FC<SaleFormProps> = ({ onSubmit, editingSale, onCancel }) => {
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<SaleItemForm[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    if (editingSale) {
      setSaleDate(editingSale.sale_date);
      setNotes(editingSale.notes || "");
      setDiscountAmount(editingSale.discount_amount || 0);
      if (editingSale.sale_items) {
        setItems(editingSale.sale_items.map((item, index) => ({
          ...item,
          tempId: `item-${index}`
        })));
      }
    }
  }, [editingSale]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos",
        variant: "destructive",
      });
    }
  };

  const addItem = () => {
    const newItem: SaleItemForm = {
      tempId: `item-${Date.now()}`,
      product_id: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      unit_cost: 0,
      total_cost: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (tempId: string) => {
    setItems(items.filter(item => item.tempId !== tempId));
  };

  const updateItem = (tempId: string, field: keyof SaleItemForm, value: any) => {
    setItems(items.map(item => {
      if (item.tempId === tempId) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'product_id') {
          const product = products.find(p => p.id === value);
          if (product) {
            updatedItem.unit_price = product.selling_price || 0;
            updatedItem.unit_cost = product.total_cost || 0;
          }
        }
        
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
          updatedItem.total_cost = updatedItem.quantity * updatedItem.unit_cost;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0) - discountAmount;
    const totalCost = items.reduce((sum, item) => sum + item.total_cost, 0);
    const grossProfit = totalAmount - totalCost;
    const netProfit = grossProfit; // Simplified for now
    
    return { totalAmount, totalCost, grossProfit, netProfit };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item à venda",
        variant: "destructive",
      });
      return;
    }

    const { totalAmount, totalCost, grossProfit, netProfit } = calculateTotals();
    
    const saleData = {
      sale_date: saleDate,
      total_amount: totalAmount,
      total_cost: totalCost,
      gross_profit: grossProfit,
      net_profit: netProfit,
      discount_amount: discountAmount,
      notes: notes,
      status: 'completed' as const,
      sale_number: `VD-${Date.now()}`,
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        unit_cost: item.unit_cost,
        total_cost: item.total_cost
      }))
    };

    try {
      await onSubmit(saleData);
    } catch (error) {
      console.error('Error submitting sale:', error);
    }
  };

  const { totalAmount, totalCost, grossProfit, netProfit } = calculateTotals();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {editingSale ? 'Editar Venda' : 'Nova Venda'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="saleDate">Data da Venda</Label>
              <Input
                id="saleDate"
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                required
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Itens da Venda</h3>
              <Button
                type="button"
                onClick={addItem}
                size="sm"
                className="gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Adicionar Item
              </Button>
            </div>

            {items.map((item) => {
              const product = products.find(p => p.id === item.product_id);
              
              return (
                <Card key={item.tempId} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    <div className="md:col-span-2">
                      <Label>Produto</Label>
                      <Select
                        value={item.product_id}
                        onValueChange={(value) => updateItem(item.tempId, 'product_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                <span>{product.name}</span>
                                <Badge variant="outline">
                                  R$ {product.selling_price?.toFixed(2)}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.tempId, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div>
                      <Label>Preço Unit.</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.tempId, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label>Total</Label>
                      <Input
                        type="text"
                        value={`R$ ${item.total_price.toFixed(2)}`}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>

                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.tempId)}
                        className="w-full"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discountAmount">Desconto (R$)</Label>
              <Input
                id="discountAmount"
                type="number"
                min="0"
                step="0.01"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <Separator />

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {(totalAmount + discountAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Desconto:</span>
              <span>R$ {discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>R$ {totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Custo Total:</span>
              <span>R$ {totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-green-600">
              <span>Lucro Bruto:</span>
              <span>R$ {grossProfit.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading || items.length === 0}>
              {loading ? 'Salvando...' : editingSale ? 'Atualizar Venda' : 'Criar Venda'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SaleForm;
