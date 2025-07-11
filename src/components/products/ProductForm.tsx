import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const productSchema = z.object({
  name: z.string().min(2, { message: "Nome é obrigatório" }),
  categoryId: z.string().optional(),
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
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      items: [{ recipeId: "", quantity: 1, cost: 0 }],
      packagingItems: [],
    },
  });

  // Load product data when editing
  useEffect(() => {
    if (product) {
      console.log("ProductForm - Loading product data:", product);
      
      // Set basic product info
      form.setValue("name", product.name || "");
      form.setValue("categoryId", product.category_id || "");
      
      // Set recipe items with proper mapping
      if (product.items && Array.isArray(product.items) && product.items.length > 0) {
        const formattedItems = product.items.map((item: any) => ({
          recipeId: item.recipeId || item.recipe_id || "",
          quantity: item.quantity || 1,
          cost: item.cost || 0,
        }));
        console.log("ProductForm - Setting recipe items:", formattedItems);
        form.setValue("items", formattedItems);
      } else {
        form.setValue("items", [{ recipeId: "", quantity: 1, cost: 0 }]);
      }
      
      // Set packaging items with proper mapping
      if (product.packagingItems && Array.isArray(product.packagingItems) && product.packagingItems.length > 0) {
        const formattedPackaging = product.packagingItems.map((item: any) => ({
          packagingId: item.packagingId || item.packaging_id || "",
          quantity: item.quantity || 1,
          cost: item.cost || 0,
          isPrimary: item.isPrimary || item.is_primary || false,
        }));
        console.log("ProductForm - Setting packaging items:", formattedPackaging);
        form.setValue("packagingItems", formattedPackaging);
      } else {
        form.setValue("packagingItems", []);
      }
    } else {
      // New product - reset form
      console.log("ProductForm - Resetting for new product");
      form.reset({
        name: "",
        categoryId: "",
        items: [{ recipeId: "", quantity: 1, cost: 0 }],
        packagingItems: [],
      });
    }
  }, [product, form]);

  // Watch form values for cost calculations
  const watchedItems = form.watch("items");
  const watchedPackagingItems = form.watch("packagingItems");

  // Calculate costs automatically
  const calculateItemCost = (recipeId: string, quantity: number) => {
    if (!recipeId || !quantity) return 0;
    const recipe = recipes.find(r => r.id === recipeId);
    return recipe ? (recipe.unitCost || recipe.unit_cost || 0) * quantity : 0;
  };

  const calculatePackagingCost = (packagingId: string, quantity: number) => {
    if (!packagingId || !quantity) return 0;
    const pkg = packaging.find(p => p.id === packagingId);
    return pkg ? (pkg.unitCost || pkg.unit_cost || 0) * quantity : 0;
  };

  // Calculate total costs with proper null checks
  const totalRecipeCost = (watchedItems || []).reduce((sum, item) => {
    return sum + calculateItemCost(item.recipeId, item.quantity);
  }, 0);

  const totalPackagingCost = (watchedPackagingItems || []).reduce((sum, pkg) => {
    return sum + calculatePackagingCost(pkg.packagingId, pkg.quantity);
  }, 0);

  const addRecipe = () => {
    const currentItems = form.getValues("items");
    form.setValue("items", [
      ...currentItems,
      { recipeId: "", quantity: 1, cost: 0 }
    ]);
  };

  const removeRecipe = (index: number) => {
    const currentItems = form.getValues("items");
    if (currentItems.length > 1) {
      form.setValue("items", currentItems.filter((_, i) => i !== index));
    }
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
    const updatedItems = [...currentItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-calculate cost when recipe or quantity changes
    if (field === 'recipeId' || field === 'quantity') {
      const cost = calculateItemCost(updatedItems[index].recipeId, updatedItems[index].quantity);
      updatedItems[index].cost = cost;
    }
    
    form.setValue("items", updatedItems);
  };

  const handlePackagingChange = (index: number, field: string, value: any) => {
    const currentPackaging = form.getValues("packagingItems") || [];
    const updatedPackaging = [...currentPackaging];
    updatedPackaging[index] = { ...updatedPackaging[index], [field]: value };
    
    // Auto-calculate cost when packaging or quantity changes
    if (field === 'packagingId' || field === 'quantity') {
      const cost = calculatePackagingCost(updatedPackaging[index].packagingId, updatedPackaging[index].quantity);
      updatedPackaging[index].cost = cost;
    }
    
    form.setValue("packagingItems", updatedPackaging);
  };

  const handleFormSubmit = async (values: z.infer<typeof productSchema>) => {
    console.log("ProductForm - submitting form with values:", values);
    
    // Recalculate all costs before submit
    const updatedItems = values.items.map(item => ({
      ...item,
      cost: calculateItemCost(item.recipeId, item.quantity)
    }));

    const updatedPackagingItems = (values.packagingItems || []).map(item => ({
      ...item,
      cost: calculatePackagingCost(item.packagingId, item.quantity)
    }));

    const finalTotalRecipeCost = updatedItems.reduce((sum, item) => sum + item.cost, 0);
    const finalTotalPackagingCost = updatedPackagingItems.reduce((sum, item) => sum + item.cost, 0);
    const totalCost = finalTotalRecipeCost + finalTotalPackagingCost;

    const productData = {
      ...values,
      items: updatedItems,
      packagingItems: updatedPackagingItems,
      totalCost,
    };
    
    console.log("ProductForm - final product data:", productData);
    onSubmit(productData);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Basic Info */}
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

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria (opcional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
              
              {/* Form Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                  {product ? "Atualizar Produto" : "Criar Produto"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Cost Summary - Right side */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4">
            <ProductCostSummary
              totalRecipeCost={totalRecipeCost}
              totalPackagingCost={totalPackagingCost}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
