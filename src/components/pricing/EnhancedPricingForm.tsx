
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/calculations";
import { Calculator, DollarSign, TrendingUp, Percent, Target, AlertCircle } from "lucide-react";

interface EnhancedPricingFormProps {
  totalCost?: number;
  productName: string;
  productId: string;
  onPricingChange: (data: any) => void;
  initialData?: any;
}

export const EnhancedPricingForm: React.FC<EnhancedPricingFormProps> = ({
  totalCost = 0,
  productName,
  productId,
  onPricingChange,
  initialData
}) => {
  // Estados para custos base
  const [baseCost, setBaseCost] = useState(totalCost || 0);
  const [packagingCost, setPackagingCost] = useState(0);
  
  // Estados para custos indiretos
  const [laborCost, setLaborCost] = useState(0);
  const [laborCostType, setLaborCostType] = useState<'fixed' | 'percentage'>('fixed');
  const [overheadCost, setOverheadCost] = useState(0);
  const [overheadCostType, setOverheadCostType] = useState<'fixed' | 'percentage'>('fixed');
  const [marketingCost, setMarketingCost] = useState(0);
  const [marketingCostType, setMarketingCostType] = useState<'fixed' | 'percentage'>('fixed');
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [deliveryCostType, setDeliveryCostType] = useState<'fixed' | 'percentage'>('fixed');
  const [otherCosts, setOtherCosts] = useState(0);
  const [otherCostType, setOtherCostType] = useState<'fixed' | 'percentage'>('fixed');
  
  // Estados para configurações
  const [wastagePercentage, setWastagePercentage] = useState(5);
  const [targetMarginPercentage, setTargetMarginPercentage] = useState(30);
  const [platformFeePercentage, setPlatformFeePercentage] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(0);
  
  // Estados para preços
  const [sellingPrice, setSellingPrice] = useState(0);
  const [minimumPrice, setMinimumPrice] = useState(0);
  const [maximumPrice, setMaximumPrice] = useState(0);
  const [competitorPrice, setCompetitorPrice] = useState(0);
  const [notes, setNotes] = useState("");

  // Atualizar custo base quando totalCost mudar
  useEffect(() => {
    if (totalCost > 0) {
      setBaseCost(totalCost);
    }
  }, [totalCost]);

  // Carregar dados iniciais
  useEffect(() => {
    if (initialData) {
      setBaseCost(initialData.baseCost || totalCost || 0);
      setPackagingCost(initialData.packagingCost || 0);
      setLaborCost(initialData.laborCost || 0);
      setOverheadCost(initialData.overheadCost || 0);
      setMarketingCost(initialData.marketingCost || 0);
      setDeliveryCost(initialData.deliveryCost || 0);
      setOtherCosts(initialData.otherCosts || 0);
      setWastagePercentage(initialData.wastagePercentage || 5);
      setTargetMarginPercentage(initialData.targetMarginPercentage || 30);
      setPlatformFeePercentage(initialData.platformFeePercentage || 0);
      setTaxPercentage(initialData.taxPercentage || 0);
      setSellingPrice(initialData.sellingPrice || 0);
      setMinimumPrice(initialData.minimumPrice || 0);
      setMaximumPrice(initialData.maximumPrice || 0);
      setCompetitorPrice(initialData.competitorPrice || 0);
      setNotes(initialData.notes || "");
    }
  }, [initialData, totalCost]);

  // Função para calcular custo indireto
  const calculateIndirectCost = (value: number, type: 'fixed' | 'percentage', baseValue: number) => {
    return type === 'percentage' ? (baseValue * value) / 100 : value;
  };

  // Cálculos principais
  const productionCost = baseCost + packagingCost;
  
  const totalLaborCost = calculateIndirectCost(laborCost, laborCostType, productionCost);
  const totalOverheadCost = calculateIndirectCost(overheadCost, overheadCostType, productionCost);
  const totalMarketingCost = calculateIndirectCost(marketingCost, marketingCostType, productionCost);
  const totalDeliveryCost = calculateIndirectCost(deliveryCost, deliveryCostType, productionCost);
  const totalOtherCosts = calculateIndirectCost(otherCosts, otherCostType, productionCost);
  
  const totalIndirectCosts = totalLaborCost + totalOverheadCost + totalMarketingCost + totalDeliveryCost + totalOtherCosts;
  
  const costWithWastage = (productionCost + totalIndirectCosts) * (1 + wastagePercentage / 100);
  const idealPrice = costWithWastage * (1 + targetMarginPercentage / 100);
  const priceWithPlatformFee = idealPrice * (1 + platformFeePercentage / 100);
  const finalPrice = priceWithPlatformFee * (1 + taxPercentage / 100);
  
  const totalTaxes = totalIndirectCosts + (costWithWastage - productionCost) + (priceWithPlatformFee - idealPrice) + (finalPrice - priceWithPlatformFee);
  const profit = finalPrice - costWithWastage;

  // Notificar mudanças
  useEffect(() => {
    const pricingData = {
      baseCost,
      packagingCost,
      laborCost,
      overheadCost,
      marketingCost,
      deliveryCost,
      otherCosts,
      wastagePercentage,
      targetMarginPercentage,
      platformFeePercentage,
      taxPercentage,
      sellingPrice: finalPrice,
      minimumPrice,
      maximumPrice,
      competitorPrice,
      notes,
      calculations: {
        productionCost,
        totalIndirectCosts,
        costWithWastage,
        idealPrice,
        finalPrice,
        totalTaxes,
        profit
      }
    };
    
    onPricingChange(pricingData);
  }, [
    baseCost, packagingCost, laborCost, overheadCost, marketingCost, deliveryCost, otherCosts,
    wastagePercentage, targetMarginPercentage, platformFeePercentage, taxPercentage,
    minimumPrice, maximumPrice, competitorPrice, notes, onPricingChange
  ]);

  return (
    <div className="space-y-8">
      {/* Custo do Produto */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-blue-800">
            <DollarSign className="h-5 w-5" />
            Custo do Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="baseCost">Custo Total do Produto</Label>
              <Input
                id="baseCost"
                type="number"
                step="0.01"
                value={baseCost}
                onChange={(e) => setBaseCost(Number(e.target.value))}
                className="text-lg font-semibold"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Este valor é calculado automaticamente com base no produto selecionado
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center p-4 bg-white rounded-lg border">
                <p className="text-sm text-muted-foreground">Custo de Produção</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(productionCost)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custos Indiretos */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-purple-800">
            <Calculator className="h-5 w-5" />
            Custos Indiretos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            { label: "Custo de Mão de Obra", value: laborCost, setValue: setLaborCost, type: laborCostType, setType: setLaborCostType, total: totalLaborCost },
            { label: "Custos Administrativos", value: overheadCost, setValue: setOverheadCost, type: overheadCostType, setType: setOverheadCostType, total: totalOverheadCost },
            { label: "Custos de Marketing", value: marketingCost, setValue: setMarketingCost, type: marketingCostType, setType: setMarketingCostType, total: totalMarketingCost },
            { label: "Custos de Entrega", value: deliveryCost, setValue: setDeliveryCost, type: deliveryCostType, setType: setDeliveryCostType, total: totalDeliveryCost },
            { label: "Outros Custos", value: otherCosts, setValue: setOtherCosts, type: otherCostType, setType: setOtherCostType, total: totalOtherCosts }
          ].map((cost, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label>{cost.label}</Label>
              </div>
              <div>
                <Select value={cost.type} onValueChange={cost.setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">R$</SelectItem>
                    <SelectItem value="percentage">%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  type="number"
                  step="0.01"
                  value={cost.value}
                  onChange={(e) => cost.setValue(Number(e.target.value))}
                  placeholder={cost.type === 'percentage' ? "0%" : "R$ 0,00"}
                />
              </div>
              <div className="text-right">
                <p className="font-semibold text-purple-600">{formatCurrency(cost.total)}</p>
              </div>
            </div>
          ))}
          
          <Separator />
          
          <div className="flex justify-between items-center p-4 bg-white rounded-lg border">
            <span className="font-semibold">Total de Custos Indiretos:</span>
            <span className="text-xl font-bold text-purple-600">{formatCurrency(totalIndirectCosts)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Margem */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-green-800">
            <Target className="h-5 w-5" />
            Configurações de Precificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="wastage">Percentual de Desperdício (%)</Label>
              <Input
                id="wastage"
                type="number"
                step="0.1"
                value={wastagePercentage}
                onChange={(e) => setWastagePercentage(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="margin">Margem de Lucro Desejada (%)</Label>
              <Input
                id="margin"
                type="number"
                step="0.1"
                value={targetMarginPercentage}
                onChange={(e) => setTargetMarginPercentage(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="platformFee">Taxa da Plataforma (%)</Label>
              <Input
                id="platformFee"
                type="number"
                step="0.1"
                value={platformFeePercentage}
                onChange={(e) => setPlatformFeePercentage(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="tax">Impostos (%)</Label>
              <Input
                id="tax"
                type="number"
                step="0.1"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Final */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-amber-800">
            <TrendingUp className="h-5 w-5" />
            Resumo da Precificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-muted-foreground">Custo sem Taxas</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(productionCost)}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-muted-foreground">Total das Taxas</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(totalTaxes)}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-muted-foreground">Preço Final</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(finalPrice)}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-muted-foreground">Lucro</p>
              <p className="text-xl font-bold text-amber-600">{formatCurrency(profit)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análise Competitiva */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            Análise Competitiva (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="minPrice">Preço Mínimo</Label>
              <Input
                id="minPrice"
                type="number"
                step="0.01"
                value={minimumPrice}
                onChange={(e) => setMinimumPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="maxPrice">Preço Máximo</Label>
              <Input
                id="maxPrice"
                type="number"
                step="0.01"
                value={maximumPrice}
                onChange={(e) => setMaximumPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="competitorPrice">Preço do Concorrente</Label>
              <Input
                id="competitorPrice"
                type="number"
                step="0.01"
                value={competitorPrice}
                onChange={(e) => setCompetitorPrice(Number(e.target.value))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Observações</Label>
            <textarea
              id="notes"
              className="w-full p-3 border rounded-lg resize-none"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre a precificação..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
