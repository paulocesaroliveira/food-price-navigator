
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
import { Product, Recipe, Packaging } from "@/types";
import { MinusCircle, PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/utils/calculations";

const productSchema = z.object({
  name: z.string().min(2, { message: "Nome é obrigatório" }),
  packagingId: z.string().min(1, { message: "Embalagem é obrigatória" }),
});

type ProductFormProps = {
  product?: Product;
  recipes: Recipe[];
  packaging: Packaging[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
};

type ProductItemState = {
  id?: string;
  recipeId: string;
  quantity: number;
  cost: number;
};

export const ProductForm = ({
  product,
  recipes,
  packaging,
  onSubmit,
  onCancel,
}: ProductFormProps) => {
  const [items, setItems] = useState<ProductItemState[]>(
    product?.items.map(item => ({
      id: item.id,
      recipeId: item.recipeId,
      quantity: item.quantity,
      cost: item.cost,
    })) || []
  );

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      packagingId: product?.packagingId || "",
    },
  });

  // Calculate costs
  const [packagingCost, setPackagingCost] = useState<number>(product?.packagingCost || 0);
  const [itemsTotalCost, setItemsTotalCost] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(product?.totalCost || 0);

  // Update costs when items or packaging change
  useEffect(() => {
    const total = items.reduce((acc, item) => acc + item.cost, 0);
    setItemsTotalCost(total);
    setTotalCost(total + packagingCost);
  }, [items, packagingCost]);

  // Update packaging cost when packaging selection changes
  useEffect(() => {
    const selectedPackagingId = form.watch("packagingId");
    if (selectedPackagingId) {
      const selectedPackaging = packaging.find(pkg => pkg.id === selectedPackagingId);
      if (selectedPackaging) {
        setPackagingCost(selectedPackaging.unitCost);
      }
    } else {
      setPackagingCost(0);
    }
  }, [form.watch("packagingId"), packaging]);

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

  const handleFormSubmit = (values: z.infer<typeof productSchema>) => {
    if (items.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item ao produto.",
        variant: "destructive",
      });
      return;
    }

    const selectedPackaging = packaging.find(pkg => pkg.id === values.packagingId);
    
    onSubmit({
      ...values,
      items,
      packagingCost: selectedPackaging?.unitCost || 0,
      totalCost,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
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

            <FormField
              control={form.control}
              name="packagingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Embalagem</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma embalagem" />
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

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-medium">Itens do Produto</h3>
                <Button type="button" onClick={addItem} size="sm" variant="outline" className="gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Adicionar Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    Nenhum item adicionado. Clique em "Adicionar Item" para incluir receitas no produto.
                  </p>
                )}

                {items.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-6">
                          <FormLabel className="text-xs">Receita</FormLabel>
                          <Select 
                            value={item.recipeId}
                            onValueChange={(value) => updateItemRecipe(index, value)}
                          >
                            <SelectTrigger className="w-full">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <div className="p-6 border rounded-md bg-muted/50 space-y-6">
              <h3 className="text-lg font-medium">Resumo de Custos</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Custo dos Itens:</span>
                  <span className="text-sm">{formatCurrency(itemsTotalCost)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Custo da Embalagem:</span>
                  <span className="text-sm">{formatCurrency(packagingCost)}</span>
                </div>
                
                <div className="border-t pt-4 flex justify-between">
                  <span className="font-bold">Custo Total:</span>
                  <span className="font-bold">{formatCurrency(totalCost)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {product ? "Atualizar Produto" : "Adicionar Produto"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
