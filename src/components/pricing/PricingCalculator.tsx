
import React, { useState, useEffect } from "react";
import { Product, AdditionalCost } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Calculator, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/utils/calculations";
import { calculatePricingResults } from "@/services/pricingService";
import { v4 as uuidv4 } from "uuid";

interface PricingCalculatorProps {
  product: Product;
  onSave: (pricingData: any) => void;
  isLoading?: boolean;
}

const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  product,
  onSave,
  isLoading = false
}) => {
  const [configName, setConfigName] = useState(`Precificação - ${product.name}`);
  const [wastagePercentage, setWastagePercentage] = useState(5);
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([]);
  const [marginPercentage, setMarginPercentage] = useState(30);
  const [platformFeePercentage, setPlatformFeePercentage] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(0);
  
  const [results, setResults] = useState<any>(null);

  // Calcular resultados em tempo real
  useEffect(() => {
    const baseCost = product.totalCost - product.packagingCost;
    const packagingCost = product.packagingCost;
    
    const calculatedResults = calculatePricingResults(
      baseCost,
      packagingCost,
      wastagePercentage,
      additionalCosts,
      marginPercentage,
      platformFeePercentage,
      taxPercentage
    );
    
    setResults(calculatedResults);
  }, [
    product,
    wastagePercentage,
    additionalCosts,
    marginPercentage,
    platformFeePercentage,
    taxPercentage
  ]);

  const addAdditionalCost = () => {
    setAdditionalCosts([
      ...additionalCosts,
      {
        id: uuidv4(),
        name: "",
        value: 0,
        isPerUnit: true
      }
    ]);
  };

  const updateAdditionalCost = (index: number, field: keyof AdditionalCost, value: any) => {
    const newCosts = [...additionalCosts];
    newCosts[index] = { ...newCosts[index], [field]: value };
    setAdditionalCosts(newCosts);
  };

  const removeAdditionalCost = (index: number) => {
    setAdditionalCosts(additionalCosts.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!results) return;

    const pricingData = {
      name: configName,
      productId: product.id,
      baseCost: product.totalCost - product.packagingCost,
      packagingCost: product.packagingCost,
      wastagePercentage,
      additionalCosts,
      desiredMarginPercentage: marginPercentage,
      platformFeePercentage,
      taxPercentage,
      totalUnitCost: results.unitCost,
      idealPrice: results.sellingPrice,
      finalPrice: results.priceWithTaxes,
      unitProfit: results.unitProfit,
      actualMargin: results.appliedMarkup
    };

    onSave(pricingData);
  };

  const baseCost = product.totalCost - product.packagingCost;
  const packagingCost = product.packagingCost;
  const totalAdditionalCosts = additionalCosts.reduce((sum, cost) => sum + cost.value, 0);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Formulário de Configuração */}
      <Card className="border shadow-soft">
        <CardHeader className="bg-gradient-to-r from-food-vanilla to-food-cream">
          <CardTitle className="flex items-center gap-2 text-food-dark">
            <Calculator className="h-5 w-5 text-food-coral" />
            Configuração de Preços
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-food-dark">Custos Adicionais</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAdditionalCost}
                className="border-food-coral text-food-coral hover:bg-food-coral hover:text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>

            {additionalCosts.map((cost, index) => (
              <div key={cost.id} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-sm">Nome</Label>
                  <Input
                    value={cost.name}
                    onChange={(e) => updateAdditionalCost(index, 'name', e.target.value)}
                    placeholder="Ex: Mão de obra, energia..."
                    className="border-food-vanilla focus-visible:ring-food-coral"
                  />
                </div>
                <div className="w-24">
                  <Label className="text-sm">Valor (R$)</Label>
                  <Input
                    type="number"
                    value={cost.value}
                    onChange={(e) => updateAdditionalCost(index, 'value', Number(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="border-food-vanilla focus-visible:ring-food-coral"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAdditionalCost(index)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {totalAdditionalCosts > 0 && (
              <div className="p-2 bg-food-vanilla/30 rounded text-sm">
                <strong>Total de custos adicionais: {formatCurrency(totalAdditionalCosts)}</strong>
              </div>
            )}
          </div>

          <Separator className="bg-food-vanilla" />

          {/* Margem e Taxas */}
          <div className="space-y-4">
            <h3 className="font-medium text-food-dark flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-food-coral" />
              Margem e Taxas
            </h3>

            <div>
              <Label htmlFor="margin" className="text-sm">Margem de Lucro Desejada (%)</Label>
              <Input
                id="margin"
                type="number"
                value={marginPercentage}
                onChange={(e) => setMarginPercentage(Number(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
                className="mt-1 border-food-vanilla focus-visible:ring-food-coral"
              />
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
            {isLoading ? "Salvando..." : "Salvar Precificação"}
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
                <div className="text-sm text-green-700">Preço Ideal (com margem)</div>
                <div className="text-3xl font-bold font-poppins text-green-800">
                  {formatCurrency(results.sellingPrice)}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Lucro: {formatCurrency(results.unitProfit)} ({formatPercentage(results.appliedMarkup)})
                </div>
              </div>

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

              {/* Resumo dos Cálculos */}
              <div className="mt-6 p-4 bg-food-cream rounded-lg border">
                <h4 className="font-medium text-food-dark mb-3">Resumo dos Cálculos</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Custo da receita:</span>
                    <span>{formatCurrency(baseCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custo da embalagem:</span>
                    <span>{formatCurrency(packagingCost)}</span>
                  </div>
                  {totalAdditionalCosts > 0 && (
                    <div className="flex justify-between">
                      <span>Custos adicionais:</span>
                      <span>{formatCurrency(totalAdditionalCosts)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Perda ({wastagePercentage}%):</span>
                    <span>{formatCurrency((baseCost + packagingCost + totalAdditionalCosts) * (wastagePercentage / 100))}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Custo total unitário:</span>
                    <span>{formatCurrency(results.unitCost)}</span>
                  </div>
                </div>
              </div>
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
