
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ProductCategory } from "@/types";
import { Edit, Trash, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProductCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoriesChange: () => void;
}

export const ProductCategoryDialog = ({
  open,
  onOpenChange,
  onCategoriesChange,
}: ProductCategoryDialogProps) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        toast({
          title: "Erro",
          description: `Erro ao buscar categorias: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      setCategories(data as ProductCategory[]);
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao buscar as categorias.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Erro",
        description: "O nome da categoria não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("product_categories")
        .insert([{ name: newCategoryName.trim() }])
        .select();

      if (error) {
        toast({
          title: "Erro",
          description: `Erro ao adicionar categoria: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      setCategories([...categories, data[0] as ProductCategory]);
      setNewCategoryName("");
      onCategoriesChange();
      
      toast({
        title: "Sucesso",
        description: "Categoria adicionada com sucesso.",
      });
    } catch (err) {
      console.error("Error adding category:", err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar a categoria.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome da categoria não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("product_categories")
        .update({ name: editingCategory.name.trim() })
        .eq("id", editingCategory.id);

      if (error) {
        toast({
          title: "Erro",
          description: `Erro ao atualizar categoria: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      setCategories(
        categories.map((cat) =>
          cat.id === editingCategory.id ? editingCategory : cat
        )
      );
      setEditingCategory(null);
      onCategoriesChange();
      
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso.",
      });
    } catch (err) {
      console.error("Error updating category:", err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a categoria.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("product_categories")
        .delete()
        .eq("id", categoryId);

      if (error) {
        toast({
          title: "Erro",
          description: `Erro ao excluir categoria: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      setCategories(categories.filter((cat) => cat.id !== categoryId));
      onCategoriesChange();
      
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso.",
      });
    } catch (err) {
      console.error("Error deleting category:", err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a categoria.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias de Produtos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="new-category">Nova Categoria</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="new-category"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nome da categoria"
                disabled={isLoading}
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddCategory}
                disabled={isLoading || !newCategoryName.trim()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
          
          <div className="border rounded-md">
            <div className="p-3 bg-muted font-medium text-sm">
              Categorias Existentes
            </div>
            <div className="divide-y">
              {categories.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Nenhuma categoria cadastrada.
                </div>
              ) : (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="p-3 flex items-center justify-between"
                  >
                    {editingCategory?.id === category.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={editingCategory.name}
                          onChange={(e) =>
                            setEditingCategory({
                              ...editingCategory,
                              name: e.target.value,
                            })
                          }
                          placeholder="Nome da categoria"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleUpdateCategory}
                          disabled={isLoading || !editingCategory.name.trim()}
                        >
                          Salvar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCategory(null)}
                          disabled={isLoading}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium">{category.name}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingCategory(category)}
                            disabled={isLoading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={isLoading}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
