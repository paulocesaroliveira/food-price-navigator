
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit, Trash, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/calculations";
import { Product, Recipe, Packaging } from "@/types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/products/ProductForm";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { getProductList, createProduct, updateProduct, deleteProduct, searchProducts } from "@/services/productService";
import { fetchRecipes } from "@/services/recipeService";
import { getPackagingList } from "@/services/packagingService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const Products = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch products
  const { 
    data: products = [], 
    isLoading: isLoadingProducts,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['products'],
    queryFn: getProductList,
  });

  // Fetch recipes
  const { 
    data: recipes = [],
    isLoading: isLoadingRecipes
  } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });

  // Fetch packaging
  const { 
    data: packaging = [],
    isLoading: isLoadingPackaging
  } = useQuery({
    queryKey: ['packaging'],
    queryFn: getPackagingList,
  });

  // Create product mutation
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

  // Update product mutation
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

  // Delete product mutation
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

  // Search products
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
    createProductMutation.mutate(data);
  };

  const handleUpdateProduct = (data: any) => {
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

  const isLoading = isLoadingProducts || isLoadingRecipes || isLoadingPackaging;

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
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted border-b">
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">Itens</th>
                    <th className="text-left p-3">Embalagem</th>
                    <th className="text-left p-3">Custo Total</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const pkg = packaging.find(p => p.id === product.packagingId);
                    const totalItems = product.items.reduce((acc, item) => acc + item.quantity, 0);
                    
                    return (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">{product.name}</td>
                        <td className="p-3">{totalItems}</td>
                        <td className="p-3">{pkg?.name}</td>
                        <td className="p-3">{formatCurrency(product.totalCost)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for desktop */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          {(dialogOpen || sheetOpen) && !isLoading && (
            <ProductForm
              product={currentProduct}
              recipes={recipes}
              packaging={packaging}
              onSubmit={isEditing ? handleUpdateProduct : handleCreateProduct}
              onCancel={() => setDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Sheet for mobile */}
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
              onSubmit={isEditing ? handleUpdateProduct : handleCreateProduct}
              onCancel={() => setSheetOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation dialog */}
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
