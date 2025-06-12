import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { getProductList } from "@/services/productService";
import { getSalePoints, createSalePoint, deleteSalePoint } from "@/services/salePointService";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CalendarIcon, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Receipt, 
  Percent,
  MapPin,
  X
} from "lucide-react";
import { formatCurrency } from "@/utils/calculations";
import { toast } from "@/hooks/use-toast";

interface SaleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (sale: any) => void;
  editingSale: Sale | null;
  isLoading: boolean;
}

interface SaleItemInput {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface SaleExpenseInput {
  name: string;
  amount: number;
  type: 'expense' | 'tax' | 'fee';
  description?: string;
}

const SaleForm: React.FC<SaleFormProps> = ({ 
  isOpen, 
  onOpenChange, 
  onSubmit, 
  editingSale = null,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    sale_date: format(new Date(), "yyyy-MM-dd"),
    discount_amount: 0,
    sale_point_id: "",
    notes: "",
  });

  const [saleItems, setSaleItems] = useState<SaleItemInput[]>([]);
  const [saleExpenses, setSaleExpenses] = useState<SaleExpenseInput[]>([]);
  const [saleDate, setSaleDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSalePointName, setNewSalePointName] = useState("");
  const [showNewSalePointInput, setShowNewSalePointInput] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProductList
  });

  const { data: salePoints = [], refetch: refetchSalePoints } = useQuery({
    queryKey: ['sale-points'],
    queryFn: getSalePoints
  });

  const addSaleItem = () => {
    setSaleItems([...saleItems, {
      product_id: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    }]);
  };

  const removeSaleItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const updateSaleItem = (index: number, field: keyof SaleItemInput, value: any) => {
    const updatedItems = [...saleItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product && product.sellingPrice) {
        updatedItems[index].unit_price = product.sellingPrice;
        updatedItems[index].total_price = updatedItems[index].quantity * product.sellingPrice;
      }
    }
    
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total_price = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    setSaleItems(updatedItems);
  };

  const addSaleExpense = () => {
    setSaleExpenses([...saleExpenses, {
      name: "",
      amount: 0,
      type: "expense",
      description: ""
    }]);
  };

  const removeSaleExpense = (index: number) => {
    setSaleExpenses(saleExpenses.filter((_, i) => i !== index));
  };

  const updateSaleExpense = (index: number, field: keyof SaleExpenseInput, value: any) => {
    const updatedExpenses = [...saleExpenses];
    updatedExpenses[index] = { ...updatedExpenses[index], [field]: value };
    setSaleExpenses(updatedExpenses);
  };

  const getTotalItems = () => {
    return saleItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const getTotalExpenses = () => {
    return saleExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getSubtotal = () => {
    return getTotalItems() + getTotalExpenses();
  };

  const getTotalAmount = () => {
    return getSubtotal() - formData.discount_amount;
  };

  const handleCreateSalePoint = async () => {
    if (!newSalePointName.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome do ponto de venda",
        variant: "destructive"
      });
      return;
    }

    const result = await createSalePoint({
      name: newSalePointName,
      is_active: true
    });

    if (result) {
      setNewSalePointName("");
      setShowNewSalePointInput(false);
      refetchSalePoints();
      setFormData({ ...formData, sale_point_id: result.id });
    }
  };

  const handleDeleteSalePoint = async (id: string) => {
    const success = await deleteSalePoint(id);
    if (success) {
      refetchSalePoints();
      if (formData.sale_point_id === id) {
        setFormData({ ...formData, sale_point_id: "" });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saleItems.length === 0) {
      toast({
        title: "Erro", 
        description: "Adicione pelo menos um produto",
        variant: "destructive"
      });
      return;
    }

    const invalidItems = saleItems.some(item => !item.product_id || item.quantity <= 0 || item.unit_price <= 0);
    if (invalidItems) {
      toast({
        title: "Erro",
        description: "Verifique se todos os produtos têm quantidade e preço válidos",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const salePayload = {
        ...formData,
        sale_date: format(saleDate, "yyyy-MM-dd"),
        items: saleItems,
        expenses: saleExpenses.length > 0 ? saleExpenses : undefined,
        discount_amount: formData.discount_amount,
        sale_point_id: formData.sale_point_id || undefined
      };

      // Aqui você chamaria o serviço de criação de venda
      // const createdSale = await createSale(salePayload);
      
      toast({
        title: "Sucesso",
        description: "Venda criada com sucesso!"
      });
      
      onSubmit(salePayload);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Não foi possível criar a venda: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addProduct = (product: Product) => {
    const existingIndex = selectedProducts.findIndex(p => p.id === product.id);
    
    if (existingIndex >= 0) {
      const updated = [...selectedProducts];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalPrice = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setSelectedProducts(updated);
    } else {
      const unitPrice = product.selling_price || 0;
      const unitCost = product.total_cost || 0;
      const totalPrice = unitPrice;
      const totalCost = unitCost;
      
      setSelectedProducts(prev => [...prev, {
        id: product.id,
        name: product.name,
        quantity: 1,
        unitPrice,
        totalPrice,
        unitCost,
        totalCost,
        product
      }]);
    }
  };

  const ProductSelector = () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto">
        {filteredProducts.map((product) => (
          <Card 
            key={product.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => addProduct(product)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{product.name}</h4>
                  <p className="text-sm text-green-600 font-medium">
                    {formatCurrency(product.selling_price || 0)}
                  </p>
                  {product.category && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {product.category.name}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Informações da Venda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Data da Venda</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !saleDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {saleDate ? format(saleDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={saleDate}
                    onSelect={(date) => date && setSaleDate(date)}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="sale_point">Ponto de Venda</Label>
              <div className="flex gap-2">
                <Select value={formData.sale_point_id} onValueChange={(value) => setFormData({...formData, sale_point_id: value})}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione o ponto de venda" />
                  </SelectTrigger>
                  <SelectContent>
                    {salePoints.map((point) => (
                      <SelectItem key={point.id} value={point.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{point.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSalePoint(point.id);
                            }}
                            className="ml-2 h-4 w-4 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewSalePointInput(!showNewSalePointInput)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {showNewSalePointInput && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Nome do novo ponto de venda"
                    value={newSalePointName}
                    onChange={(e) => setNewSalePointName(e.target.value)}
                  />
                  <Button type="button" onClick={handleCreateSalePoint} size="sm">
                    Criar
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Observações sobre a venda..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Produtos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Produtos</CardTitle>
            <Button type="button" onClick={addSaleItem} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {saleItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum produto adicionado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {saleItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <Label>Produto</Label>
                      <Select 
                        value={item.product_id} 
                        onValueChange={(value) => updateSaleItem(index, 'product_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              <div className="flex flex-col">
                                <span>{product.name}</span>
                                {product.sellingPrice && (
                                  <span className="text-sm text-gray-500">
                                    {formatCurrency(product.sellingPrice)}
                                  </span>
                                )}
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
                        value={item.quantity}
                        onChange={(e) => updateSaleItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    
                    <div>
                      <Label>Preço Unitário</Label>
                      <Input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateSaleItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeSaleItem(index)}
                        className="w-full text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-right">
                    <span className="font-medium">Total: {formatCurrency(item.total_price)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Desconto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Desconto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="discount_amount">Valor do Desconto (R$)</Label>
            <Input
              id="discount_amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.discount_amount}
              onChange={(e) => setFormData({...formData, discount_amount: parseFloat(e.target.value) || 0})}
              placeholder="0,00"
            />
          </div>
        </CardContent>
      </Card>

      {/* Despesas */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Despesas (Opcional)
            </CardTitle>
            <Button type="button" onClick={addSaleExpense} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Despesa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {saleExpenses.length === 0 ? (
            <p className="text-center py-4 text-gray-500">Nenhuma despesa adicionada</p>
          ) : (
            <div className="space-y-4">
              {saleExpenses.map((expense, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Nome</Label>
                      <Input 
                        value={expense.name}
                        onChange={(e) => updateSaleExpense(index, 'name', e.target.value)}
                        placeholder="Ex: Comissão"
                      />
                    </div>
                    
                    <div>
                      <Label>Tipo</Label>
                      <Select 
                        value={expense.type} 
                        onValueChange={(value) => updateSaleExpense(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expense">Despesa</SelectItem>
                          <SelectItem value="tax">Taxa</SelectItem>
                          <SelectItem value="fee">Comissão</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Valor (R$)</Label>
                      <Input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={expense.amount}
                        onChange={(e) => updateSaleExpense(index, 'amount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeSaleExpense(index)}
                        className="w-full text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Venda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal dos Produtos:</span>
              <span>{formatCurrency(getTotalItems())}</span>
            </div>
            {getTotalExpenses() > 0 && (
              <div className="flex justify-between">
                <span>Total de Despesas:</span>
                <span>{formatCurrency(getTotalExpenses())}</span>
              </div>
            )}
            {formData.discount_amount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Desconto:</span>
                <span>-{formatCurrency(formData.discount_amount)}</span>
              </div>
            )}
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Final:</span>
                <span>{formatCurrency(getTotalAmount())}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Criando..." : "Criar Venda"}
        </Button>
      </div>
    </form>
  );
};

export default SaleForm;
