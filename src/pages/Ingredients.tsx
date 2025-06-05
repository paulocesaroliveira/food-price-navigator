
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Edit, 
  Trash2, 
  Upload,
  Settings,
  ChefHat,
  DollarSign,
  Calendar,
  TrendingUp
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ImageUpload } from "@/components/ingredients/ImageUpload";
import { CategoryDialog } from "@/components/ingredients/CategoryDialog";
import { IngredientForm } from "@/components/ingredients/IngredientForm";
import SEOHead from "@/components/SEOHead";

interface DatabaseIngredient {
  id: string;
  created_at: string;
  name: string;
  description?: string;
  image_url?: string;
  unit_cost: number;
  unit: string;
  category_id?: string;
  supplier?: string;
  notes?: string;
  user_id: string;
  brand: string;
  package_quantity: number;
  package_price: number;
  updated_at: string;
}

interface DisplayIngredient {
  id: string;
  created_at: string;
  name: string;
  description?: string;
  image_url?: string;
  cost: number;
  unit: string;
  category: string;
  supplier?: string;
  notes?: string;
  user_id: string;
  brand: string;
  package_quantity: number;
  package_price: number;
  unit_cost: number;
}

interface Category {
  id: string;
  created_at: string;
  name: string;
  description?: string;
  user_id: string;
}

const Ingredients = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<DisplayIngredient | null>(null);

  const queryClient = useQueryClient();

  const { data: ingredientsRaw, isLoading } = useQuery({
    queryKey: ['ingredients', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('ingredients')
        .select(`
          *,
          ingredient_categories(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as (DatabaseIngredient & { ingredient_categories?: { name: string } })[];
    },
    enabled: !!user?.id,
  });

  const ingredients: DisplayIngredient[] = ingredientsRaw?.map(item => ({
    id: item.id,
    created_at: item.created_at,
    name: item.name,
    description: item.notes,
    image_url: item.image_url,
    cost: item.unit_cost,
    unit: item.unit,
    category: item.ingredient_categories?.name || 'Sem categoria',
    supplier: item.supplier,
    notes: item.notes,
    user_id: item.user_id,
    brand: item.brand,
    package_quantity: item.package_quantity,
    package_price: item.package_price,
    unit_cost: item.unit_cost
  })) || [];

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('ingredient_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user?.id,
  });

  const createIngredientMutation = useMutation({
    mutationFn: async (newIngredient: { 
      name: string; 
      description?: string; 
      image_url?: string; 
      cost: number; 
      unit: string; 
      category: string; 
      supplier?: string; 
      notes?: string; 
    }) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      // Find category_id by name
      const category = categories?.find(c => c.name === newIngredient.category);
      
      const ingredientData = {
        name: newIngredient.name,
        notes: newIngredient.notes || newIngredient.description,
        image_url: newIngredient.image_url,
        unit_cost: newIngredient.cost,
        unit: newIngredient.unit,
        category_id: category?.id,
        supplier: newIngredient.supplier,
        user_id: user.id,
        brand: newIngredient.supplier || 'Sem marca',
        package_quantity: 1,
        package_price: newIngredient.cost
      };

      const { data, error } = await supabase
        .from('ingredients')
        .insert([ingredientData])
        .select()
        .single();
      if (error) throw error;
      return data as DatabaseIngredient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients', user?.id] });
      toast({ title: "Sucesso", description: "Ingrediente criado com sucesso!" });
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: `Erro ao criar ingrediente: ${error.message}`, variant: "destructive" });
    },
  });

  const updateIngredientMutation = useMutation({
    mutationFn: async (updatedIngredient: DisplayIngredient) => {
      // Find category_id by name
      const category = categories?.find(c => c.name === updatedIngredient.category);
      
      const ingredientData = {
        name: updatedIngredient.name,
        notes: updatedIngredient.notes || updatedIngredient.description,
        image_url: updatedIngredient.image_url,
        unit_cost: updatedIngredient.cost,
        unit: updatedIngredient.unit,
        category_id: category?.id,
        supplier: updatedIngredient.supplier,
        brand: updatedIngredient.supplier || 'Sem marca',
        package_quantity: updatedIngredient.package_quantity,
        package_price: updatedIngredient.package_price
      };

      const { data, error } = await supabase
        .from('ingredients')
        .update(ingredientData)
        .eq('id', updatedIngredient.id)
        .select()
        .single();
      if (error) throw error;
      return data as DatabaseIngredient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients', user?.id] });
      toast({ title: "Sucesso", description: "Ingrediente atualizado com sucesso!" });
      setShowForm(false);
      setEditingIngredient(null);
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: `Erro ao atualizar ingrediente: ${error.message}`, variant: "destructive" });
    },
  });

  const deleteIngredientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients', user?.id] });
      toast({ title: "Sucesso", description: "Ingrediente removido com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: `Erro ao remover ingrediente: ${error.message}`, variant: "destructive" });
    },
  });

  const filteredIngredients = ingredients
    ?.filter(ingredient =>
      ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory ? ingredient.category === selectedCategory : true)
    );

  const totalIngredients = ingredients?.length || 0;
  const totalCategories = categories?.length || 0;

  const handleEdit = (ingredient: DisplayIngredient) => {
    setEditingIngredient(ingredient);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este ingrediente?")) {
      await deleteIngredientMutation.mutateAsync(id);
    }
  };

  return (
    <>
      <SEOHead 
        title="Ingredientes - TastyHub"
        description="Gerencie seus ingredientes de forma eficiente. Controle custos, fornecedores e estoque com facilidade."
        keywords="ingredientes, custos, fornecedores, estoque, gestão"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container-responsive py-4 sm:py-6 lg:py-8 spacing-responsive">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 p-4 sm:p-6 lg:p-8 text-white shadow-2xl mb-4 sm:mb-6 lg:mb-8">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -right-2 -top-2 sm:-right-4 sm:-top-4 h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 rounded-full bg-white/10"></div>
            <div className="absolute -left-2 -bottom-2 sm:-left-4 sm:-bottom-4 h-20 w-20 sm:h-32 sm:w-32 lg:h-40 lg:w-40 rounded-full bg-white/5"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="rounded-xl sm:rounded-2xl bg-white/20 p-2 sm:p-3 lg:p-4 backdrop-blur-sm">
                      <Package className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold">Ingredientes</h1>
                      <p className="text-emerald-100 text-xs sm:text-sm lg:text-lg">Gerencie seus ingredientes e custos</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 rounded-full bg-white/20 px-2 py-1 sm:px-3 sm:py-2 backdrop-blur-sm">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Controle Total</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-white/20 px-2 py-1 sm:px-3 sm:py-2 backdrop-blur-sm">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Gestão de Custos</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <Button 
                    onClick={() => setShowCategoryDialog(true)}
                    className="gap-2 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/30 h-10 sm:h-10 lg:h-12 text-xs sm:text-sm px-3 sm:px-4"
                  >
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Categorias</span>
                  </Button>
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="gap-2 bg-white text-emerald-600 hover:bg-emerald-50 h-10 sm:h-10 lg:h-12 text-xs sm:text-sm px-3 sm:px-4"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Novo Ingrediente</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar ingredientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 sm:h-10 border-0 shadow-lg bg-white text-xs sm:text-sm"
              />
            </div>
            <div className="relative">
              <select
                className="h-8 sm:h-10 border-0 shadow-lg bg-white text-xs sm:text-sm pl-3 pr-8 rounded-md appearance-none text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Todas as Categorias</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-50 group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="rounded-xl p-2 bg-gradient-to-r from-blue-500 to-blue-600 group-hover:scale-110 transition-transform duration-300">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs text-gray-500">Total</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{totalIngredients}</p>
                <p className="text-xs text-gray-500">Ingredientes</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-green-50 group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="rounded-xl p-2 bg-gradient-to-r from-green-500 to-green-600 group-hover:scale-110 transition-transform duration-300">
                    <ChefHat className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs text-gray-500">Total</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{totalCategories}</p>
                <p className="text-xs text-gray-500">Categorias</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-purple-50 group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="rounded-xl p-2 bg-gradient-to-r from-purple-500 to-purple-600 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs text-gray-500">Em breve</span>
                </div>
                <p className="text-lg font-bold text-gray-900">Uploads</p>
                <p className="text-xs text-gray-500">de custos</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-orange-50 group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="rounded-xl p-2 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs text-gray-500">Em breve</span>
                </div>
                <p className="text-lg font-bold text-gray-900">Relatórios</p>
                <p className="text-xs text-gray-500">de custos</p>
              </CardContent>
            </Card>
          </div>

          {/* Ingredients List */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="py-3 sm:py-4 bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardTitle className="text-sm sm:text-lg font-semibold text-gray-700">Lista de Ingredientes</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              {isLoading ? (
                <div className="text-center p-4">Carregando ingredientes...</div>
              ) : filteredIngredients && filteredIngredients.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {filteredIngredients.map((ingredient) => (
                    <div key={ingredient.id} className="relative border rounded-md p-2 sm:p-3 bg-white hover:shadow-lg transition-all duration-200">
                      {ingredient.image_url && (
                        <div className="absolute top-0 left-0 w-full h-24 sm:h-32 rounded-t-md overflow-hidden">
                          <img
                            src={ingredient.image_url}
                            alt={ingredient.name}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                      )}
                      <div className={`pt-2 ${ingredient.image_url ? 'mt-24 sm:mt-32' : ''}`}>
                        <h3 className="text-sm font-semibold text-gray-800">{ingredient.name}</h3>
                        <p className="text-xs text-gray-600 truncate">{ingredient.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div>
                            <p className="text-gray-700 text-sm font-bold">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ingredient.cost)}
                            </p>
                            <p className="text-gray-500 text-xs">por {ingredient.unit}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="icon" variant="outline" onClick={() => handleEdit(ingredient)} className="border-gray-300 hover:bg-gray-50 h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="outline" onClick={() => handleDelete(ingredient.id)} className="text-red-600 border-red-300 hover:bg-red-50 h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 text-gray-500">Nenhum ingrediente encontrado.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ingredient Form Modal */}
      <IngredientForm
        open={showForm}
        onOpenChange={setShowForm}
        categories={categories || []}
        ingredient={editingIngredient ? {
          id: editingIngredient.id,
          name: editingIngredient.name,
          image: editingIngredient.image_url,
          categoryId: categories?.find(c => c.name === editingIngredient.category)?.id || '',
          unit: editingIngredient.unit as 'g' | 'ml',
          brand: editingIngredient.brand,
          supplier: editingIngredient.supplier,
          packageQuantity: editingIngredient.package_quantity,
          packagePrice: editingIngredient.package_price,
          unitCost: editingIngredient.unit_cost
        } : null}
        onSubmit={async (values) => {
          try {
            if (editingIngredient) {
              // Update existing ingredient
              await updateIngredientMutation.mutateAsync({ ...editingIngredient, ...values, cost: values.unitCost || values.cost });
            } else {
              // Create new ingredient
              await createIngredientMutation.mutateAsync({ ...values, cost: values.unitCost || values.cost });
            }
          } catch (error) {
            console.error("Error creating/updating ingredient:", error);
          } finally {
            setEditingIngredient(null);
            setShowForm(false);
          }
        }}
      />

      {/* Category Dialog */}
      <CategoryDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        onCategoriesChange={() => {
          queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
        }}
      />
    </>
  );
};

export default Ingredients;
