
import React, { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const ingredientSchema = z.object({
  name: z.string().min(2, { message: "Nome é obrigatório" }),
  brand: z.string().min(1, { message: "Marca é obrigatória" }),
  categoryId: z.string().optional(),
  unit: z.enum(["g", "ml", "un"], { message: "Unidade é obrigatória" }),
  packageQuantity: z.coerce.number().positive({ message: "Quantidade deve ser maior que 0" }),
  packagePrice: z.coerce.number().positive({ message: "Preço deve ser maior que 0" }),
  supplier: z.string().optional(),
});

interface IngredientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  ingredient?: any;
}

export const IngredientForm = ({
  open,
  onOpenChange,
  onSuccess,
  ingredient,
}: IngredientFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['ingredient-categories'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('ingredient_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const form = useForm<z.infer<typeof ingredientSchema>>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: "",
      brand: "",
      categoryId: "",
      unit: "g",
      packageQuantity: 0,
      packagePrice: 0,
      supplier: "",
    },
  });

  // Reset form when ingredient changes or dialog opens
  React.useEffect(() => {
    if (open) {
      if (ingredient) {
        console.log('Editando ingrediente:', ingredient);
        form.reset({
          name: ingredient.name || "",
          brand: ingredient.brand || "",
          categoryId: ingredient.category_id || "",
          unit: ingredient.unit || "g",
          packageQuantity: Number(ingredient.package_quantity) || 0,
          packagePrice: Number(ingredient.package_price) || 0,
          supplier: ingredient.supplier || "",
        });
      } else {
        console.log('Novo ingrediente');
        form.reset({
          name: "",
          brand: "",
          categoryId: "",
          unit: "g",
          packageQuantity: 0,
          packagePrice: 0,
          supplier: "",
        });
      }
    }
  }, [ingredient, form, open]);

  const packageQuantity = form.watch("packageQuantity");
  const packagePrice = form.watch("packagePrice");
  const unitCost = packageQuantity && packagePrice ? packagePrice / packageQuantity : 0;

  const handleSubmit = async (values: z.infer<typeof ingredientSchema>) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const ingredientData = {
        name: values.name,
        brand: values.brand,
        category_id: values.categoryId || null,
        unit: values.unit,
        package_quantity: values.packageQuantity,
        package_price: values.packagePrice,
        unit_cost: unitCost,
        supplier: values.supplier || null,
        user_id: user.id,
      };

      if (ingredient) {
        const { error } = await supabase
          .from('ingredients')
          .update(ingredientData)
          .eq('id', ingredient.id);

        if (error) throw error;

        toast({
          title: "Ingrediente atualizado",
          description: "O ingrediente foi atualizado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('ingredients')
          .insert(ingredientData);

        if (error) throw error;

        toast({
          title: "Ingrediente criado",
          description: "O ingrediente foi criado com sucesso.",
        });
      }

      onSuccess();
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao salvar ingrediente:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar ingrediente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {ingredient ? 'Editar Ingrediente' : 'Novo Ingrediente'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Farinha de Trigo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Dona Benta" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade de Medida</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="g">Gramas (g)</SelectItem>
                        <SelectItem value="ml">Mililitros (ml)</SelectItem>
                        <SelectItem value="un">Unidades (un)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="packageQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade por Pacote</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ex: 1000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="packagePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço do Pacote</FormLabel>
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

            <div className="p-4 border rounded-md bg-muted/50">
              <p className="text-sm font-medium">Custo Unitário (calculado)</p>
              <p className="text-xl font-bold mt-1">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(unitCost)}
              </p>
            </div>

            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do fornecedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? "Salvando..." : ingredient ? "Atualizar" : "Criar"} Ingrediente
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
