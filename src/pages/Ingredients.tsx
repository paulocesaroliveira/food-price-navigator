
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat } from "lucide-react";

const Ingredients = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <ChefHat className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Ingredientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus ingredientes e custos
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ingredientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta página será implementada com a funcionalidade completa de ingredientes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Ingredients;
