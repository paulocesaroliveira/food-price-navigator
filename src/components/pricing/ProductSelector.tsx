
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";
import { getProductList } from "@/services/productService";
import { getPricingConfigs } from "@/services/pricingService";
import { formatCurrency, formatPercentage } from "@/utils/calculations";
import { Package2, Calculator, TrendingUp, DollarSign } from "lucide-react";

interface ProductSelectorProps {
  onProductSelect: (product: Product) => void;
  selectedProduct?: Product | null;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  onProductSelect,
  selectedProduct
}) => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProductList
  });

  const { data: allPricingConfigs = [] } = useQuery({
    queryKey: ["all-pricing-configs"],
    queryFn: () => getPricingConfigs()
  });

  // Função para obter a última configuração de preço de um produto
  const getLatestPricingConfig = (productId: string) => {
    const productConfigs = allPricingConfigs.filter(config => config.product_id === productId);
    if (productConfigs.length === 0) return null;
    
    // Retorna a configuração mais recente
    return productConfigs.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Selecionar Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Selecionar Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package2 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mt-2">
              Nenhum produto encontrado
            </p>
            <p className="text-sm text-muted-foreground">
              Cadastre produtos primeiro para começar a precificar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package2 className="h-5 w-5 text-food-coral" />
          Selecionar Produto para Precificar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {products.map((product) => {
            const latestPricing = getLatestPricingConfig(product.id);
            const isSelected = selectedProduct?.id === product.id;
            
            return (
              <Card
                key={product.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected 
                    ? 'ring-2 ring-food-coral border-food-coral bg-food-coral/5' 
                    : 'border hover:border-food-coral/50'
                }`}
                onClick={() => onProductSelect(product)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-food-vanilla/50 flex items-center justify-center">
                          <Package2 className="h-6 w-6 text-food-coral" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-food-dark">{product.name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <DollarSign className="h-3 w-3" />
                            Custo: {formatCurrency(product.totalCost)}
                          </div>
                          
                          {latestPricing && (
                            <>
                              <div className="flex items-center gap-1 text-sm text-green-600">
                                <TrendingUp className="h-3 w-3" />
                                Margem: {formatPercentage(latestPricing.actual_margin)}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-food-dark font-medium">
                                <Calculator className="h-3 w-3" />
                                Venda: {formatCurrency(latestPricing.ideal_price)}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {latestPricing ? (
                        <Badge variant="secondary" className="bg-food-green/20 text-food-green border-food-green/30">
                          Precificado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-food-amber text-food-amber">
                          Não precificado
                        </Badge>
                      )}
                      
                      <Button
                        size="sm"
                        className="bg-food-coral hover:bg-food-amber text-white"
                      >
                        Precificar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSelector;
