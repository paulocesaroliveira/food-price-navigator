
import React, { useState, useEffect } from 'react';
import { PublishedProduct } from '@/services/websiteService';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';

interface ProductCatalogProps {
  products: PublishedProduct[];
  addToCart: (product: PublishedProduct, quantity: number, notes: string) => void;
}

const ProductCatalog = ({ products, addToCart }: ProductCatalogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<PublishedProduct[]>(products);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<PublishedProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Extract unique categories from products
    const uniqueCategories: string[] = [];
    products.forEach(product => {
      if (product.category && !uniqueCategories.includes(product.category)) {
        uniqueCategories.push(product.category);
      }
    });
    setCategories(uniqueCategories.sort());
  }, [products]);

  useEffect(() => {
    // Filter products based on search term and category
    let filtered = [...products];
    
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  const handleAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, quantity, notes);
      setIsDialogOpen(false);
      // Reset form
      setSelectedProduct(null);
      setQuantity(1);
      setNotes('');
    }
  };

  const openProductDialog = (product: PublishedProduct) => {
    setSelectedProduct(product);
    setQuantity(1);
    setNotes('');
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-poppins font-bold text-gray-800 mb-8 text-center">Nossos Produtos</h2>
      
      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg font-quicksand"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              className={`rounded-full text-sm whitespace-nowrap ${selectedCategory === null ? 'bg-[#E76F51] hover:bg-[#E76F51]/90' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              Todos
            </Button>
            
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`rounded-full text-sm whitespace-nowrap ${selectedCategory === category ? 'bg-[#E76F51] hover:bg-[#E76F51]/90' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                  Sem imagem
                </div>
              )}
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-poppins font-semibold text-gray-800">{product.name}</h3>
                  {product.price && (
                    <span className="text-lg font-medium text-[#E76F51]">
                      R$ {product.price.toFixed(2)}
                    </span>
                  )}
                </div>
                
                {product.description && (
                  <p className="text-gray-600 font-quicksand mb-4 line-clamp-2">{product.description}</p>
                )}
                
                {product.category && (
                  <div className="mb-4">
                    <span className="inline-block bg-[#2A9D8F]/10 text-[#2A9D8F] text-xs font-medium px-2.5 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                )}
                
                <Button 
                  className="w-full bg-[#E76F51] hover:bg-[#E76F51]/90 font-quicksand"
                  onClick={() => openProductDialog(product)}
                >
                  <Plus size={18} className="mr-1" /> Adicionar
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 font-quicksand">Nenhum produto encontrado.</p>
        </div>
      )}

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="font-quicksand">
          <DialogHeader>
            <DialogTitle className="font-poppins">{selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              {selectedProduct?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct?.image_url && (
            <img 
              src={selectedProduct.image_url} 
              alt={selectedProduct.name} 
              className="rounded-md h-52 w-full object-cover mb-4"
            />
          )}
          
          <div className="space-y-4">
            {selectedProduct?.price && (
              <div className="text-lg font-medium">
                Preço: <span className="text-[#E76F51]">R$ {selectedProduct.price.toFixed(2)}</span>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1">Quantidade</label>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  +
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Observações (opcional)</label>
              <Textarea 
                placeholder="Ex: Sem açúcar, extra de calda, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full bg-[#E76F51] hover:bg-[#E76F51]/90"
              onClick={handleAddToCart}
            >
              Adicionar ao Pedido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCatalog;
