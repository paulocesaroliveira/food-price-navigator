import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Settings, Trash2 } from "lucide-react";
import { ProductCategory } from "@/types";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProductCategoryManagerProps {
  categories: ProductCategory[];
  onCategoriesChange: () => void;
}

export const ProductCategoryManager: React.FC<ProductCategoryManagerProps> = ({
  categories,
  onCategoriesChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from("product_categories")
        .insert({ name: newCategoryName.trim() });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!",
      });

      setNewCategoryName("");
      onCategoriesChange();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro ao criar categoria: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from("product_categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria removida com sucesso!",
      });

      onCategoriesChange();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro ao remover categoria: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="new-category">Nova Categoria</Label>
              <Input
                id="new-category"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nome da categoria"
              />
            </div>
            <Button
              onClick={handleCreateCategory}
              disabled={isCreating}
              className="mt-6"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Criar
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Categorias Existentes</Label>
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada</p>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{category.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
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
