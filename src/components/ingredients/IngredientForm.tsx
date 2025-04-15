
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/ingredients/ImageUpload";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";

const ingredientSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  categoryId: z.string().min(1, { message: "Selecione uma categoria" }),
  unit: z.enum(["g", "ml"], { message: "Selecione uma unidade válida" }),
  brand: z.string().min(1, { message: "Informe a marca" }),
  supplier: z.string().optional(),
  packageQuantity: z.coerce.number().positive({ message: "Quantidade deve ser maior que zero" }),
  packagePrice: z.coerce.number().nonnegative({ message: "Preço deve ser maior ou igual a zero" }),
});

type IngredientFormValues = z.infer<typeof ingredientSchema>;

type IngredientFormProps = {
  ingredient?: any;
  onSave: () => void;
  onCancel: () => void;
};

export const IngredientForm = ({ ingredient, onSave, onCancel }: IngredientFormProps) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(ingredient?.image_url || null);
  const { uploadFile, isUploading } = useFileUpload();
  const { toast } = useToast();
  
  const form = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: ingredient
      ? {
          name: ingredient.name,
          categoryId: ingredient.category_id || "",
          unit: ingredient.unit,
          brand: ingredient.brand,
          supplier: ingredient.supplier || "",
          packageQuantity: ingredient.package_quantity,
          packagePrice: ingredient.package_price,
        }
      : {
          name: "",
          categoryId: "",
          unit: "g",
          brand: "",
          supplier: "",
          packageQuantity: 0,
          packagePrice: 0,
        },
  });

  // Calcular o custo unitário
  const unitCost = React.useMemo(() => {
    const packageQuantity = form.watch("packageQuantity");
    const packagePrice = form.watch("packagePrice");
    
    if (!packageQuantity || packageQuantity <= 0) return 0;
    return packagePrice / packageQuantity;
  }, [form.watch("packageQuantity"), form.watch("packagePrice")]);

  // Buscar categorias de ingredientes
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from("ingredient_categories")
          .select("*")
          .order("name");
          
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as categorias",
          variant: "destructive",
        });
      }
    }
    
    fetchCategories();
  }, [toast]);

  // Manipular upload de imagem
  const handleImageUpload = async (file: File) => {
    try {
      const url = await uploadFile(file, "ingredients");
      setImageUrl(url);
      return url;
    } catch (error) {
      console.error("Erro no upload da imagem:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload da imagem",
        variant: "destructive",
      });
      return null;
    }
  };

  // Enviar formulário
  const onSubmit = async (data: IngredientFormValues) => {
    try {
      // Calcular custo unitário
      const unitCost = data.packagePrice / data.packageQuantity;
      
      if (ingredient) {
        // Atualizar ingrediente existente
        const { error } = await supabase
          .from("ingredients")
          .update({
            name: data.name,
            category_id: data.categoryId,
            unit: data.unit,
            brand: data.brand,
            supplier: data.supplier,
            package_quantity: data.packageQuantity,
            package_price: data.packagePrice,
            unit_cost: unitCost,
            image_url: imageUrl,
          })
          .eq("id", ingredient.id);
          
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Ingrediente atualizado com sucesso",
        });
      } else {
        // Criar novo ingrediente
        const { error } = await supabase
          .from("ingredients")
          .insert({
            name: data.name,
            category_id: data.categoryId,
            unit: data.unit,
            brand: data.brand,
            supplier: data.supplier,
            package_quantity: data.packageQuantity,
            package_price: data.packagePrice,
            unit_cost: unitCost,
            image_url: imageUrl,
          });
          
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Ingrediente cadastrado com sucesso",
        });
      }
      
      onSave();
    } catch (error) {
      console.error("Erro ao salvar ingrediente:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o ingrediente",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <ImageUpload 
                  currentImage={imageUrl} 
                  onUpload={handleImageUpload} 
                  isUploading={isUploading} 
                  label="Imagem do ingrediente (opcional)"
                />
              </div>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do ingrediente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Chocolate em pó" {...field} />
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
                    <FormLabel>Categoria</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
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
                  <FormItem className="space-y-3">
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="g" id="g" />
                          <label htmlFor="g" className="cursor-pointer">Gramas (g)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ml" id="ml" />
                          <label htmlFor="ml" className="cursor-pointer">Mililitros (ml)</label>
                        </div>
                      </RadioGroup>
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
                      <Input placeholder="Ex: Nestlé" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Mercado XYZ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="packageQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade da embalagem</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 500" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.valueAsNumber);
                        }}
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
                    <FormLabel>Preço da embalagem (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 10.50" 
                        step="0.01"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.valueAsNumber);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel>Custo por unidade (R$)</FormLabel>
                <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted text-muted-foreground flex items-center">
                  {unitCost ? unitCost.toFixed(2) : '0.00'} / {form.watch("unit")}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">
                {ingredient ? 'Atualizar' : 'Cadastrar'} ingrediente
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
