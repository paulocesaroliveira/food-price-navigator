import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

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

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function RecipeCard({ recipe, onEdit, onDelete, isDeleting = false }: RecipeCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow relative">
      <LoadingOverlay isLoading={isDeleting} message="Excluindo..." />
      
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{recipe.name}</CardTitle>
            <CardDescription>
              {recipe.portions} {recipe.portions === 1 ? 'porção' : 'porções'}
            </CardDescription>
          </div>
          {recipe.category && (
            <Badge variant="secondary" className="shrink-0">
              {recipe.category.name}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Custo Total</p>
            <p className="font-semibold">R$ {recipe.total_cost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Custo por Porção</p>
            <p className="font-semibold">R$ {recipe.unit_cost.toFixed(2)}</p>
          </div>
        </div>
        
        {recipe.notes && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{recipe.notes}</p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(recipe)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Excluir</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a receita "{recipe.name}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(recipe.id)}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
