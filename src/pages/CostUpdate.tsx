
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Package, ChefHat, AlertCircle, CheckCircle, TrendingUp, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { syncAllCosts, CostSyncResult } from "@/services/costSync";
import { 
  fetchIngredients,
  fetchPackaging,
  Ingredient,
  Packaging
} from "@/services/costUpdate";
import { useQueryClient } from "@tanstack/react-query";

const CostUpdate = () => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [packaging, setPackaging] = useState<Packaging[]>([]);
  const [lastUpdate, setLastUpdate] = useState<CostSyncResult | null>(null);

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
    console.log('🔄 Invalidando todos os caches...');
    // Invalidar todos os caches relacionados
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['recipes'] });
    queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    queryClient.invalidateQueries({ queryKey: ['packaging'] });
    
    // Forçar recarregamento imediato
    queryClient.refetchQueries({ queryKey: ['products'] });
    queryClient.refetchQueries({ queryKey: ['recipes'] });
  };

  const handleSyncAllCosts = async () => {
    setIsUpdating(true);
    try {
      console.log('🚀 Iniciando sincronização completa...');
      const result = await syncAllCosts();
      setLastUpdate(result);
      
      // Invalidar todos os caches para forçar recarregamento
      invalidateAllQueries();
      
      toast({
        title: "Sucesso",
        description: `Sincronização concluída! ${result.updatedRecipes} receitas e ${result.updatedProducts} produtos atualizados.`,
      });
      
      if (result.errors && result.errors.length > 0) {
        console.error("Erros durante a sincronização:", result.errors);
        toast({
          title: "Atenção",
          description: `Alguns erros ocorreram. Verifique o console para detalhes.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ Erro na sincronização:', error);
      toast({
        title: "Erro",
        description: `Erro ao sincronizar custos: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
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
              Sincronização de Custos
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mantenha seus custos sempre atualizados e seus cálculos precisos com nossa ferramenta de sincronização automática.
          </p>
        </div>

        {/* Sincronização Completa */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Sincronização Completa</h3>
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
                onClick={handleSyncAllCosts}
                disabled={isUpdating}
                className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 h-auto"
                size="lg"
              >
                {isUpdating && <RefreshCw className="mr-2 h-5 w-5 animate-spin" />}
                {isUpdating ? "Sincronizando Sistema..." : "Sincronizar Todo o Sistema"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultado da Última Sincronização */}
        {lastUpdate && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-emerald-800">Última Sincronização</h3>
                  <p className="text-emerald-600 font-normal">Resultados da operação mais recente</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <ChefHat className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Receitas Atualizadas</p>
                  <p className="text-3xl font-bold text-blue-600">{lastUpdate.updatedRecipes}</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Produtos Atualizados</p>
                  <p className="text-3xl font-bold text-green-600">{lastUpdate.updatedProducts}</p>
                </div>
                {lastUpdate.errors && lastUpdate.errors.length > 0 && (
                  <div className="text-center p-4 bg-orange-50 rounded-lg shadow-sm">
                    <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Erros Encontrados</p>
                    <p className="text-3xl font-bold text-orange-600">{lastUpdate.errors.length}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status dos Dados */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <ChefHat className="h-5 w-5" />
                <span>Ingredientes no Sistema</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{ingredients.length}</p>
                <p className="text-muted-foreground">Ingredientes cadastrados</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <Package className="h-5 w-5" />
                <span>Embalagens no Sistema</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{packaging.length}</p>
                <p className="text-muted-foreground">Embalagens cadastradas</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CostUpdate;
