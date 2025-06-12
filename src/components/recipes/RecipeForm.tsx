
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/calculations";
import { supabase } from "@/integrations/supabase/client";

interface RecipeIngredient {
  id?: string;
  ingredient_id: string;
  quantity: number;
  cost: number;
  ingredient?: {
    id: string;
    name: string;
    unit: string;
    unit_cost: number;
  };
}

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
  const [image, setImage] = useState(editingRecipe?.image_url || "");

  // Ingredientes base (custo único para toda a receita)
  const [baseIngredients, setBaseIngredients] = useState<RecipeIngredient[]>([]);
  
  // Ingredientes por porção (custo multiplicado pelas porções)
  const [portionIngredients, setPortionIngredients] = useState<RecipeIngredient[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingRecipe) {
      loadRecipeIngredients();
    } else {
      setBaseIngredients([]);
      setPortionIngredients([]);
    }
  }, [editingRecipe]);

  const loadRecipeIngredients = async () => {
    if (!editingRecipe?.id) return;

    try {
      // Carregar ingredientes base
      const { data: baseData, error: baseError } = await supabase
        .from('recipe_base_ingredients')
        .select(`
          *,
          ingredient:ingredients(id, name, unit, unit_cost)
        `)
        .eq('recipe_id', editingRecipe.id);

      if (baseError) throw baseError;

      // Carregar ingredientes por porção
      const { data: portionData, error: portionError } = await supabase
        .from('recipe_portion_ingredients')
        .select(`
          *,
          ingredient:ingredients(id, name, unit, unit_cost)
        `)
        .eq('recipe_id', editingRecipe.id);

      if (portionError) throw portionError;

      setBaseIngredients(baseData?.map(item => ({
        id: item.id,
        ingredient_id: item.ingredient_id,
        quantity: item.quantity,
        cost: item.cost,
        ingredient: item.ingredient
      })) || []);

      setPortionIngredients(portionData?.map(item => ({
        id: item.id,
        ingredient_id: item.ingredient_id,
        quantity: item.quantity,
        cost: item.cost,
        ingredient: item.ingredient
      })) || []);

    } catch (error) {
      console.error('Erro ao carregar ingredientes da receita:', error);
    }
  };

  const addBaseIngredient = () => {
    setBaseIngredients([...baseIngredients, {
      ingredient_id: '',
      quantity: 0,
      cost: 0
    }]);
  };

  const addPortionIngredient = () => {
    setPortionIngredients([...portionIngredients, {
      ingredient_id: '',
      quantity: 0,
      cost: 0
    }]);
  };

  const removeBaseIngredient = (index: number) => {
    setBaseIngredients(baseIngredients.filter((_, i) => i !== index));
  };

  const removePortionIngredient = (index: number) => {
    setPortionIngredients(portionIngredients.filter((_, i) => i !== index));
  };

  const updateBaseIngredient = (index: number, field: string, value: any) => {
    const updated = [...baseIngredients];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'ingredient_id') {
      const ingredient = ingredients.find(ing => ing.id === value);
      if (ingredient) {
        updated[index].cost = updated[index].quantity * ingredient.unit_cost;
        updated[index].ingredient = ingredient;
      }
    } else if (field === 'quantity') {
      const ingredient = ingredients.find(ing => ing.id === updated[index].ingredient_id);
      if (ingredient) {
        updated[index].cost = value * ingredient.unit_cost;
      }
    }

    setBaseIngredients(updated);
  };

  const updatePortionIngredient = (index: number, field: string, value: any) => {
    const updated = [...portionIngredients];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'ingredient_id') {
      const ingredient = ingredients.find(ing => ing.id === value);
      if (ingredient) {
        updated[index].cost = updated[index].quantity * ingredient.unit_cost;
        updated[index].ingredient = ingredient;
      }
    } else if (field === 'quantity') {
      const ingredient = ingredients.find(ing => ing.id === updated[index].ingredient_id);
      if (ingredient) {
        updated[index].cost = value * ingredient.unit_cost;
      }
    }

    setPortionIngredients(updated);
  };

  // Calcular custos
  const baseCost = baseIngredients.reduce((sum, ing) => sum + (ing.cost || 0), 0);
  const portionCost = portionIngredients.reduce((sum, ing) => sum + (ing.cost || 0), 0);
  const portionsNumber = parseInt(portions) || 1;
  const totalCost = baseCost + (portionCost * portionsNumber);
  const unitCost = totalCost / portionsNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "❌ Erro",
        description: "O nome da receita é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (baseIngredients.some(ing => !ing.ingredient_id) || portionIngredients.some(ing => !ing.ingredient_id)) {
      toast({
        title: "❌ Erro",
        description: "Todos os ingredientes devem ser selecionados",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const recipeData = {
        name,
        category_id: categoryId || null,
        portions: portionsNumber,
        total_cost: totalCost,
        unit_cost: unitCost,
        notes,
        image_url: image,
        user_id: user.id
      };

      let recipeId = editingRecipe?.id;

      if (editingRecipe) {
        // Atualizar receita existente
        const { error } = await supabase
          .from('recipes')
          .update(recipeData)
          .eq('id', editingRecipe.id);

        if (error) throw error;

        // Deletar ingredientes existentes
        await supabase.from('recipe_base_ingredients').delete().eq('recipe_id', editingRecipe.id);
        await supabase.from('recipe_portion_ingredients').delete().eq('recipe_id', editingRecipe.id);
      } else {
        // Criar nova receita
        const { data, error } = await supabase
          .from('recipes')
          .insert(recipeData)
          .select()
          .single();

        if (error) throw error;
        recipeId = data.id;
      }

      // Inserir ingredientes base
      if (baseIngredients.length > 0) {
        const baseIngredientsData = baseIngredients.map(ing => ({
          recipe_id: recipeId,
          ingredient_id: ing.ingredient_id,
          quantity: ing.quantity,
          cost: ing.cost
        }));

        const { error: baseError } = await supabase
          .from('recipe_base_ingredients')
          .insert(baseIngredientsData);

        if (baseError) throw baseError;
      }

      // Inserir ingredientes por porção
      if (portionIngredients.length > 0) {
        const portionIngredientsData = portionIngredients.map(ing => ({
          recipe_id: recipeId,
          ingredient_id: ing.ingredient_id,
          quantity: ing.quantity,
          cost: ing.cost
        }));

        const { error: portionError } = await supabase
          .from('recipe_portion_ingredients')
          .insert(portionIngredientsData);

        if (portionError) throw portionError;
      }

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
      setImage("");
      setBaseIngredients([]);
      setPortionIngredients([]);

    } catch (error: any) {
      console.error('Erro ao salvar receita:', error);
      toast({
        title: "❌ Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingRecipe ? 'Editar' : 'Nova'} Receita
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="image">URL da Imagem</Label>
                  <Input
                    id="image"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
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
            </CardContent>
          </Card>

          {/* Ingredientes Base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Ingredientes Base (Custo Único)
                <Button type="button" onClick={addBaseIngredient} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {baseIngredients.map((ingredient, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label>Ingrediente</Label>
                      <Select
                        value={ingredient.ingredient_id}
                        onValueChange={(value) => updateBaseIngredient(index, 'ingredient_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ingredients.map((ing) => (
                            <SelectItem key={ing.id} value={ing.id}>
                              {ing.name} - {ing.brand} ({formatCurrency(ing.unit_cost)}/{ing.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={ingredient.quantity}
                        onChange={(e) => updateBaseIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Custo</Label>
                      <Input
                        type="text"
                        value={formatCurrency(ingredient.cost)}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>&nbsp;</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeBaseIngredient(index)}
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ingredientes por Porção */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Ingredientes por Porção (Custo Multiplicado)
                <Button type="button" onClick={addPortionIngredient} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portionIngredients.map((ingredient, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label>Ingrediente</Label>
                      <Select
                        value={ingredient.ingredient_id}
                        onValueChange={(value) => updatePortionIngredient(index, 'ingredient_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ingredients.map((ing) => (
                            <SelectItem key={ing.id} value={ing.id}>
                              {ing.name} - {ing.brand} ({formatCurrency(ing.unit_cost)}/{ing.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Quantidade por Porção</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={ingredient.quantity}
                        onChange={(e) => updatePortionIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Custo Unitário</Label>
                      <Input
                        type="text"
                        value={formatCurrency(ingredient.cost)}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>&nbsp;</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePortionIngredient(index)}
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resumo dos Custos */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Resumo dos Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(baseCost)}
                  </div>
                  <div className="text-sm text-gray-600">Ingredientes Base</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(portionCost * portionsNumber)}
                  </div>
                  <div className="text-sm text-gray-600">Ingredientes × Porções</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalCost)}
                  </div>
                  <div className="text-sm text-gray-600">Custo Total</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(unitCost)}
                  </div>
                  <div className="text-sm text-gray-600">Custo por Porção</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : editingRecipe ? 'Atualizar' : 'Criar'} Receita
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeForm;
