
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
          baseCost: existingConfig.base_cost || 0,
          packagingCost: existingConfig.packaging_cost || 0,
          laborCost: existingConfig.labor_cost || 0,
          overheadCost: existingConfig.overhead_cost || 0,
          marketingCost: existingConfig.marketing_cost || 0,
          deliveryCost: existingConfig.delivery_cost || 0,
          otherCosts: existingConfig.other_costs || 0,
          wastagePercentage: existingConfig.wastage_percentage || 5,
          targetMarginPercentage: existingConfig.margin_percentage || 30,
          platformFeePercentage: existingConfig.platform_fee_percentage || 0,
          taxPercentage: existingConfig.tax_percentage || 0,
          minimumPrice: existingConfig.minimum_price || 0,
          maximumPrice: existingConfig.maximum_price || 0,
          competitorPrice: existingConfig.competitor_price || 0,
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
