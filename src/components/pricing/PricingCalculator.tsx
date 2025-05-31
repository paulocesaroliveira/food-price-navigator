
import React, { useState, useEffect } from "react";
import { Product, PricingConfiguration, AdditionalCost, PricingResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Save, TrendingUp, DollarSign, Target, Zap } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/utils/calculations";
import { calculatePricingResults } from "@/services/pricingService";
import { DynamicPricingForm } from "./DynamicPricingForm";

interface PricingCalculatorProps {
  product: Product;
  onSave: (config: any) => Promise<void>;
  isLoading?: boolean;
  existingConfig?: PricingConfiguration | null;
}

const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  product,
  onSave,
  isLoading = false,
  existingConfig
}) => {
  const [pricingData, setPricingData] = useState<any>(null);

  const handlePricingChange = (sellingPrice: number, marginPercentage: number) => {
    // Atualizar dados conforme necessário
    console.log('Pricing changed:', { sellingPrice, marginPercentage });
  };

  const handleSave = async () => {
    if (!pricingData) return;
    
    try {
      await onSave(pricingData);
    } catch (error) {
      console.error('Error saving pricing:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Product Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-blue-50">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-3">
              <Calculator className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">{product.name}</CardTitle>
              <p className="text-gray-600">Configuração de precificação inteligente</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Dynamic Pricing Form */}
      <DynamicPricingForm
        totalCost={product.totalCost}
        onPricingChange={handlePricingChange}
        initialSellingPrice={existingConfig?.idealPrice || 0}
        initialMarginPercentage={existingConfig?.desiredMarginPercentage || 30}
      />

      {/* Results Section */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Cost */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-red-100 p-2">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-sm font-medium text-red-700">Custo Total</span>
            </div>
            <div className="text-2xl font-bold text-red-800">
              {formatCurrency(product.totalCost)}
            </div>
          </CardContent>
        </Card>

        {/* Profit */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-green-100 p-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-700">Lucro Estimado</span>
            </div>
            <div className="text-2xl font-bold text-green-800">
              {formatCurrency(0)} {/* Será calculado dinamicamente */}
            </div>
          </CardContent>
        </Card>

        {/* Margin */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-blue-100 p-2">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-700">Margem Atual</span>
            </div>
            <div className="text-2xl font-bold text-blue-800">
              30.0% {/* Será calculado dinamicamente */}
            </div>
          </CardContent>
        </Card>

        {/* Final Price */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-purple-100 p-2">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-purple-700">Preço Final</span>
            </div>
            <div className="text-2xl font-bold text-purple-800">
              {formatCurrency(0)} {/* Será calculado dinamicamente */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <Card className="border-0 shadow-xl">
        <CardFooter className="p-6">
          <Button
            className="w-full gap-3 h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={handleSave}
            disabled={isLoading}
          >
            <Save className="h-5 w-5" />
            {isLoading ? "Salvando..." : "Salvar Precificação"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PricingCalculator;
