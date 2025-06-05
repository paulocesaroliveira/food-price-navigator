
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Package, DollarSign, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductCategoryDialog } from "@/components/products/ProductCategoryDialog";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { formatCurrency } from "@/utils/calculations";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { ViewToggle } from "@/components/shared/ViewToggle";

interface Product {
  id: string;
  name: string;
  selling_price?: number;
  profit_margin_percentage?: number;
  notes?: string;
  image_url?: string;
  recipe_id?: string;
  packaging_id?: string;
  category_id?: string;
  created_at: string;
  recipe?: {
    id: string;
    name: string;
    unit_cost: number;
  };
  packaging?: {
    id: string;
    name: string;
    unit_cost: number;
  };
  category?: {
    id: string;
    name: string;
  };
}

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const queryClient = useQueryClient();

  // Query para buscar produtos
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          recipe:recipes(id, name, unit_cost),
          packaging:packaging(id, name, unit_cost),
          category:product_categories(id, name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.recipe?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = products.length;
  const avgSellingPrice = products.length > 0 
    ? products.reduce((acc, product) => acc + (product.selling_price || 0), 0) / products.length 
    : 0;

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
  };

  const calculateTotalCost = (product: Product) => {
    const recipeCost = product.recipe?.unit_cost || 0;
    const packagingCost = product.packaging?.unit_cost || 0;
    return recipeCost + packagingCost;
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="custom-card">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : filteredProducts.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Tente alterar os termos de busca" : "Comece criando seu primeiro produto"}
          </p>
          {!searchTerm && (
            <Button 
              className="mt-4 btn-gradient"
              onClick={() => setShowForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Produto
            </Button>
          )}
        </div>
      ) : (
        filteredProducts.map((product) => {
          const totalCost = calculateTotalCost(product);
          const profit = (product.selling_price || 0) - totalCost;
          const profitMargin = totalCost > 0 ? (profit / totalCost) * 100 : 0;

          return (
            <Card key={product.id} className="custom-card card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    {product.category && (
                      <p className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded-full inline-block">
                        {product.category.name}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {product.recipe && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Receita:</span>
                      <span className="font-medium">{product.recipe.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Custo total:</span>
                    <span className="font-medium text-red-600">{formatCurrency(totalCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Preço de venda:</span>
                    <span className="font-medium text-green-600">{formatCurrency(product.selling_price || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Margem:</span>
                    <span className={`font-medium ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profitMargin.toFixed(1)}%
                    </span>
                  </div>
                  {product.notes && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Observações:</span>
                      <p className="text-sm mt-1 line-clamp-2">{product.notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                    className="rounded-full"
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(product)}
                    className="text-red-500 hover:text-red-700 rounded-full"
                  >
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
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
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
          </Card>
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
        filteredProducts.map((product) => {
          const totalCost = calculateTotalCost(product);
          const profit = (product.selling_price || 0) - totalCost;
          const profitMargin = totalCost > 0 ? (profit / totalCost) * 100 : 0;

          return (
            <Card key={product.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate">{product.name}</h3>
                    {product.category && (
                      <p className="text-sm text-purple-600">{product.category.name}</p>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground min-w-0">
                    {product.recipe?.name || "Sem receita"}
                  </div>
                  <div className="text-sm font-medium text-red-600 min-w-0">
                    {formatCurrency(totalCost)}
                  </div>
                  <div className="text-sm font-medium text-green-600 min-w-0">
                    {formatCurrency(product.selling_price || 0)}
                  </div>
                  <div className={`text-sm font-medium min-w-0 ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitMargin.toFixed(1)}%
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(product)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Produtos"
        subtitle="Gerencie seus produtos finais e preços"
        icon={Package}
        gradient="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
        badges={[
          { icon: Calculator, text: `${totalProducts} produtos` },
          { icon: DollarSign, text: `Preço médio: ${formatCurrency(avgSellingPrice)}` }
        ]}
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
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </div>
        }
      />

      {/* Controles de busca e visualização */}
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

      {/* Lista de Produtos */}
      {view === 'grid' ? renderGridView() : renderListView()}

      {/* Formulários e Dialogs */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={async (data) => {
            console.log('Form submitted:', data);
            setShowForm(false);
            setEditingProduct(null);
            queryClient.invalidateQueries({ queryKey: ['products'] });
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      {showCategoryDialog && (
        <ProductCategoryDialog
          open={showCategoryDialog}
          onOpenChange={setShowCategoryDialog}
        />
      )}

      {deletingProduct && (
        <DeleteProductDialog
          open={!!deletingProduct}
          onOpenChange={(open) => {
            if (!open) setDeletingProduct(null);
          }}
          onConfirm={() => {
            console.log('Delete confirmed:', deletingProduct);
            setDeletingProduct(null);
            queryClient.invalidateQueries({ queryKey: ['products'] });
          }}
          productName={deletingProduct.name}
        />
      )}
    </div>
  );
};

export default Products;
