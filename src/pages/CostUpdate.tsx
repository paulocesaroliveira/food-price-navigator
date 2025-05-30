
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, AlertTriangle, CheckCircle, TrendingUp, Database, Package, ChefHat, Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  recalculateAllCosts, 
  recalculateIngredientChain,
  recalculatePackagingChain,
  fetchIngredients,
  fetchPackaging,
  UpdateAllResult,
  UpdateChainResult 
} from "@/services/costUpdateService";
import { fetchRecipes } from "@/services/recipeService";
import { getProductList } from "@/services/productService";

const CostUpdate = () => {
  const [updateResult, setUpdateResult] = useState<UpdateAllResult | null>(null);
  const [chainResult, setChainResult] = useState<UpdateChainResult | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedPackaging, setSelectedPackaging] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Buscar dados para estatísticas
  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProductList,
  });

  const { data: ingredients = [] } = useQuery({
    queryKey: ['ingredients'],
    queryFn: fetchIngredients,
  });

  const { data: packaging = [] } = useQuery({
    queryKey: ['packaging'],
    queryFn: fetchPackaging,
  });

  // Mutation para recalcular todos os custos
  const recalculateAllMutation = useMutation({
    mutationFn: recalculateAllCosts,
    onSuccess: (result) => {
      setUpdateResult(result);
      setChainResult(null);
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      if (result.errors.length > 0) {
        toast({
          title: "⚠️ Atualização concluída com avisos",
          description: `${result.updated_recipes} receitas e ${result.updated_products} produtos atualizados, mas houve ${result.errors.length} erro(s).`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "✅ Atualização concluída com sucesso!",
          description: `${result.updated_recipes} receitas e ${result.updated_products} produtos foram atualizados.`,
        });
      }
    },
    onError: (error: any) => {
      console.error('❌ Erro na atualização completa:', error);
      toast({
        title: "❌ Erro na atualização",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation para recalcular cadeia específica de ingredientes
  const recalculateIngredientChainMutation = useMutation({
    mutationFn: (ingredientIds: string[]) => recalculateIngredientChain(ingredientIds),
    onSuccess: (result) => {
      setChainResult(result);
      setUpdateResult(null);
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast({
        title: "✅ Atualização da cadeia de ingredientes concluída!",
        description: `${result.affected_recipes} receitas e ${result.affected_products} produtos foram atualizados.`,
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro na atualização da cadeia de ingredientes:', error);
      toast({
        title: "❌ Erro na atualização da cadeia",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation para recalcular cadeia específica de embalagens
  const recalculatePackagingChainMutation = useMutation({
    mutationFn: (packagingIds: string[]) => recalculatePackagingChain(packagingIds),
    onSuccess: (result) => {
      setChainResult(result);
      setUpdateResult(null);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast({
        title: "✅ Atualização da cadeia de embalagens concluída!",
        description: `${result.affected_products} produtos foram atualizados.`,
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro na atualização da cadeia de embalagens:', error);
      toast({
        title: "❌ Erro na atualização da cadeia",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleToggleIngredient = (ingredientId: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredientId) 
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId]
    );
  };

  const handleTogglePackaging = (packagingId: string) => {
    setSelectedPackaging(prev => 
      prev.includes(packagingId) 
        ? prev.filter(id => id !== packagingId)
        : [...prev, packagingId]
    );
  };

  const isLoading = recalculateAllMutation.isPending || 
                   recalculateIngredientChainMutation.isPending || 
                   recalculatePackagingChainMutation.isPending;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-food-vanilla via-food-cream to-food-vanilla p-6 rounded-xl border shadow-soft">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-food-coral/20 flex items-center justify-center">
            <Database className="h-8 w-8 text-food-coral" />
          </div>
          <div>
            <h1 className="text-3xl font-poppins font-bold text-food-dark">
              Atualização de Custos
            </h1>
            <p className="text-muted-foreground">
              Sistema manual para recalcular custos em toda a cadeia produtiva
            </p>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingredientes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ingredients.length}</div>
            <p className="text-xs text-muted-foreground">
              Base das receitas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Embalagens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packaging.length}</div>
            <p className="text-xs text-muted-foreground">
              Base dos produtos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recipes.length}</div>
            <p className="text-xs text-muted-foreground">
              Dependem dos ingredientes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Dependem das receitas e embalagens
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fluxo da Cadeia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-food-coral" />
            Fluxo da Cadeia de Custos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-food-coral/20 flex items-center justify-center mx-auto mb-2">
                <Package className="h-8 w-8 text-food-coral" />
              </div>
              <p className="font-semibold">Ingredientes</p>
              <p className="text-xs text-muted-foreground">Custo unitário</p>
            </div>
            
            <div className="text-2xl text-food-coral">→</div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-food-amber/20 flex items-center justify-center mx-auto mb-2">
                <ChefHat className="h-8 w-8 text-food-amber" />
              </div>
              <p className="font-semibold">Receitas</p>
              <p className="text-xs text-muted-foreground">Custo por porção</p>
            </div>
            
            <div className="text-2xl text-food-coral">→</div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-food-sage/20 flex items-center justify-center mx-auto mb-2">
                <Package className="h-8 w-8 text-food-sage" />
              </div>
              <p className="font-semibold">Embalagens</p>
              <p className="text-xs text-muted-foreground">Custo unitário</p>
            </div>
            
            <div className="text-2xl text-food-coral">→</div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-food-coral/20 flex items-center justify-center mx-auto mb-2">
                <Calculator className="h-8 w-8 text-food-coral" />
              </div>
              <p className="font-semibold">Produtos</p>
              <p className="text-xs text-muted-foreground">Custo total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opções de Atualização */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Atualização Completa */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-food-dark">🔄 Atualização Completa</CardTitle>
            <p className="text-sm text-muted-foreground">
              Recalcula todos os custos da cadeia produtiva
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Esta ação irá recalcular todos os custos de ingredientes, embalagens, receitas e produtos.
                Use quando houver mudanças significativas nos preços.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={() => recalculateAllMutation.mutate()}
              disabled={isLoading}
              className="w-full bg-food-coral hover:bg-food-coral/90"
            >
              {isLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Recalcular Todos os Custos
            </Button>
          </CardContent>
        </Card>

        {/* Atualização Seletiva - Ingredientes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-food-dark">🎯 Ingredientes Alterados</CardTitle>
            <p className="text-sm text-muted-foreground">
              Recalcula apenas receitas afetadas por ingredientes específicos
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-48 overflow-y-auto border rounded-lg p-3">
              <p className="text-sm font-medium mb-2">Selecione os ingredientes alterados:</p>
              <div className="space-y-2">
                {ingredients.map((ingredient) => (
                  <div key={ingredient.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={ingredient.id}
                      checked={selectedIngredients.includes(ingredient.id)}
                      onChange={() => handleToggleIngredient(ingredient.id)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={ingredient.id} className="text-sm">
                      {ingredient.name} - R$ {ingredient.unit_cost}/{ingredient.unit}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={() => recalculateIngredientChainMutation.mutate(selectedIngredients)}
              disabled={isLoading || selectedIngredients.length === 0}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="mr-2 h-4 w-4" />
              )}
              Recalcular Ingredientes ({selectedIngredients.length})
            </Button>
          </CardContent>
        </Card>

        {/* Atualização Seletiva - Embalagens */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-food-dark">📦 Embalagens Alteradas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Recalcula apenas produtos afetados por embalagens específicas
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-48 overflow-y-auto border rounded-lg p-3">
              <p className="text-sm font-medium mb-2">Selecione as embalagens alteradas:</p>
              <div className="space-y-2">
                {packaging.map((pack) => (
                  <div key={pack.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={pack.id}
                      checked={selectedPackaging.includes(pack.id)}
                      onChange={() => handleTogglePackaging(pack.id)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={pack.id} className="text-sm">
                      {pack.name} ({pack.type}) - R$ {pack.unit_cost}/unidade
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={() => recalculatePackagingChainMutation.mutate(selectedPackaging)}
              disabled={isLoading || selectedPackaging.length === 0}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="mr-2 h-4 w-4" />
              )}
              Recalcular Embalagens ({selectedPackaging.length})
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progresso */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processando atualizações...</span>
                <span>Aguarde</span>
              </div>
              <Progress value={undefined} className="w-full" />
              <p className="text-xs text-muted-foreground text-center">
                Verifique o console do navegador para acompanhar o progresso detalhado
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {(updateResult || chainResult) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resultado da Atualização
            </CardTitle>
          </CardHeader>
          <CardContent>
            {updateResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{updateResult.updated_recipes}</p>
                    <p className="text-sm text-muted-foreground">Receitas atualizadas</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{updateResult.updated_products}</p>
                    <p className="text-sm text-muted-foreground">Produtos atualizados</p>
                  </div>
                </div>
                
                {updateResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-semibold text-destructive">Erros encontrados:</p>
                    {updateResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {chainResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{chainResult.affected_recipes}</p>
                    <p className="text-sm text-muted-foreground">Receitas afetadas</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{chainResult.affected_products}</p>
                    <p className="text-sm text-muted-foreground">Produtos afetados</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Apenas os itens diretamente relacionados foram atualizados.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CostUpdate;
