
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "@/hooks/use-toast";
import { Product, Recipe, Packaging, ProductCategory } from "@/types";
import { Save, X, Package2, Tag } from "lucide-react";
import { ProductCategoryDialog } from "./ProductCategoryDialog";
import { RecipeSelector } from "./RecipeSelector";
import { PackagingSelector } from "./PackagingSelector";
import { CostSummary } from "./CostSummary";

const productSchema = z.object({
  name: z.string().min(2, { message: "Nome é obrigatório" }),
  categoryId: z.string().optional(),
});

type ProductFormProps = {
  product?: Product;
  recipes: Recipe[];
  packaging: Packaging[];
  categories: ProductCategory[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  onCategoriesChange: () => void;
};

export const ProductForm = ({
  product,
  recipes,
  packaging,
  categories,
  onSubmit,
  onCancel,
  onCategoriesChange,
}: ProductFormProps) => {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  
  // Estado para receitas selecionadas
  const [selectedRecipes, setSelectedRecipes] = useState(() =>
    product?.items.map(item => ({
      recipeId: item.recipeId,
      quantity: item.quantity,
      cost: item.cost,
    })) || []
  );

  // Estado para embalagens selecionadas
  const [selectedPackaging, setSelectedPackaging] = useState(() =>
    product?.packagingItems?.map(pkg => ({
      packagingId: pkg.packagingId,
      quantity: pkg.quantity || 1,
      cost: pkg.cost,
      isPrimary: pkg.isPrimary || false,
    })) || []
  );

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      categoryId: product?.categoryId || "",
    },
  });

  // Calcular custos
  const recipesCost = selectedRecipes.reduce((acc, item) => acc + item.cost, 0);
  const packagingCost = selectedPackaging.reduce((acc, item) => acc + item.cost, 0);
  const totalCost = recipesCost + packagingCost;

  // Handlers para receitas
  const handleAddRecipe = () => {
    if (recipes.length === 0) {
      toast({
        title: "Erro",
        description: "Não há receitas disponíveis.",
        variant: "destructive",
      });
      return;
    }

    const firstRecipe = recipes[0];
    setSelectedRecipes([...selectedRecipes, {
      recipeId: firstRecipe.id,
      quantity: 1,
      cost: firstRecipe.unitCost,
    }]);
  };

  const handleRemoveRecipe = (index: number) => {
    const newRecipes = [...selectedRecipes];
    newRecipes.splice(index, 1);
    setSelectedRecipes(newRecipes);
  };

  const handleRecipeChange = (index: number, recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const newRecipes = [...selectedRecipes];
    newRecipes[index] = {
      ...newRecipes[index],
      recipeId,
      cost: recipe.unitCost * newRecipes[index].quantity,
    };
    setSelectedRecipes(newRecipes);
  };

  const handleRecipeQuantityChange = (index: number, quantity: number) => {
    const recipe = recipes.find(r => r.id === selectedRecipes[index].recipeId);
    if (!recipe) return;

    const newRecipes = [...selectedRecipes];
    newRecipes[index] = {
      ...newRecipes[index],
      quantity,
      cost: recipe.unitCost * quantity,
    };
    setSelectedRecipes(newRecipes);
  };

  // Handlers para embalagens
  const handleAddPackaging = () => {
    if (packaging.length === 0) {
      toast({
        title: "Erro",
        description: "Não há embalagens disponíveis.",
        variant: "destructive",
      });
      return;
    }

    const firstPackaging = packaging[0];
    setSelectedPackaging([...selectedPackaging, {
      packagingId: firstPackaging.id,
      quantity: 1,
      cost: firstPackaging.unitCost,
      isPrimary: selectedPackaging.length === 0, // Primeira embalagem é principal
    }]);
  };

  const handleRemovePackaging = (index: number) => {
    const newPackaging = [...selectedPackaging];
    newPackaging.splice(index, 1);
    setSelectedPackaging(newPackaging);
  };

  const handlePackagingChange = (index: number, packagingId: string) => {
    const pkg = packaging.find(p => p.id === packagingId);
    if (!pkg) return;

    const newPackaging = [...selectedPackaging];
    newPackaging[index] = {
      ...newPackaging[index],
      packagingId,
      cost: pkg.unitCost * newPackaging[index].quantity,
    };
    setSelectedPackaging(newPackaging);
  };

  const handlePackagingQuantityChange = (index: number, quantity: number) => {
    const pkg = packaging.find(p => p.id === selectedPackaging[index].packagingId);
    if (!pkg) return;

    const newPackaging = [...selectedPackaging];
    newPackaging[index] = {
      ...newPackaging[index],
      quantity,
      cost: pkg.unitCost * quantity,
    };
    setSelectedPackaging(newPackaging);
  };

  const handlePrimaryChange = (index: number) => {
    const newPackaging = selectedPackaging.map((pkg, i) => ({
      ...pkg,
      isPrimary: i === index,
    }));
    setSelectedPackaging(newPackaging);
  };

  const handleFormSubmit = (values: z.infer<typeof productSchema>) => {
    if (selectedRecipes.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma receita ao produto.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPackaging.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma embalagem ao produto.",
        variant: "destructive",
      });
      return;
    }

    const primaryPackaging = selectedPackaging.find(pkg => pkg.isPrimary);
    if (!primaryPackaging) {
      toast({
        title: "Erro",
        description: "Selecione uma embalagem principal.",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      ...values,
      categoryId: values.categoryId === "_none" ? null : values.categoryId,
      items: selectedRecipes.map(recipe => ({
        recipeId: recipe.recipeId,
        quantity: recipe.quantity,
        cost: recipe.cost,
      })),
      packagingItems: selectedPackaging.map(pkg => ({
        packagingId: pkg.packagingId,
        quantity: pkg.quantity,
        cost: pkg.cost,
        isPrimary: pkg.isPrimary,
      })),
      packagingId: primaryPackaging.packagingId,
      packagingCost: primaryPackaging.cost,
      totalCost,
    });
  };

  const primaryPackagingImage = () => {
    const primary = selectedPackaging.find(pkg => pkg.isPrimary);
    if (primary) {
      const pkg = packaging.find(p => p.id === primary.packagingId);
      return pkg?.imageUrl;
    }
    return null;
  };

  return (
    <>
      <ProductCategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onCategoriesChange={onCategoriesChange}
      />

      <div className="space-y-6">
        {/* Header com imagem do produto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package2 className="h-5 w-5" />
              {product ? "Editar Produto" : "Novo Produto"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <Form {...form}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Produto</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Caixa de Brigadeiros Sortidos"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Categoria</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="_none">Sem categoria</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setCategoryDialogOpen(true)}
                      className="mt-8"
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                </Form>
              </div>

              <div className="flex justify-center">
                {primaryPackagingImage() ? (
                  <div className="w-32 h-32 rounded-lg overflow-hidden">
                    <img
                      src={primaryPackagingImage()!}
                      alt="Produto"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center">
                    <Package2 className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seleção de Receitas */}
        <Card>
          <CardContent className="pt-6">
            <RecipeSelector
              recipes={recipes}
              selectedRecipes={selectedRecipes}
              onRecipeAdd={handleAddRecipe}
              onRecipeRemove={handleRemoveRecipe}
              onRecipeChange={handleRecipeChange}
              onQuantityChange={handleRecipeQuantityChange}
            />
          </CardContent>
        </Card>

        {/* Seleção de Embalagens */}
        <Card>
          <CardContent className="pt-6">
            <PackagingSelector
              packaging={packaging}
              selectedPackaging={selectedPackaging}
              onPackagingAdd={handleAddPackaging}
              onPackagingRemove={handleRemovePackaging}
              onPackagingChange={handlePackagingChange}
              onQuantityChange={handlePackagingQuantityChange}
              onPrimaryChange={handlePrimaryChange}
            />
          </CardContent>
        </Card>

        {/* Resumo de Custos */}
        <CostSummary
          recipesCost={recipesCost}
          packagingCost={packagingCost}
          totalCost={totalCost}
        />

        {/* Botões de Ação */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={form.handleSubmit(handleFormSubmit)}>
            <Save className="h-4 w-4 mr-2" />
            {product ? "Atualizar" : "Criar"} Produto
          </Button>
        </div>
      </div>
    </>
  );
};
