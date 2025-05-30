
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Package, ChefHat, AlertCircle, CheckCircle, TrendingUp, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  recalculateAllCosts, 
  recalculateIngredientChain, 
  recalculatePackagingChain,
  fetchIngredients,
  fetchPackaging,
  UpdateAllResult,
  UpdateChainResult,
  Ingredient,
  Packaging
} from "@/services/costUpdate";
import { useQueryClient } from "@tanstack/react-query";

const CostUpdate = () => {
  const queryClient = useQueryClient();
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [isUpdatingIngredients, setIsUpdatingIngredients] = useState(false);
  const [isUpdatingPackaging, setIsUpdatingPackaging] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedPackaging, setSelectedPackaging] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [packaging, setPackaging] = useState<Packaging[]>([]);
  const [lastUpdate, setLastUpdate] = useState<UpdateAllResult | UpdateChainResult | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ingredientsData, packagingData] = await Promise.all([
        fetchIngredients(),
        fetchPackaging()
      ]);
      setIngredients(ingredientsData);
      setPackaging(packagingData);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro ao carregar dados: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const invalidateAllQueries = () => {
    // Invalidar todos os caches relacionados
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['recipes'] });
    queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    queryClient.invalidateQueries({ queryKey: ['packaging'] });
    
    // Forçar recarregamento imediato
    queryClient.refetchQueries({ queryKey: ['products'] });
    queryClient.refetchQueries({ queryKey: ['recipes'] });
  };

  const handleUpdateAll = async () => {
    setIsUpdatingAll(true);
    try {
      const result = await recalculateAllCosts();
      setLastUpdate(result);
      
      invalidateAllQueries();
      
      toast({
        title: "Sucesso",
        description: `Recálculo completo concluído! ${result.updated_recipes} receitas e ${result.updated_products} produtos atualizados.`,
      });
      
      if (result.errors && result.errors.length > 0) {
        console.error("Erros durante o recálculo:", result.errors);
        toast({
          title: "Atenção",
          description: `Alguns erros ocorreram. Verifique o console para detalhes.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro ao recalcular custos: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingAll(false);
    }
  };

  const handleUpdateIngredientChain = async () => {
    if (selectedIngredients.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um ingrediente.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingIngredients(true);
    try {
      const result = await recalculateIngredientChain(selectedIngredients);
      setLastUpdate(result);
      
      invalidateAllQueries();
      
      toast({
        title: "Sucesso",
        description: `Cadeia de ingredientes atualizada! ${result.affected_recipes} receitas e ${result.affected_products} produtos afetados.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro ao atualizar cadeia: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingIngredients(false);
    }
  };

  const handleUpdatePackagingChain = async () => {
    if (selectedPackaging.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma embalagem.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPackaging(true);
    try {
      const result = await recalculatePackagingChain(selectedPackaging);
      setLastUpdate(result);
      
      invalidateAllQueries();
      
      toast({
        title: "Sucesso",
        description: `Cadeia de embalagens atualizada! ${result.affected_products} produtos afetados.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro ao atualizar cadeia: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPackaging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-blue-600 rounded-full">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Atualização de Custos
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mantenha seus custos sempre atualizados e seus cálculos precisos com nossa ferramenta de recálculo automático.
          </p>
        </div>

        {/* Atualização Completa */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Atualização Completa</h3>
                <p className="text-blue-100 font-normal">Recalcula todo o sistema em uma única operação</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-blue-100">
                Recalcula todos os custos do sistema seguindo a ordem: ingredientes → receitas → produtos
              </p>
              <Button 
                onClick={handleUpdateAll}
                disabled={isUpdatingAll}
                className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 h-auto"
                size="lg"
              >
                {isUpdatingAll && <RefreshCw className="mr-2 h-5 w-5 animate-spin" />}
                {isUpdatingAll ? "Atualizando Sistema..." : "Recalcular Todo o Sistema"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Atualização por Ingredientes */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <ChefHat className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Ingredientes</h3>
                  <p className="text-green-100 font-normal text-sm">Atualização seletiva</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-muted-foreground">
                Selecione ingredientes específicos para recalcular apenas receitas e produtos afetados
              </p>
              
              <Select value="" onValueChange={(value) => {
                if (value && !selectedIngredients.includes(value)) {
                  setSelectedIngredients([...selectedIngredients, value]);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione ingredientes..." />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map((ingredient) => (
                    <SelectItem key={ingredient.id} value={ingredient.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{ingredient.name} - {ingredient.brand}</span>
                        <span className="text-green-600 font-semibold ml-2">
                          R$ {ingredient.unit_cost.toFixed(2)}/{ingredient.unit}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedIngredients.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Ingredientes selecionados:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedIngredients.map((id) => {
                      const ingredient = ingredients.find(i => i.id === id);
                      return ingredient ? (
                        <Badge 
                          key={id} 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors" 
                          onClick={() => {
                            setSelectedIngredients(selectedIngredients.filter(i => i !== id));
                          }}
                        >
                          {ingredient.name} ×
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleUpdateIngredientChain}
                disabled={isUpdatingIngredients || selectedIngredients.length === 0}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isUpdatingIngredients && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                {isUpdatingIngredients ? "Atualizando..." : "Atualizar Cadeia de Ingredientes"}
              </Button>
            </CardContent>
          </Card>

          {/* Atualização por Embalagens */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Embalagens</h3>
                  <p className="text-purple-100 font-normal text-sm">Atualização seletiva</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-muted-foreground">
                Selecione embalagens específicas para recalcular apenas produtos afetados
              </p>
              
              <Select value="" onValueChange={(value) => {
                if (value && !selectedPackaging.includes(value)) {
                  setSelectedPackaging([...selectedPackaging, value]);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione embalagens..." />
                </SelectTrigger>
                <SelectContent>
                  {packaging.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{pkg.name} - {pkg.type}</span>
                        <span className="text-purple-600 font-semibold ml-2">
                          R$ {pkg.unit_cost.toFixed(2)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedPackaging.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Embalagens selecionadas:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPackaging.map((id) => {
                      const pkg = packaging.find(p => p.id === id);
                      return pkg ? (
                        <Badge 
                          key={id} 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors" 
                          onClick={() => {
                            setSelectedPackaging(selectedPackaging.filter(p => p !== id));
                          }}
                        >
                          {pkg.name} ×
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleUpdatePackagingChain}
                disabled={isUpdatingPackaging || selectedPackaging.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isUpdatingPackaging && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                {isUpdatingPackaging ? "Atualizando..." : "Atualizar Cadeia de Embalagens"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resultado da Última Atualização */}
        {lastUpdate && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-emerald-800">Última Atualização</h3>
                  <p className="text-emerald-600 font-normal">Resultados da operação mais recente</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {'updated_recipes' in lastUpdate ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Receitas Atualizadas</p>
                    <p className="text-3xl font-bold text-blue-600">{lastUpdate.updated_recipes}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Produtos Atualizados</p>
                    <p className="text-3xl font-bold text-green-600">{lastUpdate.updated_products}</p>
                  </div>
                  {lastUpdate.errors && lastUpdate.errors.length > 0 && (
                    <div className="text-center p-4 bg-orange-50 rounded-lg shadow-sm">
                      <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Erros Encontrados</p>
                      <p className="text-3xl font-bold text-orange-600">{lastUpdate.errors.length}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <ChefHat className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Receitas Afetadas</p>
                    <p className="text-3xl font-bold text-blue-600">{lastUpdate.affected_recipes}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Produtos Afetados</p>
                    <p className="text-3xl font-bold text-green-600">{lastUpdate.affected_products}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CostUpdate;
