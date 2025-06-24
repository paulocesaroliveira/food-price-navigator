
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, ChefHat, Package, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RecipesGrid } from "@/components/recipes/RecipesGrid";
import { RecipeCategoryDialog } from "@/components/recipes/RecipeCategoryDialog";
import RecipeForm from "@/components/recipes/RecipeForm";
import { formatCurrency } from "@/utils/calculations";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { CategoryManager } from "@/components/shared/CategoryManager";
import { ItemCard } from "@/components/shared/ItemCard";
import { SortControls } from "@/components/shared/SortControls";
import { useSortAndFilter } from "@/hooks/useSortAndFilter";

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
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [deletingRecipeId, setDeletingRecipeId] = useState<string | null>(null);
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

  const sortOptions = [
    { value: 'name' as const, label: 'Nome' },
    { value: 'category' as const, label: 'Categoria' },
    { value: 'cost' as const, label: 'Custo' },
    { value: 'created_at' as const, label: 'Data de Criação' }
  ];

  const {
    sortedItems: filteredRecipes,
    sortBy,
    sortDirection,
    handleSort
  } = useSortAndFilter({
    items: recipes,
    searchTerm,
    defaultSort: 'name'
  });

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

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['recipes'] });
    setShowForm(false);
    setEditingRecipe(null);
  };

  const handleNewRecipe = () => {
    setEditingRecipe(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRecipe(null);
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {isLoading ? (
        Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl h-48"></div>
          </div>
        ))
      ) : filteredRecipes.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">Nenhuma receita encontrada</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Tente alterar os termos de busca" : "Comece criando sua primeira receita"}
          </p>
        </div>
      ) : (
        filteredRecipes.map((recipe) => (
          <ItemCard
            key={recipe.id}
            id={recipe.id}
            title={recipe.name}
            category={recipe.category?.name}
            imageUrl={recipe.image_url}
            stats={[
              { label: 'Porções', value: recipe.portions, type: 'text' },
              { label: 'Custo total', value: recipe.total_cost || 0, type: 'currency' },
              { label: 'Custo unitário', value: recipe.unit_cost || 0, type: 'currency' }
            ]}
            onEdit={() => handleEdit(recipe)}
            onDelete={() => handleDelete(recipe.id)}
            isDeleting={deletingRecipeId === recipe.id}
            extraInfo={recipe.notes}
          />
        ))
      )}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-16"></div>
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
          <ItemCard
            key={recipe.id}
            id={recipe.id}
            title={recipe.name}
            category={recipe.category?.name}
            stats={[
              { label: 'Porções', value: recipe.portions, type: 'text' },
              { label: 'Custo total', value: recipe.total_cost || 0, type: 'currency' },
              { label: 'Custo unitário', value: recipe.unit_cost || 0, type: 'currency' }
            ]}
            onEdit={() => handleEdit(recipe)}
            onDelete={() => handleDelete(recipe.id)}
            isDeleting={deletingRecipeId === recipe.id}
          />
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
            <CategoryManager
              title="Categorias de Receitas"
              description="Gerencie as categorias das suas receitas"
              tableName="recipe_categories"
              queryKey="recipe-categories"
              icon={ChefHat}
              onCategoriesChange={() => queryClient.invalidateQueries({ queryKey: ['recipes'] })}
            >
              <Button 
                variant="outline"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                Categorias
              </Button>
            </CategoryManager>
            <Button 
              onClick={handleNewRecipe}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Receita
            </Button>
          </div>
        }
      />

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
        <div className="flex items-center gap-3">
          <SortControls
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
            availableOptions={sortOptions}
          />
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {view === 'grid' ? renderGridView() : renderListView()}

      <RecipeForm
        open={showForm}
        onOpenChange={handleFormClose}
        onSuccess={handleFormSuccess}
        categories={categories}
        ingredients={ingredients}
        editingRecipe={editingRecipe}
      />
    </div>
  );
};

export default Recipes;
