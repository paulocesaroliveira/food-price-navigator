
import React, { useState, useEffect } from 'react';
import { Product, PricingConfiguration, AdditionalCost, PricingResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage } from '@/utils/calculations';
import { calculatePricingResults } from '@/services/pricingService';
import AdditionalCostsEditor from './AdditionalCostsEditor';

interface PricingFormProps {
  product: Product;
  onSave: (data: any) => void;
  isLoading?: boolean;
  existingConfig?: PricingConfiguration | null;
}

const PricingForm: React.FC<PricingFormProps> = ({
  product,
  onSave,
  isLoading = false,
  existingConfig
}) => {
  const [formData, setFormData] = useState({
    name: existingConfig?.name || `Precificação ${product.name}`,
    product_id: product.id,
    user_id: '',
    base_cost: existingConfig?.base_cost || product.total_cost || 0,
    packaging_cost: existingConfig?.packaging_cost || product.packaging_cost || 0,
    wastage_percentage: existingConfig?.wastage_percentage || 5,
    additionalCosts: existingConfig?.additionalCosts || [] as AdditionalCost[],
    margin_percentage: existingConfig?.margin_percentage || 30,
    platform_fee_percentage: existingConfig?.platform_fee_percentage || 0,
    tax_percentage: existingConfig?.tax_percentage || 0,
    labor_cost: existingConfig?.labor_cost || 0,
    overhead_cost: existingConfig?.overhead_cost || 0,
    marketing_cost: existingConfig?.marketing_cost || 0,
    delivery_cost: existingConfig?.delivery_cost || 0,
    other_costs: existingConfig?.other_costs || 0,
    target_margin_percentage: existingConfig?.target_margin_percentage || 30,
    minimum_price: existingConfig?.minimum_price || 0,
    maximum_price: existingConfig?.maximum_price || 0,
    competitor_price: existingConfig?.competitor_price || 0,
    notes: existingConfig?.notes || ''
  });

  const [results, setResults] = useState<PricingResult | null>(null);

  useEffect(() => {
    calculateResults();
  }, [
    formData.base_cost,
    formData.packaging_cost,
    formData.wastage_percentage,
    formData.additionalCosts,
    formData.margin_percentage,
    formData.platform_fee_percentage,
    formData.tax_percentage
  ]);

  const calculateResults = () => {
    const calculatedResults = calculatePricingResults(
      formData.base_cost,
      formData.packaging_cost,
      formData.wastage_percentage,
      formData.additionalCosts,
      formData.margin_percentage,
      formData.platform_fee_percentage,
      formData.tax_percentage
    );
    setResults(calculatedResults);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!results) return;

    const dataToSave = {
      ...formData,
      id: existingConfig?.id,
      user_id: '', // Will be set by the service
      total_unit_cost: results.unitCost,
      ideal_price: results.sellingPrice,
      final_price: results.priceWithTaxes,
      unit_profit: results.unitProfit,
      actual_margin: results.margin
    };

    onSave(dataToSave);
  };

  const handleInputChange = (field: string, value: number | string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAdditionalCostsChange = (costs: AdditionalCost[]) => {
    setFormData(prev => ({ ...prev, additionalCosts: costs }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custos Base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💰 Custos Base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Configuração</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="base_cost">Custo Base do Produto</Label>
              <Input
                id="base_cost"
                type="number"
                step="0.01"
                value={formData.base_cost}
                onChange={(e) => handleInputChange('base_cost', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <Label htmlFor="packaging_cost">Custo de Embalagem</Label>
              <Input
                id="packaging_cost"
                type="number"
                step="0.01"
                value={formData.packaging_cost}
                onChange={(e) => handleInputChange('packaging_cost', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="wastage_percentage">Percentual de Desperdício (%)</Label>
              <Input
                id="wastage_percentage"
                type="number"
                step="0.1"
                value={formData.wastage_percentage}
                onChange={(e) => handleInputChange('wastage_percentage', parseFloat(e.target.value) || 0)}
              />
            </div>

            <AdditionalCostsEditor
              costs={formData.additionalCosts}
              onChange={handleAdditionalCostsChange}
            />
          </CardContent>
        </Card>

        {/* Parâmetros de Venda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📈 Parâmetros de Venda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="margin_percentage">Margem de Lucro (%)</Label>
              <Input
                id="margin_percentage"
                type="number"
                step="0.1"
                value={formData.margin_percentage}
                onChange={(e) => handleInputChange('margin_percentage', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <Label htmlFor="platform_fee_percentage">Taxa da Plataforma (%)</Label>
              <Input
                id="platform_fee_percentage"
                type="number"
                step="0.1"
                value={formData.platform_fee_percentage}
                onChange={(e) => handleInputChange('platform_fee_percentage', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="tax_percentage">Impostos (%)</Label>
              <Input
                id="tax_percentage"
                type="number"
                step="0.1"
                value={formData.tax_percentage}
                onChange={(e) => handleInputChange('tax_percentage', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Observações sobre esta precificação..."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resultados */}
      {results && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              🎯 Resultados da Precificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(results.unitCost)}
                </div>
                <div className="text-sm text-gray-600">Custo Unitário</div>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(results.sellingPrice)}
                </div>
                <div className="text-sm text-gray-600">Preço de Venda</div>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(results.priceWithCommission)}
                </div>
                <div className="text-sm text-gray-600">Com Comissão</div>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(results.priceWithTaxes)}
                </div>
                <div className="text-sm text-gray-600">Preço Final</div>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(results.unitProfit)}
                </div>
                <div className="text-sm text-gray-600">Lucro Unitário</div>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-blue-700">
                  {formatPercentage(results.appliedMarkup)}
                </div>
                <div className="text-sm text-gray-600">Markup Aplicado</div>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(results.minimumRecommendedPrice)}
                </div>
                <div className="text-sm text-gray-600">Preço Mínimo</div>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border">
                <Badge variant="secondary" className="text-lg">
                  {formatPercentage(results.appliedMarkup)} markup
                </Badge>
                <div className="text-sm text-gray-600">Rendimento</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading || !results} className="min-w-32">
          {isLoading ? 'Salvando...' : existingConfig ? 'Atualizar' : 'Salvar'} Precificação
        </Button>
      </div>
    </form>
  );
};

export default PricingForm;
