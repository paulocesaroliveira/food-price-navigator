import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Trash2, Package, DollarSign, Tag, ChefHat } from "lucide-react";
import { Product, Recipe, Packaging, ProductCategory } from "@/types";
import { formatCurrency } from "@/utils/calculations";
import { ProductCategoryManager } from "@/components/products/ProductCategoryManager";
import { toast } from "@/hooks/use-toast";

interface ProductFormProps {
  product?: Product;
  recipes: Recipe[];
  packaging: Packaging[];
  categories: ProductCategory[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  onCategoriesChange: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  recipes,
  packaging,
  categories,
  onSubmit,
  onCancel,
  onCategoriesChange,
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    categoryId: product?.categoryId || "",
    sellingPrice: product?.sellingPrice || 0,
  });

  const [items, setItems] = useState(product?.items || []);
  const [packagingItems, setPackagingItems] = useState(product?.packagingItems || []);
  const [totalCost, setTotalCost] = useState(product?.totalCost || 0);
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [recipeQuantity, setRecipeQuantity] = useState(1);
  const [recipeCost, setRecipeCost] = useState(0);
  const [selectedPackaging, setSelectedPackaging] = useState<string | null>(null);
  const [packagingQuantity, setPackagingQuantity] = useState(1);
  const [packagingCost, setPackagingCost] = useState(0);
  const [isPrimaryPackaging, setIsPrimaryPackaging] = useState(false);

  // Atualizar custos dos itens já selecionados quando as receitas mudam
  useEffect(() => {
    if (recipes.length > 0 && items.length > 0) {
      console.log('🔍 Verificando atualizações de custo das receitas...');
      
      const updatedItems = items.map(item => {
        const currentRecipe = recipes.find(r => r.id === item.recipeId);
        if (currentRecipe) {
          const currentUnitCost = currentRecipe.unitCost;
          const itemRecipeUnitCost = item.recipe?.unitCost || 0;
          
          // Verifica se o custo mudou
          if (Math.abs(currentUnitCost - itemRecipeUnitCost) > 0.001) {
            const newCost = currentUnitCost * item.quantity;
            console.log(`🔄 Atualizando custo do item ${item.recipe?.name}:`);
            console.log(`   Custo anterior: R$ ${itemRecipeUnitCost.toFixed(2)} × ${item.quantity} = R$ ${item.cost.toFixed(2)}`);
            console.log(`   Custo atual: R$ ${currentUnitCost.toFixed(2)} × ${item.quantity} = R$ ${newCost.toFixed(2)}`);
            
            return {
              ...item,
              cost: newCost,
              recipe: {
                ...item.recipe!,
                unitCost: currentUnitCost,
              },
            };
          }
        }
        return item;
      });
      
      // Só atualiza se houve mudança real
      const hasChanges = updatedItems.some((item, index) => 
        Math.abs(item.cost - items[index].cost) > 0.001
      );
      
      if (hasChanges) {
        console.log('✅ Itens atualizados com novos custos das receitas');
        setItems(updatedItems);
      }
    }
  }, [recipes.map(r => `${r.id}-${r.unitCost}`).join(','), items.length]);

  useEffect(() => {
    recalculateTotalCost();
  }, [items, packagingItems]);

  const recalculateTotalCost = () => {
    const itemsCost = items.reduce((acc, item) => acc + item.cost, 0);
    const packagingCost = packagingItems.reduce((acc, pkg) => acc + pkg.cost, 0);
    setTotalCost(itemsCost + packagingCost);
  };

  const handleAddItem = () => {
    if (!selectedRecipe) {
      toast({
        title: "Erro",
        description: "Selecione uma receita",
        variant: "destructive",
      });
      return;
    }

    const recipe = recipes.find((r) => r.id === selectedRecipe);
    if (!recipe) {
      toast({
        title: "Erro",
        description: "Receita não encontrada",
        variant: "destructive",
      });
      return;
    }

    const cost = recipe.unitCost * recipeQuantity;

    setItems([
      ...items,
      {
        id: `temp-${Date.now()}`,
        recipeId: selectedRecipe,
        quantity: recipeQuantity,
        cost: cost,
        recipe: {
          id: recipe.id,
          name: recipe.name,
          image: recipe.image,
          unitCost: recipe.unitCost,
        },
      },
    ]);

    setSelectedRecipe(null);
    setRecipeQuantity(1);
    setRecipeCost(0);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleRecipeChange = (value: string) => {
    setSelectedRecipe(value);

    const recipe = recipes.find((r) => r.id === value);
    if (recipe) {
      setRecipeCost(recipe.unitCost * recipeQuantity);
    } else {
      setRecipeCost(0);
    }
  };

  const handleRecipeQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value) || 1;
    setRecipeQuantity(quantity);

    if (selectedRecipe) {
      const recipe = recipes.find((r) => r.id === selectedRecipe);
      if (recipe) {
        setRecipeCost(recipe.unitCost * quantity);
      }
    }
  };

  const handleAddPackaging = () => {
    if (!selectedPackaging) {
      toast({
        title: "Erro",
        description: "Selecione uma embalagem",
        variant: "destructive",
      });
      return;
    }

    const packagingItem = packaging.find((p) => p.id === selectedPackaging);
    if (!packagingItem) {
      toast({
        title: "Erro",
        description: "Embalagem não encontrada",
        variant: "destructive",
      });
      return;
    }

    const cost = packagingItem.unitCost * packagingQuantity;

    setPackagingItems([
      ...packagingItems,
      {
        id: `temp-${Date.now()}`,
        packagingId: selectedPackaging,
        quantity: packagingQuantity,
        cost: cost,
        isPrimary: isPrimaryPackaging,
        packaging: {
          id: packagingItem.id,
          name: packagingItem.name,
          type: packagingItem.type,
          bulkQuantity: packagingItem.bulkQuantity,
          bulkPrice: packagingItem.bulkPrice,
          unitCost: packagingItem.unitCost,
          imageUrl: packagingItem.imageUrl,
          notes: packagingItem.notes,
        },
      },
    ]);

    setSelectedPackaging(null);
    setPackagingQuantity(1);
    setPackagingCost(0);
    setIsPrimaryPackaging(false);
  };

  const handleRemovePackaging = (index: number) => {
    setPackagingItems(packagingItems.filter((_, i) => i !== index));
  };

  const handlePackagingChange = (value: string) => {
    setSelectedPackaging(value);

    const packagingItem = packaging.find((p) => p.id === value);
    if (packagingItem) {
      setPackagingCost(packagingItem.unitCost * packagingQuantity);
    } else {
      setPackagingCost(0);
    }
  };

  const handlePackagingQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value) || 1;
    setPackagingQuantity(quantity);

    if (selectedPackaging) {
      const packagingItem = packaging.find((p) => p.id === selectedPackaging);
      if (packagingItem) {
        setPackagingCost(packagingItem.unitCost * quantity);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do produto é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Erro", 
        description: "Adicione pelo menos uma receita ao produto",
        variant: "destructive",
      });
      return;
    }

    const itemsCost = items.reduce((acc, item) => acc + item.cost, 0);
    const packagingCost = packagingItems.reduce((acc, pkg) => acc + pkg.cost, 0);

    const productData = {
      name: formData.name,
      categoryId: formData.categoryId || null,
      items,
      packagingItems,
      totalCost: itemsCost + packagingCost,
      sellingPrice: formData.sellingPrice,
    };

    onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Digite o nome do produto"
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <div className="flex gap-2">
              <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Sem categoria</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ProductCategoryManager
                categories={categories}
                onCategoriesChange={onCategoriesChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sellingPrice">Valor de Venda (R$)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="sellingPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                placeholder="0,00"
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receitas */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Receitas
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Receita
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="recipe">Receita</Label>
              <Select value={selectedRecipe || ""} onValueChange={handleRecipeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma receita" />
                </SelectTrigger>
                <SelectContent>
                  {recipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id}>
                      {recipe.name} ({formatCurrency(recipe.unitCost)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                type="number"
                id="quantity"
                min="1"
                value={recipeQuantity}
                onChange={handleRecipeQuantityChange}
              />
            </div>
          </div>

          <Separator />

          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma receita adicionada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <p className="font-medium">{item.recipe?.name}</p>
                    <p className="text-sm text-gray-500">
                      Quantidade: {item.quantity} - {formatCurrency(item.cost)}
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Embalagens */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Embalagens
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddPackaging}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Embalagem
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="packaging">Embalagem</Label>
              <Select value={selectedPackaging || ""} onValueChange={handlePackagingChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma embalagem" />
                </SelectTrigger>
                <SelectContent>
                  {packaging.map((pack) => (
                    <SelectItem key={pack.id} value={pack.id}>
                      {pack.name} ({formatCurrency(pack.unitCost)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="packaging-quantity">Quantidade</Label>
              <Input
                type="number"
                id="packaging-quantity"
                min="1"
                value={packagingQuantity}
                onChange={handlePackagingQuantityChange}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-primary"
              checked={isPrimaryPackaging}
              onCheckedChange={(checked) => setIsPrimaryPackaging(checked === true)}
            />
            <Label htmlFor="is-primary">Embalagem Primária</Label>
          </div>

          <Separator />

          {packagingItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma embalagem adicionada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {packagingItems.map((pack, index) => (
                <div key={index} className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <p className="font-medium">{pack.packaging?.name}</p>
                    <p className="text-sm text-gray-500">
                      Quantidade: {pack.quantity} - {formatCurrency(pack.cost)}
                    </p>
                    {pack.isPrimary && <Badge variant="secondary">Primária</Badge>}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleRemovePackaging(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <p className="text-lg font-medium">Custo Total:</p>
            <p className="text-lg font-medium">{formatCurrency(totalCost)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {product ? "Atualizar Produto" : "Criar Produto"}
        </Button>
      </div>
    </form>
  );
};
