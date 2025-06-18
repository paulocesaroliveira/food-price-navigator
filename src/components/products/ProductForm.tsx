
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecipeSelector } from "./RecipeSelector";
import { PackagingSelector } from "./PackagingSelector";
import { ProductCostSummary } from "./ProductCostSummary";
import { Product, ProductCategory, Recipe, Packaging } from "@/types";
import { Plus, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const productSchema = z.object({
  name: z.string().min(2, { message: "Nome é obrigatório" }),
  categoryId: z.string().optional(),
  sellingPrice: z.coerce.number().min(0, { message: "Valor deve ser maior ou igual a 0" }),
  items: z.array(z.object({
    recipeId: z.string(),
    quantity: z.coerce.number().positive(),
    cost: z.coerce.number().min(0),
  })).min(1, { message: "Adicione pelo menos uma receita" }),
  packagingItems: z.array(z.object({
    packagingId: z.string(),
    quantity: z.coerce.number().positive(),
    cost: z.coerce.number().min(0),
    isPrimary: z.boolean(),
  })).optional(),
});

type ProductFormProps = {
  product?: Product;
  onSubmit: (data: z.infer<typeof productSchema>) => void;
  onCancel: () => void;
  categories: ProductCategory[];
  recipes: Recipe[];
  packaging: Packaging[];
};

export const ProductForm = ({
  product,
  onSubmit,
  onCancel,
  categories,
  recipes,
  packaging,
}: ProductFormProps) => {
  const { user } = useAuth();
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      categoryId: product?.categoryId || "",
      sellingPrice: product?.sellingPrice || 0,
      items: product?.items || [],
      packagingItems: product?.packagingItems || [],
    },
  });

  // Watch form values for cost calculations
  const watchedItems = form.watch("items");
  const watchedPackagingItems = form.watch("packagingItems");
  const watchedSellingPrice = form.watch("sellingPrice");

  // Calculate individual item costs automatically
  useEffect(() => {
    const currentItems = form.getValues("items");
    let hasChanges = false;

    const updatedItems = currentItems.map(item => {
      if (item.recipeId && item.quantity) {
        const recipe = recipes.find(r => r.id === item.recipeId);
        if (recipe) {
          const newCost = recipe.unitCost * item.quantity;
          if (item.cost !== newCost) {
            hasChanges = true;
            return { ...item, cost: newCost };
          }
        }
      }
      return item;
    });

    if (hasChanges) {
      form.setValue("items", updatedItems);
    }
  }, [watchedItems, recipes, form]);

  // Calculate packaging costs automatically
  useEffect(() => {
    const currentPackaging = form.getValues("packagingItems") || [];
    let hasChanges = false;

    const updatedPackaging = currentPackaging.map(item => {
      if (item.packagingId && item.quantity) {
        const pkg = packaging.find(p => p.id === item.packagingId);
        if (pkg) {
          const newCost = pkg.unitCost * item.quantity;
          if (item.cost !== newCost) {
            hasChanges = true;
            return { ...item, cost: newCost };
          }
        }
      }
      return item;
    });

    if (hasChanges) {
      form.setValue("packagingItems", updatedPackaging);
    }
  }, [watchedPackagingItems, packaging, form]);

  // Calculate total costs
  const totalRecipeCost = watchedItems?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0;
  const totalPackagingCost = watchedPackagingItems?.reduce((sum, pkg) => sum + (pkg.cost || 0), 0) || 0;

  const addRecipe = () => {
    const currentItems = form.getValues("items");
    form.setValue("items", [
      ...currentItems,
      { recipeId: "", quantity: 1, cost: 0 }
    ]);
  };

  const removeRecipe = (index: number) => {
    const currentItems = form.getValues("items");
    form.setValue("items", currentItems.filter((_, i) => i !== index));
  };

  const addPackaging = () => {
    const currentPackaging = form.getValues("packagingItems") || [];
    form.setValue("packagingItems", [
      ...currentPackaging,
      { packagingId: "", quantity: 1, cost: 0, isPrimary: currentPackaging.length === 0 }
    ]);
  };

  const removePackaging = (index: number) => {
    const currentPackaging = form.getValues("packagingItems") || [];
    form.setValue("packagingItems", currentPackaging.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const currentItems = form.getValues("items");
    currentItems[index] = { ...currentItems[index], [field]: value };
    
    // Auto-calculate cost when recipe or quantity changes
    if ((field === 'recipeId' || field === 'quantity') && currentItems[index].recipeId && currentItems[index].quantity) {
      const recipe = recipes.find(r => r.id === currentItems[index].recipeId);
      if (recipe) {
        currentItems[index].cost = recipe.unitCost * currentItems[index].quantity;
      }
    }
    
    form.setValue("items", currentItems);
  };

  const handlePackagingChange = (index: number, field: string, value: any) => {
    const currentPackaging = form.getValues("packagingItems") || [];
    currentPackaging[index] = { ...currentPackaging[index], [field]: value };
    
    // Auto-calculate cost when packaging or quantity changes
    if ((field === 'packagingId' || field === 'quantity') && currentPackaging[index].packagingId && currentPackaging[index].quantity) {
      const pkg = packaging.find(p => p.id === currentPackaging[index].packagingId);
      if (pkg) {
        currentPackaging[index].cost = pkg.unitCost * currentPackaging[index].quantity;
      }
    }
    
    form.setValue("packagingItems", currentPackaging);
  };

  const handleFormSubmit = async (values: z.infer<typeof productSchema>) => {
    // Garantir que o user_id seja incluído nos dados
    const productData = {
      ...values,
      userId: user?.id, // Adicionar user_id do usuário autenticado
    };
    onSubmit(productData);
  };

  return (
    <div className="space-y-6">
      {/* Mobile header with category button */}
      <div className="flex items-center justify-between lg:hidden">
        <h3 className="text-lg font-medium">
          {product ? 'Editar Produto' : 'Novo Produto'}
        </h3>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Categorias
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Basic Info - Mobile Optimized */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Produto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Bolo de Chocolate Premium" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria (opcional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor de Venda</FormLabel>
                        <FormControl>
                          <CurrencyInput
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="R$ 0,00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Recipes Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <CardTitle className="text-base">Receitas</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addRecipe}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Receita
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <RecipeSelector
                    recipes={recipes}
                    selectedItems={watchedItems || []}
                    onItemChange={handleItemChange}
                    onRemoveItem={removeRecipe}
                  />
                </CardContent>
              </Card>

              {/* Packaging Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <CardTitle className="text-base">Embalagens (opcional)</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addPackaging}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Embalagem
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <PackagingSelector
                    packaging={packaging}
                    selectedItems={watchedPackagingItems || []}
                    onItemChange={handlePackagingChange}
                    onRemoveItem={removePackaging}
                  />
                </CardContent>
              </Card>
              
              {/* Mobile Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  {product ? "Atualizar Produto" : "Criar Produto"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Cost Summary - Hidden on mobile, shown in a separate card */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4">
            <ProductCostSummary
              totalRecipeCost={totalRecipeCost}
              totalPackagingCost={totalPackagingCost}
              sellingPrice={watchedSellingPrice || 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
