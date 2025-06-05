import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Beaker, Package, ShoppingCart } from "lucide-react";
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
  bulk_quantity: number;
  bulk_price: number;
  unit_cost: number;
  unit: string;
  notes?: string;
  image_url?: string;
  category_id?: string;
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
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const queryClient = useQueryClient();

  // Query para buscar ingredientes
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

  // Query para buscar categorias
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

  // Mutation para deletar ingrediente
  const deleteIngredient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      toast({
        title: "Sucesso",
        description: "Ingrediente deletado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar ingrediente.",
        variant: "destructive",
      });
    }
  });

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas
  const totalIngredients = ingredients.length;
  const totalValue = ingredients.reduce((acc, ing) => acc + (ing.bulk_price || 0), 0);

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
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
    }
  };

  const renderGridView = () => (
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
      ) : filteredIngredients.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <Beaker className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">Nenhum ingrediente encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Tente alterar os termos de busca" : "Comece criando seu primeiro ingrediente"}
          </p>
          {!searchTerm && (
            <Button 
              className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={() => setShowForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Ingrediente
            </Button>
          )}
        </div>
      ) : (
        filteredIngredients.map((ingredient) => (
          <Card key={ingredient.id} className="custom-card card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{ingredient.name}</CardTitle>
                  {ingredient.category && (
                    <p className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block">
                      {ingredient.category.name}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantidade (bulk):</span>
                  <span className="font-medium">{ingredient.bulk_quantity} {ingredient.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Preço bulk:</span>
                  <span className="font-medium text-green-600">{formatCurrency(ingredient.bulk_price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Custo unitário:</span>
                  <span className="font-medium text-blue-600">{formatCurrency(ingredient.unit_cost)}</span>
                </div>
                {ingredient.notes && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Observações:</span>
                    <p className="text-sm mt-1 line-clamp-2">{ingredient.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(ingredient)}
                  className="rounded-full"
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(ingredient.id)}
                  className="text-red-500 hover:text-red-700 rounded-full"
                >
                  Excluir
                </Button>
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
          <Beaker className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
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
                  {ingredient.category && (
                    <p className="text-sm text-blue-600">{ingredient.category.name}</p>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {ingredient.bulk_quantity} {ingredient.unit}
                </div>
                <div className="text-sm font-medium text-green-600 min-w-0">
                  {formatCurrency(ingredient.bulk_price)}
                </div>
                <div className="text-sm font-medium text-blue-600 min-w-0">
                  {formatCurrency(ingredient.unit_cost)}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(ingredient)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(ingredient.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Excluir
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
        subtitle="Gerencie os ingredientes e seus custos"
        icon={Beaker}
        gradient="bg-gradient-to-br from-green-500 via-teal-500 to-blue-500"
        badges={[
          { icon: Package, text: `${totalIngredients} ingredientes` },
          { icon: ShoppingCart, text: formatCurrency(totalValue) }
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

      {/* Controles de busca e visualização */}
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

      {/* Lista de Ingredientes */}
      {view === 'grid' ? renderGridView() : renderListView()}

      {/* Formulários e Dialogs */}
      {showForm && (
        <IngredientForm
          ingredient={editingIngredient}
          onSubmit={async (data) => {
            console.log('Form submitted:', data);
            setShowForm(false);
            setEditingIngredient(null);
            queryClient.invalidateQueries({ queryKey: ['ingredients'] });
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingIngredient(null);
          }}
        />
      )}

      {showCategoryDialog && (
        <CategoryDialog
          open={showCategoryDialog}
          onOpenChange={setShowCategoryDialog}
        />
      )}
    </div>
  );
};

export default Ingredients;
