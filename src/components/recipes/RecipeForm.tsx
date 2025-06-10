
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface RecipeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  categories: any[];
  ingredients: any[];
  editingRecipe?: any;
}

const RecipeForm: React.FC<RecipeFormProps> = ({
  open,
  onOpenChange,
  onSuccess,
  categories,
  ingredients,
  editingRecipe
}) => {
  const [name, setName] = useState(editingRecipe?.name || "");
  const [categoryId, setCategoryId] = useState(editingRecipe?.category?.id || "");
  const [portions, setPortions] = useState(editingRecipe?.portions?.toString() || "1");
  const [notes, setNotes] = useState(editingRecipe?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "❌ Erro",
        description: "O nome da receita é obrigatório",
        variant: "destructive"
      });
      return;
    }

    // Simular criação/atualização da receita
    toast({
      title: "✨ Sucesso",
      description: `Receita ${editingRecipe ? 'atualizada' : 'criada'} com sucesso!`,
    });
    
    onSuccess();
    onOpenChange(false);
    
    // Reset form
    setName("");
    setCategoryId("");
    setPortions("1");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingRecipe ? 'Editar' : 'Nova'} Receita
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Receita *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome da receita"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portions">Porções *</Label>
              <Input
                id="portions"
                type="number"
                min="1"
                value={portions}
                onChange={(e) => setPortions(e.target.value)}
                placeholder="1"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre a receita..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingRecipe ? 'Atualizar' : 'Criar'} Receita
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeForm;
