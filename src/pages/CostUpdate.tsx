
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Package, ChefHat, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  recalculateAllCosts, 
  recalculateIngredientChain, 
  recalculatePackagingChain,
  fetchIngredients,
  fetchPackaging,
  UpdateAllResult,
  UpdateChainResult
} from "@/services/costUpdateService";
import { useQueryClient } from "@tanstack/react-query";

interface Ingredient {
  id: string;
  name: string;
  unit_cost: number;
  brand: string;
  unit: string;
}

interface Packaging {
  id: string;
  name: string;
  unit_cost: number;
  type: string;
}

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
      
      // Invalidar cache e forçar recarregamento
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
      
      // Invalidar cache e forçar recarregamento
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
      
      // Invalidar cache e forçar recarregamento
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Atualização de Custos</h1>
      </div>

      {/* Atualização Completa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Atualização Completa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Recalcula todos os custos do sistema: ingredientes → receitas → produtos
          </p>
          <Button 
            onClick={handleUpdateAll}
            disabled={isUpdatingAll}
            className="w-full"
          >
            {isUpdatingAll && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {isUpdatingAll ? "Atualizando..." : "Recalcular Todos os Custos"}
          </Button>
        </CardContent>
      </Card>

      {/* Atualização por Ingredientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Atualização por Ingredientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Selecione ingredientes para recalcular apenas receitas e produtos afetados
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
                  {ingredient.name} - {ingredient.brand} (R$ {ingredient.unit_cost.toFixed(2)}/{ingredient.unit})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedIngredients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedIngredients.map((id) => {
                const ingredient = ingredients.find(i => i.id === id);
                return ingredient ? (
                  <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => {
                    setSelectedIngredients(selectedIngredients.filter(i => i !== id));
                  }}>
                    {ingredient.name} ×
                  </Badge>
                ) : null;
              })}
            </div>
          )}

          <Button 
            onClick={handleUpdateIngredientChain}
            disabled={isUpdatingIngredients || selectedIngredients.length === 0}
            className="w-full"
          >
            {isUpdatingIngredients && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {isUpdatingIngredients ? "Atualizando..." : "Atualizar Cadeia de Ingredientes"}
          </Button>
        </CardContent>
      </Card>

      {/* Atualização por Embalagens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Atualização por Embalagens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Selecione embalagens para recalcular apenas produtos afetados
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
                  {pkg.name} - {pkg.type} (R$ {pkg.unit_cost.toFixed(2)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPackaging.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedPackaging.map((id) => {
                const pkg = packaging.find(p => p.id === id);
                return pkg ? (
                  <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => {
                    setSelectedPackaging(selectedPackaging.filter(p => p !== id));
                  }}>
                    {pkg.name} ×
                  </Badge>
                ) : null;
              })}
            </div>
          )}

          <Button 
            onClick={handleUpdatePackagingChain}
            disabled={isUpdatingPackaging || selectedPackaging.length === 0}
            className="w-full"
          >
            {isUpdatingPackaging && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {isUpdatingPackaging ? "Atualizando..." : "Atualizar Cadeia de Embalagens"}
          </Button>
        </CardContent>
      </Card>

      {/* Resultado da Última Atualização */}
      {lastUpdate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Última Atualização
            </CardTitle>
          </CardHeader>
          <CardContent>
            {'updated_recipes' in lastUpdate ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Receitas Atualizadas</p>
                  <p className="text-2xl font-bold">{lastUpdate.updated_recipes}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Produtos Atualizados</p>
                  <p className="text-2xl font-bold">{lastUpdate.updated_products}</p>
                </div>
                {lastUpdate.errors && lastUpdate.errors.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      Erros: {lastUpdate.errors.length}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Receitas Afetadas</p>
                  <p className="text-2xl font-bold">{lastUpdate.affected_recipes}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Produtos Afetados</p>
                  <p className="text-2xl font-bold">{lastUpdate.affected_products}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CostUpdate;
