
import React from "react";
import { Recipe } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/utils/calculations";
import { Trash2, FileText } from "lucide-react";

interface RecipeSelectorProps {
  recipes: Recipe[];
  selectedRecipes: Array<{
    recipeId: string;
    quantity: number;
    cost: number;
  }>;
  onRecipeAdd: () => void;
  onRecipeRemove: (index: number) => void;
  onRecipeChange: (index: number, recipeId: string) => void;
  onQuantityChange: (index: number, quantity: number) => void;
}

export const RecipeSelector = ({
  recipes,
  selectedRecipes,
  onRecipeAdd,
  onRecipeRemove,
  onRecipeChange,
  onQuantityChange,
}: RecipeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Receitas do Produto</h3>
        <Button onClick={onRecipeAdd} variant="outline" size="sm">
          + Adicionar Receita
        </Button>
      </div>

      {selectedRecipes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhuma receita adicionada.<br />
              Clique em "Adicionar Receita" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {selectedRecipes.map((item, index) => {
            const recipe = recipes.find(r => r.id === item.recipeId);
            return (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-1">
                      {recipe?.image ? (
                        <img
                          src={recipe.image}
                          alt={recipe.name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="col-span-6">
                      <Label className="text-sm text-muted-foreground">Receita</Label>
                      <Select
                        value={item.recipeId}
                        onValueChange={(value) => onRecipeChange(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma receita" />
                        </SelectTrigger>
                        <SelectContent>
                          {recipes.map((recipe) => (
                            <SelectItem key={recipe.id} value={recipe.id}>
                              <div className="flex items-center gap-2">
                                <span>{recipe.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatCurrency(recipe.unitCost)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label className="text-sm text-muted-foreground">Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onQuantityChange(index, Number(e.target.value))}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-sm text-muted-foreground">Custo</Label>
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(item.cost)}
                      </div>
                    </div>

                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRecipeRemove(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
