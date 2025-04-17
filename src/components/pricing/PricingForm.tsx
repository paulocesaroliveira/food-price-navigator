
import React, { useState, useEffect } from "react";
import { Product, PricingConfiguration, AdditionalCost, PricingResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AdditionalCostsEditor from "./AdditionalCostsEditor";
import { ShoppingBag, PercentIcon, Calculator, Tag, Save, TrendingUp, Wallet, HelpCircle } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/utils/calculations";
import { calculatePricingResults } from "@/services/pricingService";
import { v4 as uuidv4 } from "uuid";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
      <Card className="border rounded-xl shadow-soft bg-food-white">
        <CardHeader className="bg-gradient-to-r from-food-vanilla to-food-cream">
          <CardTitle className="flex items-center gap-2 text-xl font-poppins">
            <ShoppingBag className="h-5 w-5 text-food-coral" />
            {product.name}
          </CardTitle>
          <CardDescription>Configuração de precificação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <div className="space-y-4">
            <div>
              <Label htmlFor="config-name" className="font-medium font-poppins text-food-dark">
                Nome da precificação
              </Label>
              <Input
                id="config-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Precificação padrão"
                className="mt-1 border-food-vanilla focus-visible:ring-food-coral"
              />
            </div>
            
            <div className="p-4 bg-food-vanilla/30 rounded-xl space-y-4">
              <h3 className="font-poppins font-medium text-food-dark flex items-center">
                <Wallet className="w-4 h-4 mr-2 text-food-coral" />
                Custos Base
              </h3>
              
              <div>
                <Label htmlFor="base-cost" className="text-sm flex items-center">
                  Custo base
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="ml-1 cursor-help">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">
                          Custo total da receita sem incluir embalagem
                          ou despesas adicionais.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="relative">
                  <Input
                    id="base-cost"
                    type="number"
                    value={baseCost}
                    onChange={(e) => setBaseCost(parseFloat(e.target.value) || 0)}
                    className="pl-7 mt-1 border-food-vanilla focus-visible:ring-food-coral"
                  />
                  <span className="absolute left-2.5 top-[9px] text-muted-foreground">R$</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="packaging-cost" className="text-sm">Custo da embalagem</Label>
                <div className="relative">
                  <Input
                    id="packaging-cost"
                    type="number"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(parseFloat(e.target.value) || 0)}
                    className="pl-7 mt-1 border-food-vanilla focus-visible:ring-food-coral"
                  />
                  <span className="absolute left-2.5 top-[9px] text-muted-foreground">R$</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="wastage" className="text-sm flex items-center">
                  Porcentagem de perda
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="ml-1 cursor-help">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">
                          Percentual de perda, quebra ou desperdício 
                          durante a produção.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="relative">
                  <Input
                    id="wastage"
                    type="number"
                    value={wastagePercentage}
                    onChange={(e) => setWastagePercentage(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    className="pl-7 mt-1 border-food-vanilla focus-visible:ring-food-coral"
                  />
                  <PercentIcon className="absolute left-2.5 top-[9px] h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            <Separator className="bg-food-vanilla" />
            
            <AdditionalCostsEditor
              costs={additionalCosts}
              onChange={setAdditionalCosts}
            />
            
            <Separator className="bg-food-vanilla" />
            
            <div className="p-4 bg-food-vanilla/30 rounded-xl space-y-4">
              <h3 className="font-poppins font-medium text-food-dark flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-food-coral" />
                Margem e Taxas
              </h3>
              
              <div>
                <Label htmlFor="margin" className="text-sm flex items-center">
                  Margem de lucro desejada
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="ml-1 cursor-help">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">
                          Percentual de lucro desejado sobre o custo total.
                          Recomendado: mínimo de 30%.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="relative">
                  <Input
                    id="margin"
                    type="number"
                    value={marginPercentage}
                    onChange={(e) => setMarginPercentage(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    className="pl-7 mt-1 border-food-vanilla focus-visible:ring-food-coral"
                  />
                  <PercentIcon className="absolute left-2.5 top-[9px] h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="platform-fee" className="text-sm">Comissão de plataforma</Label>
                <div className="relative">
                  <Input
                    id="platform-fee"
                    type="number"
                    value={platformFeePercentage}
                    onChange={(e) => setPlatformFeePercentage(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    className="pl-7 mt-1 border-food-vanilla focus-visible:ring-food-coral"
                  />
                  <PercentIcon className="absolute left-2.5 top-[9px] h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="tax" className="text-sm">Impostos</Label>
                <div className="relative">
                  <Input
                    id="tax"
                    type="number"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    className="pl-7 mt-1 border-food-vanilla focus-visible:ring-food-coral"
                  />
                  <PercentIcon className="absolute left-2.5 top-[9px] h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-food-vanilla/30 rounded-b-xl">
          <Button
            className="w-full gap-2 bg-food-coral hover:bg-food-amber text-white transition-colors"
            onClick={handleSave}
            disabled={isLoading || isSaving}
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Salvando..." : "Salvar Precificação"}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="border rounded-xl shadow-soft bg-gradient-to-br from-food-white to-food-cream/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-poppins">
            <Calculator className="h-5 w-5 text-food-coral" />
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
                <div className="bg-food-vanilla/30 p-4 rounded-xl shadow-soft">
                  <div className="text-sm text-muted-foreground mb-1">Custo total unitário</div>
                  <div className="text-2xl font-semibold font-poppins">{formatCurrency(pricingResults.unitCost)}</div>
                </div>
                
                <div className="bg-food-green/20 border border-food-green/30 p-4 rounded-xl shadow-soft">
                  <div className="text-sm text-green-700 mb-1 flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    Preço ideal com margem
                  </div>
                  <div className="text-3xl font-semibold font-poppins text-green-800">{formatCurrency(pricingResults.sellingPrice)}</div>
                </div>
                
                <div className="bg-food-vanilla/30 p-4 rounded-xl shadow-soft">
                  <div className="text-sm text-muted-foreground mb-1">Preço com comissão</div>
                  <div className="text-2xl font-semibold font-poppins">{formatCurrency(pricingResults.priceWithCommission)}</div>
                </div>
                
                <div className="bg-food-amber/20 border border-food-amber/30 p-4 rounded-xl shadow-soft">
                  <div className="text-sm text-amber-700 mb-1">Preço final (com impostos)</div>
                  <div className="text-2xl font-semibold font-poppins text-amber-800">{formatCurrency(pricingResults.priceWithTaxes)}</div>
                </div>
                
                <div className="bg-food-green/10 p-4 rounded-xl shadow-soft">
                  <div className="text-sm text-muted-foreground mb-1">Lucro por unidade</div>
                  <div className="text-2xl font-semibold font-poppins text-green-600">{formatCurrency(pricingResults.unitProfit)}</div>
                </div>
                
                <div className={`p-4 rounded-xl shadow-soft ${
                  pricingResults.appliedMarkup > 30 
                    ? 'bg-food-green/20 border border-food-green/30' 
                    : pricingResults.appliedMarkup < 15
                      ? 'bg-food-red/20 border border-food-red/30'
                      : 'bg-food-vanilla border border-food-vanilla/50'
                }`}>
                  <div className="text-sm text-muted-foreground mb-1">Markup aplicado</div>
                  <div className="text-2xl font-semibold font-poppins">{formatPercentage(pricingResults.appliedMarkup)}</div>
                </div>
              </div>
              
              <div className="bg-food-amber/20 border border-food-amber/20 p-4 rounded-xl shadow-soft">
                <div className="text-sm text-amber-700 mb-1">Preço mínimo recomendado</div>
                <div className="text-xl font-semibold font-poppins text-amber-800">
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
