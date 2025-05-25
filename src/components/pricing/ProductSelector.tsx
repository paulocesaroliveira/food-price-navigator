
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProductList } from "@/services/productService";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Package, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/utils/calculations";

interface ProductSelectorProps {
  onProductSelect: (product: Product) => void;
  selectedProduct?: Product;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ 
  onProductSelect, 
  selectedProduct 
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProductList
  });

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedProduct) {
    return (
      <Card className="border-2 border-food-coral bg-gradient-to-r from-food-vanilla to-food-cream">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-food-white flex items-center justify-center shadow-soft">
                <Package className="h-8 w-8 text-food-coral" />
              </div>
              <div>
                <h3 className="text-xl font-poppins font-semibold text-food-dark">
                  {selectedProduct.name}
                </h3>
                <p className="text-muted-foreground">
                  Custo base: {formatCurrency(selectedProduct.totalCost)}
                </p>
                {selectedProduct.category && (
                  <p className="text-sm text-food-coral">
                    {selectedProduct.category.name}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => onProductSelect(null as any)}
              className="border-food-coral text-food-coral hover:bg-food-coral hover:text-white"
            >
              Trocar Produto
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-soft">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-poppins font-semibold text-food-dark mb-2">
              Selecione um Produto
            </h3>
            <p className="text-muted-foreground text-sm">
              Escolha o produto que deseja precificar
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              className="pl-9 border-food-vanilla focus-visible:ring-food-coral"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Carregando produtos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-4">
                <Package className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mt-2">
                  {searchTerm ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => onProductSelect(product)}
                  className="w-full p-3 rounded-lg border border-food-vanilla hover:border-food-coral hover:bg-food-vanilla/30 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-food-dark group-hover:text-food-coral transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Custo: {formatCurrency(product.totalCost)}
                      </p>
                      {product.category && (
                        <p className="text-xs text-food-coral">
                          {product.category.name}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-food-coral transition-colors" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSelector;
