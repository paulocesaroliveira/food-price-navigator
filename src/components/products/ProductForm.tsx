import { useEffect, useState } from "react";
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
import { toast } from "@/hooks/use-toast";
import { Product, Recipe, Packaging, ProductCategory } from "@/types";
import { MinusCircle, PlusCircle, Package, FileType, Tag, Info, DollarSign, Image } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/utils/calculations";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductCategoryDialog } from "./ProductCategoryDialog";

const productSchema = z.object({
  name: z.string().min(2, { message: "Nome é obrigatório" }),
  categoryId: z.string().optional(),
  packagingId: z.string().min(1, { message: "Embalagem principal é obrigatória" }),
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

type ProductItemState = {
  id?: string;
  recipeId: string;
  quantity: number;
  cost: number;
  recipe?: Partial<Recipe> | null;
};

type ProductPackagingState = {
  id?: string;
  packagingId: string;
  quantity: number;
  cost: number;
  isPrimary: boolean;
  packaging?: Packaging | null;
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
  const [items, setItems] = useState<ProductItemState[]>(
    product?.items.map(item => ({
      id: item.id,
      recipeId: item.recipeId,
      quantity: item.quantity,
      cost: item.cost,
      recipe: item.recipe as Partial<Recipe> | null
    })) || []
  );

  const [packagingItems, setPackagingItems] = useState<ProductPackagingState[]>(
    product?.packagingItems?.map(pkg => ({
      id: pkg.id,
      packagingId: pkg.packagingId,
      quantity: pkg.quantity || 1,
      cost: pkg.cost,
      isPrimary: pkg.isPrimary || false,
      packaging: pkg.packaging
    })) || product ? [
      {
        packagingId: product.packagingId || "",
        quantity: 1,
        cost: product.packagingCost,
        isPrimary: true
      }
    ] : []
  );

  const [activeTab, setActiveTab] = useState("info");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      categoryId: product?.categoryId || "",
      packagingId: product?.packagingId || "",
    },
  });

  const [primaryPackagingCost, setPrimaryPackagingCost] = useState<number>(product?.packagingCost || 0);
  const [additionalPackagingCost, setAdditionalPackagingCost] = useState<number>(0);
  const [itemsTotalCost, setItemsTotalCost] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(product?.totalCost || 0);

  useEffect(() => {
    const itemsTotal = items.reduce((acc, item) => {
      const recipe = recipes.find(r => r.id === item.recipeId);
      const recipeCost = recipe ? recipe.unitCost * item.quantity : 0;
      return acc + recipeCost;
    }, 0);
    
    setItemsTotalCost(itemsTotal);
    
    const packagingTotal = packagingItems
      .filter(pkg => !pkg.isPrimary)
      .reduce((acc, pkg) => acc + pkg.cost, 0);
    setAdditionalPackagingCost(packagingTotal);
    
    setTotalCost(itemsTotal + primaryPackagingCost + packagingTotal);
  }, [items, primaryPackagingCost, packagingItems, recipes]);

  useEffect(() => {
    const selectedPackagingId = form.watch("packagingId");
    if (selectedPackagingId) {
      const selectedPackaging = packaging.find(pkg => pkg.id === selectedPackagingId);
      if (selectedPackaging) {
        setPrimaryPackagingCost(selectedPackaging.unitCost);
        
        const primaryIndex = packagingItems.findIndex(pkg => pkg.isPrimary);
        
        if (primaryIndex >= 0) {
          const updatedItems = [...packagingItems];
          updatedItems[primaryIndex] = {
            ...updatedItems[primaryIndex],
            packagingId: selectedPackagingId,
            cost: selectedPackaging.unitCost,
            isPrimary: true,
            packaging: selectedPackaging
          };
          setPackagingItems(updatedItems);
        } else {
          setPackagingItems([
            ...packagingItems,
            {
              packagingId: selectedPackagingId,
              quantity: 1,
              cost: selectedPackaging.unitCost,
              isPrimary: true,
              packaging: selectedPackaging
            }
          ]);
        }
      }
    } else {
      setPrimaryPackagingCost(0);
      setPackagingItems(packagingItems.filter(pkg => !pkg.isPrimary));
    }
  }, [form.watch("packagingId")]);

  const addItem = () => {
    if (recipes.length === 0) {
      toast({
        title: "Erro",
        description: "Não há receitas disponíveis.",
        variant: "destructive",
      });
      return;
    }

    const defaultRecipe = recipes[0];
    const newItem: ProductItemState = {
      recipeId: defaultRecipe.id,
      quantity: 1,
      cost: defaultRecipe.unitCost,
      recipe: defaultRecipe
    };

    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItemRecipe = (index: number, recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const newItems = [...items];
    newItems[index].recipeId = recipeId;
    newItems[index].recipe = recipe;
    newItems[index].cost = recipe.unitCost * newItems[index].quantity;
    setItems(newItems);
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const recipe = recipes.find(r => r.id === items[index].recipeId);
    if (!recipe) return;

    const newItems = [...items];
    newItems[index].quantity = quantity;
    newItems[index].cost = recipe.unitCost * quantity;
    setItems(newItems);
  };

  const addPackaging = () => {
    if (packaging.length === 0) {
      toast({
        title: "Erro",
        description: "Não há embalagens disponíveis.",
        variant: "destructive",
      });
      return;
    }

    const availablePackaging = packaging.find(pkg => 
      !packagingItems.some(item => item.packagingId === pkg.id)
    ) || packaging[0];
    
    const newPackaging: ProductPackagingState = {
      packagingId: availablePackaging.id,
      quantity: 1,
      cost: availablePackaging.unitCost,
      isPrimary: false,
      packaging: availablePackaging
    };

    setPackagingItems([...packagingItems, newPackaging]);
  };

  const removePackaging = (index: number) => {
    if (packagingItems[index].isPrimary) {
      toast({
        title: "Erro",
        description: "Não é possível remover a embalagem principal.",
        variant: "destructive",
      });
      return;
    }

    const newItems = [...packagingItems];
    newItems.splice(index, 1);
    setPackagingItems(newItems);
  };

  const updatePackagingItem = (index: number, packagingId: string) => {
    const pkg = packaging.find(p => p.id === packagingId);
    if (!pkg) return;

    const newItems = [...packagingItems];
    newItems[index].packagingId = packagingId;
    newItems[index].packaging = pkg;
    newItems[index].cost = pkg.unitCost * newItems[index].quantity;
    setPackagingItems(newItems);
  };

  const updatePackagingQuantity = (index: number, quantity: number) => {
    const pkg = packaging.find(p => p.id === packagingItems[index].packagingId);
    if (!pkg) return;

    const newItems = [...packagingItems];
    newItems[index].quantity = quantity;
    newItems[index].cost = pkg.unitCost * quantity;
    setPackagingItems(newItems);
  };

  const handleFormSubmit = (values: z.infer<typeof productSchema>) => {
    if (items.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item ao produto.",
        variant: "destructive",
      });
      return;
    }

    const primaryPackaging = packagingItems.find(pkg => pkg.isPrimary);
    
    if (!primaryPackaging) {
      const selectedPackaging = packaging.find(pkg => pkg.id === values.packagingId);
      if (selectedPackaging) {
        packagingItems.push({
          packagingId: values.packagingId,
          quantity: 1,
          cost: selectedPackaging.unitCost,
          isPrimary: true,
          packaging: selectedPackaging
        });
      }
    }
    
    onSubmit({
      ...values,
      items: items.map(item => {
        const recipe = recipes.find(r => r.id === item.recipeId);
        return {
          ...item,
          cost: recipe ? recipe.unitCost * item.quantity : item.cost
        };
      }),
      packagingItems: packagingItems,
      packagingCost: primaryPackagingCost,
      totalCost,
    });
  };

  const getPrimaryPackagingImage = () => {
    const primaryPkg = packagingItems.find(pkg => pkg.isPrimary);
    if (primaryPkg?.packaging?.imageUrl) {
      return primaryPkg.packaging.imageUrl;
    } else if (primaryPkg) {
      const pkg = packaging.find(p => p.id === primaryPkg.packagingId);
      return pkg?.imageUrl;
    }
    return null;
  };

  return (
    <>
      {categoryDialogOpen && (
        <ProductCategoryDialog
          open={categoryDialogOpen}
          onOpenChange={setCategoryDialogOpen}
          onCategoriesChange={onCategoriesChange}
        />
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="info" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Informações
              </TabsTrigger>
              <TabsTrigger value="composition" className="flex items-center gap-2">
                <FileType className="h-4 w-4" />
                Composição
              </TabsTrigger>
              <TabsTrigger value="cost" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Custos
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome do Produto</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: Caixa de Brigadeiros Sortidos" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex items-end gap-2">
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
                              className="mb-[2px]"
                            >
                              <Tag className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="packagingId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Embalagem Principal</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione uma embalagem principal" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {packaging.map((pkg) => (
                                      <SelectItem key={pkg.id} value={pkg.id}>
                                        {pkg.name} - {formatCurrency(pkg.unitCost)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          Embalagens Adicionais
                        </h3>
                        <Button 
                          type="button" 
                          onClick={addPackaging} 
                          size="sm" 
                          variant="outline" 
                          className="gap-1"
                        >
                          <PlusCircle className="h-4 w-4" />
                          Adicionar
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {packagingItems.filter(pkg => !pkg.isPrimary).length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">
                              Nenhuma embalagem adicional.
                            </p>
                          </div>
                        ) : (
                          packagingItems.filter(pkg => !pkg.isPrimary).map((pkg, index) => {
                            const realIndex = packagingItems.findIndex(pkg => pkg === pkg);
                            return (
                              <Card key={index} className="border border-muted">
                                <CardContent className="p-3">
                                  <div className="grid grid-cols-12 gap-2">
                                    <div className="col-span-5">
                                      <FormLabel className="text-xs">Embalagem</FormLabel>
                                      <Select 
                                        value={pkg.packagingId}
                                        onValueChange={(value) => updatePackagingItem(realIndex, value)}
                                      >
                                        <SelectTrigger className="w-full h-9">
                                          <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {packaging.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                              {p.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="col-span-3">
                                      <FormLabel className="text-xs">Quantidade</FormLabel>
                                      <Input
                                        type="number"
                                        min="1"
                                        className="h-9"
                                        value={pkg.quantity}
                                        onChange={(e) => updatePackagingQuantity(realIndex, Number(e.target.value))}
                                      />
                                    </div>
                                    <div className="col-span-3">
                                      <FormLabel className="text-xs">Custo</FormLabel>
                                      <div className="h-9 flex items-center px-2 border rounded-md bg-muted/50 text-sm">
                                        {formatCurrency(pkg.cost)}
                                      </div>
                                    </div>
                                    <div className="col-span-1 flex items-end">
                                      <Button 
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-destructive"
                                        onClick={() => removePackaging(realIndex)}
                                      >
                                        <MinusCircle className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-center items-center mb-2">
                        {getPrimaryPackagingImage() ? (
                          <div className="relative w-40 h-40 rounded-md overflow-hidden">
                            <img
                              src={getPrimaryPackagingImage() || ''}
                              alt="Imagem do produto"
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center w-40 h-40 bg-muted rounded-md">
                            <Image className="h-12 w-12 text-muted-foreground mb-2 opacity-40" />
                            <p className="text-xs text-muted-foreground text-center px-2">
                              A imagem será baseada na embalagem principal selecionada.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center text-sm text-muted-foreground">
                        Este produto utilizará a imagem da embalagem principal selecionada.
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <FileType className="h-5 w-5" />
                          Itens do Produto
                        </h3>
                        <Button 
                          type="button" 
                          onClick={addItem} 
                          size="sm" 
                          variant="outline" 
                          className="gap-1"
                        >
                          <PlusCircle className="h-4 w-4" />
                          Adicionar
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {items.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            <FileType className="h-12 w-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">
                              Nenhum item adicionado. Clique em "Adicionar" para incluir receitas no produto.
                            </p>
                          </div>
                        ) : (
                          items.map((item, index) => (
                            <Card key={index} className="border border-muted">
                              <CardContent className="p-3">
                                <div className="grid grid-cols-12 gap-2">
                                  <div className="col-span-5">
                                    <FormLabel className="text-xs">Receita</FormLabel>
                                    <Select 
                                      value={item.recipeId}
                                      onValueChange={(value) => updateItemRecipe(index, value)}
                                    >
                                      <SelectTrigger className="w-full h-9">
                                        <SelectValue placeholder="Selecione" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {recipes.map((recipe) => (
                                          <SelectItem key={recipe.id} value={recipe.id}>
                                            {recipe.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="col-span-3">
                                    <FormLabel className="text-xs">Quantidade</FormLabel>
                                    <Input
                                      type="number"
                                      min="1"
                                      className="h-9"
                                      value={item.quantity}
                                      onChange={(e) => updateItemQuantity(index, Number(e.target.value))}
                                    />
                                  </div>
                                  <div className="col-span-3">
                                    <FormLabel className="text-xs">Custo</FormLabel>
                                    <div className="h-9 flex items-center px-2 border rounded-md bg-muted/50 text-sm">
                                      {formatCurrency(item.cost)}
                                    </div>
                                  </div>
                                  <div className="col-span-1 flex items-end">
                                    <Button 
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 text-destructive"
                                      onClick={() => removeItem(index)}
                                    >
                                      <MinusCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="composition" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Composição do Produto</h3>
                    <Button 
                      type="button" 
                      onClick={addItem} 
                      size="sm" 
                      variant="outline" 
                      className="gap-1"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Adicionar Item
                    </Button>
                  </div>
                  
                  {items.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <FileType className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p className="text-medium">
                        Nenhum item adicionado
                      </p>
                      <p className="text-sm mt-1">
                        Adicione receitas ao seu produto para criar a composição
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Accordion type="multiple" className="w-full">
                        {items.map((item, index) => {
                          const recipe = recipes.find(r => r.id === item.recipeId);
                          return (
                            <AccordionItem key={index} value={`item-${index}`}>
                              <AccordionTrigger className="hover:bg-muted/50 px-3 rounded-md">
                                <div className="flex items-center justify-between w-full pr-4">
                                  <div className="flex items-center gap-2">
                                    {recipe?.image ? (
                                      <div className="h-8 w-8 rounded-md overflow-hidden">
                                        <img
                                          src={recipe.image}
                                          alt={recipe.name}
                                          className="h-full w-full object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                                        <FileType className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    )}
                                    <span>{recipe?.name || "Receita"}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm">Qtd: {item.quantity}</span>
                                    <span className="text-sm text-muted-foreground">{formatCurrency(item.cost)}</span>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-3">
                                <div className="grid grid-cols-12 gap-3 py-2">
                                  <div className="col-span-6">
                                    <FormLabel className="text-xs">Receita</FormLabel>
                                    <Select 
                                      value={item.recipeId}
                                      onValueChange={(value) => updateItemRecipe(index, value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma receita" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {recipes.map((recipe) => (
                                          <SelectItem key={recipe.id} value={recipe.id}>
                                            {recipe.name} - {formatCurrency(recipe.unitCost)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="col-span-3">
                                    <FormLabel className="text-xs">Quantidade</FormLabel>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) => updateItemQuantity(index, Number(e.target.value))}
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <FormLabel className="text-xs">Custo</FormLabel>
                                    <div className="h-10 flex items-center px-2 border rounded-md bg-muted/50">
                                      {formatCurrency(item.cost)}
                                    </div>
                                  </div>
                                  <div className="col-span-1 flex items-end">
                                    <Button 
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeItem(index)}
                                      className="text-destructive"
                                    >
                                      <MinusCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Embalagens</h3>
                    <Button 
                      type="button" 
                      onClick={addPackaging} 
                      size="sm" 
                      variant="outline" 
                      className="gap-1"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Adicionar Embalagem
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-muted p-3 font-medium text-sm">Embalagem Principal</div>
                      <div className="p-3">
                        <FormField
                          control={form.control}
                          name="packagingId"
                          render={({ field }) => (
                            <FormItem>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma embalagem principal" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {packaging.map((pkg) => (
                                    <SelectItem key={pkg.id} value={pkg.id}>
                                      {pkg.name} - {formatCurrency(pkg.unitCost)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {packagingItems.filter(pkg => !pkg.isPrimary).length > 0 && (
                      <div className="border rounded-md overflow-hidden">
                        <div className="bg-muted p-3 font-medium text-sm">Embalagens Adicionais</div>
                        <div className="divide-y">
                          {packagingItems.filter(pkg => !pkg.isPrimary).map((pkg, index) => {
                            const realIndex = packagingItems.findIndex(p => p === pkg);
                            const pkgInfo = packaging.find(p => p.id === pkg.packagingId);
                            return (
                              <div key={index} className="p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {pkgInfo?.imageUrl ? (
                                    <div className="h-8 w-8 rounded-md overflow-hidden">
                                      <img
                                        src={pkgInfo.imageUrl}
                                        alt={pkgInfo.name}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                                      <Package className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-medium">{pkgInfo?.name || "Embalagem"}</div>
                                    <div className="text-sm text-muted-foreground">
                                      Qtd: {pkg.quantity} &middot; {formatCurrency(pkg.cost)}
                                    </div>
                                  </div>
                                </div>
                                <Button 
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => removePackaging(realIndex)}
                                >
                                  <MinusCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="cost" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Resumo de Custos</h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div className="flex flex-col bg-muted/30 p-4 rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">Custo dos Itens</h4>
                            <span className="text-lg font-semibold">{formatCurrency(itemsTotalCost)}</span>
                          </div>
                          <div className="h-1 bg-muted mb-2"></div>
                          <div className="space-y-1">
                            {items.map((item, index) => {
                              const recipe = recipes.find(r => r.id === item.recipeId);
                              return (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">{recipe?.name || "Receita"} × {item.quantity}</span>
                                  <span>{formatCurrency(item.cost)}</span>
                                </div>
                              );
                            })}
                            {items.length === 0 && (
                              <div className="text-center text-sm text-muted-foreground py-2">
                                Nenhum item adicionado
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col bg-muted/30 p-4 rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">Custo de Embalagens</h4>
                            <span className="text-lg font-semibold">{formatCurrency(primaryPackagingCost + additionalPackagingCost)}</span>
                          </div>
                          <div className="h-1 bg-muted mb-2"></div>
                          <div className="space-y-1">
                            {packagingItems.filter(pkg => !pkg.isPrimary).map((pkg, index) => {
                              const realIndex = packagingItems.findIndex(p => p === pkg);
                              return (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">{pkg.packaging.name} × {pkg.quantity}</span>
                                  <span>{formatCurrency(pkg.cost)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={items.length === 0}
            >
              {product ? "Atualizar" : "Criar"} Produto
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
