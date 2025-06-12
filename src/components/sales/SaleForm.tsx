
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Plus, Minus, X } from 'lucide-react';
import { getProductList } from '@/services/productService';
import { getSalePoints } from '@/services/salePointService';
import { getDiscountCategories } from '@/services/discountCategoryService';
import { createSale } from '@/services/salesService';
import { formatCurrency } from '@/utils/calculations';
import { Product, Sale } from '@/types';
import { toast } from '@/hooks/use-toast';

interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unitCost: number;
  totalCost: number;
  product: Product;
}

interface SaleFormProps {
  onSubmit: (sale: Sale) => void;
  onCancel: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    sale_point_id: '',
    discount_category_id: '',
    discount_amount: 0,
    notes: ''
  });

  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProductList
  });

  const { data: salePoints = [] } = useQuery({
    queryKey: ['sale-points'],
    queryFn: getSalePoints
  });

  const { data: discountCategories = [] } = useQuery({
    queryKey: ['discount-categories'],
    queryFn: getDiscountCategories
  });

  // Get categories for filtering
  const categories = [...new Set(products.map(p => p.category?.name).filter(Boolean))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate totals
  const subtotal = saleItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalCost = saleItems.reduce((sum, item) => sum + item.totalCost, 0);
  const totalAmount = subtotal - formData.discount_amount;
  const grossProfit = subtotal - totalCost;
  const netProfit = totalAmount - totalCost;

  const addProductToSale = (product: Product) => {
    const existingItem = saleItems.find(item => item.id === product.id);
    
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      const unitPrice = product.selling_price || 0;
      const unitCost = product.total_cost || 0;

      const newItem: SaleItem = {
        id: product.id,
        name: product.name,
        quantity: 1,
        unitPrice: unitPrice,
        totalPrice: unitPrice * 1,
        unitCost: unitCost,
        totalCost: unitCost * 1,
        product: product
      };

      setSaleItems(prev => [...prev, newItem]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setSaleItems(prev => prev.map(item => {
      if (item.id === productId) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.unitPrice * newQuantity,
          totalCost: item.unitCost * newQuantity
        };
      }
      return item;
    }));
  };

  const updateUnitPrice = (productId: string, newPrice: number) => {
    setSaleItems(prev => prev.map(item => {
      if (item.id === productId) {
        return {
          ...item,
          unitPrice: newPrice,
          totalPrice: newPrice * item.quantity
        };
      }
      return item;
    }));
  };

  const removeItem = (productId: string) => {
    setSaleItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saleItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um produto à venda",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const saleData = {
        ...formData,
        total_amount: totalAmount,
        total_cost: totalCost,
        gross_profit: grossProfit,
        net_profit: netProfit,
        items: saleItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
          unit_cost: item.unitCost,
          total_cost: item.totalCost
        }))
      };

      const newSale = await createSale(saleData);
      
      if (newSale) {
        toast({
          title: "Sucesso",
          description: "Venda registrada com sucesso!"
        });
        onSubmit(newSale);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao registrar venda",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Selecionar Produtos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category || ''}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => addProductToSale(product)}
              >
                <div className="flex-1">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">
                    {formatCurrency(product.selling_price || 0)}
                  </div>
                  {product.category && (
                    <Badge variant="secondary" className="text-xs">
                      {product.category.name}
                    </Badge>
                  )}
                </div>
                <Package className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sale Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Venda</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sale Items */}
            <div className="space-y-4">
              <Label>Itens da Venda</Label>
              {saleItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum produto adicionado
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {saleItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency(item.unitPrice)} cada
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                          className="w-16 text-center"
                          min="1"
                        />
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateUnitPrice(item.id, parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />

                      <div className="text-sm font-medium w-20 text-right">
                        {formatCurrency(item.totalPrice)}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sale Configuration */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="sale_point_id">Ponto de Venda</Label>
                <Select value={formData.sale_point_id} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, sale_point_id: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ponto de venda" />
                  </SelectTrigger>
                  <SelectContent>
                    {salePoints.map((point) => (
                      <SelectItem key={point.id} value={point.id}>
                        {point.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discount_category_id">Categoria de Desconto</Label>
                <Select value={formData.discount_category_id} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, discount_category_id: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {discountCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discount_amount">Valor do Desconto</Label>
                <Input
                  id="discount_amount"
                  type="number"
                  step="0.01"
                  value={formData.discount_amount}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    discount_amount: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações sobre a venda..."
                />
              </div>
            </div>

            {/* Totals */}
            {saleItems.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Desconto:</span>
                  <span>-{formatCurrency(formData.discount_amount)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Lucro Líquido:</span>
                  <span>{formatCurrency(netProfit)}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || saleItems.length === 0}
              >
                {isSubmitting ? 'Salvando...' : 'Registrar Venda'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SaleForm;
