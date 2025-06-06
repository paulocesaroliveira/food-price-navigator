
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

const Products = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Package className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos e precificação
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta página será implementada com a funcionalidade completa de produtos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
