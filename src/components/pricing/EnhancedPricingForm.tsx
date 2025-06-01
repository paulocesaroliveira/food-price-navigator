
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

interface CostField {
  value: number;
  type: 'fixed' | 'percentage';
}

interface PricingFormData {
  totalProductCost: number;
  laborCost: CostField;
  overheadCost: CostField;
  marketingCost: CostField;
  deliveryCost: CostField;
  otherCosts: CostField;
  wastagePercentage: number;
  targetMarginPercentage: number;
  sellingPrice: number;
  platformFeePercentage: number;
  cardFeePercentage: number;
  taxPercentage: number;
  notes: string;
}

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
  const [formData, setFormData] = useState<PricingFormData>({
    totalProductCost: totalCost || 0,
    laborCost: { value: 0, type: 'fixed' },
    overheadCost: { value: 0, type: 'fixed' },
    marketingCost: { value: 0, type: 'fixed' },
    deliveryCost: { value: 0, type: 'fixed' },
    otherCosts: { value: 0, type: 'fixed' },
    wastagePercentage: 5,
    targetMarginPercentage: 30,
    sellingPrice: 0,
    platformFeePercentage: 0,
    cardFeePercentage: 3,
    taxPercentage: 0,
    notes: "",
  });

  const [editMode, setEditMode] = useState<'margin' | 'price'>('margin');

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        totalProductCost: totalCost || initialData.baseCost || 0,
        laborCost: { 
          value: initialData.laborCost || 0, 
          type: initialData.laborCostType || 'fixed' 
        },
        overheadCost: { 
          value: initialData.overheadCost || 0, 
          type: initialData.overheadCostType || 'fixed' 
        },
        marketingCost: { 
          value: initialData.marketingCost || 0, 
          type: initialData.marketingCostType || 'fixed' 
        },
        deliveryCost: { 
          value: initialData.deliveryCost || 0, 
          type: initialData.deliveryCostType || 'fixed' 
        },
        otherCosts: { 
          value: initialData.otherCosts || 0, 
          type: initialData.otherCostType || 'fixed' 
        },
        wastagePercentage: initialData.wastagePercentage || 5,
        targetMarginPercentage: initialData.targetMarginPercentage || 30,
        sellingPrice: initialData.sellingPrice || 0,
        platformFeePercentage: initialData.platformFeePercentage || 0,
        cardFeePercentage: initialData.cardFeePercentage || 3,
        taxPercentage: initialData.taxPercentage || 0,
        notes: initialData.notes || "",
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        totalProductCost: totalCost || 0
      }));
    }
  }, [totalCost, initialData]);

  const calculateCostValue = (cost: CostField, baseCost: number): number => {
    if (cost.type === 'percentage') {
      return baseCost * (cost.value / 100);
    }
    return cost.value;
  };

  const calculateResults = () => {
    const baseCost = formData.totalProductCost;
    
    const laborCostValue = calculateCostValue(formData.laborCost, baseCost);
    const overheadCostValue = calculateCostValue(formData.overheadCost, baseCost);
    const marketingCostValue = calculateCostValue(formData.marketingCost, baseCost);
    const deliveryCostValue = calculateCostValue(formData.deliveryCost, baseCost);
    const otherCostsValue = calculateCostValue(formData.otherCosts, baseCost);
    
    const totalIndirectCosts = laborCostValue + overheadCostValue + marketingCostValue + deliveryCostValue + otherCostsValue;
    const totalCostBeforeWastage = baseCost + totalIndirectCosts;
    const totalCostWithWastage = totalCostBeforeWastage * (1 + formData.wastagePercentage / 100);
    
    let sellingPrice = formData.sellingPrice;
    let marginPercentage = formData.targetMarginPercentage;
    
    if (editMode === 'price' && sellingPrice > 0) {
      marginPercentage = ((sellingPrice - totalCostWithWastage) / sellingPrice) * 100;
    } else if (editMode === 'margin' && marginPercentage > 0) {
      sellingPrice = totalCostWithWastage / (1 - marginPercentage / 100);
    }
    
    const finalPrice = sellingPrice * (1 + formData.platformFeePercentage / 100) * (1 + formData.cardFeePercentage / 100) * (1 + formData.taxPercentage / 100);
    const profit = sellingPrice - totalCostWithWastage;
    const profitMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
    
    return {
      baseCost,
      totalIndirectCosts,
      totalCostWithWastage,
      sellingPrice,
      finalPrice,
      profit,
      marginPercentage,
      profitMargin,
      laborCostValue,
      overheadCostValue,
      marketingCostValue,
      deliveryCostValue,
      otherCostsValue
    };
  };

  const results = calculateResults();

  useEffect(() => {
    const dataToSend = {
      name: productName,
      product_id: productId,
      baseCost: formData.totalProductCost,
      base_cost: formData.totalProductCost,
      packagingCost: 0,
      packaging_cost: 0,
      laborCost: calculateCostValue(formData.laborCost, formData.totalProductCost),
      labor_cost: calculateCostValue(formData.laborCost, formData.totalProductCost),
      overheadCost: calculateCostValue(formData.overheadCost, formData.totalProductCost),
      overhead_cost: calculateCostValue(formData.overheadCost, formData.totalProductCost),
      marketingCost: calculateCostValue(formData.marketingCost, formData.totalProductCost),
      marketing_cost: calculateCostValue(formData.marketingCost, formData.totalProductCost),
      deliveryCost: calculateCostValue(formData.deliveryCost, formData.totalProductCost),
      delivery_cost: calculateCostValue(formData.deliveryCost, formData.totalProductCost),
      otherCosts: calculateCostValue(formData.otherCosts, formData.totalProductCost),
      other_costs: calculateCostValue(formData.otherCosts, formData.totalProductCost),
      laborCostType: formData.laborCost.type,
      overheadCostType: formData.overheadCost.type,
      marketingCostType: formData.marketingCost.type,
      deliveryCostType: formData.deliveryCost.type,
      otherCostType: formData.otherCosts.type,
      wastagePercentage: formData.wastagePercentage,
      wastage_percentage: formData.wastagePercentage,
      targetMarginPercentage: formData.targetMarginPercentage,
      target_margin_percentage: formData.targetMarginPercentage,
      margin_percentage: formData.targetMarginPercentage,
      sellingPrice: formData.sellingPrice,
      platformFeePercentage: formData.platformFeePercentage,
      platform_fee_percentage: formData.platformFeePercentage,
      cardFeePercentage: formData.cardFeePercentage,
      card_fee_percentage: formData.cardFeePercentage,
      taxPercentage: formData.taxPercentage,
      tax_percentage: formData.taxPercentage,
      notes: formData.notes,
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
  }, [formData, onPricingChange, productName, productId, results]);

  const handleInputChange = (field: keyof PricingFormData, value: any) => {
    console.log(`Updating ${field} with value:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCostFieldValueChange = (field: keyof Pick<PricingFormData, 'laborCost' | 'overheadCost' | 'marketingCost' | 'deliveryCost' | 'otherCosts'>, value: number) => {
    console.log(`Updating ${field} value with:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value: value
      }
    }));
  };

  const handleCostFieldTypeChange = (field: keyof Pick<PricingFormData, 'laborCost' | 'overheadCost' | 'marketingCost' | 'deliveryCost' | 'otherCosts'>, type: 'fixed' | 'percentage') => {
    console.log(`Updating ${field} type with:`, type);
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        type: type
      }
    }));
  };

  const handleSellingPriceChange = (value: number) => {
    console.log('Updating selling price:', value);
    setEditMode('price');
    setFormData(prev => ({ ...prev, sellingPrice: value }));
  };

  const handleMarginChange = (value: number) => {
    console.log('Updating margin:', value);
    setEditMode('margin');
    setFormData(prev => ({ ...prev, targetMarginPercentage: value }));
  };

  const CostFieldInput = ({ 
    label, 
    field, 
    baseCost 
  }: { 
    label: string; 
    field: keyof Pick<PricingFormData, 'laborCost' | 'overheadCost' | 'marketingCost' | 'deliveryCost' | 'otherCosts'>;
    baseCost: number;
  }) => {
    const cost = formData[field];
    const calculatedValue = calculateCostValue(cost, baseCost);
    
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex gap-2">
          <Select 
            value={cost.type} 
            onValueChange={(value: 'fixed' | 'percentage') => handleCostFieldTypeChange(field, value)}
          >
            <SelectTrigger className="w-20 bg-white border border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
              <SelectItem value="fixed">R$</SelectItem>
              <SelectItem value="percentage">%</SelectItem>
            </SelectContent>
          </Select>
          {cost.type === 'fixed' ? (
            <CurrencyInput
              value={cost.value}
              onValueChange={(value) => handleCostFieldValueChange(field, value)}
              className="flex-1"
              placeholder="Valor em reais"
            />
          ) : (
            <Input
              type="number"
              step="0.01"
              value={cost.value}
              onChange={(e) => handleCostFieldValueChange(field, parseFloat(e.target.value) || 0)}
              className="flex-1"
              placeholder="Porcentagem"
            />
          )}
        </div>
        {cost.type === 'percentage' && cost.value > 0 && (
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
              {formatCurrency(formData.totalProductCost)}
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
            <CostFieldInput label="Custo de Mão de Obra" field="laborCost" baseCost={formData.totalProductCost} />
            <CostFieldInput label="Custos Administrativos" field="overheadCost" baseCost={formData.totalProductCost} />
            <CostFieldInput label="Custos de Marketing" field="marketingCost" baseCost={formData.totalProductCost} />
            <CostFieldInput label="Custos de Entrega" field="deliveryCost" baseCost={formData.totalProductCost} />
            <CostFieldInput label="Outros Custos" field="otherCosts" baseCost={formData.totalProductCost} />
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
                value={formData.wastagePercentage}
                onChange={(e) => handleInputChange('wastagePercentage', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Taxa da Plataforma (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.platformFeePercentage}
                onChange={(e) => handleInputChange('platformFeePercentage', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Taxa de Cartão (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.cardFeePercentage}
                onChange={(e) => handleInputChange('cardFeePercentage', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Impostos (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.taxPercentage}
                onChange={(e) => handleInputChange('taxPercentage', parseFloat(e.target.value) || 0)}
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
                value={editMode === 'margin' ? formData.targetMarginPercentage : results.marginPercentage.toFixed(2)}
                onChange={(e) => handleMarginChange(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor de Venda (R$)</Label>
              <CurrencyInput
                value={editMode === 'price' ? formData.sellingPrice : results.sellingPrice}
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
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
};
