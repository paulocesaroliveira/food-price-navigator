
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenseCategories, createExpenseCategory, updateExpenseCategory, deleteExpenseCategory } from "@/services/accountsPayableService";
import { toast } from "@/hooks/use-toast";
import type { ExpenseCategory } from "@/types/accountsPayable";

interface ExpenseCategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoriesChange: () => void;
}

const PRESET_COLORS = [
  "#E76F51", "#F4A261", "#E9C46A", "#2A9D8F", "#264653",
  "#E63946", "#F77F00", "#FCBF49", "#003049", "#669BBC"
];

export const ExpenseCategoryManager = ({
  open,
  onOpenChange,
  onCategoriesChange
}: ExpenseCategoryManagerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: PRESET_COLORS[0]
  });

  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: getExpenseCategories,
    enabled: open
  });

  const createMutation = useMutation({
    mutationFn: createExpenseCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      onCategoriesChange();
      resetForm();
      toast({ title: "Categoria criada com sucesso!" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar categoria",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ExpenseCategory> }) =>
      updateExpenseCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      onCategoriesChange();
      resetForm();
      toast({ title: "Categoria atualizada com sucesso!" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExpenseCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      onCategoriesChange();
      toast({ title: "Categoria excluída com sucesso!" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir categoria",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", color: PRESET_COLORS[0] });
    setIsCreating(false);
    setEditingCategory(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome da categoria",
        variant: "destructive"
      });
      return;
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color
    });
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Gerenciar Categorias de Despesa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Form */}
          {isCreating && (
            <Card>
              <CardContent className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome da categoria"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição da categoria"
                      className="resize-none"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Cor</label>
                    <div className="flex gap-2 mt-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${
                            formData.color === color ? 'border-gray-800' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="flex-1"
                    >
                      {editingCategory ? "Atualizar" : "Criar"} Categoria
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Add button */}
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          )}

          {/* Categories list */}
          <div className="space-y-2">
            <h3 className="font-medium">Categorias Existentes</h3>
            {isLoading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : categories.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma categoria cadastrada</p>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <Card key={category.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <p className="font-medium">{category.name}</p>
                          {category.description && (
                            <p className="text-sm text-muted-foreground">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
