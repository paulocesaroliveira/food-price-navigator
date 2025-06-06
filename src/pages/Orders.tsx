
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

const Orders = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <ShoppingCart className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">
            Gerencie pedidos e entregas
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta página será implementada com a funcionalidade completa de pedidos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
