
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/calculations";

interface ProductCostSummaryProps {
  totalRecipeCost: number;
  totalPackagingCost: number;
}

export const ProductCostSummary = ({
  totalRecipeCost,
  totalPackagingCost,
}: ProductCostSummaryProps) => {
  const totalCost = totalRecipeCost + totalPackagingCost;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resumo de Custos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total de Receitas</p>
            <p className="font-semibold">{formatCurrency(totalRecipeCost)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total de Embalagens</p>
            <p className="font-semibold">{formatCurrency(totalPackagingCost)}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Custo Total do Produto</span>
            <span className="text-xl font-bold text-blue-600">{formatCurrency(totalCost)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
