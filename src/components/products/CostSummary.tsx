
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/calculations";
import { DollarSign } from "lucide-react";

interface CostSummaryProps {
  recipesCost: number;
  packagingCost: number;
  totalCost: number;
}

export const CostSummary = ({ recipesCost, packagingCost, totalCost }: CostSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Resumo de Custos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Receitas:</span>
              <span className="font-medium">{formatCurrency(recipesCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Embalagens:</span>
              <span className="font-medium">{formatCurrency(packagingCost)}</span>
            </div>
          </div>
          
          <div className="border-l pl-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total:</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(totalCost)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
