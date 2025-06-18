
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ProductCategory } from "@/types";

interface ProductCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductCategoryModal = ({ open, onOpenChange }: ProductCategoryModalProps) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('product_categories')
        .insert({
          name: name.trim(),
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Categoria criada",
        description: "A categoria foi criada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      setNewCategoryName("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar categoria",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir categoria",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      createCategoryMutation.mutate(newCategoryName);
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias de Produtos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Add new category */}
          <div className="space-y-2">
            <Label htmlFor="new-category">Nova Categoria</Label>
            <div className="flex gap-2">
              <Input
                id="new-category"
                placeholder="Nome da categoria"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateCategory();
                  }
                }}
              />
              <Button 
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Categories list */}
          <div className="space-y-2">
            <Label>Categorias Existentes</Label>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Carregando...</div>
            ) : categories.length === 0 ? (
              <div className="text-sm text-muted-foreground">Nenhuma categoria criada</div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {categories.map((category: ProductCategory) => (
                  <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{category.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-destructive hover:text-destructive"
                      disabled={deleteCategoryMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
