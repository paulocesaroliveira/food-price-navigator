
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProductList } from "@/services/productService";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/calculations";

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
            className="flex items-center bg-muted px-3 py-1.5 rounded-full text-sm"
          >
            <span>{product.name}</span>
            <button 
              onClick={() => removeSelected(product)}
              className="ml-2 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        
        {selected.length === 0 && (
          <div className="text-muted-foreground italic">Nenhum produto selecionado</div>
        )}
      </div>
      
      <Button variant="outline" onClick={() => setOpen(true)}>
        Selecionar Produtos
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar Produtos</DialogTitle>
            <DialogDescription>
              Escolha os produtos para calcular a precificação
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative my-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              className="pl-9"
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
                      className={`w-full flex items-center justify-between p-2 rounded-md hover:bg-muted text-left ${
                        isSelected(product) ? "bg-muted" : ""
                      }`}
                      onClick={() => toggleProduct(product)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-sm border flex items-center justify-center ${
                          isSelected(product) 
                            ? "bg-primary border-primary text-primary-foreground" 
                            : "border-input"
                        }`}>
                          {isSelected(product) && <Check className="h-3.5 w-3.5" />}
                        </div>
                        <span>{product.name}</span>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {formatCurrency(product.totalCost)}
                      </span>
                    </button>
                    {product !== filteredProducts[filteredProducts.length - 1] && (
                      <Separator className="mt-2" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={selected.length === 0}>
              Confirmar ({selected.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductSelector;
