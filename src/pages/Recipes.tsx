
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, ChefHat, BookOpen, Edit, Trash2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { RecipeCategoryDialog } from "@/components/recipes/RecipeCategoryDialog";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/calculations";
import { PageHeader } from "@/components/shared/PageHeader";

const Recipes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const queryClient = useQueryClient();

  // Query para buscar receitas
  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_categories(name, id)
        `)
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Query para buscar categorias
  const { data: categories = [] } = useQuery({
    queryKey: ['recipe-categories'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('recipe_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Mutation para deletar receita
  const deleteRecipe = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast({
        title: "Sucesso",
        description: "Receita deletada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar receita.",
        variant: "destructive",
      });
    }
  });

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas
  const totalRecipes = recipes.length;

  const handleEdit = (recipe: any) => {
    setEditingRecipe(recipe);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta receita?')) {
      deleteRecipe.mutate(id);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Receitas"
        subtitle="Gerencie receitas e suas composições"
        icon={ChefHat}
        gradient="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500"
        badges={[
          { icon: BookOpen, text: `${totalRecipes} receitas` }
        ]}
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowCategoryDialog(true)}
              className="rounded-xl border-white/30 text-white hover:bg-white/20"
            >
              Gerenciar Categorias
            </Button>
            <Button 
              onClick={() => setShowForm(true)}
              className="btn-gradient bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Receita
            </Button>
          </div>
        }
      />

      {/* Busca */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <Input
          placeholder="Buscar receitas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-sm input-focus"
        />
      </div>

      {/* Lista de Receitas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="custom-card">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredRecipes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium">Nenhuma receita encontrada</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Tente alterar os termos de busca" : "Comece criando sua primeira receita"}
            </p>
            {!searchTerm && (
              <Button 
                className="mt-4 btn-gradient"
                onClick={() => setShowForm(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Receita
              </Button>
            )}
          </div>
        ) : (
          filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="custom-card card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{recipe.name}</CardTitle>
                    {recipe.recipe_categories && (
                      <Badge variant="secondary" className="rounded-full">
                        {recipe.recipe_categories.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Porções:</span>
                    <span className="font-medium">{recipe.portions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Custo total:</span>
                    <span className="font-medium text-green-600">{formatCurrency(recipe.total_cost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Custo unitário:</span>
                    <span className="font-medium text-blue-600">{formatCurrency(recipe.unit_cost)}</span>
                  </div>
                  {recipe.notes && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Observações:</span>
                      <p className="text-sm mt-1 line-clamp-2">{recipe.notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(recipe)}
                    className="rounded-full p-2"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(recipe)}
                    className="rounded-full p-2"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(recipe.id)}
                    className="text-red-500 hover:text-red-700 rounded-full p-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Formulário de Receita */}
      {showForm && (
        <RecipeForm
          recipe={editingRecipe}
          categories={categories}
          onClose={() => {
            setShowForm(false);
            setEditingRecipe(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingRecipe(null);
            queryClient.invalidateQueries({ queryKey: ['recipes'] });
          }}
        />
      )}

      {/* Dialog de Categorias */}
      {showCategoryDialog && (
        <RecipeCategoryDialog
          onClose={() => setShowCategoryDialog(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['recipe-categories'] });
          }}
        />
      )}
    </div>
  );
};

export default Recipes;
