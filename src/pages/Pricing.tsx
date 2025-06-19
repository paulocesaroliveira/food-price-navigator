
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calculator, Package, DollarSign, TrendingUp, ArrowRight, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/calculations";
import { PageHeader } from "@/components/shared/PageHeader";
import { Product, PricingConfiguration } from "@/types";
import PricingCalculator from "@/components/pricing/PricingCalculator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Pricing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPricingDialog, setShowPricingDialog] = useState(false);

  const { data: products = [] } = useQuery({
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

  const { data: configurations = [] } = useQuery({
    queryKey: ['pricing-configurations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('pricing_configs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = products.length;
  const avgCost = products.length > 0 
    ? products.reduce((acc, product) => acc + (product.total_cost || 0), 0) / products.length 
    : 0;

  const totalConfigurations = configurations.length;

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setShowPricingDialog(true);
  };

  const handleSavePricing = async (pricingData: any) => {
    console.log('Salvando configuração de preço:', pricingData);
    // TODO: Implementar salvamento da configuração
    setShowPricingDialog(false);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Precificação"
        subtitle="Configure preços inteligentes para seus produtos"
        icon={Calculator}
        gradient="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600"
        badges={[
          { icon: Package, text: `${totalProducts} produtos` },
          { icon: Settings, text: `${totalConfigurations} configurações` },
          { icon: DollarSign, text: `Custo médio: ${formatCurrency(avgCost)}` }
        ]}
      />

      {/* Search Bar */}
      <div className="flex items-center space-x-2 max-w-md">
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <Input
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full input-focus"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Tente alterar os termos de busca" : "Cadastre produtos para começar a precificação"}
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const hasConfiguration = configurations.some(config => config.product_id === product.id);
            
            return (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-purple-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold truncate">{product.name}</CardTitle>
                      {product.category && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {product.category.name}
                        </Badge>
                      )}
                    </div>
                    {hasConfiguration && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Configurado
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Custo Total:</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(product.total_cost || 0)}
                      </span>
                    </div>
                    
                    {hasConfiguration && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant="outline" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Precificado
                        </Badge>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleProductSelect(product)}
                    className={`w-full group-hover:shadow-md transition-all duration-300 ${
                      hasConfiguration 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' 
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                    }`}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    {hasConfiguration ? 'Reconfigurar' : 'Precificar'}
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pricing Dialog */}
      <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Precificação - {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <PricingCalculator
              product={selectedProduct}
              onSave={handleSavePricing}
              existingConfig={configurations.find(config => config.product_id === selectedProduct.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;
