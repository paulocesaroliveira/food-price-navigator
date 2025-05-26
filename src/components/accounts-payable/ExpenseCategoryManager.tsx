
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { PlusCircle, Edit, Trash2, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ExpenseCategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoriesChange: () => void;
}

export const ExpenseCategoryManager = ({ 
  open, 
  onOpenChange, 
  onCategoriesChange 
}: ExpenseCategoryManagerProps) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const queryClient = useQueryClient();

  const { data: categories = [], refetch } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('expense_categories')
        .insert({ 
          name,
          description,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setNewCategoryName("");
      setNewCategoryDescription("");
      refetch();
      onCategoriesChange();
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
    mutationFn: async ({ id, name, description }: { id: string; name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('expense_categories')
        .update({ name, description })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setEditingId(null);
      setEditingName("");
      setEditingDescription("");
      refetch();
      onCategoriesChange();
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
      // Verificar se há contas usando esta categoria
      const { data: accounts, error: checkError } = await supabase
        .from('accounts_payable')
        .select('id')
        .eq('category_id', id)
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (accounts && accounts.length > 0) {
        throw new Error("Não é possível excluir esta categoria pois existem contas vinculadas a ela");
      }
      
      const { error } = await supabase
        .from('expense_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
      onCategoriesChange();
      toast({
        title: "Categoria excluída",
        description: "Categoria foi excluída com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Não foi possível excluir a categoria: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleCreate = () => {
    if (newCategoryName.trim()) {
      createMutation.mutate({ 
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined
      });
    }
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditingDescription(category.description || "");
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      updateMutation.mutate({ 
        id: editingId, 
        name: editingName.trim(),
        description: editingDescription.trim() || undefined
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingDescription("");
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias de Despesas</DialogTitle>
          <DialogDescription>
            Adicione, edite ou remova categorias de despesas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="newCategory">Nova Categoria</Label>
              <Input
                id="newCategory"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nome da categoria"
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleCreate()}
              />
            </div>
            <div>
              <Label htmlFor="newDescription">Descrição (opcional)</Label>
              <Input
                id="newDescription"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Descrição da categoria"
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleCreate()}
              />
            </div>
            <Button 
              onClick={handleCreate} 
              disabled={!newCategoryName.trim() || createMutation.isPending}
              className="w-full"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {editingId === category.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                          autoFocus
                        />
                      ) : (
                        category.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === category.id ? (
                        <Input
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                          placeholder="Descrição"
                        />
                      ) : (
                        category.description || "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === category.id ? (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleSaveEdit}
                            disabled={updateMutation.isPending}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(category.id)}
                            disabled={deleteMutation.isPending}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Nenhuma categoria cadastrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
