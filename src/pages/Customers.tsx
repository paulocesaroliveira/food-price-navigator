
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const Customers = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seu cadastro de clientes
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta página será implementada com a funcionalidade completa de clientes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
