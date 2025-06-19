
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/utils/calculations";

interface ProductCostSummaryProps {
  totalRecipeCost: number;
  totalPackagingCost: number;
  sellingPrice: number;
}

export const ProductCostSummary = ({
  totalRecipeCost,
  totalPackagingCost,
  sellingPrice,
}: ProductCostSummaryProps) => {
  const totalCost = totalRecipeCost + totalPackagingCost;
  const grossProfit = sellingPrice - totalCost;
  
  // Calculate margin inline since we have the values
  const margin = sellingPrice > 0 ? ((sellingPrice - totalCost) / sellingPrice) * 100 : 0;
  const markup = totalCost > 0 ? ((sellingPrice - totalCost) / totalCost) * 100 : 0;

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
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Custo Total do Produto</span>
              <span className="font-semibold text-red-600">{formatCurrency(totalCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor de Venda</span>
              <span className="font-semibold text-green-600">{formatCurrency(sellingPrice)}</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Lucro Bruto</p>
              <p className={`font-semibold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(grossProfit)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Margem</p>
              <p className={`font-semibold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(margin)}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-muted-foreground text-sm">Markup</p>
            <p className={`font-semibold text-sm ${markup >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(markup)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
