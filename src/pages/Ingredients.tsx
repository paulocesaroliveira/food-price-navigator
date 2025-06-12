
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Utensils, Package } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { IngredientForm } from "@/components/ingredients/IngredientForm";
import { CategoryDialog } from "@/components/ingredients/CategoryDialog";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/calculations";

const Ingredients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);

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

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIngredients = ingredients.length;
  const avgCost = ingredients.length > 0 
    ? ingredients.reduce((acc, ingredient) => acc + (ingredient.unit_cost || 0), 0) / ingredients.length 
    : 0;

  const handleSuccess = () => {
    setShowForm(false);
    setEditingIngredient(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ingredientes"
        subtitle="Gerencie seus ingredientes e custos de forma inteligente"
        icon={Utensils}
        gradient="from-orange-500 to-red-600"
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
              className="btn-gradient"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Ingrediente
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ingredientes</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIngredients}</div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgCost)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar ingredientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 input-focus"
        />
      </div>

      <Card className="custom-card">
        <CardHeader>
          <CardTitle>Lista de Ingredientes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando ingredientes...</p>
            </div>
          ) : filteredIngredients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Nenhum ingrediente cadastrado ainda.</p>
              <Button 
                className="mt-4 btn-gradient"
                onClick={() => setShowForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Ingrediente
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIngredients.map((ingredient) => (
                <div key={ingredient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    {ingredient.image_url && (
                      <img 
                        src={ingredient.image_url} 
                        alt={ingredient.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-medium">{ingredient.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {ingredient.brand} • {ingredient.package_quantity} {ingredient.unit}
                      </p>
                      {ingredient.category && (
                        <p className="text-xs text-orange-600">{ingredient.category.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(ingredient.unit_cost)}</p>
                    <p className="text-sm text-muted-foreground">por {ingredient.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <IngredientForm
        open={showForm}
        onOpenChange={setShowForm}
        ingredient={editingIngredient}
        onSuccess={handleSuccess}
      />

      <CategoryDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
      />
    </div>
  );
};

export default Ingredients;
