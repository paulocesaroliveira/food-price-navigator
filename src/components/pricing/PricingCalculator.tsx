
import React, { useState, useEffect } from "react";
import { Product, AdditionalCost, PricingConfiguration } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Calculator, TrendingUp, DollarSign, AlertTriangle, Target } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/utils/calculations";
import { calculatePricingResults } from "@/services/pricingService";
import { v4 as uuidv4 } from "uuid";
import AdditionalCostsEditor from "./AdditionalCostsEditor";

interface PricingCalculatorProps {
  product: Product;
  onSave: (pricingData: any) => void;
  isLoading?: boolean;
  existingConfig?: PricingConfiguration | null;
}

const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  product,
  onSave,
  isLoading = false,
  existingConfig
}) => {
  const [configName, setConfigName] = useState(`Precificação - ${product.name}`);
  const [wastagePercentage, setWastagePercentage] = useState(5);
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([]);
  
  // Estado para controlar o modo de precificação
  const [pricingMode, setPricingMode] = useState<'margin' | 'target'>('margin');
  const [marginPercentage, setMarginPercentage] = useState(30);
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [actualSellingPrice, setActualSellingPrice] = useState<string>('');
  
  const [platformFeePercentage, setPlatformFeePercentage] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(0);
  
  const [results, setResults] = useState<any>(null);

  // Flag to prevent infinite loops during bidirectional updates
  const [isUpdatingFromCalculation, setIsUpdatingFromCalculation] = useState(false);

  // Carregar dados existentes quando um config é fornecido
  useEffect(() => {
    if (existingConfig) {
      setConfigName(existingConfig.name);
      setWastagePercentage(existingConfig.wastagePercentage);
      setAdditionalCosts(existingConfig.additionalCosts || []);
      setMarginPercentage(existingConfig.desiredMarginPercentage);
      setPlatformFeePercentage(existingConfig.platformFeePercentage);
      setTaxPercentage(existingConfig.taxPercentage);
      setActualSellingPrice(existingConfig.actualSellingPrice?.toString() || '');
    }
  }, [existingConfig]);

  // Calculate total cost for bidirectional calculations
  const calculateTotalCost = () => {
    const baseCost = product.totalCost - product.packagingCost;
    const packagingCost = product.packagingCost;
    
    const totalAdditionalCost = additionalCosts.reduce((sum, cost) => {
      if (cost.type === 'percentage') {
        return sum + (baseCost + packagingCost) * (cost.value / 100);
      }
      return sum + cost.value;
    }, 0);
    
    const totalCost = baseCost + packagingCost + totalAdditionalCost;
    const wastageMultiplier = 1 + (wastagePercentage / 100);
    return totalCost * wastageMultiplier;
  };

  // Handle margin change - calculate actual selling price
  const handleMarginChange = (newMargin: number) => {
    setMarginPercentage(newMargin);
    
    if (!isUpdatingFromCalculation) {
      const totalCost = calculateTotalCost();
      const marginMultiplier = 1 / (1 - (newMargin / 100));
      const calculatedPrice = totalCost * marginMultiplier;
      
      setIsUpdatingFromCalculation(true);
      setActualSellingPrice(calculatedPrice.toFixed(2));
      setTimeout(() => setIsUpdatingFromCalculation(false), 0);
    }
  };

  // Handle actual selling price change - calculate margin
  const handleActualPriceChange = (priceStr: string) => {
    setActualSellingPrice(priceStr);
    
    if (!isUpdatingFromCalculation && priceStr && parseFloat(priceStr) > 0) {
      const totalCost = calculateTotalCost();
      const price = parseFloat(priceStr);
      
      if (totalCost > 0 && price > totalCost) {
        const calculatedMargin = ((price - totalCost) / price) * 100;
        
        setIsUpdatingFromCalculation(true);
        setMarginPercentage(calculatedMargin);
        setTimeout(() => setIsUpdatingFromCalculation(false), 0);
      }
    }
  };

  // Calcular resultados em tempo real
  useEffect(() => {
    const baseCost = product.totalCost - product.packagingCost;
    const packagingCost = product.packagingCost;
    
    let calculatedMargin = marginPercentage;
    let finalTargetPrice = 0;
    
    // Se estiver no modo de preço alvo, calcular a margem necessária
    if (pricingMode === 'target' && targetPrice && parseFloat(targetPrice) > 0) {
      finalTargetPrice = parseFloat(targetPrice);
      
      // Calcular custo total primeiro
      const totalAdditionalCost = additionalCosts.reduce((sum, cost) => {
        if (cost.type === 'percentage') {
          return sum + (baseCost + packagingCost) * (cost.value / 100);
        }
        return sum + cost.value;
      }, 0);
      
      const totalCost = baseCost + packagingCost + totalAdditionalCost;
      const wastageMultiplier = 1 + (wastagePercentage / 100);
      const unitCostWithWastage = totalCost * wastageMultiplier;
      
      // Calcular margem necessária para atingir o preço alvo
      if (unitCostWithWastage > 0) {
        calculatedMargin = ((finalTargetPrice - unitCostWithWastage) / finalTargetPrice) * 100;
      }
    }
    
    const calculatedResults = calculatePricingResults(
      baseCost,
      packagingCost,
      wastagePercentage,
      additionalCosts,
      calculatedMargin,
      platformFeePercentage,
      taxPercentage
    );
    
    setResults({
      ...calculatedResults,
      calculatedMargin,
      targetPrice: finalTargetPrice
    });
  }, [
    product,
    wastagePercentage,
    additionalCosts,
    marginPercentage,
    targetPrice,
    pricingMode,
    platformFeePercentage,
    taxPercentage
  ]);

  const handleSave = () => {
    if (!results) return;

    const finalMargin = pricingMode === 'target' ? results.calculatedMargin : marginPercentage;
    const finalPrice = pricingMode === 'target' ? results.targetPrice : results.sellingPrice;

    const pricingData = {
      id: existingConfig?.id,
      name: configName,
      productId: product.id,
      baseCost: product.totalCost - product.packagingCost,
      packagingCost: product.packagingCost,
      wastagePercentage,
      additionalCosts,
      desiredMarginPercentage: finalMargin,
      platformFeePercentage,
      taxPercentage,
      totalUnitCost: results.unitCost,
      idealPrice: finalPrice,
      finalPrice: results.priceWithTaxes,
      unitProfit: results.unitProfit,
      actualMargin: results.appliedMarkup,
      actualSellingPrice: actualSellingPrice ? parseFloat(actualSellingPrice) : finalPrice
    };

    onSave(pricingData);
  };

  const baseCost = product.totalCost - product.packagingCost;
  const packagingCost = product.packagingCost;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Formulário de Configuração */}
      <Card className="border shadow-soft">
        <CardHeader className="bg-gradient-to-r from-food-vanilla to-food-cream">
          <CardTitle className="flex items-center gap-2 text-food-dark">
            <Calculator className="h-5 w-5 text-food-coral" />
            {existingConfig ? 'Editar Precificação' : 'Nova Precificação'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Nome da Configuração */}
          <div>
            <Label htmlFor="config-name" className="font-medium">Nome da Precificação</Label>
            <Input
              id="config-name"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              className="mt-1 border-food-vanilla focus-visible:ring-food-coral"
            />
          </div>

          <Separator className="bg-food-vanilla" />

          {/* Custos Base */}
          <div className="space-y-4">
            <h3 className="font-medium text-food-dark flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-food-coral" />
              Custos Base
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Custo da receita</Label>
                <div className="mt-1 p-2 bg-food-vanilla/30 rounded text-sm font-medium">
                  {formatCurrency(baseCost)}
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Custo da embalagem</Label>
                <div className="mt-1 p-2 bg-food-vanilla/30 rounded text-sm font-medium">
                  {formatCurrency(packagingCost)}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="wastage" className="text-sm">Percentual de Perda/Desperdício (%)</Label>
              <Input
                id="wastage"
                type="number"
                value={wastagePercentage}
                onChange={(e) => setWastagePercentage(Number(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
                className="mt-1 border-food-vanilla focus-visible:ring-food-coral"
              />
            </div>
          </div>

          <Separator className="bg-food-vanilla" />

          {/* Custos Adicionais */}
          <AdditionalCostsEditor
            costs={additionalCosts}
            onChange={setAdditionalCosts}
            baseCost={baseCost + packagingCost}
          />

          <Separator className="bg-food-vanilla" />

          {/* Estratégia de Precificação */}
          <div className="space-y-4">
            <h3 className="font-medium text-food-dark flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-food-coral" />
              Estratégia de Precificação
            </h3>

            <div className="flex items-center justify-between p-3 bg-food-vanilla/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 text-food-coral" />
                <span className="text-sm font-medium">
                  {pricingMode === 'margin' ? 'Por margem de lucro' : 'Por preço alvo'}
                </span>
              </div>
              <Switch
                checked={pricingMode === 'target'}
                onCheckedChange={(checked) => setPricingMode(checked ? 'target' : 'margin')}
              />
            </div>

            {pricingMode === 'margin' ? (
              <div>
                <Label htmlFor="margin" className="text-sm">Margem de Lucro Desejada (%)</Label>
                <Input
                  id="margin"
                  type="number"
                  value={marginPercentage}
                  onChange={(e) => handleMarginChange(Number(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="mt-1 border-food-vanilla focus-visible:ring-food-coral"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="target-price" className="text-sm">Preço de Venda Desejado</Label>
                <div className="relative">
                  <Input
                    id="target-price"
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    className="mt-1 pl-7 border-food-vanilla focus-visible:ring-food-coral"
                    placeholder="0,00"
                  />
                  <span className="absolute left-2.5 top-[9px] text-muted-foreground text-sm">R$</span>
                </div>
                {results && results.calculatedMargin !== undefined && targetPrice && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Margem calculada: {formatPercentage(results.calculatedMargin)}
                  </div>
                )}
              </div>
            )}

            {/* Preço Real de Venda */}
            <div>
              <Label htmlFor="actual-price" className="text-sm">Preço Real de Venda</Label>
              <div className="relative">
                <Input
                  id="actual-price"
                  type="number"
                  value={actualSellingPrice}
                  onChange={(e) => handleActualPriceChange(e.target.value)}
                  min="0"
                  step="0.01"
                  className="mt-1 pl-7 border-food-vanilla focus-visible:ring-food-coral"
                  placeholder="0,00"
                />
                <span className="absolute left-2.5 top-[9px] text-muted-foreground text-sm">R$</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Este campo atualiza automaticamente a margem de lucro acima
              </div>
            </div>

            <div>
              <Label htmlFor="platform-fee" className="text-sm">Comissão de Plataforma (%)</Label>
              <Input
                id="platform-fee"
                type="number"
                value={platformFeePercentage}
                onChange={(e) => setPlatformFeePercentage(Number(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
                className="mt-1 border-food-vanilla focus-visible:ring-food-coral"
              />
            </div>

            <div>
              <Label htmlFor="tax" className="text-sm">Impostos (%)</Label>
              <Input
                id="tax"
                type="number"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(Number(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
                className="mt-1 border-food-vanilla focus-visible:ring-food-coral"
              />
            </div>
          </div>

          <Separator className="bg-food-vanilla" />

          <Button
            onClick={handleSave}
            disabled={isLoading || !results}
            className="w-full bg-food-coral hover:bg-food-amber text-white"
          >
            {isLoading ? "Salvando..." : existingConfig ? "Atualizar Precificação" : "Salvar Precificação"}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card className="border shadow-soft">
        <CardHeader className="bg-gradient-to-r from-food-green/20 to-food-amber/20">
          <CardTitle className="flex items-center gap-2 text-food-dark">
            <TrendingUp className="h-5 w-5 text-food-green" />
            Resultado da Precificação
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {results ? (
            <div className="space-y-4">
              {/* Custo Total */}
              <div className="p-4 bg-food-vanilla/30 rounded-lg">
                <div className="text-sm text-muted-foreground">Custo Total Unitário</div>
                <div className="text-2xl font-semibold font-poppins text-food-dark">
                  {formatCurrency(results.unitCost)}
                </div>
              </div>

              {/* Preço Ideal */}
              <div className="p-4 bg-food-green/20 border border-food-green/30 rounded-lg">
                <div className="text-sm text-green-700">
                  {pricingMode === 'target' ? 'Preço Alvo' : 'Preço Ideal (com margem)'}
                </div>
                <div className="text-3xl font-bold font-poppins text-green-800">
                  {formatCurrency(pricingMode === 'target' && results.targetPrice ? results.targetPrice : results.sellingPrice)}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Lucro: {formatCurrency(results.unitProfit)} ({formatPercentage(pricingMode === 'target' ? results.calculatedMargin : results.appliedMarkup)})
                </div>
              </div>

              {/* Preço Real vs Ideal */}
              {actualSellingPrice && parseFloat(actualSellingPrice) > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-700">Preço Real de Venda</div>
                  <div className="text-2xl font-bold text-blue-800">
                    {formatCurrency(parseFloat(actualSellingPrice))}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Diferença: {formatCurrency(parseFloat(actualSellingPrice) - (pricingMode === 'target' && results.targetPrice ? results.targetPrice : results.sellingPrice))}
                  </div>
                </div>
              )}

              {/* Preços com Taxas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-food-amber/20 border border-food-amber/30 rounded-lg">
                  <div className="text-xs text-amber-700">Com Comissão</div>
                  <div className="text-lg font-semibold text-amber-800">
                    {formatCurrency(results.priceWithCommission)}
                  </div>
                </div>
                <div className="p-3 bg-food-red/20 border border-food-red/30 rounded-lg">
                  <div className="text-xs text-red-700">Preço Final</div>
                  <div className="text-lg font-semibold text-red-800">
                    {formatCurrency(results.priceWithTaxes)}
                  </div>
                </div>
              </div>

              {/* Preço Mínimo Recomendado */}
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-700 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Preço Mínimo Recomendado (20% margem)
                </div>
                <div className="text-xl font-semibold text-orange-800 mt-1">
                  {formatCurrency(results.minimumRecommendedPrice)}
                </div>
              </div>

              {/* Alerta para preço alvo muito baixo */}
              {pricingMode === 'target' && results.calculatedMargin < 20 && targetPrice && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-xs text-red-700 font-medium">⚠️ Atenção!</div>
                  <div className="text-xs text-red-600">
                    O preço alvo resulta em uma margem muito baixa. Considere aumentar o preço.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calculator className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mt-2">
                Configure os parâmetros para ver os resultados
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingCalculator;
