
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Package, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductForm } from "@/components/products/ProductForm";
import { formatCurrency } from "@/utils/calculations";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { CategoryManager } from "@/components/shared/CategoryManager";
import { ItemCard } from "@/components/shared/ItemCard";
import { SortControls } from "@/components/shared/SortControls";
import { useSortAndFilter } from "@/hooks/useSortAndFilter";
import { Product, ProductCategory, Recipe, Packaging } from "@/types";
import { getProductById } from "@/services/productService";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(id, name)
        `)
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: packaging = [] } = useQuery({
    queryKey: ['packaging'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('packaging')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const sortOptions = [
    { value: 'name' as const, label: 'Nome' },
    { value: 'category' as const, label: 'Categoria' },
    { value: 'cost' as const, label: 'Custo' },
    { value: 'created_at' as const, label: 'Data de Criação' }
  ];

  const {
    sortedItems: filteredProducts,
    sortBy,
    sortDirection,
    handleSort
  } = useSortAndFilter({
    items: products,
    searchTerm,
    defaultSort: 'name'
  });

  const totalProducts = products.length;
  const avgCost = products.length > 0 
    ? products.reduce((acc, product) => acc + (product.total_cost || 0), 0) / products.length 
    : 0;

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const product = {
        name: productData.name,
        category_id: productData.categoryId || null,
        total_cost: productData.totalCost || 0,
        packaging_cost: productData.packagingItems?.reduce((sum: number, item: any) => sum + (item.cost || 0), 0) || 0,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: productResult, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;

      if (productData.items && productData.items.length > 0) {
        const items = productData.items.map((item: any) => ({
          product_id: productResult.id,
          recipe_id: item.recipeId,
          quantity: item.quantity,
          cost: item.cost
        }));

        const { error: itemsError } = await supabase
          .from('product_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      if (productData.packagingItems && productData.packagingItems.length > 0) {
        const packagingItems = productData.packagingItems.map((item: any) => ({
          product_id: productResult.id,
          packaging_id: item.packagingId,
          quantity: item.quantity,
          cost: item.cost,
          is_primary: item.isPrimary
        }));

        const { error: packagingError } = await supabase
          .from('product_packaging')
          .insert(packagingItems);

        if (packagingError) throw packagingError;
      }

      return productResult;
    },
    onSuccess: () => {
      toast({
        title: "Produto criado",
        description: "O produto foi criado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
      setEditingProduct(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, productData }: { productId: string, productData: any }) => {
      const product = {
        name: productData.name,
        category_id: productData.categoryId || null,
        total_cost: productData.totalCost || 0,
        packaging_cost: productData.packagingItems?.reduce((sum: number, item: any) => sum + (item.cost || 0), 0) || 0,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('products')
        .update(product)
        .eq('id', productId);

      if (error) throw error;

      await supabase.from('product_items').delete().eq('product_id', productId);
      await supabase.from('product_packaging').delete().eq('product_id', productId);

      if (productData.items && productData.items.length > 0) {
        const items = productData.items.map((item: any) => ({
          product_id: productId,
          recipe_id: item.recipeId,
          quantity: item.quantity,
          cost: item.cost
        }));

        const { error: itemsError } = await supabase
          .from('product_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      if (productData.packagingItems && productData.packagingItems.length > 0) {
        const packagingItems = productData.packagingItems.map((item: any) => ({
          product_id: productId,
          packaging_id: item.packagingId,
          quantity: item.quantity,
          cost: item.cost,
          is_primary: item.isPrimary
        }));

        const { error: packagingError } = await supabase
          .from('product_packaging')
          .insert(packagingItems);

        if (packagingError) throw packagingError;
      }
    },
    onSuccess: () => {
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
      setEditingProduct(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeletingProductId(null);
    }
  });

  const handleEdit = async (productId: string) => {
    try {
      const productData = await getProductById(productId);
      setEditingProduct(productData);
      setShowForm(true);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar produto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = (productId: string) => {
    setDeletingProductId(productId);
    deleteProductMutation.mutate(productId);
  };

  const handleFormSubmit = (productData: any) => {
    if (editingProduct) {
      updateProductMutation.mutate({ productId: editingProduct.id, productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {isLoading ? (
        Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl h-48"></div>
          </div>
        ))
      ) : filteredProducts.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Tente alterar os termos de busca" : "Comece criando seu primeiro produto"}
          </p>
        </div>
      ) : (
        filteredProducts.map((product) => (
          <ItemCard
            key={product.id}
            id={product.id}
            title={product.name}
            category={product.category?.name}
            stats={[
              { label: 'Custo total', value: product.total_cost || 0, type: 'currency' },
              { label: 'Preço venda', value: product.selling_price || 0, type: 'currency' }
            ]}
            onEdit={() => handleEdit(product.id)}
            onDelete={() => handleDelete(product.id)}
            isDeleting={deletingProductId === product.id}
          />
        ))
      )}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-16"></div>
        ))
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Tente alterar os termos de busca" : "Comece criando seu primeiro produto"}
          </p>
        </div>
      ) : (
        filteredProducts.map((product) => (
          <ItemCard
            key={product.id}
            id={product.id}
            title={product.name}
            category={product.category?.name}
            stats={[
              { label: 'Custo total', value: product.total_cost || 0, type: 'currency' },
              { label: 'Preço venda', value: product.selling_price || 0, type: 'currency' }
            ]}
            onEdit={() => handleEdit(product.id)}
            onDelete={() => handleDelete(product.id)}
            isDeleting={deletingProductId === product.id}
          />
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Produtos"
        subtitle="Gerencie seus produtos e composições"
        icon={Package}
        gradient="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500"
        badges={[
          { icon: Package, text: `${totalProducts} produtos` },
          { icon: DollarSign, text: `Custo médio: ${formatCurrency(avgCost)}` }
        ]}
        actions={
          <div className="flex gap-2">
            <CategoryManager
              title="Categorias de Produtos"
              description="Gerencie as categorias dos seus produtos"
              tableName="product_categories"
              queryKey="product-categories"
              icon={Package}
              onCategoriesChange={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
            >
              <Button 
                variant="outline"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                Categorias
              </Button>
            </CategoryManager>
            <Button 
              onClick={handleNewProduct}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full input-focus"
          />
        </div>
        <div className="flex items-center gap-3">
          <SortControls
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
            availableOptions={sortOptions}
          />
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {view === 'grid' ? renderGridView() : renderListView()}

      <Dialog open={showForm} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
            categories={categories}
            recipes={recipes}
            packaging={packaging}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
