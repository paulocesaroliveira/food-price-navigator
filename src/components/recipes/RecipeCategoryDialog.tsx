
import React, { useState, useEffect } from "react";
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
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Pencil, Trash2, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from "@tanstack/react-query";
import { 
  fetchRecipeCategories, 
  createRecipeCategory,
  updateRecipeCategory,
  deleteRecipeCategory
} from "@/services/recipeService";
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

interface RecipeCategoryDialogProps {
  open: boolean;
  onClose: () => void;
}

export const RecipeCategoryDialog = ({ 
  open, 
  onClose 
}: RecipeCategoryDialogProps) => {
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { 
    data: categories = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["recipeCategories"],
    queryFn: fetchRecipeCategories
  });

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  const createMutation = useMutation({
    mutationFn: (name: string) => createRecipeCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipeCategories"] });
      setNewCategory("");
      toast({
        title: "Categoria criada",
        description: "A categoria foi criada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar",
        description: "Não foi possível criar a categoria. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => 
      updateRecipeCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipeCategories"] });
      setEditingCategory(null);
      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a categoria. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRecipeCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipeCategories"] });
      setCategoryToDelete(null);
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao excluir categoria:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a categoria. Verifique se ela está sendo usada em alguma receita.",
        variant: "destructive"
      });
    }
  });

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Digite o nome da categoria.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await createMutation.mutateAsync(newCategory);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Digite o nome da categoria.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await updateMutation.mutateAsync({
        id: editingCategory.id,
        name: editingCategory.name
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      await deleteMutation.mutateAsync(categoryToDelete);
    }
  };

  if (error) {
    toast({
      title: "Erro ao carregar categorias",
      description: "Não foi possível carregar as categorias. Tente novamente mais tarde.",
      variant: "destructive"
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gerenciar Categorias de Receitas</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Nome da nova categoria"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleCreateCategory} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Adicionar
              </Button>
            </div>
            
            <div className="border rounded-md">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="w-[100px] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.length > 0 ? (
                      categories.map((category: any) => (
                        <TableRow key={category.id}>
                          <TableCell>
                            {editingCategory?.id === category.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editingCategory.name}
                                  onChange={(e) => setEditingCategory({
                                    ...editingCategory,
                                    name: e.target.value
                                  })}
                                />
                                <Button 
                                  size="sm" 
                                  onClick={handleUpdateCategory}
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Salvar"
                                  )}
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
                              category.name
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {editingCategory?.id !== category.id && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingCategory(category)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => setCategoryToDelete(category.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                          Nenhuma categoria cadastrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta categoria? Se estiver sendo usada em receitas, a exclusão não será possível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
