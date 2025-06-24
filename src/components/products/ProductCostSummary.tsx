
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Package, DollarSign } from "lucide-react";
import { formatCurrency } from "@/utils/calculations";

interface ProductCostSummaryProps {
  totalRecipeCost: number;
  totalPackagingCost: number;
}

export const ProductCostSummary = ({ totalRecipeCost, totalPackagingCost }: ProductCostSummaryProps) => {
  const totalCost = totalRecipeCost + totalPackagingCost;

  return (
    <Card className="border-green-200 bg-green-50/30 sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Calculator className="h-5 w-5" />
          Resumo de Custos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">Total de Receitas</span>
            </div>
            <span className="font-bold text-blue-600">{formatCurrency(totalRecipeCost)}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-600">Total de Embalagens</span>
            </div>
            <span className="font-bold text-purple-600">{formatCurrency(totalPackagingCost)}</span>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white border-2 border-green-400">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <span className="font-bold">Custo Total do Produto</span>
            </div>
            <span className="font-bold text-xl">{formatCurrency(totalCost)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
