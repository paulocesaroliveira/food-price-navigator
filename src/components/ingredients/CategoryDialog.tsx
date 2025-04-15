
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoriesChange: () => void;
}

export const CategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  onOpenChange,
  onCategoriesChange,
}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<{id: string, name: string} | null>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("ingredient_categories")
        .insert({ name: newCategory.trim() });
        
      if (error) throw error;
      
      setNewCategory("");
      fetchCategories();
      onCategoriesChange();
      
      toast({
        title: "Sucesso",
        description: "Categoria adicionada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a categoria",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("ingredient_categories")
        .update({ name: editingCategory.name.trim() })
        .eq("id", editingCategory.id);
        
      if (error) throw error;
      
      setEditingCategory(null);
      fetchCategories();
      onCategoriesChange();
      
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a categoria",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Verificar se a categoria está em uso
      const { count, error: countError } = await supabase
        .from("ingredients")
        .select("*", { count: "exact", head: true })
        .eq("category_id", id);
        
      if (countError) throw countError;
      
      if (count && count > 0) {
        toast({
          title: "Não é possível excluir",
          description: `Esta categoria está sendo usada por ${count} ingrediente(s)`,
          variant: "destructive",
        });
        return;
      }
      
      // Excluir a categoria
      const { error } = await supabase
        .from("ingredient_categories")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      fetchCategories();
      onCategoriesChange();
      
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso",
      });
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar categorias</DialogTitle>
          <DialogDescription>
            Adicione, edite ou remova categorias de ingredientes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Nova categoria"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleAddCategory} disabled={!newCategory.trim() || isLoading}>
              Adicionar
            </Button>
          </div>
          
          <div className="border rounded-md">
            {categories.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nenhuma categoria cadastrada
              </div>
            ) : (
              <div className="divide-y">
                {categories.map((category) => (
                  <div key={category.id} className="p-3 flex items-center justify-between">
                    {editingCategory && editingCategory.id === category.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={editingCategory.name}
                          onChange={(e) => 
                            setEditingCategory({ ...editingCategory, name: e.target.value })
                          }
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            onClick={handleUpdateCategory}
                            disabled={!editingCategory.name.trim() || isLoading}
                          >
                            Salvar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setEditingCategory(null)}
                            disabled={isLoading}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span>{category.name}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingCategory(category)}
                            disabled={isLoading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
