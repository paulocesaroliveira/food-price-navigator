
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Package, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { IngredientForm } from "@/components/ingredients/IngredientForm";
import { CategoryDialog } from "@/components/ingredients/CategoryDialog";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/calculations";
import { PageHeader } from "@/components/shared/PageHeader";

const Ingredients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
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
          ingredient_categories(name, id)
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
    ingredient.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas
  const totalIngredients = ingredients.length;
  const totalValue = ingredients.reduce((sum, ing) => sum + (Number(ing.package_price) || 0), 0);

  const handleEdit = (ingredient: any) => {
    setEditingIngredient(ingredient);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este ingrediente?')) {
      deleteIngredient.mutate(id);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Ingredientes"
        subtitle="Gerencie ingredientes e suas categorias"
        icon={Package}
        gradient="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500"
        badges={[
          { icon: Package, text: `${totalIngredients} ingredientes` },
          { icon: DollarSign, text: `Valor: ${formatCurrency(totalValue)}` }
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
              Novo Ingrediente
            </Button>
          </div>
        }
      />

      {/* Busca */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <Input
          placeholder="Buscar ingredientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-sm input-focus"
        />
      </div>

      {/* Lista de Ingredientes */}
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
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium">Nenhum ingrediente encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Tente alterar os termos de busca" : "Comece criando seu primeiro ingrediente"}
            </p>
            {!searchTerm && (
              <Button 
                className="mt-4 btn-gradient"
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
                    <p className="text-sm text-muted-foreground">{ingredient.brand}</p>
                  </div>
                  {ingredient.ingredient_categories && (
                    <Badge variant="secondary" className="rounded-full">
                      {ingredient.ingredient_categories.name}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantidade:</span>
                    <span className="font-medium">{ingredient.package_quantity} {ingredient.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Preço:</span>
                    <span className="font-medium text-green-600">{formatCurrency(ingredient.package_price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Custo unitário:</span>
                    <span className="font-medium text-blue-600">{formatCurrency(ingredient.unit_cost)}</span>
                  </div>
                  {ingredient.supplier && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fornecedor:</span>
                      <span className="font-medium">{ingredient.supplier}</span>
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

      {/* Formulário de Ingrediente */}
      {showForm && (
        <IngredientForm
          open={showForm}
          ingredient={editingIngredient}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) setEditingIngredient(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingIngredient(null);
            queryClient.invalidateQueries({ queryKey: ['ingredients'] });
          }}
        />
      )}

      {/* Dialog de Categorias */}
      {showCategoryDialog && (
        <CategoryDialog
          open={showCategoryDialog}
          onOpenChange={setShowCategoryDialog}
          onCategoriesChange={() => {
            queryClient.invalidateQueries({ queryKey: ['ingredient-categories'] });
          }}
        />
      )}
    </div>
  );
};

export default Ingredients;
