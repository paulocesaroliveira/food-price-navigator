
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Package, DollarSign, TrendingUp, Target, AlertTriangle, Save, Zap } from "lucide-react";
import { formatCurrency } from "@/utils/calculations";
import { Product, PricingConfiguration } from "@/types";

interface PricingCalculatorFormProps {
  product: Product;
  onSave: (data: any) => void;
  existingConfig?: PricingConfiguration | null;
  isLoading?: boolean;
}

export const PricingCalculatorForm: React.FC<PricingCalculatorFormProps> = ({
  product,
  onSave,
  existingConfig,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: `Precificação ${product.name}`,
    product_id: product.id,
    base_cost: product.total_cost || 0,
    packaging_cost: 0,
    labor_cost: 0,
    overhead_cost: 0,
    marketing_cost: 0,
    delivery_cost: 0,
    other_costs: 0,
    wastage_percentage: 5,
    margin_percentage: 30,
    platform_fee_percentage: 0,
    tax_percentage: 0,
    target_margin_percentage: 30,
    minimum_price: 0,
    maximum_price: 0,
    competitor_price: 0,
    notes: ""
  });

  // Initialize with existing configuration
  useEffect(() => {
    if (existingConfig) {
      setFormData({
        name: existingConfig.name || `Precificação ${product.name}`,
        product_id: product.id,
        base_cost: existingConfig.base_cost || product.total_cost || 0,
        packaging_cost: existingConfig.packaging_cost || 0,
        labor_cost: existingConfig.labor_cost || 0,
        overhead_cost: existingConfig.overhead_cost || 0,
        marketing_cost: existingConfig.marketing_cost || 0,
        delivery_cost: existingConfig.delivery_cost || 0,
        other_costs: existingConfig.other_costs || 0,
        wastage_percentage: existingConfig.wastage_percentage || 5,
        margin_percentage: existingConfig.margin_percentage || 30,
        platform_fee_percentage: existingConfig.platform_fee_percentage || 0,
        tax_percentage: existingConfig.tax_percentage || 0,
        target_margin_percentage: existingConfig.target_margin_percentage || 30,
        minimum_price: existingConfig.minimum_price || 0,
        maximum_price: existingConfig.maximum_price || 0,
        competitor_price: existingConfig.competitor_price || 0,
        notes: existingConfig.notes || ""
      });
    } else {
      setFormData(prev => ({
        ...prev,
        base_cost: product.total_cost || 0
      }));
    }
  }, [existingConfig, product]);

  const handleInputChange = (field: string, value: number | string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculations
  const productionCost = formData.base_cost + formData.packaging_cost;
  const totalIndirectCosts = formData.labor_cost + formData.overhead_cost + 
                           formData.marketing_cost + formData.delivery_cost + 
                           formData.other_costs;
  const costWithWastage = (productionCost + totalIndirectCosts) * (1 + formData.wastage_percentage / 100);
  const idealPrice = costWithWastage * (1 + formData.margin_percentage / 100);
  const priceWithPlatformFee = idealPrice * (1 + formData.platform_fee_percentage / 100);
  const finalPrice = priceWithPlatformFee * (1 + formData.tax_percentage / 100);
  const profit = finalPrice - costWithWastage;
  const actualMargin = costWithWastage > 0 ? ((profit / costWithWastage) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      total_unit_cost: costWithWastage,
      ideal_price: idealPrice,
      final_price: finalPrice,
      unit_profit: profit,
      actual_margin: actualMargin
    };

    onSave(dataToSave);
  };

  const getMarginStatus = () => {
    if (actualMargin >= formData.target_margin_percentage) {
      return { status: 'success', icon: TrendingUp, text: 'Meta Atingida', color: 'text-green-600' };
    } else if (actualMargin >= formData.target_margin_percentage * 0.8) {
      return { status: 'warning', icon: Target, text: 'Próximo da Meta', color: 'text-yellow-600' };
    } else {
      return { status: 'danger', icon: AlertTriangle, text: 'Abaixo da Meta', color: 'text-red-600' };
    }
  };

  const marginStatus = getMarginStatus();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Information */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-blue-50">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-3">
              <Calculator className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{product.name}</CardTitle>
              <p className="text-gray-600">
                Configuração de precificação inteligente - Custo Base: {formatCurrency(product.total_cost || 0)}
              </p>
            </div>
            <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
              <Zap className="h-4 w-4 mr-1" />
              {existingConfig ? 'Editando' : 'Nova Configuração'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Configuration Name */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Identificação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="name">Nome da Configuração</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-2"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Production Costs */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Package className="h-5 w-5" />
                Custos de Produção
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base_cost">Custo Base do Produto</Label>
                  <Input
                    id="base_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.base_cost}
                    onChange={(e) => handleInputChange('base_cost', Number(e.target.value))}
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="packaging_cost">Custo de Embalagem</Label>
                  <Input
                    id="packaging_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.packaging_cost}
                    onChange={(e) => handleInputChange('packaging_cost', Number(e.target.value))}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Indirect Costs */}
          <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <DollarSign className="h-5 w-5" />
                Custos Indiretos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="labor_cost">Mão de Obra</Label>
                  <Input
                    id="labor_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.labor_cost}
                    onChange={(e) => handleInputChange('labor_cost', Number(e.target.value))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="overhead_cost">Custos Gerais</Label>
                  <Input
                    id="overhead_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.overhead_cost}
                    onChange={(e) => handleInputChange('overhead_cost', Number(e.target.value))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="marketing_cost">Marketing</Label>
                  <Input
                    id="marketing_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.marketing_cost}
                    onChange={(e) => handleInputChange('marketing_cost', Number(e.target.value))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="delivery_cost">Entrega</Label>
                  <Input
                    id="delivery_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.delivery_cost}
                    onChange={(e) => handleInputChange('delivery_cost', Number(e.target.value))}
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="other_costs">Outros Custos</Label>
                <Input
                  id="other_costs"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.other_costs}
                  onChange={(e) => handleInputChange('other_costs', Number(e.target.value))}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Margins and Fees */}
          <Card className="border-orange-200 bg-orange-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <TrendingUp className="h-5 w-5" />
                Margens e Taxas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wastage_percentage">Desperdício (%)</Label>
                  <Input
                    id="wastage_percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.wastage_percentage}
                    onChange={(e) => handleInputChange('wastage_percentage', Number(e.target.value))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="margin_percentage">Margem de Lucro (%)</Label>
                  <Input
                    id="margin_percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.margin_percentage}
                    onChange={(e) => handleInputChange('margin_percentage', Number(e.target.value))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="platform_fee_percentage">Taxa da Plataforma (%)</Label>
                  <Input
                    id="platform_fee_percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.platform_fee_percentage}
                    onChange={(e) => handleInputChange('platform_fee_percentage', Number(e.target.value))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="tax_percentage">Impostos (%)</Label>
                  <Input
                    id="tax_percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.tax_percentage}
                    onChange={(e) => handleInputChange('tax_percentage', Number(e.target.value))}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Strategy */}
          <Card className="border-indigo-200 bg-indigo-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-800">
                <Target className="h-5 w-5" />
                Estratégia de Preços
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="minimum_price">Preço Mínimo</Label>
                  <Input
                    id="minimum_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimum_price}
                    onChange={(e) => handleInputChange('minimum_price', Number(e.target.value))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="maximum_price">Preço Máximo</Label>
                  <Input
                    id="maximum_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maximum_price}
                    onChange={(e) => handleInputChange('maximum_price', Number(e.target.value))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="competitor_price">Preço da Concorrência</Label>
                  <Input
                    id="competitor_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.competitor_price}
                    onChange={(e) => handleInputChange('competitor_price', Number(e.target.value))}
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Adicione observações sobre a estratégia de preços..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-1 space-y-6">
          {/* Cost Summary */}
          <Card className="border-green-200 bg-green-50/30 sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Calculator className="h-5 w-5" />
                Resumo de Custos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="text-sm text-gray-600">Custo de Produção</span>
                  <span className="font-bold text-blue-600">{formatCurrency(productionCost)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="text-sm text-gray-600">Custos Indiretos</span>
                  <span className="font-bold text-purple-600">{formatCurrency(totalIndirectCosts)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="text-sm text-gray-600">Custo + Desperdício</span>
                  <span className="font-bold text-orange-600">{formatCurrency(costWithWastage)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="text-sm text-gray-600">Preço Final</span>
                  <span className="font-bold text-green-600">{formatCurrency(finalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit Analysis */}
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <TrendingUp className="h-5 w-5" />
                Análise de Lucro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">
                    {formatCurrency(profit)}
                  </div>
                  <div className="text-sm text-gray-600">Lucro por Unidade</div>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {actualMargin.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Margem Real</div>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className={`flex items-center justify-center gap-2 text-lg font-bold ${marginStatus.color} mb-1`}>
                    <marginStatus.icon className="h-5 w-5" />
                    {marginStatus.text}
                  </div>
                  <div className="text-sm text-gray-600">
                    Meta: {formData.target_margin_percentage}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            type="submit"
            className="w-full gap-3 h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={isLoading}
          >
            <Save className="h-5 w-5" />
            {isLoading ? "Salvando..." : existingConfig ? "Atualizar Precificação" : "Salvar Precificação"}
          </Button>
        </div>
      </div>
    </form>
  );
};
