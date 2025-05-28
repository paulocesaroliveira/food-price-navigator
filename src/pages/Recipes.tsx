import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, ChefHat, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import RecipeForm from "@/components/recipes/RecipeForm";
import { calculateRecipeCosts } from "@/utils/recipeCalculations";

interface Recipe {
  id: string;
  name: string;
  portions: number;
  total_cost: number;
  unit_cost: number;
  notes?: string;
  image_url?: string;
  created_at: string;
  category?: {
    id: string;
    name: string;
  };
}

const Recipes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const queryClient = useQueryClient();

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      console.log("Fetching recipes...");
      
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          category:recipe_categories(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching recipes:", error);
        throw error;
      }
      
      console.log("Data from database:", data);
      
      const formattedRecipes = data?.map(recipe => ({
        id: recipe.id,
        name: recipe.name,
        portions: recipe.portions,
        total_cost: Number(recipe.total_cost),
        unit_cost: Number(recipe.unit_cost),
        notes: recipe.notes,
        image_url: recipe.image_url,
        created_at: recipe.created_at,
        category: recipe.category
      })) || [];
      
      console.log("Final formatted recipes:", formattedRecipes);
      
      return formattedRecipes as Recipe[];
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['recipe-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipe_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const { data: ingredients = [] } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Receita excluída",
        description: "A receita foi excluída com sucesso",
      });

      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    } catch (error: any) {
      console.error("Erro ao excluir receita:", error.message);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a receita",
        variant: "destructive",
      });
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRecipe(null);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      console.log("Salvando receita com dados:", data);
      
      if (editingRecipe) {
        // Atualizar receita existente
        const { error: recipeError } = await supabase
          .from('recipes')
          .update({
            name: data.name,
            image_url: data.image_url,
            category_id: data.category_id,
            portions: data.portions,
            notes: data.notes
          })
          .eq('id', editingRecipe.id);

        if (recipeError) throw recipeError;

        // Deletar ingredientes existentes
        await supabase.from('recipe_base_ingredients').delete().eq('recipe_id', editingRecipe.id);
        await supabase.from('recipe_portion_ingredients').delete().eq('recipe_id', editingRecipe.id);

        // Inserir novos ingredientes base
        if (data.baseIngredients && data.baseIngredients.length > 0) {
          const { error: baseError } = await supabase
            .from('recipe_base_ingredients')
            .insert(
              data.baseIngredients.map((ing: any) => ({
                recipe_id: editingRecipe.id,
                ingredient_id: ing.ingredient_id,
                quantity: ing.quantity,
                cost: ing.cost
              }))
            );
          
          if (baseError) throw baseError;
        }

        // Inserir novos ingredientes por porção
        if (data.portionIngredients && data.portionIngredients.length > 0) {
          const { error: portionError } = await supabase
            .from('recipe_portion_ingredients')
            .insert(
              data.portionIngredients.map((ing: any) => ({
                recipe_id: editingRecipe.id,
                ingredient_id: ing.ingredient_id,
                quantity: ing.quantity,
                cost: ing.cost
              }))
            );
          
          if (portionError) throw portionError;
        }

        // Recalcular custos (vai disparar os triggers automaticamente)
        await calculateRecipeCosts(editingRecipe.id);

      } else {
        // Criar nova receita
        const { data: newRecipe, error: recipeError } = await supabase
          .from('recipes')
          .insert([{
            name: data.name,
            image_url: data.image_url,
            category_id: data.category_id,
            portions: data.portions,
            notes: data.notes,
            total_cost: 0,
            unit_cost: 0
          }])
          .select()
          .single();

        if (recipeError) throw recipeError;

        // Inserir ingredientes base
        if (data.baseIngredients && data.baseIngredients.length > 0) {
          const { error: baseError } = await supabase
            .from('recipe_base_ingredients')
            .insert(
              data.baseIngredients.map((ing: any) => ({
                recipe_id: newRecipe.id,
                ingredient_id: ing.ingredient_id,
                quantity: ing.quantity,
                cost: ing.cost
              }))
            );
          
          if (baseError) throw baseError;
        }

        // Inserir ingredientes por porção
        if (data.portionIngredients && data.portionIngredients.length > 0) {
          const { error: portionError } = await supabase
            .from('recipe_portion_ingredients')
            .insert(
              data.portionIngredients.map((ing: any) => ({
                recipe_id: newRecipe.id,
                ingredient_id: ing.ingredient_id,
                quantity: ing.quantity,
                cost: ing.cost
              }))
            );
          
          if (portionError) throw portionError;
        }

        // Recalcular custos (vai disparar os triggers automaticamente)
        await calculateRecipeCosts(newRecipe.id);
      }

      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Invalidar produtos também
    } catch (error: any) {
      console.error("Erro ao salvar receita:", error);
      throw error;
    }
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Receitas</h1>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-food-coral hover:bg-food-coral/90 text-white dark:bg-food-coralDark dark:hover:bg-food-coralDark/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Receita
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recipes.length}</div>
            <p className="text-xs text-muted-foreground">
              Receitas cadastradas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio por Receita</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {recipes.length > 0 ? (recipes.reduce((sum, recipe) => sum + recipe.total_cost, 0) / recipes.length).toFixed(2) : '0,00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Custo total médio
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Porções</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recipes.reduce((sum, recipe) => sum + recipe.portions, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Porções totais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome, categoria ou observações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Lista de receitas */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">Carregando receitas...</div>
        ) : filteredRecipes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? "Nenhuma receita encontrada para sua busca." : "Nenhuma receita cadastrada ainda."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => {
              console.log(`Displaying recipe ${recipe.name}: total_cost=${recipe.total_cost}, unit_cost=${recipe.unit_cost}`);
              
              return (
                <Card key={recipe.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{recipe.name}</CardTitle>
                        <CardDescription>
                          {recipe.portions} {recipe.portions === 1 ? 'porção' : 'porções'}
                        </CardDescription>
                      </div>
                      {recipe.category && (
                        <Badge variant="secondary">
                          {recipe.category.name}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Custo Total</p>
                        <p className="font-semibold">R$ {recipe.total_cost.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Custo por Porção</p>
                        <p className="font-semibold">R$ {recipe.unit_cost.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    {recipe.notes && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{recipe.notes}</p>
                    )}
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(recipe)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a receita "{recipe.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(recipe.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <RecipeForm
        open={showForm || !!editingRecipe}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editingRecipe={editingRecipe}
        categories={categories}
        ingredients={ingredients}
      />
    </div>
  );
};

export default Recipes;
