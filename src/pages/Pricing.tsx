
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Product, PricingConfiguration } from "@/types";
import { 
  FilePenLine, 
  FileText, 
  Calculator, 
  Plus, 
  ArrowLeft,
  History,
  Download
} from "lucide-react";
import ProductSelector from "@/components/pricing/ProductSelector";
import PricingForm from "@/components/pricing/PricingForm";
import PricingConfigsList from "@/components/pricing/PricingConfigsList";
import { 
  getPricingConfigs, 
  getPricingConfig, 
  createPricingConfig, 
  updatePricingConfig, 
  deletePricingConfig,
  duplicatePricingConfig 
} from "@/services/pricingService";
import { getProductList } from "@/services/productService";
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

enum PricingMode {
  LIST = "list",
  HISTORY = "history",
  CREATE = "create",
  VIEW = "view",
  EDIT = "edit"
}

const Pricing = () => {
  const [tab, setTab] = useState("create");
  const [mode, setMode] = useState<PricingMode>(PricingMode.LIST);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: getProductList
  });
  
  // Fetch pricing configs
  const { data: pricingConfigs = [], isLoading: isLoadingConfigs } = useQuery({
    queryKey: ["pricing-configs"],
    queryFn: () => getPricingConfigs()
  });
  
  // Fetch current config if in VIEW or EDIT mode
  const { data: currentConfig, isLoading: isLoadingCurrentConfig } = useQuery({
    queryKey: ["pricing-config", currentConfigId],
    queryFn: () => currentConfigId ? getPricingConfig(currentConfigId) : null,
    enabled: !!currentConfigId && (mode === PricingMode.VIEW || mode === PricingMode.EDIT)
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
      setMode(PricingMode.HISTORY);
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
      setMode(PricingMode.HISTORY);
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
  
  // Handle product selection
  const handleProductsSelected = (products: Product[]) => {
    setSelectedProducts(products);
  };
  
  // Handle save pricing
  const handleSavePricing = async (config: Omit<PricingConfiguration, "id" | "createdAt" | "updatedAt">) => {
    if (mode === PricingMode.EDIT && currentConfigId) {
      updateMutation.mutate({ id: currentConfigId, config });
    } else {
      createMutation.mutate(config);
    }
  };
  
  // Handle view config
  const handleViewConfig = (id: string) => {
    setCurrentConfigId(id);
    setMode(PricingMode.VIEW);
    setTab("create");
  };
  
  // Handle edit config
  const handleEditConfig = (id: string) => {
    setCurrentConfigId(id);
    setMode(PricingMode.EDIT);
    setTab("create");
  };
  
  // Handle duplicate config
  const handleDuplicateConfig = (id: string) => {
    duplicateMutation.mutate({ id });
  };
  
  // Handle delete config
  const confirmDeleteConfig = (id: string) => {
    setConfigToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const executeDeleteConfig = () => {
    if (configToDelete) {
      deleteMutation.mutate(configToDelete);
      setDeleteDialogOpen(false);
      setConfigToDelete(null);
    }
  };
  
  // Find the product for current config
  const findProductForConfig = () => {
    if (!currentConfig) return null;
    return products.find(p => p.id === currentConfig.productId);
  };
  
  // Reset to list mode
  const goBack = () => {
    setMode(PricingMode.LIST);
    setCurrentConfigId(null);
  };
  
  // Switch to history mode
  const viewHistory = () => {
    setMode(PricingMode.HISTORY);
    setCurrentConfigId(null);
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
      
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="bg-food-vanilla/50 p-1">
          <TabsTrigger 
            value="create" 
            onClick={() => setMode(PricingMode.LIST)}
            className="data-[state=active]:bg-food-white data-[state=active]:text-food-coral"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Precificação
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            onClick={viewHistory}
            className="data-[state=active]:bg-food-white data-[state=active]:text-food-coral"
          >
            <History className="h-4 w-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-4">
          {mode === PricingMode.LIST && (
            <Card className="border shadow-soft rounded-xl bg-food-white">
              <CardHeader className="bg-gradient-to-r from-food-vanilla to-food-cream rounded-t-xl">
                <CardTitle className="flex items-center gap-2 font-poppins text-food-dark">
                  <Plus className="h-5 w-5 text-food-coral" />
                  Selecione os produtos
                </CardTitle>
                <CardDescription>
                  Escolha um ou mais produtos para calcular o preço
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <ProductSelector 
                  onProductsSelected={handleProductsSelected}
                  selectedProducts={selectedProducts}
                />
                
                {selectedProducts.length > 0 && (
                  <Button 
                    onClick={() => setMode(PricingMode.CREATE)}
                    className="w-full mt-4 bg-food-coral hover:bg-food-amber text-white transition-colors"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Calcular Preço ({selectedProducts.length} produtos)
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
          
          {mode === PricingMode.CREATE && selectedProducts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goBack}
                  className="mr-2 border-food-cream hover:bg-food-cream hover:text-food-coral"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
                <h2 className="text-xl font-semibold font-poppins text-food-dark">Nova Precificação</h2>
              </div>
              
              <PricingForm
                product={selectedProducts[0]}
                onSave={handleSavePricing}
                isLoading={createMutation.isPending}
              />
            </div>
          )}
          
          {(mode === PricingMode.VIEW || mode === PricingMode.EDIT) && currentConfig && (
            <div className="space-y-4">
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goBack}
                  className="mr-2 border-food-cream hover:bg-food-cream hover:text-food-coral"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
                <h2 className="text-xl font-semibold font-poppins text-food-dark">
                  {mode === PricingMode.VIEW ? "Visualizar" : "Editar"} Precificação
                </h2>
              </div>
              
              <PricingForm
                product={findProductForConfig() || products[0]}
                config={currentConfig}
                onSave={(config) => handleSavePricing(config)}
                isLoading={isLoadingCurrentConfig || updateMutation.isPending}
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history">
          <PricingConfigsList
            configs={pricingConfigs}
            onView={handleViewConfig}
            onEdit={handleEditConfig}
            onDuplicate={handleDuplicateConfig}
            onDelete={confirmDeleteConfig}
            isLoading={isLoadingConfigs}
          />
        </TabsContent>
      </Tabs>
      
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
