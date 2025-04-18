
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Product, PricingConfiguration } from "@/types";
import { 
  Calculator, 
  Plus, 
  ArrowLeft,
  Search,
  Package,
  FileText,
  Download,
  DollarSign,
  Edit,
  Trash2,
  Copy,
  Filter,
  X
} from "lucide-react";
import PricingForm from "@/components/pricing/PricingForm";
import { 
  getPricingConfigs, 
  getPricingConfig, 
  createPricingConfig, 
  updatePricingConfig, 
  deletePricingConfig,
  duplicatePricingConfig 
} from "@/services/pricingService";
import { getProductList, searchProducts } from "@/services/productService";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/calculations";

enum PricingMode {
  LIST = "list",
  CREATE = "create",
  EDIT = "edit"
}

const Pricing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mode, setMode] = useState<PricingMode>(PricingMode.LIST);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch products
  const { data: products = [], isLoading: isLoadingProducts, refetch: refetchProducts } = useQuery({
    queryKey: ["products"],
    queryFn: getProductList
  });
  
  // Get all pricing configs to check if a product already has pricing
  const { data: allPricingConfigs = [], isLoading: isLoadingConfigs } = useQuery({
    queryKey: ["pricing-configs"],
    queryFn: () => getPricingConfigs()
  });
  
  // Fetch current config if in EDIT mode
  const { data: currentConfig, isLoading: isLoadingCurrentConfig } = useQuery({
    queryKey: ["pricing-config", currentConfigId],
    queryFn: () => currentConfigId ? getPricingConfig(currentConfigId) : null,
    enabled: !!currentConfigId
  });
  
  // Create pricing config mutation
  const createMutation = useMutation({
    mutationFn: createPricingConfig,
    onSuccess: () => {
      toast({
        title: "Precificação salva",
        description: "A configuração de preço foi salva com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["pricing-configs"] });
      setPricingDialogOpen(false);
      setCurrentProduct(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: `Ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  });
  
  // Update pricing config mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, config }: { id: string; config: Omit<PricingConfiguration, "id" | "createdAt" | "updatedAt"> }) => 
      updatePricingConfig(id, config),
    onSuccess: () => {
      toast({
        title: "Precificação atualizada",
        description: "A configuração de preço foi atualizada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["pricing-configs"] });
      queryClient.invalidateQueries({ queryKey: ["pricing-config", currentConfigId] });
      setPricingDialogOpen(false);
      setCurrentProduct(null);
      setCurrentConfigId(null);
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description: `Ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  });
  
  // Delete pricing config mutation
  const deleteMutation = useMutation({
    mutationFn: deletePricingConfig,
    onSuccess: () => {
      toast({
        title: "Precificação excluída",
        description: "A configuração de preço foi excluída com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["pricing-configs"] });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir",
        description: `Ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  });
  
  // Duplicate pricing config mutation
  const duplicateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) => 
      duplicatePricingConfig(id, name),
    onSuccess: () => {
      toast({
        title: "Precificação duplicada",
        description: "A configuração de preço foi duplicada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["pricing-configs"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao duplicar",
        description: `Ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  });
  
  // Handle save pricing
  const handleSavePricing = async (config: Omit<PricingConfiguration, "id" | "createdAt" | "updatedAt">) => {
    if (isEditing && currentConfigId) {
      updateMutation.mutate({ id: currentConfigId, config });
    } else {
      createMutation.mutate(config);
    }
  };
  
  // Search products
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchTerm) {
        try {
          const results = await searchProducts(searchTerm);
          queryClient.setQueryData(['products'], results);
        } catch (error: any) {
          toast({
            title: "Erro",
            description: `Erro na busca: ${error.message}`,
            variant: "destructive",
          });
        }
      } else {
        refetchProducts();
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchTerm, queryClient, refetchProducts]);
  
  // Handle edit pricing
  const openPricingDialog = (product: Product) => {
    setCurrentProduct(product);
    
    // Check if product already has a pricing config
    const existingConfig = allPricingConfigs.find(config => config.productId === product.id);
    
    if (existingConfig) {
      setCurrentConfigId(existingConfig.id);
      setIsEditing(true);
    } else {
      setCurrentConfigId(null);
      setIsEditing(false);
    }
    
    setPricingDialogOpen(true);
  };
  
  // Handle duplicate config
  const handleDuplicateConfig = (productId: string) => {
    const config = allPricingConfigs.find(config => config.productId === productId);
    if (config) {
      duplicateMutation.mutate({ id: config.id });
    }
  };
  
  // Handle delete config
  const confirmDeleteConfig = (productId: string) => {
    const config = allPricingConfigs.find(config => config.productId === productId);
    if (config) {
      setConfigToDelete(config.id);
      setDeleteDialogOpen(true);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível encontrar a configuração de preço para este produto",
        variant: "destructive"
      });
    }
  };
  
  const executeDeleteConfig = () => {
    if (configToDelete) {
      deleteMutation.mutate(configToDelete);
      setDeleteDialogOpen(false);
      setConfigToDelete(null);
    }
  };
  
  // Check if a product has pricing
  const productHasPricing = (productId: string) => {
    return allPricingConfigs.some(config => config.productId === productId);
  };
  
  // Get pricing config for a product
  const getPricingForProduct = (productId: string) => {
    return allPricingConfigs.find(config => config.productId === productId);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };
  
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-food-vanilla/30 p-4 rounded-xl">
        <div>
          <h1 className="text-3xl font-poppins font-semibold tracking-tight text-food-dark">Precificação</h1>
          <p className="text-muted-foreground mt-1">
            Calcule os preços dos seus produtos com base nos custos e margens desejadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1 border-food-coral text-food-coral hover:bg-food-cream hover:text-food-coral"
          >
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Exportar</span> PDF
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1 border-food-coral text-food-coral hover:bg-food-cream hover:text-food-coral"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Exportar</span> Excel
          </Button>
        </div>
      </div>
      
      <Card className="border shadow-soft rounded-xl bg-food-white">
        <CardHeader className="bg-gradient-to-r from-food-vanilla to-food-cream rounded-t-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="font-poppins text-food-dark">
              Produtos para Precificação
            </CardTitle>
            <CardDescription>
              Selecione um produto para calcular ou editar seu preço de venda
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar produto..."
                className="pl-9 w-[200px] md:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingProducts || isLoadingConfigs ? (
            <div className="flex justify-center py-8">
              <p>Carregando produtos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum produto encontrado</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchTerm ? (
                  <>
                    Nenhum produto corresponde à sua busca.
                    <Button variant="link" onClick={clearSearch} className="p-0 h-auto text-sm underline ml-1">
                      Limpar busca
                    </Button>
                  </>
                ) : (
                  "Adicione produtos na seção 'Produtos' para poder precificá-los."
                )}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>Preço Sugerido</TableHead>
                    <TableHead>Preço Final</TableHead>
                    <TableHead>Margem</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const pricing = getPricingForProduct(product.id);
                    const hasPricing = !!pricing;
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <div className="h-10 w-10 rounded-md overflow-hidden">
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{product.category?.name || "Sem categoria"}</TableCell>
                        <TableCell>{formatCurrency(product.totalCost)}</TableCell>
                        <TableCell>
                          {hasPricing ? formatCurrency(pricing.idealPrice) : "-"}
                        </TableCell>
                        <TableCell>
                          {hasPricing ? (
                            <span className="font-medium">{formatCurrency(pricing.finalPrice)}</span>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          {hasPricing ? `${pricing.actualMargin.toFixed(1)}%` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              onClick={() => openPricingDialog(product)}
                            >
                              {hasPricing ? (
                                <>
                                  <Edit className="h-4 w-4" />
                                  <span className="hidden sm:inline">Editar</span>
                                </>
                              ) : (
                                <>
                                  <Calculator className="h-4 w-4" />
                                  <span className="hidden sm:inline">Precificar</span>
                                </>
                              )}
                            </Button>
                            
                            {hasPricing && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                                  onClick={() => handleDuplicateConfig(product.id)}
                                >
                                  <Copy className="h-4 w-4" />
                                  <span className="hidden sm:inline">Duplicar</span>
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1 text-red-600 hover:text-red-800 hover:bg-red-50"
                                  onClick={() => confirmDeleteConfig(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="hidden sm:inline">Excluir</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Pricing Dialog */}
      <Dialog open={pricingDialogOpen} onOpenChange={setPricingDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {isEditing ? "Editar Precificação" : "Nova Precificação"}
            </DialogTitle>
          </DialogHeader>
          
          {pricingDialogOpen && currentProduct && (
            <PricingForm
              product={currentProduct}
              config={currentConfig || undefined}
              onSave={handleSavePricing}
              isLoading={isLoadingCurrentConfig || createMutation.isPending || updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-food-white rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-poppins text-food-dark">Excluir Precificação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta precificação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-food-vanilla hover:bg-food-vanilla hover:text-food-dark">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeDeleteConfig} 
              className="bg-food-red hover:bg-food-red/80 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Pricing;
