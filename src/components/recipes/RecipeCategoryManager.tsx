
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings, ChefHat } from "lucide-react";
import { CategoryManager } from "@/components/shared/CategoryManager";

interface RecipeCategory {
  id: string;
  name: string;
}

interface RecipeCategoryManagerProps {
  categories: RecipeCategory[];
  onCategoriesChange: () => void;
}

export const RecipeCategoryManager: React.FC<RecipeCategoryManagerProps> = ({
  categories,
  onCategoriesChange,
}) => {
  return (
    <CategoryManager
      title="Gerenciar Categorias de Receitas"
      description="Organize suas receitas em categorias para facilitar a busca e organização"
      tableName="recipe_categories"
      queryKey="recipe-categories"
      icon={ChefHat}
      onCategoriesChange={onCategoriesChange}
    >
      <Button variant="outline" className="gap-2">
        <Settings className="h-4 w-4" />
        Gerenciar Categorias
      </Button>
    </CategoryManager>
  );
};
