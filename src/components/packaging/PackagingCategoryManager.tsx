
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings, Package2 } from "lucide-react";
import { CategoryManager } from "@/components/shared/CategoryManager";

interface PackagingCategoryManagerProps {
  onCategoriesChange: () => void;
}

export const PackagingCategoryManager: React.FC<PackagingCategoryManagerProps> = ({
  onCategoriesChange,
}) => {
  return (
    <CategoryManager
      title="Gerenciar Categorias de Embalagens"
      description="Organize suas embalagens em categorias para melhor gestão do estoque"
      tableName="packaging_categories"
      queryKey="packaging-categories"
      icon={Package2}
      onCategoriesChange={onCategoriesChange}
    >
      <Button variant="outline" className="gap-2">
        <Settings className="h-4 w-4" />
        Categorias
      </Button>
    </CategoryManager>
  );
};
