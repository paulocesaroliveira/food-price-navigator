import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, ChefHat, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import RecipeForm from "@/components/recipes/RecipeForm";
import { createRecipe, updateRecipe, deleteRecipe } from "@/services/recipeService";
import { RecipeCategoryManager } from "@/components/recipes/RecipeCategoryManager";
import { RecipesGrid } from "@/components/recipes/RecipesGrid";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePagination } from "@/hooks/usePagination";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/shared/PageHeader";

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
  const { isLoading: isActionLoading, withLoading } = useLoadingStates();

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      console.log("Fetching recipes...");
      
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

      if (error) {
        console.error("Error fetching recipes:", error);
        throw error;
      }
      
      console.log("Raw recipes from database:", data);
      
      const processedRecipes = data?.map(recipe => {
        console.log(`Processing recipe ${recipe.name}: total_cost=${recipe.total_cost}, unit_cost=${recipe.unit_cost}, portions=${recipe.portions}`);
        
        return {
          id: recipe.id,
          name: recipe.name,
          portions: recipe.portions,
          total_cost: Number(recipe.total_cost) || 0,
          unit_cost: Number(recipe.unit_cost) || 0,
          notes: recipe.notes,
          image_url: recipe.image_url,
          created_at: recipe.created_at,
          category: recipe.category
        };
      }) || [];
      
      console.log("Processed recipes:", processedRecipes);
      return processedRecipes;
    },
    refetchOnWindowFocus: true,
    refetchInterval: 5000
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
      return data;
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
      return data;
    }
  });

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedRecipes,
    goToPage,
    hasNextPage,
    hasPreviousPage,
    totalItems,
    startIndex,
    endIndex
  } = usePagination({ data: filteredRecipes, itemsPerPage: 12 });

  const handleDelete = async (id: string) => {
    await withLoading(`delete-${id}`, async () => {
      try {
        await deleteRecipe(id);

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
    });
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRecipe(null);
  };

  const handleFormSubmit = async (data: any) => {
    await withLoading('save-recipe', async () => {
      try {
        console.log("Salvando receita com dados:", data);
        
        if (editingRecipe) {
          await updateRecipe(editingRecipe.id, data);
        } else {
          await createRecipe(data);
        }

        queryClient.invalidateQueries({ queryKey: ['recipes'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        
        toast({
          title: "Receita salva",
          description: "A receita foi salva com sucesso",
        });
        
        handleFormClose();
      } catch (error: any) {
        console.error("Erro ao salvar receita:", error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar a receita",
          variant: "destructive",
        });
        throw error;
      }
    });
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setShowForm(true);
  };

  const handleCategoriesChange = () => {
    queryClient.invalidateQueries({ queryKey: ['recipe-categories'] });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Receitas"
        subtitle="Gerencie suas receitas e calcule custos de produção"
        icon={ChefHat}
        gradient="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500"
        badges={[
          { icon: ChefHat, text: `${recipes.length} receitas` },
          { icon: DollarSign, text: `Custo médio: R$ ${recipes.length > 0 ? (recipes.reduce((sum, recipe) => sum + recipe.total_cost, 0) / recipes.length).toFixed(2) : '0,00'}` }
        ]}
        actions={
          <>
            <RecipeCategoryManager 
              categories={categories}
              onCategoriesChange={handleCategoriesChange}
            />
            <Button
              onClick={() => setShowForm(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Receita
            </Button>
          </>
        }
      />

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        
        <Card className="sm:col-span-2 lg:col-span-1">
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
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <Input
          placeholder="Buscar por nome, categoria ou observações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        {isLoading && <LoadingSpinner size="sm" />}
      </div>

      {/* Lista de receitas */}
      <RecipesGrid
        recipes={paginatedRecipes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        searchTerm={searchTerm}
        deletingRecipeId={isActionLoading('delete-') ? Object.keys(isActionLoading).find(key => key.startsWith('delete-') && isActionLoading(key))?.replace('delete-', '') : undefined}
      />

      {/* Paginação */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        totalItems={totalItems}
        startIndex={startIndex}
        endIndex={endIndex}
      />

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
