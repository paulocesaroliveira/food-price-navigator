
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Settings, 
  Package,
  Hash,
  FolderOpen,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

interface Category {
  id: string;
  name: string;
  user_id?: string;
  created_at?: string;
}

type CategoryTableName = 'ingredient_categories' | 'recipe_categories' | 'product_categories' | 'packaging_categories';

interface CategoryManagerProps {
  title: string;
  description: string;
  tableName: CategoryTableName;
  queryKey: string;
  icon?: React.ElementType;
  onCategoriesChange?: () => void;
  children?: React.ReactNode;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  title,
  description,
  tableName,
  queryKey,
  icon: Icon = FolderOpen,
  onCategoriesChange,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], refetch, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return (data || []) as Category[];
    },
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from(tableName)
        .insert({ 
          name,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setNewCategoryName("");
      refetch();
      onCategoriesChange?.();
      toast({
        title: "Categoria criada",
        description: "Nova categoria foi criada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Não foi possível criar a categoria: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from(tableName)
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setEditingId(null);
      setEditingName("");
      refetch();
      onCategoriesChange?.();
      toast({
        title: "Categoria atualizada",
        description: "Categoria foi atualizada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Não foi possível atualizar a categoria: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Verificar se há itens usando esta categoria
      const relatedTables = {
        'ingredient_categories': 'ingredients',
        'recipe_categories': 'recipes', 
        'product_categories': 'products',
        'packaging_categories': 'packaging'
      };
      
      const relatedTable = relatedTables[tableName];
      
      if (relatedTable) {
        const { data: items, error: checkError } = await supabase
          .from(relatedTable as any)
          .select('id')
          .eq('category_id', id)
          .limit(1);
        
        if (checkError) throw checkError;
        
        if (items && items.length > 0) {
          throw new Error("Não é possível excluir esta categoria pois existem itens vinculados a ela");
        }
      }
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      setDeleteConfirmId(null);
      refetch();
      onCategoriesChange?.();
      toast({
        title: "Categoria excluída",
        description: "Categoria foi excluída com sucesso",
      });
    },
    onError: (error: any) => {
      setDeleteConfirmId(null);
      toast({
        title: "Erro",
        description: `Não foi possível excluir a categoria: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleCreate = () => {
    if (newCategoryName.trim()) {
      createMutation.mutate(newCategoryName.trim());
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      updateMutation.mutate({ id: editingId, name: editingName.trim() });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Categorias
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              {title}
            </DialogTitle>
            <DialogDescription className="text-base">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {isLoading ? "-" : categories.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ativas</p>
                      <p className="text-2xl font-bold text-green-600">
                        {isLoading ? "-" : categories.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant="outline" className="text-purple-600 border-purple-200">
                        Gerenciando
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulário para nova categoria */}
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-primary" />
                  Adicionar Nova Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="newCategory" className="text-sm font-medium">
                      Nome da Categoria
                    </Label>
                    <Input
                      id="newCategory"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Digite o nome da categoria"
                      onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                      className="mt-1"
                    />
                  </div>
                  <Button 
                    onClick={handleCreate} 
                    disabled={!newCategoryName.trim() || createMutation.isPending}
                    className="mt-6 px-6"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <PlusCircle className="h-4 w-4 mr-2" />
                    )}
                    Criar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de categorias */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categorias Existentes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Carregando categorias...</p>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="p-8 text-center">
                    <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma categoria</h3>
                    <p className="text-muted-foreground">
                      Crie sua primeira categoria usando o formulário acima
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Nome</TableHead>
                        <TableHead className="text-right font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id} className="hover:bg-muted/50">
                          <TableCell className="py-4">
                            {editingId === category.id ? (
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                autoFocus
                                className="max-w-xs"
                              />
                            ) : (
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="font-medium">{category.name}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right py-4">
                            {editingId === category.id ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleSaveEdit}
                                  disabled={updateMutation.isPending}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  {updateMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Save className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(category)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(category.id)}
                                  disabled={deleteMutation.isPending}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  {deleteMutation.isPending && deleteConfirmId === category.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita e 
              não será possível excluir se houver itens vinculados a ela.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
