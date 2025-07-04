
import React, { useState, useEffect } from "react";
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
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

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
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    mode: "onChange", // Validação em tempo real
  });

  // Carregar dados do ingrediente para edição
  useEffect(() => {
    if (open && ingredient) {
      console.log('Carregando ingrediente para edição:', ingredient);
      form.reset({
        name: ingredient.name || "",
        brand: ingredient.brand || "",
        categoryId: ingredient.category_id || "",
        unit: ingredient.unit || "g",
        packageQuantity: ingredient.package_quantity || 0,
        packagePrice: ingredient.package_price || 0,
        supplier: ingredient.supplier || "",
      });
    } else if (open && !ingredient) {
      console.log('Novo ingrediente - resetando form');
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
  }, [ingredient, open, form]);

  // Cálculo em tempo real do custo unitário
  const packageQuantity = form.watch("packageQuantity");
  const packagePrice = form.watch("packagePrice");
  const unitCost = packageQuantity && packagePrice && packageQuantity > 0 ? packagePrice / packageQuantity : 0;

  // Validação em tempo real
  const watchedName = form.watch("name");
  const watchedBrand = form.watch("brand");
  const isFormValid = form.formState.isValid;

  const handleSubmit = async (values: z.infer<typeof ingredientSchema>) => {
    setIsLoading(true);
    setSaveSuccess(false);
    
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

        // Feedback visual de sucesso
        setSaveSuccess(true);
        toast({
          title: "✅ Ingrediente atualizado",
          description: "O ingrediente foi atualizado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('ingredients')
          .insert(ingredientData);

        if (error) throw error;

        // Feedback visual de sucesso
        setSaveSuccess(true);
        toast({
          title: "✅ Ingrediente criado",
          description: "O ingrediente foi criado com sucesso.",
        });
      }

      // Aguardar um pouco para mostrar o feedback
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        setSaveSuccess(false);
      }, 1000);

    } catch (error: any) {
      console.error('Erro ao salvar ingrediente:', error);
      toast({
        title: "❌ Erro",
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
          <DialogTitle className="flex items-center gap-2">
            {ingredient ? 'Editar Ingrediente' : 'Novo Ingrediente'}
            {saveSuccess && <CheckCircle className="h-5 w-5 text-green-500" />}
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
                    <FormLabel className="flex items-center gap-2">
                      Nome
                      {watchedName && watchedName.length >= 2 && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Farinha de Trigo" 
                        {...field}
                        className={watchedName && watchedName.length >= 2 ? "border-green-500" : ""}
                      />
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
                    <FormLabel className="flex items-center gap-2">
                      Marca
                      {watchedBrand && watchedBrand.length >= 1 && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Dona Benta" 
                        {...field}
                        className={watchedBrand && watchedBrand.length >= 1 ? "border-green-500" : ""}
                      />
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

            {/* Custo unitário calculado em tempo real */}
            <div className="p-4 border rounded-md bg-gradient-to-r from-blue-50 to-green-50">
              <p className="text-sm font-medium flex items-center gap-2">
                Custo Unitário (calculado em tempo real)
                {unitCost > 0 && <CheckCircle className="h-4 w-4 text-green-500" />}
              </p>
              <p className="text-xl font-bold mt-1 text-blue-600">
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

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !isFormValid}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Salvo!
                  </>
                ) : (
                  <>
                    {ingredient ? "Atualizar" : "Criar"} Ingrediente
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
