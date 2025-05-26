
import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Product, PricingConfiguration } from "@/types";
import { Calculator, ArrowLeft, Sparkles } from "lucide-react";
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
        title: "Precificação salva com sucesso!",
        description: "A configuração de preço foi salva e está disponível para consulta.",
      });
      queryClient.invalidateQueries({ queryKey: ["pricing-configs"] });
      queryClient.invalidateQueries({ queryKey: ["all-pricing-configs"] });
      handleReset();
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar precificação",
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
        title: "Precificação atualizada com sucesso!",
        description: "A configuração de preço foi atualizada.",
      });
      queryClient.invalidateQueries({ queryKey: ["pricing-configs"] });
      queryClient.invalidateQueries({ queryKey: ["all-pricing-configs"] });
      handleReset();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar precificação",
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-food-vanilla via-food-cream to-food-vanilla p-6 rounded-xl border shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-food-coral/20 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-food-coral" />
              </div>
              <div>
                <h1 className="text-3xl font-poppins font-bold text-food-dark">
                  Precificação Inteligente
                </h1>
                <p className="text-muted-foreground">
                  Calcule preços precisos com todos os custos incluídos
                </p>
              </div>
            </div>
          </div>
          
          {showCalculator && (
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2 border-food-coral text-food-coral hover:bg-food-coral hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      {!showCalculator ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Seleção de Produto */}
          <div className="lg:col-span-2">
            <ProductSelector
              onProductSelect={handleProductSelect}
              selectedProduct={selectedProduct}
            />
          </div>

          {/* Card de Instruções */}
          <Card className="border shadow-soft bg-gradient-to-br from-food-cream to-food-vanilla/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-food-dark">
                <Sparkles className="h-5 w-5 text-food-amber" />
                Como funciona?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-food-coral text-white text-xs flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-food-dark">Selecione o produto</h4>
                    <p className="text-sm text-muted-foreground">
                      Escolha um produto cadastrado para precificar
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-food-coral text-white text-xs flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-food-dark">Configure parâmetros</h4>
                    <p className="text-sm text-muted-foreground">
                      Ajuste margem, taxas, desperdício e custos extras
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-food-coral text-white text-xs flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-food-dark">Veja o resultado</h4>
                    <p className="text-sm text-muted-foreground">
                      Obtenha o preço ideal calculado automaticamente
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-food-white rounded-lg border border-food-coral/20">
                <h5 className="font-medium text-food-dark mb-2">✨ Recursos inclusos:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Cálculo de desperdício/perda</li>
                  <li>• Custos adicionais personalizados</li>
                  <li>• Margem de lucro configurável</li>
                  <li>• Comissões de plataforma</li>
                  <li>• Impostos e taxas</li>
                  <li>• Preço real de venda</li>
                  <li>• Preço mínimo recomendado</li>
                </ul>
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
  );
};

export default Pricing;
