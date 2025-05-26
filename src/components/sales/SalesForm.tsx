import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { createSale } from "@/services/salesService";
import { CreateSaleRequest, CreateSaleItemRequest, CreateSaleExpenseRequest } from "@/types/sales";
import { ArrowLeft, Plus, Trash2, ShoppingCart, Receipt, Percent, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getDiscountCategories, createDiscountCategory } from "@/services/discountCategoryService";
import { getSaleExpenseCategories, createSaleExpenseCategory } from "@/services/saleExpenseCategoryService";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SalesFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SalesForm = ({ onClose, onSuccess }: SalesFormProps) => {
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountCategoryId, setDiscountCategoryId] = useState("");
  const [items, setItems] = useState<CreateSaleItemRequest[]>([]);
  const [expenses, setExpenses] = useState<CreateSaleExpenseRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscountCategoryDialog, setShowDiscountCategoryDialog] = useState(false);
  const [showExpenseCategoryDialog, setShowExpenseCategoryDialog] = useState(false);
  const [newDiscountCategoryName, setNewDiscountCategoryName] = useState("");
  const [newExpenseCategoryName, setNewExpenseCategoryName] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: ['products-for-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, total_cost, selling_price")
        .order("name");
      
      if (error) throw error;
      return data;
    }
  });

  const { data: discountCategories = [], refetch: refetchDiscountCategories } = useQuery({
    queryKey: ['discount-categories'],
    queryFn: getDiscountCategories
  });

  const { data: saleExpenseCategories = [], refetch: refetchSaleExpenseCategories } = useQuery({
    queryKey: ['sale-expense-categories'],
    queryFn: getSaleExpenseCategories
  });

  const addItem = () => {
    setItems([...items, {
      product_id: "",
      quantity: 1,
      unit_price: 0,
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof CreateSaleItemRequest, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'product_id') {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct && selectedProduct.selling_price) {
        updatedItems[index].unit_price = selectedProduct.selling_price;
      }
    }
    
    setItems(updatedItems);
  };

  const addExpense = () => {
    setExpenses([...expenses, {
      name: "",
      amount: 0,
      type: "expense",
      description: "",
      category_id: "",
    }]);
  };

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const updateExpense = (index: number, field: keyof CreateSaleExpenseRequest, value: any) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index] = { ...updatedExpenses[index], [field]: value };
    setExpenses(updatedExpenses);
  };

  const handleCreateDiscountCategory = async () => {
    if (!newDiscountCategoryName.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome da categoria",
        variant: "destructive"
      });
      return;
    }

    const result = await createDiscountCategory({
      name: newDiscountCategoryName,
    });

    if (result) {
      setNewDiscountCategoryName("");
      setShowDiscountCategoryDialog(false);
      refetchDiscountCategories();
      setDiscountCategoryId(result.id);
    }
  };

  const handleCreateExpenseCategory = async () => {
    if (!newExpenseCategoryName.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome da categoria",
        variant: "destructive"
      });
      return;
    }

    const result = await createSaleExpenseCategory({
      name: newExpenseCategoryName,
    });

    if (result) {
      setNewExpenseCategoryName("");
      setShowExpenseCategoryDialog(false);
      refetchSaleExpenseCategories();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      alert("Adicione pelo menos um item à venda");
      return;
    }

    if (items.some(item => !item.product_id || item.quantity <= 0 || item.unit_price <= 0)) {
      alert("Preencha todos os campos dos itens corretamente");
      return;
    }

    setIsSubmitting(true);

    const saleData: CreateSaleRequest = {
      sale_date: saleDate,
      discount_amount: discountAmount > 0 ? discountAmount : undefined,
      discount_category_id: discountCategoryId || undefined,
      notes: notes || undefined,
      items,
      expenses: expenses.length > 0 ? expenses : undefined,
    };

    const result = await createSale(saleData);
    
    if (result) {
      onSuccess();
    }
    
    setIsSubmitting(false);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netAmount = totalAmount - totalExpenses - discountAmount;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">Nova Venda</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Informações gerais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Venda</CardTitle>
              <CardDescription>Configure os dados básicos da venda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sale_date">Data da Venda</Label>
                <Input
                  id="sale_date"
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações sobre a venda..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Itens da venda */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Itens da Venda
                  </CardTitle>
                  <CardDescription>Adicione os produtos vendidos</CardDescription>
                </div>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhum item adicionado. Clique em "Adicionar Item" para começar.
                </p>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                      <div className="md:col-span-2">
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
                          step="0.01"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Despesas e Taxas */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Despesas e Taxas
                  </CardTitle>
                  <CardDescription>Adicione despesas relacionadas à venda</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={showExpenseCategoryDialog} onOpenChange={setShowExpenseCategoryDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Categorias
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nova Categoria de Despesa</DialogTitle>
                        <DialogDescription>
                          Crie uma nova categoria para organizar suas despesas
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="category-name">Nome da Categoria</Label>
                          <Input
                            id="category-name"
                            value={newExpenseCategoryName}
                            onChange={(e) => setNewExpenseCategoryName(e.target.value)}
                            placeholder="Ex: Comissões, Taxas de Entrega..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowExpenseCategoryDialog(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCreateExpenseCategory}>
                          Criar Categoria
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button type="button" onClick={addExpense} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Despesa
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Nenhuma despesa adicionada.
                </p>
              ) : (
                <div className="space-y-4">
                  {expenses.map((expense, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                      <div>
                        <Label>Nome</Label>
                        <Input
                          value={expense.name}
                          onChange={(e) => updateExpense(index, 'name', e.target.value)}
                          placeholder="Ex: Taxa de entrega"
                        />
                      </div>
                      
                      <div>
                        <Label>Categoria</Label>
                        <Select
                          value={expense.category_id}
                          onValueChange={(value) => updateExpense(index, 'category_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {saleExpenseCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Tipo</Label>
                        <Select
                          value={expense.type}
                          onValueChange={(value) => updateExpense(index, 'type', value)}
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
                        <Label>Valor</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={expense.amount}
                          onChange={(e) => updateExpense(index, 'amount', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div>
                        <Label>Descrição</Label>
                        <Input
                          value={expense.description}
                          onChange={(e) => updateExpense(index, 'description', e.target.value)}
                          placeholder="Opcional"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeExpense(index)}
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seção de Desconto */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="h-5 w-5" />
                    Desconto
                  </CardTitle>
                  <CardDescription>Configure desconto para esta venda</CardDescription>
                </div>
                <Dialog open={showDiscountCategoryDialog} onOpenChange={setShowDiscountCategoryDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Categorias
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Categoria de Desconto</DialogTitle>
                      <DialogDescription>
                        Crie uma nova categoria para organizar seus descontos
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="discount-category-name">Nome da Categoria</Label>
                        <Input
                          id="discount-category-name"
                          value={newDiscountCategoryName}
                          onChange={(e) => setNewDiscountCategoryName(e.target.value)}
                          placeholder="Ex: Desconto Cliente VIP, Promoção..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowDiscountCategoryDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateDiscountCategory}>
                        Criar Categoria
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_category">Categoria do Desconto</Label>
                  <Select
                    value={discountCategoryId}
                    onValueChange={setDiscountCategoryId}
                  >
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
                  <Label htmlFor="discount">Valor do Desconto (R$)</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Venda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal dos Itens:</span>
                  <span className="font-medium">R$ {totalAmount.toFixed(2)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Desconto:</span>
                    <span className="font-medium">R$ {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-red-600">
                  <span>Total de Despesas:</span>
                  <span className="font-medium">R$ {totalExpenses.toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Líquido:</span>
                    <span>R$ {netAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-food-coral hover:bg-food-coral/90 text-white dark:bg-food-coralDark dark:hover:bg-food-coralDark/90"
                disabled={isSubmitting || items.length === 0}
              >
                {isSubmitting ? "Salvando..." : "Registrar Venda"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default SalesForm;
