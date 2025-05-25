
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit, Trash, Package, Image as ImageIcon, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { formatCurrency, formatPercentage } from "@/utils/calculations";
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
import { getPricingConfigs } from "@/services/pricingService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";

const mapRecipesData = (recipesData: any[]): Recipe[] => {
  return recipesData.map(recipe => ({
    id: recipe.id,
    name: recipe.name,
    image: recipe.image_url,
    categoryId: recipe.category_id,
    baseIngredients: [],  // These aren't needed in the Products context
    portionIngredients: [], // These aren't needed in the Products context
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
  });

  const { 
    data: recipesData = [],
    isLoading: isLoadingRecipes
  } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });

  const recipes: Recipe[] = mapRecipesData(recipesData);

  const { 
    data: packaging = [],
    isLoading: isLoadingPackaging
  } = useQuery({
    queryKey: ['packaging'],
    queryFn: getPackagingList,
  });

  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['productCategories'],
    queryFn: getProductCategories,
  });

  // Buscar configurações de preços para todos os produtos
  const { 
    data: pricingConfigs = [],
    isLoading: isLoadingPricing
  } = useQuery({
    queryKey: ['pricing-configs'],
    queryFn: () => getPricingConfigs(),
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

  // Função para buscar a configuração de preço mais recente de um produto
  const getLatestPricingConfig = (productId: string) => {
    const productConfigs = pricingConfigs.filter(config => config.productId === productId);
    if (productConfigs.length === 0) return null;
    
    // Retornar a configuração mais recente
    return productConfigs.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };

  const isLoading = isLoadingProducts || isLoadingRecipes || isLoadingPackaging || isLoadingCategories || isLoadingPricing;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Button className="gap-2" onClick={() => window.innerWidth >= 768 ? openCreateDialog() : openCreateSheet()}>
          <PlusCircle className="h-4 w-4" />
          Novo Produto
        </Button>
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
              <p>Carregando produtos...</p>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Foto</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Qtd. Itens</TableHead>
                    <TableHead>Custo Total</TableHead>
                    <TableHead>Margem</TableHead>
                    <TableHead>Preço de Venda</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const totalItems = product.items.reduce((acc, item) => acc + item.quantity, 0);
                    const latestPricing = getLatestPricingConfig(product.id);
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.imageUrl ? (
                            <div className="h-10 w-10 rounded-md overflow-hidden">
                              <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : product.packagingItems?.find(pkg => pkg.isPrimary)?.packaging?.imageUrl ? (
                            <div className="h-10 w-10 rounded-md overflow-hidden">
                              <img 
                                src={product.packagingItems?.find(pkg => pkg.isPrimary)?.packaging?.imageUrl} 
                                alt={product.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category?.name || "Sem categoria"}</TableCell>
                        <TableCell>{totalItems}</TableCell>
                        <TableCell>{formatCurrency(product.totalCost)}</TableCell>
                        <TableCell>
                          {latestPricing ? (
                            <span className="text-green-600 font-medium">
                              {formatPercentage(latestPricing.desiredMarginPercentage)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {latestPricing ? (
                            <span className="font-medium">
                              {formatCurrency(latestPricing.idealPrice)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.innerWidth >= 768 ? openEditDialog(product) : openEditSheet(product)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive"
                              onClick={() => openDeleteDialog(product)}
                            >
                              <Trash className="h-4 w-4 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
