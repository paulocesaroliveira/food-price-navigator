
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ProductCostSummaryProps {
  totalRecipeCost: number;
  totalPackagingCost: number;
  sellingPrice: number;
}

export function ProductCostSummary({ 
  totalRecipeCost, 
  totalPackagingCost, 
  sellingPrice 
}: ProductCostSummaryProps) {
  const totalProductCost = totalRecipeCost + totalPackagingCost;
  const grossProfit = sellingPrice - totalProductCost;
  const margin = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;
  const markup = totalProductCost > 0 ? (grossProfit / totalProductCost) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resumo de Custos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total de Receitas</p>
            <p className="text-lg font-semibold">{formatCurrency(totalRecipeCost)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total de Embalagens</p>
            <p className="text-lg font-semibold">{formatCurrency(totalPackagingCost)}</p>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <p className="text-sm text-muted-foreground">Custo Total do Produto</p>
          <p className="text-xl font-bold text-orange-600">{formatCurrency(totalProductCost)}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Valor de Venda</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(sellingPrice)}</p>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Lucro Bruto</p>
            <p className={`text-lg font-semibold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(grossProfit)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Margem</p>
            <p className={`text-lg font-semibold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(margin)}
            </p>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Markup</p>
          <p className={`text-lg font-semibold ${markup >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(markup)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
