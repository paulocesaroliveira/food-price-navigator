
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { getProductList } from "@/services/productService";
import { publishProduct, unpublishProduct, getPublishedProducts } from "@/services/websiteService";
import { Product } from "@/types";
import { PublishedProduct } from "@/services/websiteService";
import { ShoppingBag, Edit, Eye, Trash, Plus, Star, Image } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PublishProductsTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [publishedProducts, setPublishedProducts] = useState<PublishedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image_url: "",
    is_featured: false
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setIsFormValid(formData.name !== "" && parseFloat(formData.price) > 0);
  }, [formData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allProducts = await getProductList();
      setProducts(allProducts);
      
      const publishedProductsList = await getPublishedProducts();
      setPublishedProducts(publishedProductsList);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: "",
      description: "",
      category: product.category?.name || "",
      image_url: product.imageUrl || "",
      is_featured: false
    });
    setIsEditing(false);
    setEditingProductId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({ ...formData, is_featured: checked });
  };

  const handlePublish = async () => {
    if (!selectedProduct) return;
    
    try {
      const productData = {
        product_id: selectedProduct.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: formData.image_url,
        category: formData.category,
        is_featured: formData.is_featured,
        is_active: true,
        tags: null
      };
      
      await publishProduct(productData);
      fetchData();
    } catch (error) {
      console.error("Error publishing product:", error);
    }
  };

  const handleEditPublishedProduct = (product: PublishedProduct) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || "",
      category: product.category || "",
      image_url: product.image_url || "",
      is_featured: product.is_featured
    });
    setIsEditing(true);
    setEditingProductId(product.id);
  };

  const handleUnpublish = async (id: string) => {
    try {
      await unpublishProduct(id);
      fetchData();
    } catch (error) {
      console.error("Error unpublishing product:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Produtos Publicados</h3>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default" className="bg-food-coral hover:bg-food-amber">
              <Plus className="mr-2 h-4 w-4" />
              Publicar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Publicar Produto no Site</DialogTitle>
              <DialogDescription>
                Selecione um produto do seu catálogo para publicar no site.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="product">Produto</Label>
                <select 
                  id="product"
                  onChange={(e) => {
                    const product = products.find(p => p.id === e.target.value);
                    if (product) handleSelectProduct(product);
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione um produto</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedProduct && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome no Site*</Label>
                    <Input 
                      id="name" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="price">Preço*</Label>
                    <Input 
                      id="price" 
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea 
                      id="description" 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Input 
                      id="category" 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="image_url">URL da Imagem</Label>
                    <Input 
                      id="image_url" 
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_featured" className="cursor-pointer">
                      Produto em Destaque
                    </Label>
                    <Switch 
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={handleSwitchChange}
                    />
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter className="sm:justify-between">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancelar
                </Button>
              </DialogClose>
              <Button 
                type="button" 
                variant="default" 
                className="bg-food-coral hover:bg-food-amber"
                onClick={handlePublish}
                disabled={!selectedProduct || !isFormValid}
              >
                Publicar no Site
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-t-2 border-food-coral border-opacity-50 rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-500">Carregando produtos...</p>
        </div>
      ) : publishedProducts.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <ShoppingBag className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">Nenhum produto publicado</h3>
          <p className="text-gray-500 mt-2 mb-4">Publique seus produtos para exibi-los no seu site.</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" className="bg-food-coral hover:bg-food-amber">
                <Plus className="mr-2 h-4 w-4" />
                Publicar Primeiro Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              {/* Same dialog content as above */}
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Destaque</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publishedProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                          <Image className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <span>{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.category || '-'}</TableCell>
                  <TableCell>
                    {product.is_featured ? (
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 fill-yellow-500 mr-1" />
                        <span>Destaque</span>
                      </div>
                    ) : 'Não'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditPublishedProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleUnpublish(product.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Produto Publicado</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto no site.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome no Site*</Label>
              <Input 
                id="edit-name" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-price">Preço*</Label>
              <Input 
                id="edit-price" 
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea 
                id="edit-description" 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Categoria</Label>
              <Input 
                id="edit-category" 
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-image_url">URL da Imagem</Label>
              <Input 
                id="edit-image_url" 
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-is_featured" className="cursor-pointer">
                Produto em Destaque
              </Label>
              <Switch 
                id="edit-is_featured"
                checked={formData.is_featured}
                onCheckedChange={handleSwitchChange}
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={() => {
                if (editingProductId) {
                  handleUnpublish(editingProductId);
                  setIsEditing(false);
                }
              }}
            >
              Remover do Site
            </Button>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="button" 
                variant="default" 
                className="bg-food-coral hover:bg-food-amber"
                onClick={async () => {
                  if (editingProductId) {
                    // First, unpublish the current version
                    await unpublishProduct(editingProductId);
                    
                    // Then, publish the updated version
                    const publishedProduct = publishedProducts.find(p => p.id === editingProductId);
                    if (publishedProduct) {
                      const productData = {
                        product_id: publishedProduct.product_id,
                        name: formData.name,
                        description: formData.description,
                        price: parseFloat(formData.price),
                        image_url: formData.image_url,
                        category: formData.category,
                        is_featured: formData.is_featured,
                        is_active: true,
                        tags: null
                      };
                      
                      await publishProduct(productData);
                      toast({
                        title: "Sucesso",
                        description: "Produto atualizado com sucesso",
                      });
                      fetchData();
                      setIsEditing(false);
                    }
                  }
                }}
                disabled={!isFormValid}
              >
                Salvar Alterações
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublishProductsTable;
