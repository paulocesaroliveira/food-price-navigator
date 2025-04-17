
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProductList } from "@/services/productService";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Search, X, ShoppingBag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/calculations";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProductSelectorProps {
  onProductsSelected: (products: Product[]) => void;
  selectedProducts?: Product[];
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ onProductsSelected, selectedProducts = [] }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Product[]>(selectedProducts);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProductList
  });

  // Update selected when selectedProducts prop changes
  useEffect(() => {
    setSelected(selectedProducts);
  }, [selectedProducts]);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (product: Product) => 
    selected.some(p => p.id === product.id);

  const toggleProduct = (product: Product) => {
    if (isSelected(product)) {
      setSelected(selected.filter(p => p.id !== product.id));
    } else {
      setSelected([...selected, product]);
    }
  };

  const handleConfirm = () => {
    onProductsSelected(selected);
    setOpen(false);
  };

  const removeSelected = (product: Product) => {
    setSelected(selected.filter(p => p.id !== product.id));
    onProductsSelected(selected.filter(p => p.id !== product.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {selected.map(product => (
          <div 
            key={product.id}
            className="flex items-center bg-food-vanilla px-3 py-1.5 rounded-full text-sm"
          >
            <span className="text-food-dark font-medium">{product.name}</span>
            <button 
              onClick={() => removeSelected(product)}
              className="ml-2 text-muted-foreground hover:text-food-red transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        
        {selected.length === 0 && (
          <div className="text-muted-foreground italic px-3 py-2 bg-food-vanilla/30 rounded-lg w-full">
            Nenhum produto selecionado
          </div>
        )}
      </div>
      
      <Button 
        variant="outline" 
        onClick={() => setOpen(true)}
        className="w-full border-food-coral text-food-coral hover:bg-food-cream hover:text-food-coral"
      >
        <ShoppingBag className="h-4 w-4 mr-2" />
        Selecionar Produtos
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-food-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-poppins text-food-dark">Selecionar Produtos</DialogTitle>
            <DialogDescription>
              Escolha os produtos para calcular a precificação
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative my-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              className="pl-9 border-food-vanilla focus-visible:ring-food-coral"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-4">Carregando produtos...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum produto encontrado
              </div>
            ) : (
              <ul className="space-y-2 py-2">
                {filteredProducts.map(product => (
                  <li key={product.id}>
                    <button
                      className={`w-full flex items-center justify-between p-2 rounded-md hover:bg-food-vanilla text-left transition-colors ${
                        isSelected(product) ? "bg-food-vanilla" : ""
                      }`}
                      onClick={() => toggleProduct(product)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isSelected(product) 
                            ? "bg-food-coral border-food-coral text-white" 
                            : "border border-food-vanilla bg-white"
                        }`}>
                          {isSelected(product) && <Check className="h-3.5 w-3.5" />}
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <span className="text-muted-foreground text-sm font-medium">
                        {formatCurrency(product.totalCost)}
                      </span>
                    </button>
                    {product !== filteredProducts[filteredProducts.length - 1] && (
                      <Separator className="mt-2 bg-food-vanilla" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-food-vanilla hover:bg-food-vanilla hover:text-food-dark"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={selected.length === 0}
              className="bg-food-coral hover:bg-food-amber text-white"
            >
              Confirmar ({selected.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductSelector;
