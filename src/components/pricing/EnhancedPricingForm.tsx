
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, DollarSign, Target, AlertCircle } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/utils/calculations";
import { CurrencyInput } from "@/components/ui/currency-input";

interface EnhancedPricingFormProps {
  initialData?: any;
  onPricingChange: (data: any) => void;
  totalCost: number;
  productName: string;
  productId: string;
}

export const EnhancedPricingForm: React.FC<EnhancedPricingFormProps> = ({
  initialData,
  onPricingChange,
  totalCost,
  productName,
  productId
}) => {
  // Estados individuais para cada campo
  const [baseCost, setBaseCost] = useState(totalCost || 0);
  
  // Custos indiretos com tipo
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
  
  // Parâmetros
  const [wastagePercentage, setWastagePercentage] = useState(5);
  const [targetMarginPercentage, setTargetMarginPercentage] = useState(30);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [platformFeePercentage, setPlatformFeePercentage] = useState(0);
  const [cardFeePercentage, setCardFeePercentage] = useState(3);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [notes, setNotes] = useState("");
  
  // Controle de modo de edição
  const [editMode, setEditMode] = useState<'margin' | 'price'>('margin');

  // Inicializar dados
  useEffect(() => {
    if (initialData) {
      setLaborCost(initialData.laborCost || 0);
      setOverheadCost(initialData.overheadCost || 0);
      setMarketingCost(initialData.marketingCost || 0);
      setDeliveryCost(initialData.deliveryCost || 0);
      setOtherCosts(initialData.otherCosts || 0);
      setWastagePercentage(initialData.wastagePercentage || 5);
      setTargetMarginPercentage(initialData.targetMarginPercentage || 30);
      setSellingPrice(initialData.sellingPrice || 0);
      setPlatformFeePercentage(initialData.platformFeePercentage || 0);
      setCardFeePercentage(initialData.cardFeePercentage || 3);
      setTaxPercentage(initialData.taxPercentage || 0);
      setNotes(initialData.notes || "");
    }
    setBaseCost(totalCost || 0);
  }, [totalCost, initialData]);

  // Função para calcular valor baseado no tipo
  const calculateCostValue = (cost: number, type: 'fixed' | 'percentage', baseValue: number): number => {
    if (type === 'percentage') {
      return baseValue * (cost / 100);
    }
    return cost;
  };

  // Calcular resultados
  const calculateResults = () => {
    const laborCostValue = calculateCostValue(laborCost, laborCostType, baseCost);
    const overheadCostValue = calculateCostValue(overheadCost, overheadCostType, baseCost);
    const marketingCostValue = calculateCostValue(marketingCost, marketingCostType, baseCost);
    const deliveryCostValue = calculateCostValue(deliveryCost, deliveryCostType, baseCost);
    const otherCostsValue = calculateCostValue(otherCosts, otherCostType, baseCost);
    
    const totalIndirectCosts = laborCostValue + overheadCostValue + marketingCostValue + deliveryCostValue + otherCostsValue;
    const totalCostBeforeWastage = baseCost + totalIndirectCosts;
    const totalCostWithWastage = totalCostBeforeWastage * (1 + wastagePercentage / 100);
    
    let calculatedSellingPrice = sellingPrice;
    let calculatedMargin = targetMarginPercentage;
    
    if (editMode === 'price' && sellingPrice > 0) {
      calculatedMargin = ((sellingPrice - totalCostWithWastage) / sellingPrice) * 100;
    } else if (editMode === 'margin' && targetMarginPercentage > 0) {
      calculatedSellingPrice = totalCostWithWastage / (1 - targetMarginPercentage / 100);
    }
    
    const finalPrice = calculatedSellingPrice * (1 + platformFeePercentage / 100) * (1 + cardFeePercentage / 100) * (1 + taxPercentage / 100);
    const profit = calculatedSellingPrice - totalCostWithWastage;
    const profitMargin = calculatedSellingPrice > 0 ? (profit / calculatedSellingPrice) * 100 : 0;
    
    return {
      baseCost,
      totalIndirectCosts,
      totalCostWithWastage,
      sellingPrice: calculatedSellingPrice,
      finalPrice,
      profit,
      marginPercentage: calculatedMargin,
      profitMargin,
      laborCostValue,
      overheadCostValue,
      marketingCostValue,
      deliveryCostValue,
      otherCostsValue
    };
  };

  const results = calculateResults();

  // Notificar mudanças para o componente pai
  useEffect(() => {
    const dataToSend = {
      name: productName,
      product_id: productId,
      baseCost: baseCost,
      base_cost: baseCost,
      packagingCost: 0,
      packaging_cost: 0,
      laborCost: calculateCostValue(laborCost, laborCostType, baseCost),
      labor_cost: calculateCostValue(laborCost, laborCostType, baseCost),
      overheadCost: calculateCostValue(overheadCost, overheadCostType, baseCost),
      overhead_cost: calculateCostValue(overheadCost, overheadCostType, baseCost),
      marketingCost: calculateCostValue(marketingCost, marketingCostType, baseCost),
      marketing_cost: calculateCostValue(marketingCost, marketingCostType, baseCost),
      deliveryCost: calculateCostValue(deliveryCost, deliveryCostType, baseCost),
      delivery_cost: calculateCostValue(deliveryCost, deliveryCostType, baseCost),
      otherCosts: calculateCostValue(otherCosts, otherCostType, baseCost),
      other_costs: calculateCostValue(otherCosts, otherCostType, baseCost),
      laborCostType: laborCostType,
      overheadCostType: overheadCostType,
      marketingCostType: marketingCostType,
      deliveryCostType: deliveryCostType,
      otherCostType: otherCostType,
      wastagePercentage: wastagePercentage,
      wastage_percentage: wastagePercentage,
      targetMarginPercentage: targetMarginPercentage,
      target_margin_percentage: targetMarginPercentage,
      margin_percentage: targetMarginPercentage,
      sellingPrice: results.sellingPrice,
      platformFeePercentage: platformFeePercentage,
      platform_fee_percentage: platformFeePercentage,
      cardFeePercentage: cardFeePercentage,
      card_fee_percentage: cardFeePercentage,
      taxPercentage: taxPercentage,
      tax_percentage: taxPercentage,
      notes: notes,
      calculatedSellingPrice: results.sellingPrice,
      calculatedFinalPrice: results.finalPrice,
      calculatedProfit: results.profit,
      calculatedMargin: results.profitMargin,
      total_unit_cost: results.totalCostWithWastage,
      ideal_price: results.sellingPrice,
      final_price: results.finalPrice,
      unit_profit: results.profit,
      actual_margin: results.profitMargin,
      minimum_price: 0,
      maximum_price: 0,
      competitor_price: 0
    };
    onPricingChange(dataToSend);
  }, [
    productName, productId, baseCost, laborCost, laborCostType, overheadCost, overheadCostType,
    marketingCost, marketingCostType, deliveryCost, deliveryCostType, otherCosts, otherCostType,
    wastagePercentage, targetMarginPercentage, sellingPrice, platformFeePercentage, cardFeePercentage,
    taxPercentage, notes, editMode, results, onPricingChange
  ]);

  // Handlers para mudanças de preço e margem
  const handleSellingPriceChange = (value: number) => {
    setEditMode('price');
    setSellingPrice(value);
  };

  const handleMarginChange = (value: number) => {
    setEditMode('margin');
    setTargetMarginPercentage(value);
  };

  // Componente para campo de custo
  const CostFieldInput = ({ 
    label, 
    cost, 
    costType, 
    onCostChange, 
    onTypeChange 
  }: { 
    label: string; 
    cost: number;
    costType: 'fixed' | 'percentage';
    onCostChange: (value: number) => void;
    onTypeChange: (type: 'fixed' | 'percentage') => void;
  }) => {
    const calculatedValue = calculateCostValue(cost, costType, baseCost);
    
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex gap-2">
          <Select value={costType} onValueChange={onTypeChange}>
            <SelectTrigger className="w-20 bg-white border border-gray-300 z-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
              <SelectItem value="fixed">R$</SelectItem>
              <SelectItem value="percentage">%</SelectItem>
            </SelectContent>
          </Select>
          {costType === 'fixed' ? (
            <CurrencyInput
              value={cost}
              onValueChange={onCostChange}
              className="flex-1"
              placeholder="Valor em reais"
            />
          ) : (
            <Input
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => onCostChange(parseFloat(e.target.value) || 0)}
              className="flex-1"
              placeholder="Porcentagem"
            />
          )}
        </div>
        {costType === 'percentage' && cost > 0 && (
          <div className="text-xs text-muted-foreground">
            = {formatCurrency(calculatedValue)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Nome da Precificação */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-gray-800">
            <Calculator className="h-6 w-6" />
            Produto: {productName}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Custo do Produto */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-blue-800">
            <DollarSign className="h-6 w-6" />
            Custo do Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Custo Total do Produto</Label>
            <div className="text-2xl font-bold text-blue-800">
              {formatCurrency(baseCost)}
            </div>
            <p className="text-xs text-muted-foreground">
              Este valor é calculado automaticamente com base no produto selecionado
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Custos Indiretos */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-purple-800">
            <Target className="h-6 w-6" />
            Custos Indiretos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CostFieldInput 
              label="Custo de Mão de Obra" 
              cost={laborCost}
              costType={laborCostType}
              onCostChange={setLaborCost}
              onTypeChange={setLaborCostType}
            />
            <CostFieldInput 
              label="Custos Administrativos" 
              cost={overheadCost}
              costType={overheadCostType}
              onCostChange={setOverheadCost}
              onTypeChange={setOverheadCostType}
            />
            <CostFieldInput 
              label="Custos de Marketing" 
              cost={marketingCost}
              costType={marketingCostType}
              onCostChange={setMarketingCost}
              onTypeChange={setMarketingCostType}
            />
            <CostFieldInput 
              label="Custos de Entrega" 
              cost={deliveryCost}
              costType={deliveryCostType}
              onCostChange={setDeliveryCost}
              onTypeChange={setDeliveryCostType}
            />
            <CostFieldInput 
              label="Outros Custos" 
              cost={otherCosts}
              costType={otherCostType}
              onCostChange={setOtherCosts}
              onTypeChange={setOtherCostType}
            />
          </div>
          <div className="bg-purple-200 p-3 rounded-lg">
            <span className="font-semibold text-purple-800">Total Custos Indiretos: {formatCurrency(results.totalIndirectCosts)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Parâmetros de Precificação */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-green-800">
            <Target className="h-6 w-6" />
            Parâmetros de Precificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Desperdício (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={wastagePercentage}
                onChange={(e) => setWastagePercentage(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Taxa da Plataforma (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={platformFeePercentage}
                onChange={(e) => setPlatformFeePercentage(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Taxa de Cartão (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={cardFeePercentage}
                onChange={(e) => setCardFeePercentage(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Impostos (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Margem Desejada (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={editMode === 'margin' ? targetMarginPercentage : results.marginPercentage.toFixed(2)}
                onChange={(e) => handleMarginChange(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor de Venda (R$)</Label>
              <CurrencyInput
                value={editMode === 'price' ? sellingPrice : results.sellingPrice}
                onValueChange={handleSellingPriceChange}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Você pode definir a margem desejada OU o valor de venda. O outro campo será calculado automaticamente.
          </p>
        </CardContent>
      </Card>

      {/* Resultado da Precificação */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">Resultado da Precificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-100 p-6 rounded-xl text-center border-l-4 border-blue-500">
              <p className="text-sm text-blue-600 font-medium mb-1">Custo Total</p>
              <p className="text-2xl font-bold text-blue-800">{formatCurrency(results.totalCostWithWastage)}</p>
              <p className="text-xs text-blue-600 mt-1">Com desperdício</p>
            </div>
            <div className="bg-green-100 p-6 rounded-xl text-center border-l-4 border-green-500">
              <p className="text-sm text-green-600 font-medium mb-1">Preço de Venda</p>
              <p className="text-2xl font-bold text-green-800">{formatCurrency(results.sellingPrice)}</p>
              <p className="text-xs text-green-600 mt-1">Sem taxas</p>
            </div>
            <div className="bg-purple-100 p-6 rounded-xl text-center border-l-4 border-purple-500">
              <p className="text-sm text-purple-600 font-medium mb-1">Preço Final</p>
              <p className="text-2xl font-bold text-purple-800">{formatCurrency(results.finalPrice)}</p>
              <p className="text-xs text-purple-600 mt-1">Com todas as taxas</p>
            </div>
            <div className="bg-orange-100 p-6 rounded-xl text-center border-l-4 border-orange-500">
              <p className="text-sm text-orange-600 font-medium mb-1">Lucro</p>
              <p className="text-2xl font-bold text-orange-800">{formatCurrency(results.profit)}</p>
              <p className="text-xs text-orange-600 mt-1">Por unidade</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-gray-600 mb-1">Margem de Lucro</p>
              <p className="text-lg font-bold text-gray-800">{formatPercentage(results.profitMargin)}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-gray-600 mb-1">Markup</p>
              <p className="text-lg font-bold text-gray-800">{formatPercentage((results.sellingPrice / results.totalCostWithWastage - 1) * 100)}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-gray-600 mb-1">ROI</p>
              <p className="text-lg font-bold text-gray-800">{formatPercentage((results.profit / results.totalCostWithWastage) * 100)}</p>
            </div>
          </div>

          {results.profitMargin < 15 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Margem de lucro baixa (menor que 15%)</span>
            </div>
          )}
          {results.profit < 0 && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Prejuízo! O preço de venda está abaixo do custo total</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Observações */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Adicione observações sobre esta precificação..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
};
