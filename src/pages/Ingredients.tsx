
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Package, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { IngredientForm } from "@/components/ingredients/IngredientForm";
import { CategoryDialog } from "@/components/ingredients/CategoryDialog";
import { formatCurrency } from "@/utils/calculations";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { ViewToggle } from "@/components/shared/ViewToggle";

interface Ingredient {
  id: string;
  name: string;
  brand: string;
  unit: string;
  package_quantity: number;
  package_price: number;
  unit_cost: number;
  supplier?: string;
  image_url?: string;
  created_at: string;
  category?: {
    id: string;
    name: string;
  };
}

const Ingredients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [deletingIngredientId, setDeletingIngredientId] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
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
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['ingredient-categories'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('ingredient_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIngredients = ingredients.length;
  const avgCost = ingredients.length > 0 
    ? ingredients.reduce((acc, ingredient) => acc + (ingredient.unit_cost || 0), 0) / ingredients.length 
    : 0;

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingIngredientId(id);
    try {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Ingrediente excluído",
        description: "O ingrediente foi removido com sucesso.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingIngredientId(null);
    }
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    setShowForm(false);
    setEditingIngredient(null);
  };

  const handleCategoriesChange = () => {
    queryClient.invalidateQueries({ queryKey: ['ingredient-categories'] });
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {isLoading ? (
        Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </Card>
        ))
      ) : filteredIngredients.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">Nenhum ingrediente encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Tente alterar os termos de busca" : "Comece criando seu primeiro ingrediente"}
          </p>
        </div>
      ) : (
        filteredIngredients.map((ingredient) => (
          <Card key={ingredient.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {ingredient.image_url && (
                    <img
                      src={ingredient.image_url}
                      alt={ingredient.name}
                      className="w-10 h-10 rounded-md object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{ingredient.name}</h3>
                    <p className="text-sm text-gray-500">{ingredient.brand}</p>
                  </div>
                </div>
                {ingredient.category && (
                  <p className="text-sm text-orange-600">{ingredient.category.name}</p>
                )}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Pacote:</span>
                    <span>{ingredient.package_quantity} {ingredient.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Preço:</span>
                    <span className="text-green-600 font-medium">
                      {formatCurrency(ingredient.package_price)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Custo unitário:</span>
                    <span className="text-blue-600 font-medium">
                      {formatCurrency(ingredient.unit_cost)}/{ingredient.unit}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(ingredient)}
                    disabled={deletingIngredientId === ingredient.id}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(ingredient.id)}
                    disabled={deletingIngredientId === ingredient.id}
                    className="text-red-500 hover:text-red-700"
                  >
                    {deletingIngredientId === ingredient.id ? "..." : "Excluir"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

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
      ) : filteredIngredients.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">Nenhum ingrediente encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Tente alterar os termos de busca" : "Comece criando seu primeiro ingrediente"}
          </p>
        </div>
      ) : (
        filteredIngredients.map((ingredient) => (
          <Card key={ingredient.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium truncate">{ingredient.name}</h3>
                  <p className="text-sm text-gray-500">{ingredient.brand}</p>
                  {ingredient.category && (
                    <p className="text-sm text-orange-600">{ingredient.category.name}</p>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {ingredient.package_quantity} {ingredient.unit}
                </div>
                <div className="text-sm font-medium text-green-600 min-w-0">
                  {formatCurrency(ingredient.package_price)}
                </div>
                <div className="text-sm font-medium text-blue-600 min-w-0">
                  {formatCurrency(ingredient.unit_cost)}/{ingredient.unit}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(ingredient)}
                  disabled={deletingIngredientId === ingredient.id}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(ingredient.id)}
                  disabled={deletingIngredientId === ingredient.id}
                  className="text-red-500 hover:text-red-700"
                >
                  {deletingIngredientId === ingredient.id ? "Excluindo..." : "Excluir"}
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
        title="Ingredientes"
        subtitle="Gerencie seus ingredientes e custos"
        icon={Package}
        gradient="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500"
        badges={[
          { icon: Package, text: `${totalIngredients} ingredientes` },
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
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {view === 'grid' ? renderGridView() : renderListView()}

      <IngredientForm
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={handleFormSuccess}
        ingredient={editingIngredient}
      />

      <CategoryDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        onCategoriesChange={handleCategoriesChange}
      />
    </div>
  );
};

export default Ingredients;
