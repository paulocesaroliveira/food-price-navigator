
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { recipes, recipeCategories } from "@/utils/mockData";
import { formatCurrency } from "@/utils/calculations";

const Recipes = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Receitas</h1>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Nova Receita
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Receitas</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar receita..."
                  className="pl-9 w-[250px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Categoria</th>
                  <th className="text-left p-3">Porções</th>
                  <th className="text-left p-3">Custo Total</th>
                  <th className="text-left p-3">Custo por Unidade</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((recipe) => {
                  const category = recipeCategories.find(c => c.id === recipe.categoryId);
                  return (
                    <tr key={recipe.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{recipe.name}</td>
                      <td className="p-3">{category?.name}</td>
                      <td className="p-3">{recipe.portions}</td>
                      <td className="p-3">{formatCurrency(recipe.totalCost)}</td>
                      <td className="p-3">{formatCurrency(recipe.unitCost)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Recipes;
