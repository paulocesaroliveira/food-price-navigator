
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Calculator, DollarSign, TrendingUp, Edit, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdvancedPricingForm } from "@/components/pricing/AdvancedPricingForm";
import { formatCurrency } from "@/utils/calculations";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { Product, PricingConfiguration } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const mapDatabaseToPricingConfig = (item: any): PricingConfiguration => ({
  ...item,
  user_id: item.user_id || '',
  labor_cost_type: (item.labor_cost_type === 'percentage' ? 'percentage' : 'fixed') as 'fixed' | 'percentage',
  overhead_cost_type: (item.overhead_cost_type === 'percentage' ? 'percentage' : 'fixed') as 'fixed' | 'percentage',
  marketing_cost_type: (item.marketing_cost_type === 'percentage' ? 'percentage' : 'fixed') as 'fixed' | 'percentage',
  delivery_cost_type: (item.delivery_cost_type === 'percentage' ? 'percentage' : 'fixed') as 'fixed' | 'percentage',
  other_cost_type: (item.other_cost_type === 'percentage' ? 'percentage' : 'fixed') as 'fixed' | 'percentage',
});

const Pricing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingConfig, setEditingConfig] = useState<PricingConfiguration | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [deletingConfigId, setDeletingConfigId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch products with dynamic updates
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products-for-pricing'],
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
      console.log("Loaded products for pricing:", data);
      return data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds to keep products in sync
  });

  // Fetch pricing configurations
  const { data: pricingConfigs = [], isLoading: configsLoading } = useQuery({
    queryKey: ['pricing-configurations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('pricing_configs')
        .select(`
          *,
          product:products(id, name, total_cost, category:product_categories(id, name))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      console.log("Loaded pricing configurations:", data);
      return (data || []).map(mapDatabaseToPricingConfig);
    }
  });

  const createPricingMutation = useMutation({
    mutationFn: async (configData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const config = {
        ...configData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('pricing_configs')
        .insert(config)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Configuração criada",
        description: "A configuração de precificação foi criada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['pricing-configurations'] });
      setShowForm(false);
      setSelectedProduct(null);
      setEditingConfig(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar configuração",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updatePricingMutation = useMutation({
    mutationFn: async ({ id, configData }: { id: string; configData: any }) => {
      const config = {
        ...configData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('pricing_configs')
        .update(config)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Configuração atualizada",
        description: "A configuração de precificação foi atualizada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['pricing-configurations'] });
      setShowForm(false);
      setSelectedProduct(null);
      setEditingConfig(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar configuração",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deletePricingMutation = useMutation({
    mutationFn: async (configId: string) => {
      const { error } = await supabase
        .from('pricing_configs')
        .delete()
        .eq('id', configId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Configuração excluída",
        description: "A configuração de precificação foi excluída com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['pricing-configurations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir configuração",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeletingConfigId(null);
    }
  });

  const filteredConfigs = pricingConfigs
    .filter(config => {
      if (!config.product) return false;
      return config.product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             config.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             config.product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));

  const totalConfigs = pricingConfigs.length;
  const avgMargin = pricingConfigs.length > 0 
    ? pricingConfigs.reduce((acc, config) => acc + (config.actual_margin || 0), 0) / pricingConfigs.length 
    : 0;

  const handleNewPricing = (product: Product) => {
    setSelectedProduct(product);
    setEditingConfig(null);
    setShowForm(true);
  };

  const handleEdit = (config: PricingConfiguration) => {
    console.log("Editing pricing config:", config);
    
    // Find the product for this configuration
    const product = products.find(p => p.id === config.product_id);
    if (!product) {
      toast({
        title: "Erro",
        description: "Produto não encontrado para esta configuração",
        variant: "destructive",
      });
      return;
    }

    setSelectedProduct(product);
    setEditingConfig(mapDatabaseToPricingConfig(config));
    setShowForm(true);
  };

  const handleDelete = (configId: string) => {
    setDeletingConfigId(configId);
    deletePricingMutation.mutate(configId);
  };

  const handleFormSubmit = (configData: any) => {
    if (editingConfig) {
      updatePricingMutation.mutate({ id: editingConfig.id, configData });
    } else {
      createPricingMutation.mutate(configData);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedProduct(null);
    setEditingConfig(null);
  };

  // Get products without pricing configurations
  const productsWithoutPricing = products.filter(product => 
    !pricingConfigs.some(config => config.product_id === product.id)
  );

  const renderGridView = () => (
    <div className="space-y-8">
      {/* Products without pricing */}
      {productsWithoutPricing.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Produtos sem Precificação ({productsWithoutPricing.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {productsWithoutPricing.map((product) => (
              <Card key={product.id} className="border-amber-200 bg-amber-50/50 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <h4 className="font-medium truncate">{product.name}</h4>
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
                      onClick={() => handleNewPricing(product)}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      <Calculator className="h-4 w-4 mr-1" />
                      Criar Precificação
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Existing pricing configurations */}
      {filteredConfigs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Configurações de Precificação ({filteredConfigs.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredConfigs.map((config) => (
              <Card key={config.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <h4 className="font-medium truncate">{config.name}</h4>
                    {config.product && (
                      <>
                        <p className="text-sm text-gray-600">{config.product.name}</p>
                        {config.product.category && (
                          <p className="text-xs text-orange-600">{config.product.category.name}</p>
                        )}
                      </>
                    )}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Preço Final:</span>
                        <span className="text-sm font-bold text-green-600">
                          {formatCurrency(config.final_price || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Margem:</span>
                        <span className="text-sm font-bold text-blue-600">
                          {(config.actual_margin || 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Lucro:</span>
                        <span className="text-sm font-bold text-purple-600">
                          {formatCurrency(config.unit_profit || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(config)}
                        className="flex-1"
                        disabled={deletingConfigId === config.id}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            disabled={deletingConfigId === config.id}
                          >
                            {deletingConfigId === config.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a configuração "{config.name}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(config.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {products.length === 0 && !productsLoading && (
        <div className="text-center py-12">
          <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground">
            Primeiro, crie produtos na página "Produtos" para poder fazer suas precificações
          </p>
        </div>
      )}

      {/* No results from search */}
      {products.length > 0 && filteredConfigs.length === 0 && productsWithoutPricing.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">Nenhuma configuração encontrada</h3>
          <p className="text-muted-foreground">
            Tente alterar os termos de busca
          </p>
        </div>
      )}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-6">
      {/* Products without pricing */}
      {productsWithoutPricing.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Produtos sem Precificação
          </h3>
          <div className="space-y-2">
            {productsWithoutPricing.map((product) => (
              <Card key={product.id} className="border-amber-200 bg-amber-50/50 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium truncate">{product.name}</h4>
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
                    onClick={() => handleNewPricing(product)}
                    className="ml-4 bg-amber-600 hover:bg-amber-700"
                  >
                    <Calculator className="h-4 w-4 mr-1" />
                    Criar Precificação
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Existing configurations */}
      {filteredConfigs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Configurações de Precificação
          </h3>
          <div className="space-y-2">
            {filteredConfigs.map((config) => (
              <Card key={config.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium truncate">{config.name}</h4>
                      {config.product && (
                        <p className="text-sm text-gray-600">{config.product.name}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-green-600">{formatCurrency(config.final_price || 0)}</div>
                        <div className="text-xs text-gray-500">Preço Final</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">{(config.actual_margin || 0).toFixed(1)}%</div>
                        <div className="text-xs text-gray-500">Margem</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-purple-600">{formatCurrency(config.unit_profit || 0)}</div>
                        <div className="text-xs text-gray-500">Lucro</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(config)}
                      disabled={deletingConfigId === config.id}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          disabled={deletingConfigId === config.id}
                        >
                          {deletingConfigId === config.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a configuração "{config.name}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(config.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Precificação"
        subtitle="Configure preços inteligentes para seus produtos"
        icon={Calculator}
        gradient="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500"
        badges={[
          { icon: Calculator, text: `${totalConfigs} configurações` },
          { icon: TrendingUp, text: `Margem média: ${avgMargin.toFixed(1)}%` }
        ]}
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <Input
            placeholder="Buscar configurações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full input-focus"
          />
        </div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {view === 'grid' ? renderGridView() : renderListView()}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? 'Editar Precificação' : 'Nova Precificação'}
              {selectedProduct && ` - ${selectedProduct.name}`}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <AdvancedPricingForm
              product={selectedProduct}
              onSave={handleFormSubmit}
              existingConfig={editingConfig}
              isLoading={createPricingMutation.isPending || updatePricingMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;
