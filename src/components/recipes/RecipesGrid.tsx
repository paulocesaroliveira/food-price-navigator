
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RecipeCard } from "./RecipeCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Recipe {
  id: string;
  name: string;
  portions: number;
  total_cost: number;
  unit_cost: number;
  notes?: string;
  image_url?: string;
  created_at: string;
  category?: {
    id: string;
    name: string;
  };
}

interface RecipesGridProps {
  recipes: Recipe[];
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  searchTerm?: string;
  deletingRecipeId?: string;
}

export function RecipesGrid({ 
  recipes, 
  onEdit, 
  onDelete, 
  isLoading = false, 
  searchTerm = "",
  deletingRecipeId 
}: RecipesGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Carregando receitas...</p>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? "Nenhuma receita encontrada para sua busca." : "Nenhuma receita cadastrada ainda."}
          </p>
          {searchTerm && (
            <p className="text-sm text-gray-400 mt-2">
              Tente usar outros termos de busca
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deletingRecipeId === recipe.id}
        />
      ))}
    </div>
  );
}
