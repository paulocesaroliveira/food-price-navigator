
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

const Resale = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <RefreshCw className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Revenda</h1>
          <p className="text-muted-foreground">
            Gerencie transações de revenda
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transações de Revenda</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta página será implementada com a funcionalidade completa de revenda.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Resale;
