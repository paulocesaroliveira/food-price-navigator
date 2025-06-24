
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings, Package } from "lucide-react";
import { ProductCategory } from "@/types";
import { CategoryManager } from "@/components/shared/CategoryManager";

interface ProductCategoryManagerProps {
  categories: ProductCategory[];
  onCategoriesChange: () => void;
}

export const ProductCategoryManager: React.FC<ProductCategoryManagerProps> = ({
  categories,
  onCategoriesChange,
}) => {
  return (
    <CategoryManager
      title="Gerenciar Categorias de Produtos"
      description="Organize seus produtos em categorias para melhor controle e organização"
      tableName="product_categories"
      queryKey="product-categories"
      icon={Package}
      onCategoriesChange={onCategoriesChange}
    >
      <Button variant="outline" size="sm" className="gap-2">
        <Settings className="h-4 w-4" />
        Categorias
      </Button>
    </CategoryManager>
  );
};
