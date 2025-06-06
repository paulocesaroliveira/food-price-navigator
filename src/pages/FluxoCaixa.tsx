
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const FluxoCaixa = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">
            Acompanhe entradas e saídas financeiras
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimentação Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta página será implementada com a funcionalidade completa de fluxo de caixa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FluxoCaixa;
