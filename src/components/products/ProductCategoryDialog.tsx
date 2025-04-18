
import { useState } from "react";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

type ProductCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoriesChange: () => void;
};

type Category = {
  id: string;
  name: string;
};

export function ProductCategoryDialog({
  open,
  onOpenChange,
  onCategoriesChange
}: ProductCategoryDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch categories when the dialog opens
  const fetchCategories = async () => {
    if (!open) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching product categories:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Call fetchCategories when the dialog opens
  useState(() => {
    if (open) {
      fetchCategories();
    }
  });

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Nome inválido",
        description: "O nome da categoria não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .insert([{ name: newCategoryName.trim() }])
        .select()
        .single();
      
      if (error) throw error;
      
      setCategories([...categories, data]);
      setNewCategoryName("");
      toast({
        title: "Categoria adicionada",
        description: "A categoria foi adicionada com sucesso",
      });
      onCategoriesChange();
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a categoria",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast({
        title: "Nome inválido",
        description: "O nome da categoria não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('product_categories')
        .update({ name: editingCategory.name.trim() })
        .eq('id', editingCategory.id);
      
      if (error) throw error;
      
      const updatedCategories = categories.map(cat => 
        cat.id === editingCategory.id ? editingCategory : cat
      );
      setCategories(updatedCategories);
      setEditingCategory(null);
      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso",
      });
      onCategoriesChange();
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a categoria",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    setIsDeleting(true);
    try {
      // Check if the category is being used in any products
      const { data: products, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', categoryToDelete.id)
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (products && products.length > 0) {
        toast({
          title: "Não é possível excluir",
          description: "Esta categoria está sendo usada em produtos",
          variant: "destructive",
        });
        setDeleteDialogOpen(false);
        setIsDeleting(false);
        return;
      }
      
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', categoryToDelete.id);
      
      if (error) throw error;
      
      const updatedCategories = categories.filter(cat => cat.id !== categoryToDelete.id);
      setCategories(updatedCategories);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso",
      });
      onCategoriesChange();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar Categorias de Produtos</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Nova categoria..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleAddCategory} 
                size="sm"
                disabled={isLoading || !newCategoryName.trim()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
            
            {isLoading && categories.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : categories.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                Nenhuma categoria cadastrada.
              </p>
            ) : (
              <div className="border rounded-md overflow-hidden">
                {categories.map((category, index) => (
                  <div 
                    key={category.id}
                    className={`flex items-center justify-between p-3 ${
                      index !== categories.length - 1 ? "border-b" : ""
                    }`}
                  >
                    {editingCategory?.id === category.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({
                            ...editingCategory,
                            name: e.target.value
                          })}
                          autoFocus
                        />
                        <Button 
                          size="sm" 
                          onClick={handleEditCategory}
                          disabled={isLoading || !editingCategory.name.trim()}
                        >
                          Salvar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setEditingCategory(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1">{category.name}</span>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setEditingCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => confirmDeleteCategory(category)}
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
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{categoryToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCategory}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
