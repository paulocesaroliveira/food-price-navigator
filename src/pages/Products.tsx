import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { searchProducts, getProductCategories } from "@/services/productService";
import ProductForm from "@/components/products/ProductForm";
import { PageHeader } from "@/components/shared/PageHeader";
import ProductCategoryManager from "@/components/products/ProductCategoryManager";

const Products = () => {
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

  const { data: products = [], isLoading: isLoadingProducts, refetch: refetchProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => searchProducts({}),
  });

  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ['product-categories'],
    queryFn: getProductCategories,
  });

  const handleProductSuccess = () => {
    setIsProductDialogOpen(false);
    setSelectedProduct(null);
    setIsEditMode(false);
    refetchProducts();
    toast({
      title: isEditMode ? "Produto atualizado" : "Produto criado",
      description: `O produto foi ${isEditMode ? 'atualizado' : 'criado'} com sucesso.`,
    });
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsEditMode(true);
    setIsProductDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const filteredProducts = safeProducts.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalProducts = safeProducts.length;
  const averageCost = safeProducts.length > 0 
    ? safeProducts.reduce((sum, product) => sum + Number(product.totalCost || 0), 0) / safeProducts.length 
    : 0;
  const totalValue = safeProducts.reduce((sum, product) => sum + Number(product.sellingPrice || 0), 0);

  if (isLoadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Produtos" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageCost)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as categorias</SelectItem>
              {safeCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <ProductCategoryManager onCategoriesChange={refetchCategories} />
          <Dialog open={isProductDialogOpen} onOpenChange={(open) => {
            setIsProductDialogOpen(open);
            if (!open) {
              setSelectedProduct(null);
              setIsEditMode(false);
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Editar' : 'Novo'} Produto</DialogTitle>
              </DialogHeader>
              <ProductForm
                categories={safeCategories}
                onCancel={() => setIsProductDialogOpen(false)}
                product={selectedProduct}
                mode={isEditMode ? 'edit' : 'create'}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {totalProducts === 0 ? "Nenhum produto cadastrado ainda." : "Nenhum produto encontrado com os filtros aplicados."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const category = safeCategories.find(c => c.id === product.categoryId);
                return (
                  <div 
                    key={product.id} 
                    className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleEditProduct(product)}
                  >
                    <div className="space-y-2">
                      <div className="font-medium">{product.name}</div>
                      {category && (
                        <div className="text-sm text-muted-foreground">{category.name}</div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Custo:</span>
                        <span className="font-medium">{formatCurrency(Number(product.totalCost || 0))}</span>
                      </div>
                      {product.sellingPrice && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Preço:</span>
                          <span className="font-medium text-green-600">{formatCurrency(Number(product.sellingPrice))}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
