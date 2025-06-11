
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Utensils, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { IngredientForm } from "@/components/ingredients/IngredientForm";
import { CategoryDialog } from "@/components/ingredients/CategoryDialog";

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
  category_id?: string;
  category?: {
    id: string;
    name: string;
  };
}

const Ingredients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Ingrediente excluído com sucesso!"
      });
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir ingrediente: ${error.message}`,
        variant: "destructive"
      });
    },
    onSettled: () => {
      setDeletingId(null);
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    setIsDialogOpen(false);
    setSelectedIngredient(null);
  };

  const totalIngredients = ingredients.length;
  const avgCost = ingredients.length > 0 
    ? ingredients.reduce((acc, ingredient) => acc + (ingredient.unit_cost || 0), 0) / ingredients.length 
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Ingredientes" 
        subtitle="Gerencie seus ingredientes e custos"
        icon={Utensils}
        gradient="bg-gradient-to-r from-green-600 to-emerald-600"
        actions={
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsCategoryDialogOpen(true)}
              variant="outline"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              Categorias
            </Button>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Ingrediente
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ingredientes</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIngredients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgCost)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar ingredientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ingredientes</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredIngredients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {totalIngredients === 0 ? "Nenhum ingrediente cadastrado ainda." : "Nenhum ingrediente encontrado com os filtros aplicados."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIngredients.map((ingredient) => (
                <div key={ingredient.id} className="border rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{ingredient.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {ingredient.brand} - {ingredient.unit}
                        </div>
                        {ingredient.category && (
                          <div className="text-sm text-orange-600">{ingredient.category.name}</div>
                        )}
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(ingredient)}
                          disabled={deletingId === ingredient.id}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(ingredient.id)}
                          disabled={deletingId === ingredient.id}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Custo unitário:</span>
                      <span className="font-medium">{formatCurrency(ingredient.unit_cost)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Embalagem:</span>
                      <span className="text-sm">{ingredient.package_quantity} {ingredient.unit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Preço embalagem:</span>
                      <span className="text-sm">{formatCurrency(ingredient.package_price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <IngredientForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        ingredient={selectedIngredient}
        onSuccess={handleFormSuccess}
      />

      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      />
    </div>
  );
};

export default Ingredients;
