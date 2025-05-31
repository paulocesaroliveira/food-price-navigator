
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Calculator, TrendingUp, DollarSign, Target, AlertCircle } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/utils/calculations";

interface PricingFormData {
  baseCost: number;
  packagingCost: number;
  laborCost: number;
  overheadCost: number;
  marketingCost: number;
  deliveryCost: number;
  otherCosts: number;
  wastagePercentage: number;
  targetMarginPercentage: number;
  platformFeePercentage: number;
  taxPercentage: number;
  minimumPrice: number;
  maximumPrice: number;
  competitorPrice: number;
  notes: string;
}

interface EnhancedPricingFormProps {
  initialData?: Partial<PricingFormData>;
  onPricingChange: (data: PricingFormData) => void;
  totalCost: number;
}

export const EnhancedPricingForm: React.FC<EnhancedPricingFormProps> = ({
  initialData,
  onPricingChange,
  totalCost
}) => {
  const [formData, setFormData] = useState<PricingFormData>({
    baseCost: totalCost || 0,
    packagingCost: 0,
    laborCost: 0,
    overheadCost: 0,
    marketingCost: 0,
    deliveryCost: 0,
    otherCosts: 0,
    wastagePercentage: 5,
    targetMarginPercentage: 30,
    platformFeePercentage: 0,
    taxPercentage: 0,
    minimumPrice: 0,
    maximumPrice: 0,
    competitorPrice: 0,
    notes: "",
    ...initialData
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, baseCost: totalCost || 0 }));
  }, [totalCost]);

  useEffect(() => {
    onPricingChange(formData);
  }, [formData, onPricingChange]);

  const handleInputChange = (field: keyof PricingFormData, value: number | string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalDirectCosts = formData.baseCost + formData.packagingCost + formData.laborCost;
  const totalIndirectCosts = formData.overheadCost + formData.marketingCost + formData.deliveryCost + formData.otherCosts;
  const totalCostWithWastage = (totalDirectCosts + totalIndirectCosts) * (1 + formData.wastagePercentage / 100);
  const sellingPrice = totalCostWithWastage / (1 - formData.targetMarginPercentage / 100);
  const finalPrice = sellingPrice * (1 + formData.platformFeePercentage / 100) * (1 + formData.taxPercentage / 100);
  const profit = sellingPrice - totalCostWithWastage;
  const actualMargin = (profit / sellingPrice) * 100;

  return (
    <div className="space-y-8">
      {/* Custos Diretos */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-blue-800">
            <DollarSign className="h-6 w-6" />
            Custos Diretos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Custo Base (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.baseCost}
                onChange={(e) => handleInputChange('baseCost', parseFloat(e.target.value) || 0)}
                className="bg-white"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label>Custo de Embalagem (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.packagingCost}
                onChange={(e) => handleInputChange('packagingCost', parseFloat(e.target.value) || 0)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Custo de Mão de Obra (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.laborCost}
                onChange={(e) => handleInputChange('laborCost', parseFloat(e.target.value) || 0)}
                className="bg-white"
              />
            </div>
          </div>
          <div className="bg-blue-200 p-3 rounded-lg">
            <span className="font-semibold text-blue-800">Total Custos Diretos: {formatCurrency(totalDirectCosts)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Custos Indiretos */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-purple-800">
            <TrendingUp className="h-6 w-6" />
            Custos Indiretos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Custos Administrativos (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.overheadCost}
                onChange={(e) => handleInputChange('overheadCost', parseFloat(e.target.value) || 0)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Custos de Marketing (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.marketingCost}
                onChange={(e) => handleInputChange('marketingCost', parseFloat(e.target.value) || 0)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Custos de Entrega (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.deliveryCost}
                onChange={(e) => handleInputChange('deliveryCost', parseFloat(e.target.value) || 0)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Outros Custos (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.otherCosts}
                onChange={(e) => handleInputChange('otherCosts', parseFloat(e.target.value) || 0)}
                className="bg-white"
              />
            </div>
          </div>
          <div className="bg-purple-200 p-3 rounded-lg">
            <span className="font-semibold text-purple-800">Total Custos Indiretos: {formatCurrency(totalIndirectCosts)}</span>
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
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Margem Desejada (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.targetMarginPercentage}
                onChange={(e) => handleInputChange('targetMarginPercentage', parseFloat(e.target.value) || 0)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Taxa da Plataforma (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.platformFeePercentage}
                onChange={(e) => handleInputChange('platformFeePercentage', parseFloat(e.target.value) || 0)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Impostos (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.taxPercentage}
                onChange={(e) => handleInputChange('taxPercentage', parseFloat(e.target.value) || 0)}
                className="bg-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análise de Mercado */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-orange-800">
            <Calculator className="h-6 w-6" />
            Análise de Mercado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Preço Mínimo (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.minimumPrice}
                onChange={(e) => handleInputChange('minimumPrice', parseFloat(e.target.value) || 0)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Preço Máximo (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.maximumPrice}
                onChange={(e) => handleInputChange('maximumPrice', parseFloat(e.target.value) || 0)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Preço do Concorrente (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.competitorPrice}
                onChange={(e) => handleInputChange('competitorPrice', parseFloat(e.target.value) || 0)}
                className="bg-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultado da Precificação */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">Resultado da Precificação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <p className="text-sm text-blue-600 font-medium">Custo Total</p>
              <p className="text-xl font-bold text-blue-800">{formatCurrency(totalCostWithWastage)}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <p className="text-sm text-green-600 font-medium">Preço de Venda</p>
              <p className="text-xl font-bold text-green-800">{formatCurrency(sellingPrice)}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg text-center">
              <p className="text-sm text-purple-600 font-medium">Lucro</p>
              <p className="text-xl font-bold text-purple-800">{formatCurrency(profit)}</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg text-center">
              <p className="text-sm text-orange-600 font-medium">Preço Final</p>
              <p className="text-xl font-bold text-orange-800">{formatCurrency(finalPrice)}</p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Margem Efetiva</p>
              <p className="text-lg font-bold text-gray-800">{formatPercentage(actualMargin)}</p>
            </div>
            {formData.competitorPrice > 0 && (
              <div className="text-center">
                <p className="text-sm text-gray-600">vs. Concorrente</p>
                <p className={`text-lg font-bold ${finalPrice > formData.competitorPrice ? 'text-red-600' : 'text-green-600'}`}>
                  {finalPrice > formData.competitorPrice ? '+' : ''}{formatCurrency(finalPrice - formData.competitorPrice)}
                </p>
              </div>
            )}
            {(formData.minimumPrice > 0 || formData.maximumPrice > 0) && (
              <div className="text-center">
                <p className="text-sm text-gray-600">Dentro da Faixa</p>
                {formData.minimumPrice > 0 && finalPrice < formData.minimumPrice && (
                  <p className="text-lg font-bold text-red-600 flex items-center justify-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Abaixo do mínimo
                  </p>
                )}
                {formData.maximumPrice > 0 && finalPrice > formData.maximumPrice && (
                  <p className="text-lg font-bold text-red-600 flex items-center justify-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Acima do máximo
                  </p>
                )}
                {(!formData.minimumPrice || finalPrice >= formData.minimumPrice) && 
                 (!formData.maximumPrice || finalPrice <= formData.maximumPrice) && (
                  <p className="text-lg font-bold text-green-600">✓ OK</p>
                )}
              </div>
            )}
          </div>
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
