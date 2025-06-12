
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Calculator } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/utils/calculations";
import type { Product, ProductCategory } from "@/types";

interface ProductSelectorProps {
  products: Product[];
  categories: ProductCategory[];
  onProductSelect: (product: Product) => void;
  selectedProduct?: Product;
}

const ProductSelector = ({ products, categories, onProductSelect, selectedProduct }: ProductSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getMargin = (product: Product) => {
    const cost = product.total_cost || 0;
    const price = product.selling_price || 0;
    if (price === 0) return 0;
    return ((price - cost) / price) * 100;
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 30) return "text-green-600";
    if (margin >= 15) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Selecionar Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedProduct?.id === product.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => onProductSelect(product)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{product.name}</h3>
                      
                      <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Custo:</span>
                          <span>{formatCurrency(product.total_cost || 0)}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Preço:</span>
                          <span className="font-medium">
                            {formatCurrency(product.selling_price || 0)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Margem:</span>
                          <span className={`font-medium ${getMarginColor(getMargin(product))}`}>
                            {formatPercentage(getMargin(product))}
                          </span>
                        </div>
                      </div>
                      
                      {product.category && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {product.category.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum produto encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProduct && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Produto Selecionado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                {selectedProduct.imageUrl ? (
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Package className="h-8 w-8 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Custo Total</p>
                    <p className="font-medium">{formatCurrency(selectedProduct.total_cost || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Preço de Venda</p>
                    <p className="font-medium">{formatCurrency(selectedProduct.selling_price || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Margem</p>
                    <p className={`font-medium ${getMarginColor(getMargin(selectedProduct))}`}>
                      {formatPercentage(getMargin(selectedProduct))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductSelector;
