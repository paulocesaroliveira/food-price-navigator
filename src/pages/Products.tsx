import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Package, DollarSign, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductCategoryModal } from "@/components/products/ProductCategoryModal";
import { formatCurrency } from "@/utils/calculations";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { Product, ProductCategory, Recipe, Packaging } from "@/types";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
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
        .order('name'); // Já estava ordenado alfabeticamente
      
      if (error) throw error;
      console.log("Loaded products:", data);
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
        .order('name'); // Já estava ordenado alfabeticamente
      
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
        .order('name'); // Já estava ordenado alfabeticamente
      
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
        .order('name'); // Já estava ordenado alfabeticamente
      
      if (error) throw error;
      return data || [];
    }
  });

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

      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
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
    mutationFn: async ({ id, productData }: { id: string; productData: any }) => {
      const product = {
        name: productData.name,
        category_id: productData.categoryId || null,
        total_cost: productData.totalCost || 0,
        packaging_cost: productData.packagingItems?.reduce((sum: number, item: any) => sum + (item.cost || 0), 0) || 0,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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

  // Ordenar produtos filtrados alfabeticamente
  const filteredProducts = products
    .filter(product =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));

  const totalProducts = products.length;
  const avgCost = products.length > 0 
    ? products.reduce((acc, product) => acc + (product.total_cost || 0), 0) / products.length 
    : 0;

  const handleEdit = (product: Product) => {
    console.log("Editing product:", product);
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormSubmit = (productData: any) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {isLoading ? (
        Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </Card>
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
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-medium truncate">{product.name}</h3>
                {product.category && (
                  <p className="text-sm text-orange-600">{product.category.name}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600 font-medium">
                    Custo: {formatCurrency(product.total_cost || 0)}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(product)}
                  className="w-full"
                >
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
          </Card>
        ))
      ) : filteredProducts.length ===0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Tente alterar os termos de busca" : "Comece criando seu primeiro produto"}
          </p>
        </div>
      ) : (
        filteredProducts.map((product) => (
          <Card key={product.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  {product.category && (
                    <p className="text-sm text-orange-600">{product.category.name}</p>
                  )}
                </div>
                <div className="text-sm font-medium text-blue-600 min-w-0">
                  Custo: {formatCurrency(product.total_cost || 0)}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(product)}
                className="ml-4"
              >
                Editar
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Produtos"
        subtitle="Gerencie seus produtos e custos"
        icon={Package}
        gradient="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500"
        badges={[
          { icon: Package, text: `${totalProducts} produtos` },
          { icon: DollarSign, text: `Custo médio: ${formatCurrency(avgCost)}` }
        ]}
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm"
              size="sm"
              onClick={() => setShowCategoryModal(true)}
            >
              <Settings className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Categorias
            </Button>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm"
              size="sm"
            >
              <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Novo
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
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {view === 'grid' ? renderGridView() : renderListView()}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            categories={categories}
            recipes={recipes}
            packaging={packaging}
          />
        </DialogContent>
      </Dialog>

      <ProductCategoryModal 
        open={showCategoryModal} 
        onOpenChange={setShowCategoryModal} 
      />
    </div>
  );
};

export default Products;
