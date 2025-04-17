
import React, { useState, useEffect } from "react";
import { Product, PricingConfiguration, AdditionalCost, PricingResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AdditionalCostsEditor from "./AdditionalCostsEditor";
import { ShoppingBag, PercentIcon, Calculator, Tag, Save } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/utils/calculations";
import { calculatePricingResults } from "@/services/pricingService";
import { v4 as uuidv4 } from "uuid";

interface PricingFormProps {
  product: Product;
  onSave: (config: Omit<PricingConfiguration, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  config?: PricingConfiguration;
  isLoading?: boolean;
}

const PricingForm: React.FC<PricingFormProps> = ({
  product,
  onSave,
  config,
  isLoading = false
}) => {
  const [name, setName] = useState(config?.name || `Precificação - ${product.name}`);
  const [baseCost, setBaseCost] = useState(config?.baseCost || product.totalCost);
  const [packagingCost, setPackagingCost] = useState(config?.packagingCost || product.packagingCost);
  const [wastagePercentage, setWastagePercentage] = useState(config?.wastagePercentage || 5);
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>(
    config?.additionalCosts || []
  );
  const [marginPercentage, setMarginPercentage] = useState(config?.desiredMarginPercentage || 30);
  const [platformFeePercentage, setPlatformFeePercentage] = useState(config?.platformFeePercentage || 0);
  const [taxPercentage, setTaxPercentage] = useState(config?.taxPercentage || 0);
  
  const [pricingResults, setPricingResults] = useState<PricingResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate pricing results whenever inputs change
  useEffect(() => {
    const results = calculatePricingResults(
      baseCost,
      packagingCost,
      wastagePercentage,
      additionalCosts,
      marginPercentage,
      platformFeePercentage,
      taxPercentage
    );
    
    setPricingResults(results);
  }, [
    baseCost,
    packagingCost,
    wastagePercentage,
    additionalCosts,
    marginPercentage,
    platformFeePercentage,
    taxPercentage
  ]);

  const handleSave = async () => {
    if (!pricingResults) return;
    
    setIsSaving(true);
    
    try {
      const configToSave: Omit<PricingConfiguration, "id" | "createdAt" | "updatedAt"> = {
        name,
        productId: product.id,
        baseCost,
        packagingCost,
        wastagePercentage,
        additionalCosts,
        desiredMarginPercentage: marginPercentage,
        platformFeePercentage,
        taxPercentage,
        totalUnitCost: pricingResults.unitCost,
        idealPrice: pricingResults.sellingPrice,
        finalPrice: pricingResults.priceWithTaxes,
        unitProfit: pricingResults.unitProfit,
        actualMargin: pricingResults.appliedMarkup
      };
      
      await onSave(configToSave);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="h-5 w-5 text-primary" />
            {product.name}
          </CardTitle>
          <CardDescription>Configuração de precificação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-4">
            <div>
              <Label htmlFor="config-name">Nome da precificação</Label>
              <Input
                id="config-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Precificação padrão"
              />
            </div>
            
            <div>
              <Label htmlFor="base-cost">Custo base</Label>
              <div className="relative">
                <Input
                  id="base-cost"
                  type="number"
                  value={baseCost}
                  onChange={(e) => setBaseCost(parseFloat(e.target.value) || 0)}
                  className="pl-7"
                />
                <span className="absolute left-2.5 top-2.5 text-muted-foreground">R$</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Custo total da receita
              </p>
            </div>
            
            <div>
              <Label htmlFor="packaging-cost">Custo da embalagem</Label>
              <div className="relative">
                <Input
                  id="packaging-cost"
                  type="number"
                  value={packagingCost}
                  onChange={(e) => setPackagingCost(parseFloat(e.target.value) || 0)}
                  className="pl-7"
                />
                <span className="absolute left-2.5 top-2.5 text-muted-foreground">R$</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="wastage">Porcentagem de perda (%)</Label>
              <div className="relative">
                <Input
                  id="wastage"
                  type="number"
                  value={wastagePercentage}
                  onChange={(e) => setWastagePercentage(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  className="pl-7"
                />
                <PercentIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <Separator />
            
            <AdditionalCostsEditor
              costs={additionalCosts}
              onChange={setAdditionalCosts}
            />
            
            <Separator />
            
            <div>
              <Label htmlFor="margin">Margem de lucro desejada (%)</Label>
              <div className="relative">
                <Input
                  id="margin"
                  type="number"
                  value={marginPercentage}
                  onChange={(e) => setMarginPercentage(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  className="pl-7"
                />
                <PercentIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="platform-fee">Comissão de plataforma (%)</Label>
              <div className="relative">
                <Input
                  id="platform-fee"
                  type="number"
                  value={platformFeePercentage}
                  onChange={(e) => setPlatformFeePercentage(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  className="pl-7"
                />
                <PercentIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="tax">Impostos (%)</Label>
              <div className="relative">
                <Input
                  id="tax"
                  type="number"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  className="pl-7"
                />
                <PercentIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full gap-2"
            onClick={handleSave}
            disabled={isLoading || isSaving}
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Salvando..." : "Salvar Precificação"}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="bg-gradient-to-br from-card to-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calculator className="h-5 w-5 text-primary" />
            Resultado da Precificação
          </CardTitle>
          <CardDescription>
            Baseado nos parâmetros informados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pricingResults && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="pricing-result-card bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Custo total unitário</div>
                  <div className="text-2xl font-semibold">{formatCurrency(pricingResults.unitCost)}</div>
                </div>
                
                <div className="pricing-result-card bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="text-sm text-green-700 mb-1 flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    Preço ideal com margem
                  </div>
                  <div className="text-3xl font-semibold text-green-800">{formatCurrency(pricingResults.sellingPrice)}</div>
                </div>
                
                <div className="pricing-result-card bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Preço com comissão</div>
                  <div className="text-2xl font-semibold">{formatCurrency(pricingResults.priceWithCommission)}</div>
                </div>
                
                <div className="pricing-result-card bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="text-sm text-blue-700 mb-1">Preço final (com impostos)</div>
                  <div className="text-2xl font-semibold text-blue-800">{formatCurrency(pricingResults.priceWithTaxes)}</div>
                </div>
                
                <div className="pricing-result-card bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Lucro por unidade</div>
                  <div className="text-2xl font-semibold text-green-600">{formatCurrency(pricingResults.unitProfit)}</div>
                </div>
                
                <div className="pricing-result-card bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Markup aplicado</div>
                  <div className="text-2xl font-semibold">{formatPercentage(pricingResults.appliedMarkup)}</div>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <div className="text-sm text-amber-700 mb-1">Preço mínimo recomendado</div>
                <div className="text-xl font-semibold text-amber-800">
                  {formatCurrency(pricingResults.minimumRecommendedPrice)}
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  Baseado em uma margem mínima de 20%
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingForm;
