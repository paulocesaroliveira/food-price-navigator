
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit, Trash, Package, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/calculations";
import { Product, Recipe, Packaging, ProductCategory } from "@/types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/products/ProductForm";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { 
  getProductList, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  searchProducts,
  getProductCategories
} from "@/services/productService";
import { fetchRecipes } from "@/services/recipeService";
import { getPackagingList } from "@/services/packagingService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const mapRecipesData = (recipesData: any[]): Recipe[] => {
  return recipesData.map(recipe => ({
    id: recipe.id,
    name: recipe.name,
    image: recipe.image_url,
    categoryId: recipe.category_id,
    baseIngredients: [],
    portionIngredients: [],
    portions: recipe.portions,
    totalCost: recipe.total_cost,
    unitCost: recipe.unit_cost,
    notes: recipe.notes
  }));
};

const Products = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  const { 
    data: products = [], 
    isLoading: isLoadingProducts,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['products'],
    queryFn: getProductList,
    refetchOnWindowFocus: true,
    staleTime: 0, // Sempre buscar dados atualizados
  });

  const { 
    data: recipesData = [],
    isLoading: isLoadingRecipes,
    refetch: refetchRecipes
  } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
    refetchOnWindowFocus: true,
    staleTime: 0, // Sempre buscar dados atualizados
  });

  const recipes: Recipe[] = mapRecipesData(recipesData);

  const { 
    data: packaging = [],
    isLoading: isLoadingPackaging,
    refetch: refetchPackaging
  } = useQuery({
    queryKey: ['packaging'],
    queryFn: getPackagingList,
    refetchOnWindowFocus: true,
    staleTime: 0, // Sempre buscar dados atualizados
  });

  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['productCategories'],
    queryFn: getProductCategories,
    refetchOnWindowFocus: true,
    staleTime: 0, // Sempre buscar dados atualizados
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso!",
      });
      setDialogOpen(false);
      setSheetOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Erro ao criar produto: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, product }: { id: string; product: Omit<Product, "id"> }) => 
      updateProduct(id, product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!",
      });
      setDialogOpen(false);
      setSheetOpen(false);
      setCurrentProduct(undefined);
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar produto: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso!",
      });
      setDeleteDialogOpen(false);
      setCurrentProduct(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir produto: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchQuery) {
        try {
          const results = await searchProducts(searchQuery);
          queryClient.setQueryData(['products'], results);
        } catch (error: any) {
          toast({
            title: "Erro",
            description: `Erro na busca: ${error.message}`,
            variant: "destructive",
          });
        }
      } else {
        refetchProducts();
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchQuery, queryClient, refetchProducts]);

  const handleCreateProduct = (data: any) => {
    if (data.categoryId === "_none") {
      data.categoryId = null;
    }
    createProductMutation.mutate(data);
  };

  const handleUpdateProduct = (data: any) => {
    if (data.categoryId === "_none") {
      data.categoryId = null;
    }
    
    if (currentProduct) {
      updateProductMutation.mutate({
        id: currentProduct.id,
        product: data,
      });
    }
  };

  const handleDeleteProduct = () => {
    if (currentProduct) {
      deleteProductMutation.mutate(currentProduct.id);
    }
  };

  const handleCategoriesChange = () => {
    refetchCategories();
  };

  const handleRefreshData = () => {
    console.log('🔄 Atualizando todos os dados...');
    refetchProducts();
    refetchRecipes();
    refetchPackaging();
    refetchCategories();
    toast({
      title: "Dados Atualizados",
      description: "Todos os dados foram recarregados com sucesso!",
    });
  };

  const openCreateDialog = () => {
    setCurrentProduct(undefined);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const openCreateSheet = () => {
    setCurrentProduct(undefined);
    setIsEditing(false);
    setSheetOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const openEditSheet = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
    setSheetOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setCurrentProduct(product);
    setDeleteDialogOpen(true);
  };

  const isLoading = isLoadingProducts || isLoadingRecipes || isLoadingPackaging || isLoadingCategories;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button className="gap-2" onClick={() => window.innerWidth >= 768 ? openCreateDialog() : openCreateSheet()}>
            <PlusCircle className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Produtos</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar produto..."
                  className="pl-9 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <p>Carregando produtos...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-6">
              <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum produto cadastrado</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Comece adicionando seu primeiro produto clicando no botão "Novo Produto".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const totalItems = product.items.reduce((acc, item) => acc + item.quantity, 0);
                const totalPackaging = product.packagingItems?.reduce((acc, pkg) => acc + pkg.quantity, 0) || 0;
                
                return (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col space-y-3">
                        {/* Product Image */}
                        <div className="aspect-square w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : product.packagingItems?.find(pkg => pkg.isPrimary)?.packaging?.imageUrl ? (
                            <img 
                              src={product.packagingItems?.find(pkg => pkg.isPrimary)?.packaging?.imageUrl} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-12 w-12 text-muted-foreground" />
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-lg truncate flex-1 mr-2">{product.name}</h3>
                          </div>
                          
                          {product.category && (
                            <Badge variant="secondary" className="text-xs">
                              {product.category.name}
                            </Badge>
                          )}
                          
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Itens:</span> {totalItems}
                            </div>
                            <div>
                              <span className="font-medium">Embalagens:</span> {totalPackaging}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Custo Total:</span>
                              <span className="text-sm font-bold text-blue-600">{formatCurrency(product.totalCost)}</span>
                            </div>
                            
                            {product.sellingPrice > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Preço de Venda:</span>
                                <span className="text-sm font-semibold text-green-600">
                                  {formatCurrency(product.sellingPrice)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                            onClick={() => window.innerWidth >= 768 ? openEditDialog(product) : openEditSheet(product)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => openDeleteDialog(product)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          {(dialogOpen || sheetOpen) && !isLoading && (
            <ProductForm
              product={currentProduct}
              recipes={recipes}
              packaging={packaging}
              categories={categories}
              onSubmit={isEditing ? handleUpdateProduct : handleCreateProduct}
              onCancel={() => setDialogOpen(false)}
              onCategoriesChange={handleCategoriesChange}
            />
          )}
        </DialogContent>
      </Dialog>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isEditing ? "Editar Produto" : "Novo Produto"}</SheetTitle>
          </SheetHeader>
          {(dialogOpen || sheetOpen) && !isLoading && (
            <ProductForm
              product={currentProduct}
              recipes={recipes}
              packaging={packaging}
              categories={categories}
              onSubmit={isEditing ? handleUpdateProduct : handleCreateProduct}
              onCancel={() => setSheetOpen(false)}
              onCategoriesChange={handleCategoriesChange}
            />
          )}
        </SheetContent>
      </Sheet>

      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteProduct}
        productName={currentProduct?.name || ""}
      />
    </div>
  );
};

export default Products;
