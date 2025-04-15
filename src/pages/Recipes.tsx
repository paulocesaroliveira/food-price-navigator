
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/utils/calculations";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchRecipes, 
  fetchRecipeCategories, 
  createRecipe,
  updateRecipe,
  deleteRecipe 
} from "@/services/recipeService";
import { useToast } from "@/hooks/use-toast";
import RecipeForm from "@/components/recipes/RecipeForm";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Recipes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { 
    data: recipes = [], 
    isLoading,
    error
  } = useQuery({
    queryKey: ["recipes"],
    queryFn: fetchRecipes
  });

  const { 
    data: categories = []
  } = useQuery({
    queryKey: ["recipeCategories"],
    queryFn: fetchRecipeCategories
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createRecipe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateRecipe(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast({
        title: "Receita excluída",
        description: "A receita foi excluída com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a receita. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Filtrar receitas baseado no termo de busca
  const filteredRecipes = recipes.filter((recipe: any) => 
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenForm = (recipe?: any) => {
    if (recipe) {
      setEditingRecipe(recipe);
    } else {
      setEditingRecipe(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingRecipe(null);
  };

  const handleSubmit = async (data: any) => {
    if (editingRecipe) {
      await updateMutation.mutateAsync({ id: editingRecipe.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = (id: string) => {
    setRecipeToDelete(id);
  };

  const confirmDelete = () => {
    if (recipeToDelete) {
      deleteMutation.mutate(recipeToDelete);
      setRecipeToDelete(null);
    }
  };

  if (error) {
    toast({
      title: "Erro ao carregar receitas",
      description: "Não foi possível carregar as receitas. Tente novamente mais tarde.",
      variant: "destructive"
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Receitas</h1>
        <Button className="gap-2" onClick={() => handleOpenForm()}>
          <PlusCircle className="h-4 w-4" />
          Nova Receita
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Receitas</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar receita..."
                  className="pl-9 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted border-b">
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">Categoria</th>
                    <th className="text-left p-3">Porções</th>
                    <th className="text-left p-3">Custo Total</th>
                    <th className="text-left p-3">Custo por Unidade</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipes.length > 0 ? (
                    filteredRecipes.map((recipe: any) => (
                      <tr key={recipe.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">{recipe.name}</td>
                        <td className="p-3">{recipe.recipe_categories?.name}</td>
                        <td className="p-3">{recipe.portions}</td>
                        <td className="p-3">{formatCurrency(recipe.total_cost)}</td>
                        <td className="p-3">{formatCurrency(recipe.unit_cost)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleOpenForm(recipe)}
                            >
                              Editar
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive"
                              onClick={() => handleDelete(recipe.id)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        {recipes.length === 0 
                          ? "Nenhuma receita cadastrada. Adicione sua primeira receita!" 
                          : "Nenhuma receita encontrada com esse termo de busca."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulário de receita */}
      <RecipeForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        editingRecipe={editingRecipe}
        categories={categories}
      />

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={!!recipeToDelete} onOpenChange={(open) => !open && setRecipeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Recipes;
