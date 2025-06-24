
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings, Package2 } from "lucide-react";

interface PackagingCategoryManagerProps {
  onCategoriesChange: () => void;
}

// Componente removido temporariamente - Embalagens não terão categorias por enquanto
export const PackagingCategoryManager: React.FC<PackagingCategoryManagerProps> = ({
  onCategoriesChange,
}) => {
  return null; // Retorna null para não exibir nada
};
