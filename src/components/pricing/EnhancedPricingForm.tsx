
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calculator, Package, DollarSign, TrendingUp, Target, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/utils/calculations";

interface EnhancedPricingFormProps {
  totalCost: number;
  productName: string;
  productId: string;
  onPricingChange: (data: any) => void;
  initialData?: any;
}

export const EnhancedPricingForm: React.FC<EnhancedPricingFormProps> = ({
  totalCost,
  productName,
  productId,
  onPricingChange,
  initialData
}) => {
  const [productCost, setProductCost] = useState(totalCost || 0);
  const [baseCost, setBaseCost] = useState(0);
  const [packagingCost, setPackagingCost] = useState(0);
  const [laborCost, setLaborCost] = useState(0);
  const [overheadCost, setOverheadCost] = useState(0);
  const [marketingCost, setMarketingCost] = useState(0);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [otherCosts, setOtherCosts] = useState(0);
  const [laborCostType, setLaborCostType] = useState<'fixed' | 'percentage'>('fixed');
  const [overheadCostType, setOverheadCostType] = useState<'fixed' | 'percentage'>('fixed');
  const [marketingCostType, setMarketingCostType] = useState<'fixed' | 'percentage'>('fixed');
  const [deliveryCostType, setDeliveryCostType] = useState<'fixed' | 'percentage'>('fixed');
  const [otherCostType, setOtherCostType] = useState<'fixed' | 'percentage'>('fixed');
  const [wastagePercentage, setWastagePercentage] = useState(5);
  const [targetMarginPercentage, setTargetMarginPercentage] = useState(30);
  const [platformFeePercentage, setPlatformFeePercentage] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [minimumPrice, setMinimumPrice] = useState(0);
  const [maximumPrice, setMaximumPrice] = useState(0);
  const [competitorPrice, setCompetitorPrice] = useState(0);
  const [notes, setNotes] = useState("");

  // Initialize form with product cost and initial data
  useEffect(() => {
    console.log('EnhancedPricingForm - Initializing with totalCost:', totalCost);
    console.log('EnhancedPricingForm - Initial data:', initialData);
    
    if (totalCost > 0) {
      setProductCost(totalCost);
      setBaseCost(totalCost);
    }

    if (initialData) {
      setProductCost(initialData.productCost || totalCost || 0);
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
  }, [totalCost, initialData]);

  // Update productCost when totalCost changes
  useEffect(() => {
    if (totalCost > 0) {
      console.log('EnhancedPricingForm - Updating productCost from totalCost:', totalCost);
      setProductCost(totalCost);
      if (!initialData || baseCost === 0) {
        setBaseCost(totalCost);
      }
    }
  }, [totalCost]);

  const calculateActualLaborCost = () => {
    if (laborCostType === 'percentage') {
      return (productCost * laborCost) / 100;
    }
    return laborCost;
  };

  const calculateActualOverheadCost = () => {
    if (overheadCostType === 'percentage') {
      return (productCost * overheadCost) / 100;
    }
    return overheadCost;
  };

  const calculateActualMarketingCost = () => {
    if (marketingCostType === 'percentage') {
      return (productCost * marketingCost) / 100;
    }
    return marketingCost;
  };

  const calculateActualDeliveryCost = () => {
    if (deliveryCostType === 'percentage') {
      return (productCost * deliveryCost) / 100;
    }
    return deliveryCost;
  };

  const calculateActualOtherCost = () => {
    if (otherCostType === 'percentage') {
      return (productCost * otherCosts) / 100;
    }
    return otherCosts;
  };

  const productionCost = baseCost + packagingCost;
  const totalIndirectCosts = calculateActualLaborCost() + calculateActualOverheadCost() + 
                           calculateActualMarketingCost() + calculateActualDeliveryCost() + 
                           calculateActualOtherCost();
  const costWithWastage = (productionCost + totalIndirectCosts) * (1 + wastagePercentage / 100);
  const idealPrice = costWithWastage * (1 + targetMarginPercentage / 100);
  const priceWithPlatformFee = idealPrice * (1 + platformFeePercentage / 100);
  const finalPrice = priceWithPlatformFee * (1 + taxPercentage / 100);
  const profit = finalPrice - costWithWastage;
  const actualMargin = costWithWastage > 0 ? ((profit / costWithWastage) * 100) : 0;

  // Emit pricing changes
  useEffect(() => {
    const pricingData = {
      productId,
      productCost,
      baseCost,
      packagingCost,
      laborCost: calculateActualLaborCost(),
      overheadCost: calculateActualOverheadCost(),
      marketingCost: calculateActualMarketingCost(),
      deliveryCost: calculateActualDeliveryCost(),
      otherCosts: calculateActualOtherCost(),
      wastagePercentage,
      targetMarginPercentage,
      platformFeePercentage,
      taxPercentage,
      productionCost,
      totalIndirectCosts,
      costWithWastage,
      idealPrice,
      priceWithPlatformFee,
      finalPrice,
      profit,
      actualMargin,
      sellingPrice,
      minimumPrice,
      maximumPrice,
      competitorPrice,
      notes
    };
    
    onPricingChange(pricingData);
  }, [
    productId, productCost, baseCost, packagingCost, laborCost, overheadCost, 
    marketingCost, deliveryCost, otherCosts, wastagePercentage, targetMarginPercentage,
    platformFeePercentage, taxPercentage, sellingPrice, minimumPrice, maximumPrice,
    competitorPrice, notes, laborCostType, overheadCostType, marketingCostType,
    deliveryCostType, otherCostType
  ]);

  return (
    <div className="space-y-6">
      {/* Product Cost Section */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Package className="h-6 w-6 text-blue-600" />
            Custo do Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Custo Total do Produto</Label>
              <div className="mt-2 p-4 bg-white rounded-lg border-2 border-blue-200">
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(productCost)}
                </p>
                <p className="text-sm text-gray-600">Custo base calculado automaticamente</p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="baseCost">Custo Base de Produção</Label>
              <Input
                id="baseCost"
                type="number"
                step="0.01"
                min="0"
                value={baseCost}
                onChange={(e) => setBaseCost(Number(e.target.value))}
                className="mt-2"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="packagingCost">Custo de Embalagem</Label>
            <Input
              id="packagingCost"
              type="number"
              step="0.01"
              min="0"
              value={packagingCost}
              onChange={(e) => setPackagingCost(Number(e.target.value))}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Indirect Costs Section */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <DollarSign className="h-6 w-6 text-purple-600" />
            Custos Indiretos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="laborCost">Custo de Mão de Obra</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="laborCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={laborCost}
                  onChange={(e) => setLaborCost(Number(e.target.value))}
                  className="mt-2 flex-1"
                />
                <select
                  value={laborCostType}
                  onChange={(e) => setLaborCostType(e.target.value as 'fixed' | 'percentage')}
                  className="mt-2 p-2 border rounded"
                >
                  <option value="fixed">R$ Fixo</option>
                  <option value="percentage">% Custo</option>
                </select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="overheadCost">Custos Gerais (Aluguel, etc)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="overheadCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={overheadCost}
                  onChange={(e) => setOverheadCost(Number(e.target.value))}
                  className="mt-2 flex-1"
                />
                <select
                  value={overheadCostType}
                  onChange={(e) => setOverheadCostType(e.target.value as 'fixed' | 'percentage')}
                  className="mt-2 p-2 border rounded"
                >
                  <option value="fixed">R$ Fixo</option>
                  <option value="percentage">% Custo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="marketingCost">Marketing e Divulgação</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="marketingCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={marketingCost}
                  onChange={(e) => setMarketingCost(Number(e.target.value))}
                  className="mt-2 flex-1"
                />
                <select
                  value={marketingCostType}
                  onChange={(e) => setMarketingCostType(e.target.value as 'fixed' | 'percentage')}
                  className="mt-2 p-2 border rounded"
                >
                  <option value="fixed">R$ Fixo</option>
                  <option value="percentage">% Custo</option>
                </select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="deliveryCost">Entrega e Frete</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="deliveryCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={deliveryCost}
                  onChange={(e) => setDeliveryCost(Number(e.target.value))}
                  className="mt-2 flex-1"
                />
                <select
                  value={deliveryCostType}
                  onChange={(e) => setDeliveryCostType(e.target.value as 'fixed' | 'percentage')}
                  className="mt-2 p-2 border rounded"
                >
                  <option value="fixed">R$ Fixo</option>
                  <option value="percentage">% Custo</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="otherCosts">Outros Custos</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="otherCosts"
                type="number"
                step="0.01"
                min="0"
                value={otherCosts}
                onChange={(e) => setOtherCosts(Number(e.target.value))}
                className="mt-2 flex-1"
              />
              <select
                value={otherCostType}
                onChange={(e) => setOtherCostType(e.target.value as 'fixed' | 'percentage')}
                className="mt-2 p-2 border rounded"
              >
                <option value="fixed">R$ Fixo</option>
                <option value="percentage">% Custo</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Margins and Fees Section */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Calculator className="h-6 w-6 text-orange-600" />
            Margens e Taxas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="wastagePercentage">Desperdício (%)</Label>
              <Input
                id="wastagePercentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={wastagePercentage}
                onChange={(e) => setWastagePercentage(Number(e.target.value))}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="targetMarginPercentage">Margem de Lucro Alvo (%)</Label>
              <Input
                id="targetMarginPercentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={targetMarginPercentage}
                onChange={(e) => setTargetMarginPercentage(Number(e.target.value))}
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="platformFeePercentage">Taxa da Plataforma (%)</Label>
              <Input
                id="platformFeePercentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={platformFeePercentage}
                onChange={(e) => setPlatformFeePercentage(Number(e.target.value))}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="taxPercentage">Impostos (%)</Label>
              <Input
                id="taxPercentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(Number(e.target.value))}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Summary */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <TrendingUp className="h-6 w-6 text-green-600" />
            Resumo de Custos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(productionCost)}
              </div>
              <div className="text-sm text-gray-600">Custo de Produção</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(totalIndirectCosts)}
              </div>
              <div className="text-sm text-gray-600">Custos Indiretos</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(costWithWastage)}
              </div>
              <div className="text-sm text-gray-600">Custo + Desperdício</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(finalPrice)}
              </div>
              <div className="text-sm text-gray-600">Preço Final</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Strategy */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Target className="h-6 w-6 text-indigo-600" />
            Estratégia de Preços
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="minimumPrice">Preço Mínimo</Label>
              <Input
                id="minimumPrice"
                type="number"
                step="0.01"
                min="0"
                value={minimumPrice}
                onChange={(e) => setMinimumPrice(Number(e.target.value))}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="sellingPrice">Preço de Venda Desejado</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                min="0"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="maximumPrice">Preço Máximo</Label>
              <Input
                id="maximumPrice"
                type="number"
                step="0.01"
                min="0"
                value={maximumPrice}
                onChange={(e) => setMaximumPrice(Number(e.target.value))}
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="competitorPrice">Preço da Concorrência</Label>
            <Input
              id="competitorPrice"
              type="number"
              step="0.01"
              min="0"
              value={competitorPrice}
              onChange={(e) => setCompetitorPrice(Number(e.target.value))}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre a estratégia de preços..."
              className="mt-2"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Profit Analysis */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
            Análise de Lucro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(profit)}
              </div>
              <div className="text-sm text-gray-600">Lucro por Unidade</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {actualMargin.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Margem Real</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
              <div className="text-lg font-bold text-purple-600">
                {actualMargin >= targetMarginPercentage ? (
                  <span className="text-green-600">✓ Meta Atingida</span>
                ) : (
                  <span className="text-red-600">⚠ Abaixo da Meta</span>
                )}
              </div>
              <div className="text-sm text-gray-600">Status da Margem</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
