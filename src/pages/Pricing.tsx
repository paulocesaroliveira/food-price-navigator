import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calculator, Package, DollarSign, TrendingUp, ArrowRight, Settings, Target, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/calculations";
import { PageHeader } from "@/components/shared/PageHeader";
import { Product, PricingConfiguration } from "@/types";
import PricingCalculator from "@/components/pricing/PricingCalculator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getProductList } from "@/services/productService";

const Pricing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPricingDialog, setShowPricingDialog] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProductList
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

  // Filtrar e ordenar produtos alfabeticamente
  const filteredProducts = products
    .filter(product =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB, 'pt-BR');
    });

  const totalProducts = products.length;
  const avgCost = products.length > 0 
    ? products.reduce((acc, product) => acc + (product.total_cost || 0), 0) / products.length 
    : 0;
  const totalConfigurations = configurations.length;

  const handleProductSelect = (product: Product) => {
    console.log("Selected product for pricing:", product);
    setSelectedProduct(product);
    setShowPricingDialog(true);
  };

  const handleSavePricing = async (pricingData: any) => {
    console.log('Salvando configuração de preço:', pricingData);
    // TODO: Implementar salvamento da configuração
    setShowPricingDialog(false);
    setSelectedProduct(null);
  };

  // Enhanced function to calculate card pricing data with proper formatting
  const getCardPricingData = (product: Product) => {
    const config = configurations.find(config => config.product_id === product.id);
    
    if (!config) {
      return {
        costWithoutTaxes: Number(product.total_cost) || 0,
        totalTaxes: 0,
        finalPrice: 0,
        profit: 0,
        margin: 0,
        hasConfiguration: false
      };
    }

    const baseCost = Number(config.base_cost) || 0;
    const packagingCost = Number(config.packaging_cost) || 0;
    const laborCost = Number(config.labor_cost) || 0;
    const overheadCost = Number(config.overhead_cost) || 0;
    const marketingCost = Number(config.marketing_cost) || 0;
    const deliveryCost = Number(config.delivery_cost) || 0;
    const otherCosts = Number(config.other_costs) || 0;
    
    const productionCost = baseCost + packagingCost;
    const totalIndirectCosts = laborCost + overheadCost + marketingCost + deliveryCost + otherCosts;
    const costWithWastage = (productionCost + totalIndirectCosts) * (1 + (Number(config.wastage_percentage) || 5) / 100);
    
    const idealPrice = costWithWastage * (1 + (Number(config.margin_percentage) || 30) / 100);
    const priceWithPlatformFee = idealPrice * (1 + (Number(config.platform_fee_percentage) || 0) / 100);
    const finalPrice = priceWithPlatformFee * (1 + (Number(config.tax_percentage) || 0) / 100);
    
    const profit = finalPrice - costWithWastage;
    const margin = costWithWastage > 0 ? ((profit / costWithWastage) * 100) : 0;

    return {
      costWithoutTaxes: productionCost,
      totalTaxes: totalIndirectCosts,
      finalPrice: finalPrice,
      profit: profit,
      margin: margin,
      hasConfiguration: true
    };
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Precificação Inteligente"
        subtitle="Configure preços profissionais para seus produtos com análise completa de custos"
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
          placeholder="Buscar produtos para precificar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full input-focus"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
            const pricingData = getCardPricingData(product);
            
            return (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-purple-200 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold truncate text-gray-800">{product.name}</CardTitle>
                      {product.category && (
                        <Badge variant="secondary" className="mt-2 text-xs bg-blue-100 text-blue-800">
                          {product.category.name}
                        </Badge>
                      )}
                    </div>
                    {pricingData.hasConfiguration && (
                      <Badge className="bg-green-100 text-green-800 text-xs font-semibold">
                        <Zap className="h-3 w-3 mr-1" />
                        Configurado
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {pricingData.hasConfiguration ? (
                    <>
                      {/* Enhanced Pricing Information Display */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-600 font-medium mb-1">Custo Produção</p>
                          <p className="text-sm font-bold text-blue-800">
                            {formatCurrency(pricingData.costWithoutTaxes)}
                          </p>
                        </div>
                        
                        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-xs text-purple-600 font-medium mb-1">Custos Indiretos</p>
                          <p className="text-sm font-bold text-purple-800">
                            {formatCurrency(pricingData.totalTaxes)}
                          </p>
                        </div>
                        
                        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-xs text-green-600 font-medium mb-1">Preço Final</p>
                          <p className="text-sm font-bold text-green-800">
                            {formatCurrency(pricingData.finalPrice)}
                          </p>
                        </div>
                        
                        <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-xs text-amber-600 font-medium mb-1">Lucro</p>
                          <p className="text-sm font-bold text-amber-800">
                            {formatCurrency(pricingData.profit)}
                          </p>
                        </div>
                      </div>

                      {/* Enhanced Status Display */}
                      <div className="flex justify-between items-center">
                        {pricingData.profit > 0 ? (
                          <Badge className="bg-green-100 text-green-800 px-3 py-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Rentável
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="px-3 py-1">
                            <Target className="h-3 w-3 mr-1" />
                            Revisar Preços
                          </Badge>
                        )}
                        
                        <div className="text-right">
                          <p className="text-xs text-gray-600">Margem</p>
                          <p className="text-sm font-bold text-gray-800">
                            {pricingData.margin.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Product without configuration */}
                      <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <Calculator className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-1">Produto não precificado</p>
                        <div className="text-center">
                          <span className="text-xs text-gray-500">Custo Base:</span>
                          <p className="font-semibold text-blue-600">
                            {formatCurrency(product.total_cost || 0)}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={() => handleProductSelect(product)}
                    className={`w-full group-hover:shadow-md transition-all duration-300 ${
                      pricingData.hasConfiguration 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                    }`}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    {pricingData.hasConfiguration ? 'Reconfigurar Preços' : 'Criar Precificação'}
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
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-3">
              <Calculator className="h-6 w-6 text-purple-600" />
              Precificação Profissional - {selectedProduct?.name}
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
