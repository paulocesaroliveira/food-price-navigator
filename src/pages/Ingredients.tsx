
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Package2, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { IngredientForm } from "@/components/ingredients/IngredientForm";
import { CategoryManager } from "@/components/shared/CategoryManager";
import { formatCurrency } from "@/utils/calculations";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { ItemCard } from "@/components/shared/ItemCard";
import { SortControls } from "@/components/shared/SortControls";
import { useSortAndFilter } from "@/hooks/useSortAndFilter";

const Ingredients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<any>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [deletingIngredientId, setDeletingIngredientId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: ingredients = [], isLoading } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('ingredients')
        .select(`
          *,
          category:ingredient_categories(id, name)
        `)
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
    sortedItems: filteredIngredients,
    sortBy,
    sortDirection,
    handleSort
  } = useSortAndFilter({
    items: ingredients,
    searchTerm,
    defaultSort: 'name'
  });

  const deleteIngredientMutation = useMutation({
    mutationFn: async (ingredientId: string) => {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', ingredientId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Ingrediente excluído",
        description: "O ingrediente foi excluído com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir ingrediente",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeletingIngredientId(null);
    }
  });

  const totalIngredients = ingredients.length;
  const avgCost = ingredients.length > 0 
    ? ingredients.reduce((acc, ingredient) => acc + (ingredient.unit_cost || 0), 0) / ingredients.length 
    : 0;

  const handleEdit = (ingredient: any) => {
    setEditingIngredient(ingredient);
    setShowForm(true);
  };

  const handleDelete = (ingredientId: string) => {
    setDeletingIngredientId(ingredientId);
    deleteIngredientMutation.mutate(ingredientId);
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    setShowForm(false);
    setEditingIngredient(null);
  };

  const handleNewIngredient = () => {
    setEditingIngredient(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingIngredient(null);
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {isLoading ? (
        Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl h-48"></div>
          </div>
        ))
      ) : filteredIngredients.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <Package2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">Nenhum ingrediente encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Tente alterar os termos de busca" : "Comece criando seu primeiro ingrediente"}
          </p>
        </div>
      ) : (
        filteredIngredients.map((ingredient) => (
          <ItemCard
            key={ingredient.id}
            id={ingredient.id}
            title={ingredient.name}
            subtitle={ingredient.brand}
            category={ingredient.category?.name}
            imageUrl={ingredient.image_url}
            stats={[
              { label: 'Unidade', value: ingredient.unit, type: 'text' },
              { label: 'Custo unitário', value: ingredient.unit_cost || 0, type: 'currency' },
              { label: 'Qtd. pacote', value: `${ingredient.package_quantity} ${ingredient.unit}`, type: 'text' },
              { label: 'Preço pacote', value: ingredient.package_price || 0, type: 'currency' }
            ]}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={deletingIngredientId === ingredient.id}
            extraInfo={ingredient.supplier}
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
      ) : filteredIngredients.length === 0 ? (
        <div className="text-center py-12">
          <Package2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">Nenhum ingrediente encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Tente alterar os termos de busca" : "Comece criando seu primeiro ingrediente"}
          </p>
        </div>
      ) : (
        filteredIngredients.map((ingredient) => (
          <ItemCard
            key={ingredient.id}
            id={ingredient.id}
            title={ingredient.name}
            subtitle={ingredient.brand}
            category={ingredient.category?.name}
            stats={[
              { label: 'Custo', value: ingredient.unit_cost || 0, type: 'currency' },
              { label: 'Unidade', value: ingredient.unit, type: 'text' },
              { label: 'Fornecedor', value: ingredient.supplier || 'N/A', type: 'text' }
            ]}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={deletingIngredientId === ingredient.id}
          />
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Ingredientes"
        subtitle="Gerencie seus ingredientes e custos"
        icon={Package2}
        gradient="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500"
        badges={[
          { icon: Package2, text: `${totalIngredients} ingredientes` },
          { icon: DollarSign, text: `Custo médio: ${formatCurrency(avgCost)}` }
        ]}
        actions={
          <div className="flex gap-2">
            <CategoryManager
              title="Categorias de Ingredientes"
              description="Gerencie as categorias dos seus ingredientes"
              tableName="ingredient_categories"
              queryKey="ingredient-categories"
              icon={Package2}
              onCategoriesChange={() => queryClient.invalidateQueries({ queryKey: ['ingredients'] })}
            >
              <Button 
                variant="outline"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                Categorias
              </Button>
            </CategoryManager>
            <Button 
              onClick={handleNewIngredient}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Ingrediente
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <Input
            placeholder="Buscar ingredientes..."
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

      <IngredientForm
        open={showForm}
        onOpenChange={handleFormClose}
        onSuccess={handleFormSuccess}
        ingredient={editingIngredient}
      />
    </div>
  );
};

export default Ingredients;
