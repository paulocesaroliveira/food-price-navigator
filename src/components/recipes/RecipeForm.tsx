
import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface RecipeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editingRecipe?: any;
  categories: any[];
}

const RecipeForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  editingRecipe, 
  categories 
}: RecipeFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      name: "",
      category_id: "",
      portions: 1,
      notes: ""
    }
  });

  useEffect(() => {
    if (editingRecipe) {
      form.reset({
        name: editingRecipe.name,
        category_id: editingRecipe.category_id || "",
        portions: editingRecipe.portions,
        notes: editingRecipe.notes || ""
      });
    } else {
      form.reset({
        name: "",
        category_id: "",
        portions: 1,
        notes: ""
      });
    }
  }, [editingRecipe, form]);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      await onSubmit(data);
      form.reset();
      onClose();
      toast({
        title: editingRecipe ? "Receita atualizada" : "Receita criada",
        description: editingRecipe 
          ? "A receita foi atualizada com sucesso." 
          : "A nova receita foi criada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar receita:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a receita. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingRecipe ? "Editar Receita" : "Nova Receita"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Nome é obrigatório" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Receita</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Brigadeiro de Chocolate" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category_id"
              rules={{ required: "Categoria é obrigatória" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
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
              name="portions"
              rules={{ 
                required: "Número de porções é obrigatório",
                min: { value: 1, message: "Mínimo de 1 porção" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Porções</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notas sobre a receita..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingRecipe ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeForm;
