import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, DollarSign, Target, AlertCircle } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/utils/calculations";
import { CurrencyInput } from "@/components/ui/currency-input";
import { usePercentageMask } from "@/hooks/usePercentageMask";

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
  // Estados básicos
  const [formData, setFormData] = useState(() => ({
    baseCost: totalCost || 0,
    laborCost: initialData?.laborCost || 0,
    laborCostType: (initialData?.laborCostType || 'fixed') as 'fixed' | 'percentage',
    overheadCost: initialData?.overheadCost || 0,
    overheadCostType: (initialData?.overheadCostType || 'fixed') as 'fixed' | 'percentage',
    marketingCost: initialData?.marketingCost || 0,
    marketingCostType: (initialData?.marketingCostType || 'fixed') as 'fixed' | 'percentage',
    deliveryCost: initialData?.deliveryCost || 0,
    deliveryCostType: (initialData?.deliveryCostType || 'fixed') as 'fixed' | 'percentage',
    otherCosts: initialData?.otherCosts || 0,
    otherCostType: (initialData?.otherCostType || 'fixed') as 'fixed' | 'percentage',
    wastagePercentage: initialData?.wastagePercentage || 5,
    targetMarginPercentage: initialData?.targetMarginPercentage || 30,
    sellingPrice: initialData?.sellingPrice || 0,
    platformFeePercentage: initialData?.platformFeePercentage || 0,
    cardFeePercentage: initialData?.cardFeePercentage || 3,
    taxPercentage: initialData?.taxPercentage || 0,
    notes: initialData?.notes || "",
    editMode: 'margin' as 'margin' | 'price'
  }));

  // Hooks para máscaras de porcentagem
  const wastagePercentageMask = usePercentageMask(formData.wastagePercentage);
  const targetMarginMask = usePercentageMask(formData.targetMarginPercentage);
  const platformFeeMask = usePercentageMask(formData.platformFeePercentage);
  const cardFeeMask = usePercentageMask(formData.cardFeePercentage);
  const taxPercentageMask = usePercentageMask(formData.taxPercentage);

  // Máscaras dinâmicas para custos indiretos
  const laborPercentageMask = usePercentageMask(formData.laborCostType === 'percentage' ? formData.laborCost : 0);
  const overheadPercentageMask = usePercentageMask(formData.overheadCostType === 'percentage' ? formData.overheadCost : 0);
  const marketingPercentageMask = usePercentageMask(formData.marketingCostType === 'percentage' ? formData.marketingCost : 0);
  const deliveryPercentageMask = usePercentageMask(formData.deliveryCostType === 'percentage' ? formData.deliveryCost : 0);
  const otherPercentageMask = usePercentageMask(formData.otherCostType === 'percentage' ? formData.otherCosts : 0);

  // Função para atualizar dados do formulário
  const updateFormData = useCallback((updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Função para calcular valor do custo baseado no tipo
  const calculateCostValue = useCallback((cost: number, type: 'fixed' | 'percentage', baseValue: number): number => {
    return type === 'percentage' ? baseValue * (cost / 100) : cost;
  }, []);

  // Handler para mudanças de porcentagem com máscara
  const handlePercentageChange = useCallback((maskHook: any, field: string, value: string) => {
    const numericValue = maskHook.handleChange(value);
    updateFormData({ [field]: numericValue });
  }, [updateFormData]);

  // Handler para mudanças no preço de venda
  const handleSellingPriceChange = useCallback((value: number) => {
    updateFormData({ sellingPrice: value, editMode: 'price' });
  }, [updateFormData]);

  // Handler para mudanças na margem
  const handleMarginChange = useCallback((value: string) => {
    const numericValue = targetMarginMask.handleChange(value);
    updateFormData({ targetMarginPercentage: numericValue, editMode: 'margin' });
  }, [updateFormData, targetMarginMask]);

  // Handler para custos indiretos com máscara dinâmica
  const handleIndirectCostChange = useCallback((field: string, value: string, type: 'fixed' | 'percentage') => {
    if (type === 'percentage') {
      const maskHook = field === 'laborCost' ? laborPercentageMask :
                      field === 'overheadCost' ? overheadPercentageMask :
                      field === 'marketingCost' ? marketingPercentageMask :
                      field === 'deliveryCost' ? deliveryPercentageMask :
                      otherPercentageMask;
      const numericValue = maskHook.handleChange(value);
      updateFormData({ [field]: numericValue });
    } else {
      const numericValue = parseFloat(value.replace(',', '.')) || 0;
      updateFormData({ [field]: numericValue });
    }
  }, [updateFormData, laborPercentageMask, overheadPercentageMask, marketingPercentageMask, deliveryPercentageMask, otherPercentageMask]);

  // Cálculos dos resultados
  const results = useMemo(() => {
    const { baseCost, laborCost, laborCostType, overheadCost, overheadCostType, 
            marketingCost, marketingCostType, deliveryCost, deliveryCostType, 
            otherCosts, otherCostType, wastagePercentage, targetMarginPercentage, 
            sellingPrice, platformFeePercentage, cardFeePercentage, taxPercentage, editMode } = formData;

    const laborCostValue = calculateCostValue(laborCost, laborCostType, baseCost);
    const overheadCostValue = calculateCostValue(overheadCost, overheadCostType, baseCost);
    const marketingCostValue = calculateCostValue(marketingCost, marketingCostType, baseCost);
    const deliveryCostValue = calculateCostValue(deliveryCost, deliveryCostType, baseCost);
    const otherCostsValue = calculateCostValue(otherCosts, otherCostType, baseCost);
    
    const totalIndirectCosts = laborCostValue + overheadCostValue + marketingCostValue + deliveryCostValue + otherCostsValue;
    const totalCostBeforeWastage = baseCost + totalIndirectCosts;
    const totalCostWithWastage = totalCostBeforeWastage * (1 + wastagePercentage / 100);
    
    const wastageCost = totalCostBeforeWastage * (wastagePercentage / 100);
    const totalTaxesCost = wastageCost + totalIndirectCosts;
    
    let calculatedSellingPrice = sellingPrice;
    let calculatedMargin = targetMarginPercentage;
    
    if (editMode === 'price' && sellingPrice > 0) {
      calculatedMargin = ((sellingPrice - totalCostWithWastage) / sellingPrice) * 100;
    } else if (editMode === 'margin' && targetMarginPercentage > 0) {
      calculatedSellingPrice = totalCostWithWastage / (1 - targetMarginPercentage / 100);
    }
    
    const priceWithPlatformFee = calculatedSellingPrice * (1 + platformFeePercentage / 100);
    const priceWithCardFee = priceWithPlatformFee * (1 + cardFeePercentage / 100);
    const finalPrice = priceWithCardFee * (1 + taxPercentage / 100);
    
    const profit = calculatedSellingPrice - totalCostWithWastage;
    const profitMargin = calculatedSellingPrice > 0 ? (profit / calculatedSellingPrice) * 100 : 0;
    const markup = totalCostWithWastage > 0 ? ((calculatedSellingPrice - totalCostWithWastage) / totalCostWithWastage) * 100 : 0;
    
    return {
      baseCost,
      totalIndirectCosts,
      totalTaxesCost,
      totalCostWithTaxes: totalCostWithWastage,
      sellingPrice: calculatedSellingPrice,
      finalPrice,
      profit,
      marginPercentage: calculatedMargin,
      profitMargin,
      markup,
      laborCostValue,
      overheadCostValue,
      marketingCostValue,
      deliveryCostValue,
      otherCostsValue
    };
  }, [formData, calculateCostValue]);

  // Sincronizar máscaras com valores do estado
  React.useEffect(() => {
    wastagePercentageMask.setValue(formData.wastagePercentage);
    targetMarginMask.setValue(formData.targetMarginPercentage);
    platformFeeMask.setValue(formData.platformFeePercentage);
    cardFeeMask.setValue(formData.cardFeePercentage);
    taxPercentageMask.setValue(formData.taxPercentage);
    
    // Sincronizar máscaras dinâmicas
    if (formData.laborCostType === 'percentage') {
      laborPercentageMask.setValue(formData.laborCost);
    }
    if (formData.overheadCostType === 'percentage') {
      overheadPercentageMask.setValue(formData.overheadCost);
    }
    if (formData.marketingCostType === 'percentage') {
      marketingPercentageMask.setValue(formData.marketingCost);
    }
    if (formData.deliveryCostType === 'percentage') {
      deliveryPercentageMask.setValue(formData.deliveryCost);
    }
    if (formData.otherCostType === 'percentage') {
      otherPercentageMask.setValue(formData.otherCosts);
    }
  }, [formData]);

  // Notificar componente pai sobre mudanças
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      const dataToSend = {
        name: productName,
        product_id: productId,
        baseCost: formData.baseCost,
        base_cost: formData.baseCost,
        packagingCost: 0,
        packaging_cost: 0,
        laborCost: calculateCostValue(formData.laborCost, formData.laborCostType, formData.baseCost),
        labor_cost: calculateCostValue(formData.laborCost, formData.laborCostType, formData.baseCost),
        overheadCost: calculateCostValue(formData.overheadCost, formData.overheadCostType, formData.baseCost),
        overhead_cost: calculateCostValue(formData.overheadCost, formData.overheadCostType, formData.baseCost),
        marketingCost: calculateCostValue(formData.marketingCost, formData.marketingCostType, formData.baseCost),
        marketing_cost: calculateCostValue(formData.marketingCost, formData.marketingCostType, formData.baseCost),
        deliveryCost: calculateCostValue(formData.deliveryCost, formData.deliveryCostType, formData.baseCost),
        delivery_cost: calculateCostValue(formData.deliveryCost, formData.deliveryCostType, formData.baseCost),
        otherCosts: calculateCostValue(formData.otherCosts, formData.otherCostType, formData.baseCost),
        other_costs: calculateCostValue(formData.otherCosts, formData.otherCostType, formData.baseCost),
        laborCostType: formData.laborCostType,
        overheadCostType: formData.overheadCostType,
        marketingCostType: formData.marketingCostType,
        deliveryCostType: formData.deliveryCostType,
        otherCostType: formData.otherCostType,
        wastagePercentage: formData.wastagePercentage,
        wastage_percentage: formData.wastagePercentage,
        targetMarginPercentage: formData.targetMarginPercentage,
        target_margin_percentage: formData.targetMarginPercentage,
        margin_percentage: formData.targetMarginPercentage,
        sellingPrice: results.sellingPrice,
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
        total_unit_cost: results.totalCostWithTaxes,
        ideal_price: results.sellingPrice,
        final_price: results.finalPrice,
        unit_profit: results.profit,
        actual_margin: results.profitMargin
      };
      
      onPricingChange(dataToSend);
    }, 500);

    return () => clearTimeout(timeout);
  }, [formData, results, productName, productId, onPricingChange, calculateCostValue]);

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
              {formatCurrency(formData.baseCost)}
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
            {/* Custo de Mão de Obra */}
            <div className="space-y-2">
              <Label>Custo de Mão de Obra</Label>
              <div className="flex gap-2">
                <Select 
                  value={formData.laborCostType} 
                  onValueChange={(value: 'fixed' | 'percentage') => updateFormData({ laborCostType: value })}
                >
                  <SelectTrigger className="w-20 bg-white border border-gray-300 z-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 shadow-lg z-[100]">
                    <SelectItem value="fixed">R$</SelectItem>
                    <SelectItem value="percentage">%</SelectItem>
                  </SelectContent>
                </Select>
                {formData.laborCostType === 'fixed' ? (
                  <CurrencyInput
                    value={formData.laborCost}
                    onValueChange={(value) => updateFormData({ laborCost: value })}
                    className="flex-1"
                    placeholder="Valor em reais"
                  />
                ) : (
                  <Input
                    type="text"
                    value={laborPercentageMask.displayValue}
                    onChange={(e) => handleIndirectCostChange('laborCost', e.target.value, 'percentage')}
                    className="flex-1"
                    placeholder="Ex: 3.9"
                  />
                )}
              </div>
              {formData.laborCostType === 'percentage' && formData.laborCost > 0 && (
                <div className="text-xs text-muted-foreground">
                  = {formatCurrency(calculateCostValue(formData.laborCost, formData.laborCostType, formData.baseCost))}
                </div>
              )}
            </div>

            {/* Custos Administrativos */}
            <div className="space-y-2">
              <Label>Custos Administrativos</Label>
              <div className="flex gap-2">
                <Select 
                  value={formData.overheadCostType} 
                  onValueChange={(value: 'fixed' | 'percentage') => updateFormData({ overheadCostType: value })}
                >
                  <SelectTrigger className="w-20 bg-white border border-gray-300 z-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 shadow-lg z-[100]">
                    <SelectItem value="fixed">R$</SelectItem>
                    <SelectItem value="percentage">%</SelectItem>
                  </SelectContent>
                </Select>
                {formData.overheadCostType === 'fixed' ? (
                  <CurrencyInput
                    value={formData.overheadCost}
                    onValueChange={(value) => updateFormData({ overheadCost: value })}
                    className="flex-1"
                    placeholder="Valor em reais"
                  />
                ) : (
                  <Input
                    type="text"
                    value={overheadPercentageMask.displayValue}
                    onChange={(e) => handleIndirectCostChange('overheadCost', e.target.value, 'percentage')}
                    className="flex-1"
                    placeholder="Ex: 3.9"
                  />
                )}
              </div>
              {formData.overheadCostType === 'percentage' && formData.overheadCost > 0 && (
                <div className="text-xs text-muted-foreground">
                  = {formatCurrency(calculateCostValue(formData.overheadCost, formData.overheadCostType, formData.baseCost))}
                </div>
              )}
            </div>

            {/* Custos de Marketing */}
            <div className="space-y-2">
              <Label>Custos de Marketing</Label>
              <div className="flex gap-2">
                <Select 
                  value={formData.marketingCostType} 
                  onValueChange={(value: 'fixed' | 'percentage') => updateFormData({ marketingCostType: value })}
                >
                  <SelectTrigger className="w-20 bg-white border border-gray-300 z-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 shadow-lg z-[100]">
                    <SelectItem value="fixed">R$</SelectItem>
                    <SelectItem value="percentage">%</SelectItem>
                  </SelectContent>
                </Select>
                {formData.marketingCostType === 'fixed' ? (
                  <CurrencyInput
                    value={formData.marketingCost}
                    onValueChange={(value) => updateFormData({ marketingCost: value })}
                    className="flex-1"
                    placeholder="Valor em reais"
                  />
                ) : (
                  <Input
                    type="text"
                    value={marketingPercentageMask.displayValue}
                    onChange={(e) => handleIndirectCostChange('marketingCost', e.target.value, 'percentage')}
                    className="flex-1"
                    placeholder="Ex: 3.9"
                  />
                )}
              </div>
              {formData.marketingCostType === 'percentage' && formData.marketingCost > 0 && (
                <div className="text-xs text-muted-foreground">
                  = {formatCurrency(calculateCostValue(formData.marketingCost, formData.marketingCostType, formData.baseCost))}
                </div>
              )}
            </div>

            {/* Custos de Entrega */}
            <div className="space-y-2">
              <Label>Custos de Entrega</Label>
              <div className="flex gap-2">
                <Select 
                  value={formData.deliveryCostType} 
                  onValueChange={(value: 'fixed' | 'percentage') => updateFormData({ deliveryCostType: value })}
                >
                  <SelectTrigger className="w-20 bg-white border border-gray-300 z-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 shadow-lg z-[100]">
                    <SelectItem value="fixed">R$</SelectItem>
                    <SelectItem value="percentage">%</SelectItem>
                  </SelectContent>
                </Select>
                {formData.deliveryCostType === 'fixed' ? (
                  <CurrencyInput
                    value={formData.deliveryCost}
                    onValueChange={(value) => updateFormData({ deliveryCost: value })}
                    className="flex-1"
                    placeholder="Valor em reais"
                  />
                ) : (
                  <Input
                    type="text"
                    value={deliveryPercentageMask.displayValue}
                    onChange={(e) => handleIndirectCostChange('deliveryCost', e.target.value, 'percentage')}
                    className="flex-1"
                    placeholder="Ex: 3.9"
                  />
                )}
              </div>
              {formData.deliveryCostType === 'percentage' && formData.deliveryCost > 0 && (
                <div className="text-xs text-muted-foreground">
                  = {formatCurrency(calculateCostValue(formData.deliveryCost, formData.deliveryCostType, formData.baseCost))}
                </div>
              )}
            </div>

            {/* Outros Custos */}
            <div className="space-y-2">
              <Label>Outros Custos</Label>
              <div className="flex gap-2">
                <Select 
                  value={formData.otherCostType} 
                  onValueChange={(value: 'fixed' | 'percentage') => updateFormData({ otherCostType: value })}
                >
                  <SelectTrigger className="w-20 bg-white border border-gray-300 z-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 shadow-lg z-[100]">
                    <SelectItem value="fixed">R$</SelectItem>
                    <SelectItem value="percentage">%</SelectItem>
                  </SelectContent>
                </Select>
                {formData.otherCostType === 'fixed' ? (
                  <CurrencyInput
                    value={formData.otherCosts}
                    onValueChange={(value) => updateFormData({ otherCosts: value })}
                    className="flex-1"
                    placeholder="Valor em reais"
                  />
                ) : (
                  <Input
                    type="text"
                    value={otherPercentageMask.displayValue}
                    onChange={(e) => handleIndirectCostChange('otherCosts', e.target.value, 'percentage')}
                    className="flex-1"
                    placeholder="Ex: 3.9"
                  />
                )}
              </div>
              {formData.otherCostType === 'percentage' && formData.otherCosts > 0 && (
                <div className="text-xs text-muted-foreground">
                  = {formatCurrency(calculateCostValue(formData.otherCosts, formData.otherCostType, formData.baseCost))}
                </div>
              )}
            </div>
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
                type="text"
                value={wastagePercentageMask.displayValue}
                onChange={(e) => handlePercentageChange(wastagePercentageMask, 'wastagePercentage', e.target.value)}
                placeholder="Ex: 5.0"
              />
            </div>
            <div className="space-y-2">
              <Label>Taxa da Plataforma (%)</Label>
              <Input
                type="text"
                value={platformFeeMask.displayValue}
                onChange={(e) => handlePercentageChange(platformFeeMask, 'platformFeePercentage', e.target.value)}
                placeholder="Ex: 3.9"
              />
            </div>
            <div className="space-y-2">
              <Label>Taxa de Cartão (%)</Label>
              <Input
                type="text"
                value={cardFeeMask.displayValue}
                onChange={(e) => handlePercentageChange(cardFeeMask, 'cardFeePercentage', e.target.value)}
                placeholder="Ex: 3.9"
              />
            </div>
            <div className="space-y-2">
              <Label>Impostos (%)</Label>
              <Input
                type="text"
                value={taxPercentageMask.displayValue}
                onChange={(e) => handlePercentageChange(taxPercentageMask, 'taxPercentage', e.target.value)}
                placeholder="Ex: 5.0"
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Margem Desejada (%)</Label>
              <Input
                type="text"
                value={formData.editMode === 'margin' ? targetMarginMask.displayValue : results.marginPercentage.toFixed(2)}
                onChange={(e) => handleMarginChange(e.target.value)}
                placeholder="Ex: 30.5"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor de Venda (R$)</Label>
              <CurrencyInput
                value={formData.editMode === 'price' ? formData.sellingPrice : results.sellingPrice}
                onValueChange={handleSellingPriceChange}
                placeholder="R$ 0,00"
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
          {/* Cards em Destaque */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-blue-100 p-6 rounded-xl text-center border-l-4 border-blue-500">
              <p className="text-sm text-blue-600 font-medium mb-1">Custo do Produto sem Taxas</p>
              <p className="text-2xl font-bold text-blue-800">{formatCurrency(results.baseCost)}</p>
              <p className="text-xs text-blue-600 mt-1">Valor base</p>
            </div>
            <div className="bg-purple-100 p-6 rounded-xl text-center border-l-4 border-purple-500">
              <p className="text-sm text-purple-600 font-medium mb-1">Custo Total das Taxas</p>
              <p className="text-2xl font-bold text-purple-800">{formatCurrency(results.totalTaxesCost)}</p>
              <p className="text-xs text-purple-600 mt-1">Desperdício + custos indiretos</p>
            </div>
            <div className="bg-indigo-100 p-6 rounded-xl text-center border-l-4 border-indigo-500">
              <p className="text-sm text-indigo-600 font-medium mb-1">Custo Total do Produto com Taxas</p>
              <p className="text-2xl font-bold text-indigo-800">{formatCurrency(results.totalCostWithTaxes)}</p>
              <p className="text-xs text-indigo-600 mt-1">Produto + todas as taxas</p>
            </div>
            <div className="bg-green-100 p-6 rounded-xl text-center border-l-4 border-green-500">
              <p className="text-sm text-green-600 font-medium mb-1">Preço Final de Venda</p>
              <p className="text-2xl font-bold text-green-800">{formatCurrency(results.finalPrice)}</p>
              <p className="text-xs text-green-600 mt-1">Com todas as taxas</p>
            </div>
            <div className="bg-orange-100 p-6 rounded-xl text-center border-l-4 border-orange-500">
              <p className="text-sm text-orange-600 font-medium mb-1">Lucro em Real</p>
              <p className="text-2xl font-bold text-orange-800">{formatCurrency(results.profit)}</p>
              <p className="text-xs text-orange-600 mt-1">Em reais</p>
            </div>
          </div>
          
          <Separator />
          
          {/* Subcards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-gray-600 mb-1">Margem de Lucro</p>
              <p className="text-lg font-bold text-gray-800">{formatPercentage(results.profitMargin)}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-gray-600 mb-1">Markup</p>
              <p className="text-lg font-bold text-gray-800">{formatPercentage(results.markup)}</p>
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
            onChange={(e) => updateFormData({ notes: e.target.value })}
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
};
