
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, DollarSign, Percent } from "lucide-react";
import { formatCurrency } from "@/utils/calculations";

interface DynamicPricingFormProps {
  totalCost: number;
  onPricingChange: (sellingPrice: number, marginPercentage: number) => void;
  initialSellingPrice?: number;
  initialMarginPercentage?: number;
}

export const DynamicPricingForm: React.FC<DynamicPricingFormProps> = ({
  totalCost,
  onPricingChange,
  initialSellingPrice = 0,
  initialMarginPercentage = 30
}) => {
  const [sellingPrice, setSellingPrice] = useState(initialSellingPrice);
  const [marginPercentage, setMarginPercentage] = useState(initialMarginPercentage);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [isUpdatingMargin, setIsUpdatingMargin] = useState(false);

  useEffect(() => {
    if (totalCost > 0 && sellingPrice === 0) {
      const calculatedPrice = totalCost * (1 + marginPercentage / 100);
      setSellingPrice(calculatedPrice);
    }
  }, [totalCost, marginPercentage, sellingPrice]);

  const handleSellingPriceChange = (value: number) => {
    if (isUpdatingMargin) return;
    
    setIsUpdatingPrice(true);
    setSellingPrice(value);
    
    if (totalCost > 0 && value > totalCost) {
      const newMargin = ((value - totalCost) / totalCost) * 100;
      setMarginPercentage(newMargin);
      onPricingChange(value, newMargin);
    } else {
      onPricingChange(value, marginPercentage);
    }
    
    setTimeout(() => setIsUpdatingPrice(false), 100);
  };

  const handleMarginChange = (value: number) => {
    if (isUpdatingPrice) return;
    
    setIsUpdatingMargin(true);
    setMarginPercentage(value);
    
    if (totalCost > 0) {
      const newPrice = totalCost * (1 + value / 100);
      setSellingPrice(newPrice);
      onPricingChange(newPrice, value);
    } else {
      onPricingChange(sellingPrice, value);
    }
    
    setTimeout(() => setIsUpdatingMargin(false), 100);
  };

  const profit = sellingPrice - totalCost;
  const actualMargin = totalCost > 0 ? ((profit / totalCost) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Precificação Dinâmica
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="margin" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Margem de Lucro (%)
            </Label>
            <Input
              id="margin"
              type="number"
              min="0"
              step="0.1"
              value={marginPercentage.toFixed(1)}
              onChange={(e) => handleMarginChange(parseFloat(e.target.value) || 0)}
              className="text-lg font-semibold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Preço de Venda (R$)
            </Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={sellingPrice.toFixed(2)}
              onChange={(e) => handleSellingPriceChange(parseFloat(e.target.value) || 0)}
              className="text-lg font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Custo Total</p>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(totalCost)}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Lucro Unitário</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(profit)}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Margem Real</p>
            <p className="text-lg font-semibold text-blue-600">
              {actualMargin.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Preço Final de Venda:</span>
            <span className="text-2xl font-bold text-green-700">
              {formatCurrency(sellingPrice)}
            </span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Altere a margem de lucro para calcular automaticamente o preço de venda</p>
          <p>• Ou altere o preço de venda para recalcular a margem de lucro</p>
          <p>• Os valores são atualizados dinamicamente conforme você digita</p>
        </div>
      </CardContent>
    </Card>
  );
};
