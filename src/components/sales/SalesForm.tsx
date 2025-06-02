import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, ShoppingCart, DollarSign } from "lucide-react";
import { formatCurrency } from "@/utils/calculations";
import { CreateSaleRequest } from "@/types/sales";
import { CurrencyInput } from "@/components/ui/currency-input";
import { usePercentageMask } from "@/hooks/usePercentageMask";

interface SalesFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSaleRequest) => void;
  products: any[];
  isLoading?: boolean;
}

const SalesForm: React.FC<SalesFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  products,
  isLoading = false
}) => {
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([{ product_id: '', quantity: 1, unit_price: 0 }]);
  const [expenses, setExpenses] = useState([{ name: '', amount: 0, description: '' }]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');
  
  // Novos campos para taxa de cartão
  const [cardFeeType, setCardFeeType] = useState<'percentage' | 'fixed'>('percentage');
  const [cardFeeValue, setCardFeeValue] = useState(0);
  
  // Hook para máscara de porcentagem
  const cardFeePercentageMask = usePercentageMask(cardFeeType === 'percentage' ? cardFeeValue : 0);

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-fill price when product is selected
    if (field === 'product_id' && value) {
      const product = products.find(p => p.id === value);
      if (product?.selling_price) {
        updatedItems[index].unit_price = product.selling_price;
      }
    }
    
    setItems(updatedItems);
  };

  const addExpense = () => {
    setExpenses([...expenses, { name: '', amount: 0, description: '' }]);
  };

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const updateExpense = (index: number, field: string, value: any) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index] = { ...updatedExpenses[index], [field]: value };
    setExpenses(updatedExpenses);
  };

  // Calcular taxa de cartão
  const calculateCardFee = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    if (cardFeeType === 'percentage') {
      return subtotal * (cardFeeValue / 100);
    }
    return cardFeeValue;
  };

  // Calcular totais
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const cardFeeAmount = calculateCardFee();
  const total = subtotal - discountAmount + cardFeeAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filtrar itens válidos
    const validItems = items.filter(item => item.product_id && item.quantity > 0);
    if (validItems.length === 0) {
      alert('Adicione pelo menos um item válido');
      return;
    }

    // Filtrar despesas válidas
    const validExpenses = expenses.filter(expense => expense.name.trim() && expense.amount > 0);

    const saleData: CreateSaleRequest = {
      sale_date: saleDate,
      items: validItems,
      expenses: validExpenses,
      discount_amount: discountAmount,
      notes,
      card_fee_type: cardFeeType,
      card_fee_value: cardFeeValue,
      card_fee_amount: cardFeeAmount
    };

    onSubmit(saleData);
  };

  const resetForm = () => {
    setSaleDate(new Date().toISOString().split('T')[0]);
    setItems([{ product_id: '', quantity: 1, unit_price: 0 }]);
    setExpenses([{ name: '', amount: 0, description: '' }]);
    setDiscountAmount(0);
    setNotes('');
    setCardFeeType('percentage');
    setCardFeeValue(0);
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  // Sync percentage mask
  useEffect(() => {
    if (cardFeeType === 'percentage') {
      cardFeePercentageMask.setValue(cardFeeValue);
    }
  }, [cardFeeValue, cardFeeType]);

  const handleCardFeeChange = (value: string) => {
    if (cardFeeType === 'percentage') {
      const numericValue = cardFeePercentageMask.handleChange(value);
      setCardFeeValue(numericValue);
    } else {
      const numericValue = parseFloat(value.replace(',', '.')) || 0;
      setCardFeeValue(numericValue);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Nova Venda
          </DialogTitle>
          <DialogDescription>
            Registre uma nova venda com produtos e informações de pagamento
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data da Venda */}
          <div className="space-y-2">
            <Label htmlFor="sale-date">Data da Venda</Label>
            <Input
              id="sale-date"
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              required
            />
          </div>

          {/* Itens da Venda */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Itens da Venda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
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
                            {product.name} - {formatCurrency(product.selling_price || 0)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-24">
                    <Label>Qtd</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  
                  <div className="w-32">
                    <Label>Preço Unit.</Label>
                    <CurrencyInput
                      value={item.unit_price}
                      onValueChange={(value) => updateItem(index, 'unit_price', value)}
                    />
                  </div>
                  
                  <div className="w-32">
                    <Label>Total</Label>
                    <div className="p-2 bg-gray-50 rounded text-sm font-medium">
                      {formatCurrency(item.quantity * item.unit_price)}
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </CardContent>
          </Card>

          {/* Taxa de Cartão */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Taxa de Cartão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="w-32">
                  <Label>Tipo de Taxa</Label>
                  <Select
                    value={cardFeeType}
                    onValueChange={(value: 'percentage' | 'fixed') => setCardFeeType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                      <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <Label>Valor da Taxa</Label>
                  {cardFeeType === 'percentage' ? (
                    <Input
                      type="text"
                      value={cardFeePercentageMask.displayValue}
                      onChange={(e) => handleCardFeeChange(e.target.value)}
                      placeholder="Ex: 3.9"
                    />
                  ) : (
                    <CurrencyInput
                      value={cardFeeValue}
                      onValueChange={setCardFeeValue}
                      placeholder="R$ 0,00"
                    />
                  )}
                </div>
                
                <div className="w-32">
                  <Label>Taxa Calculada</Label>
                  <div className="p-2 bg-gray-50 rounded text-sm font-medium">
                    {formatCurrency(cardFeeAmount)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Despesas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Despesas Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {expenses.map((expense, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Nome da Despesa</Label>
                    <Input
                      value={expense.name}
                      onChange={(e) => updateExpense(index, 'name', e.target.value)}
                      placeholder="Ex: Frete, Embalagem..."
                    />
                  </div>
                  
                  <div className="w-32">
                    <Label>Valor</Label>
                    <CurrencyInput
                      value={expense.amount}
                      onValueChange={(value) => updateExpense(index, 'amount', value)}
                    />
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeExpense(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addExpense}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Despesa
              </Button>
            </CardContent>
          </Card>

          {/* Desconto e Observações */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Desconto</Label>
              <CurrencyInput
                id="discount"
                value={discountAmount}
                onValueChange={setDiscountAmount}
                placeholder="R$ 0,00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações sobre a venda..."
                rows={3}
              />
            </div>
          </div>

          {/* Resumo */}
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Cartão:</span>
                  <span className="font-medium">{formatCurrency(cardFeeAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Desconto:</span>
                  <span className="font-medium text-red-600">-{formatCurrency(discountAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Despesas:</span>
                  <span className="font-medium text-red-600">{formatCurrency(totalExpenses)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Venda'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SalesForm;
