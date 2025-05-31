
import React, { useState, useEffect } from "react";
import { Product, PricingConfiguration } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Save } from "lucide-react";
import { EnhancedPricingForm } from "./EnhancedPricingForm";

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

  const handlePricingChange = (data: any) => {
    setPricingData(data);
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

      {/* Enhanced Pricing Form */}
      <EnhancedPricingForm
        totalCost={product.totalCost}
        onPricingChange={handlePricingChange}
        initialData={existingConfig ? {
          baseCost: existingConfig.baseCost || 0,
          packagingCost: existingConfig.packagingCost || 0,
          laborCost: existingConfig.laborCost || 0,
          overheadCost: existingConfig.overheadCost || 0,
          marketingCost: existingConfig.marketingCost || 0,
          deliveryCost: existingConfig.deliveryCost || 0,
          otherCosts: existingConfig.otherCosts || 0,
          wastagePercentage: existingConfig.wastagePercentage || 5,
          targetMarginPercentage: existingConfig.desiredMarginPercentage || 30,
          platformFeePercentage: existingConfig.platformFeePercentage || 0,
          taxPercentage: existingConfig.taxPercentage || 0,
          minimumPrice: existingConfig.minimumPrice || 0,
          maximumPrice: existingConfig.maximumPrice || 0,
          competitorPrice: existingConfig.competitorPrice || 0,
          notes: existingConfig.notes || ""
        } : undefined}
      />

      {/* Save Button */}
      <Card className="border-0 shadow-xl">
        <CardFooter className="p-6">
          <Button
            className="w-full gap-3 h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={handleSave}
            disabled={isLoading || !pricingData}
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
