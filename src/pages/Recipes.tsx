
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, ChefHat, Package, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RecipesGrid } from "@/components/recipes/RecipesGrid";
import { RecipeCategoryDialog } from "@/components/recipes/RecipeCategoryDialog";
import { formatCurrency } from "@/utils/calculations";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { ViewToggle } from "@/components/shared/ViewToggle";

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
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [deletingRecipeId, setDeletingRecipeId] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const queryClient = useQueryClient();

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          category:recipe_categories(id, name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: ingredients = [] } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

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

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRecipes = recipes.length;
  const avgCost = recipes.length > 0 
    ? recipes.reduce((acc, recipe) => acc + (recipe.unit_cost || 0), 0) / recipes.length 
    : 0;

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingRecipeId(id);
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Receita excluída",
        description: "A receita foi removida com sucesso.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingRecipeId(null);
    }
  };

  const renderListView = () => (
    <div className="space-y-2">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
          </Card>
        ))
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">Nenhuma receita encontrada</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Tente alterar os termos de busca" : "Comece criando sua primeira receita"}
          </p>
        </div>
      ) : (
        filteredRecipes.map((recipe) => (
          <Card key={recipe.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium truncate">{recipe.name}</h3>
                  {recipe.category && (
                    <p className="text-sm text-orange-600">{recipe.category.name}</p>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {recipe.portions} porções
                </div>
                <div className="text-sm font-medium text-green-600 min-w-0">
                  {formatCurrency(recipe.total_cost)}
                </div>
                <div className="text-sm font-medium text-blue-600 min-w-0">
                  {formatCurrency(recipe.unit_cost)}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(recipe)}
                  disabled={deletingRecipeId === recipe.id}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(recipe.id)}
                  disabled={deletingRecipeId === recipe.id}
                  className="text-red-500 hover:text-red-700"
                >
                  {deletingRecipeId === recipe.id ? "Excluindo..." : "Excluir"}
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Receitas"
        subtitle="Gerencie suas receitas e custos de produção"
        icon={ChefHat}
        gradient="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500"
        badges={[
          { icon: Package, text: `${totalRecipes} receitas` },
          { icon: DollarSign, text: `Custo médio: ${formatCurrency(avgCost)}` }
        ]}
        actions={
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowCategoryDialog(true)}
              variant="outline"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              Categorias
            </Button>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Receita
            </Button>
          </div>
        }
      />

      {/* Controles de busca e visualização */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <Input
            placeholder="Buscar receitas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full input-focus"
          />
        </div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Lista de Receitas */}
      {view === 'grid' ? (
        <RecipesGrid 
          recipes={filteredRecipes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
          searchTerm={searchTerm}
          deletingRecipeId={deletingRecipeId}
        />
      ) : (
        renderListView()
      )}

      {/* Dialog de Categoria */}
      {showCategoryDialog && (
        <RecipeCategoryDialog
          open={showCategoryDialog}
          onClose={() => setShowCategoryDialog(false)}
        />
      )}
    </div>
  );
};

export default Recipes;
