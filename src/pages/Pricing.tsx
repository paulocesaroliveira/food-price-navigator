
import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Product, PricingConfiguration } from "@/types";
import { Calculator, ArrowLeft, Sparkles, TrendingUp, Target } from "lucide-react";
import ProductSelector from "@/components/pricing/ProductSelector";
import PricingCalculator from "@/components/pricing/PricingCalculator";
import { createPricingConfig, updatePricingConfig, getPricingConfigs } from "@/services/pricingService";

const Pricing = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PricingConfiguration | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get existing pricing configs for the selected product
  const { data: existingConfigs = [] } = useQuery({
    queryKey: ["pricing-configs", selectedProduct?.id],
    queryFn: () => selectedProduct ? getPricingConfigs(selectedProduct.id) : Promise.resolve([]),
    enabled: !!selectedProduct
  });

  // Create pricing config mutation
  const createMutation = useMutation({
    mutationFn: createPricingConfig,
    onSuccess: () => {
      toast({
        title: "✨ Precificação salva com sucesso!",
        description: "A configuração de preço foi salva e está disponível para consulta.",
      });
      queryClient.invalidateQueries({ queryKey: ["pricing-configs"] });
      queryClient.invalidateQueries({ queryKey: ["all-pricing-configs"] });
      handleReset();
    },
    onError: (error) => {
      toast({
        title: "❌ Erro ao salvar precificação",
        description: `Ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  });

  // Update pricing config mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, config }: { id: string; config: any }) => updatePricingConfig(id, config),
    onSuccess: () => {
      toast({
        title: "✨ Precificação atualizada com sucesso!",
        description: "A configuração de preço foi atualizada.",
      });
      queryClient.invalidateQueries({ queryKey: ["pricing-configs"] });
      queryClient.invalidateQueries({ queryKey: ["all-pricing-configs"] });
      handleReset();
    },
    onError: (error) => {
      toast({
        title: "❌ Erro ao atualizar precificação",
        description: `Ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  });

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setEditingConfig(null);
    setShowCalculator(true);
  };

  const handleEditConfig = (product: Product, config: PricingConfiguration) => {
    setSelectedProduct(product);
    setEditingConfig(config);
    setShowCalculator(true);
  };

  const handleSavePricing = async (pricingData: any) => {
    if (editingConfig && pricingData.id) {
      // Update existing config
      updateMutation.mutate({ id: pricingData.id, config: pricingData });
    } else {
      // Create new config
      createMutation.mutate(pricingData);
    }
  };

  const handleReset = () => {
    setSelectedProduct(null);
    setShowCalculator(false);
    setEditingConfig(null);
  };

  // Get the latest config for editing if available
  const latestConfig = existingConfigs.length > 0 ? existingConfigs[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                    <Calculator className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">Precificação Inteligente</h1>
                    <p className="text-blue-100 text-lg">
                      Calcule preços precisos com todos os custos incluídos
                    </p>
                  </div>
                </div>
                
                {!showCalculator && (
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                      <Target className="h-4 w-4" />
                      <span>Margem Otimizada</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                      <TrendingUp className="h-4 w-4" />
                      <span>Análise Completa</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                      <Sparkles className="h-4 w-4" />
                      <span>Resultados Instantâneos</span>
                    </div>
                  </div>
                )}
              </div>
              
              {showCalculator && (
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  className="gap-2 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/30"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              )}
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
          <div className="absolute -left-4 -bottom-4 h-32 w-32 rounded-full bg-white/5"></div>
        </div>

        {/* Content */}
        {!showCalculator ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Product Selection */}
            <div className="lg:col-span-2">
              <ProductSelector
                onProductSelect={handleProductSelect}
                selectedProduct={selectedProduct}
              />
            </div>

            {/* Instructions Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  Como funciona?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    {
                      step: "1",
                      title: "Selecione o produto",
                      description: "Escolha um produto cadastrado para precificar",
                      color: "bg-blue-500"
                    },
                    {
                      step: "2", 
                      title: "Configure parâmetros",
                      description: "Ajuste margem, taxas, desperdício e custos extras",
                      color: "bg-purple-500"
                    },
                    {
                      step: "3",
                      title: "Veja o resultado",
                      description: "Obtenha o preço ideal calculado automaticamente",
                      color: "bg-green-500"
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`${item.color} text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0`}>
                        {item.step}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 border border-blue-100">
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    Recursos inclusos
                  </h5>
                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                    {[
                      "Cálculo de desperdício/perda",
                      "Custos adicionais personalizados", 
                      "Margem de lucro configurável",
                      "Comissões de plataforma",
                      "Impostos e taxas",
                      "Preço real de venda",
                      "Preço mínimo recomendado"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          selectedProduct && (
            <PricingCalculator
              product={selectedProduct}
              onSave={handleSavePricing}
              isLoading={createMutation.isPending || updateMutation.isPending}
              existingConfig={editingConfig || latestConfig}
            />
          )
        )}
      </div>
    </div>
  );
};

export default Pricing;
