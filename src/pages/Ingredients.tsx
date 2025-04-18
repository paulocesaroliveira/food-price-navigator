
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Tags,
  X,
  FileEdit,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { formatCurrency } from "@/utils/calculations";
import { useToast } from "@/components/ui/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { IngredientForm } from "@/components/ingredients/IngredientForm";
import { CategoryDialog } from "@/components/ingredients/CategoryDialog";
import { useQueryClient, useQuery } from "@tanstack/react-query";

const Ingredients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<any>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['ingredientCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredient_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: ingredients = [], isLoading, refetch } = useQuery({
    queryKey: ['ingredients', searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('ingredients')
        .select(`
          *,
          ingredient_categories(name)
        `)
        .order('name');
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleEdit = (ingredient: any) => {
    setEditingIngredient(ingredient);
    setShowForm(true);
  };

  const confirmDelete = (ingredient: any) => {
    setIngredientToDelete(ingredient);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!ingredientToDelete) return;
    
    try {
      setIsDeleting(true);
      
      const baseIngredients = await supabase
        .from('recipe_base_ingredients')
        .select('id')
        .eq('ingredient_id', ingredientToDelete.id)
        .limit(1);
        
      const portionIngredients = await supabase
        .from('recipe_portion_ingredients')
        .select('id')
        .eq('ingredient_id', ingredientToDelete.id)
        .limit(1);
        
      if (
        (baseIngredients.data && baseIngredients.data.length > 0) || 
        (portionIngredients.data && portionIngredients.data.length > 0)
      ) {
        toast({
          title: "Não é possível excluir",
          description: "Este ingrediente está sendo usado em uma ou mais receitas",
          variant: "destructive",
        });
        setShowDeleteDialog(false);
        return;
      }
      
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', ingredientToDelete.id);
        
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Ingrediente excluído com sucesso",
      });
      
      setShowDeleteDialog(false);
      refetch();
    } catch (error) {
      console.error("Erro ao excluir ingrediente:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o ingrediente",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingIngredient(null);
    refetch();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
  };

  const handleCategoriesChange = () => {
    queryClient.invalidateQueries({ queryKey: ['ingredientCategories'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ingredientes</h1>
        <div className="flex gap-2">
          <Button className="gap-2" onClick={() => setShowCategoryDialog(true)}>
            <Tags className="h-4 w-4" />
            Gerenciar Categorias
          </Button>
          <Button className="gap-2" onClick={() => setShowForm(true)}>
            <PlusCircle className="h-4 w-4" />
            Novo Ingrediente
          </Button>
        </div>
      </div>
      
      {showForm ? (
        <IngredientForm 
          ingredient={editingIngredient} 
          onSave={handleSave} 
          onCancel={() => {
            setShowForm(false);
            setEditingIngredient(null);
          }} 
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Lista de Ingredientes</CardTitle>
              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar ingrediente..."
                    className="pl-9 md:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button 
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filtrar
                      {selectedCategory && (
                        <span className="ml-1 h-2 w-2 rounded-full bg-primary"></span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="p-2">
                      <p className="mb-2 text-sm font-medium">Categoria</p>
                      <Select 
                        value={selectedCategory || ""} 
                        onValueChange={(value) => setSelectedCategory(value || null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas as categorias" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as categorias</SelectItem>
                          {categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {(searchTerm || selectedCategory) && (
                        <Button 
                          variant="ghost" 
                          className="mt-2 w-full justify-start text-muted-foreground"
                          onClick={clearFilters}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Limpar filtros
                        </Button>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : ingredients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileEdit className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">Nenhum ingrediente encontrado</h3>
                <p className="mt-1">
                  {searchTerm || selectedCategory
                    ? "Tente mudar os filtros ou a busca"
                    : "Comece cadastrando um novo ingrediente"}
                </p>
                {searchTerm || selectedCategory ? (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={clearFilters}
                  >
                    Limpar filtros
                  </Button>
                ) : (
                  <Button
                    className="mt-4"
                    onClick={() => setShowForm(true)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo Ingrediente
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imagem</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Qtd. Embalagem</TableHead>
                      <TableHead>Preço Embalagem</TableHead>
                      <TableHead>Custo Unitário</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ingredients.map((ingredient) => (
                      <TableRow key={ingredient.id}>
                        <TableCell>
                          {ingredient.image_url ? (
                            <div className="h-10 w-10 rounded-md overflow-hidden">
                              <img 
                                src={ingredient.image_url} 
                                alt={ingredient.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{ingredient.name}</TableCell>
                        <TableCell>{ingredient.ingredient_categories?.name}</TableCell>
                        <TableCell>{ingredient.brand}</TableCell>
                        <TableCell>{ingredient.unit}</TableCell>
                        <TableCell>{ingredient.package_quantity} {ingredient.unit}</TableCell>
                        <TableCell>{formatCurrency(ingredient.package_price)}</TableCell>
                        <TableCell>{formatCurrency(ingredient.unit_cost)}/{ingredient.unit}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEdit(ingredient)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive"
                              onClick={() => confirmDelete(ingredient)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <CategoryDialog 
        open={showCategoryDialog} 
        onOpenChange={setShowCategoryDialog}
        onCategoriesChange={handleCategoriesChange}
      />
      
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o ingrediente "{ingredientToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Ingredients;
