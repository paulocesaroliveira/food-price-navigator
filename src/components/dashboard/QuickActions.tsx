
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, Users, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/orders">
              <Plus className="h-4 w-4 mr-2" />
              Novo Pedido
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/products">
              <Package className="h-4 w-4 mr-2" />
              Produtos
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/customers">
              <Users className="h-4 w-4 mr-2" />
              Clientes
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/sales">
              <DollarSign className="h-4 w-4 mr-2" />
              Vendas
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
