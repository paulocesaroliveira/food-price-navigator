
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import { ingredients, ingredientCategories } from "@/utils/mockData";
import { formatCurrency } from "@/utils/calculations";

const Ingredients = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ingredientes</h1>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Novo Ingrediente
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Ingredientes</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar ingrediente..."
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
                  <th className="text-left p-3">Marca</th>
                  <th className="text-left p-3">Unidade</th>
                  <th className="text-left p-3">Qtd. Embalagem</th>
                  <th className="text-left p-3">Preço Embalagem</th>
                  <th className="text-left p-3">Custo Unitário</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ingredient) => {
                  const category = ingredientCategories.find(c => c.id === ingredient.categoryId);
                  return (
                    <tr key={ingredient.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{ingredient.name}</td>
                      <td className="p-3">{category?.name}</td>
                      <td className="p-3">{ingredient.brand}</td>
                      <td className="p-3">{ingredient.unit}</td>
                      <td className="p-3">{ingredient.packageQuantity}</td>
                      <td className="p-3">{formatCurrency(ingredient.packagePrice)}</td>
                      <td className="p-3">{formatCurrency(ingredient.unitCost)}</td>
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

export default Ingredients;
