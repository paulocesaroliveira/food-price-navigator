
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { products, recipes, packaging } from "@/utils/mockData";
import { formatCurrency } from "@/utils/calculations";

const Products = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Produtos</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar produto..."
                  className="pl-9 w-[250px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Itens</th>
                  <th className="text-left p-3">Embalagem</th>
                  <th className="text-left p-3">Custo Total</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const pkg = packaging.find(p => p.id === product.packagingId);
                  const totalItems = product.items.reduce((acc, item) => acc + item.quantity, 0);
                  
                  return (
                    <tr key={product.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{product.name}</td>
                      <td className="p-3">{totalItems}</td>
                      <td className="p-3">{pkg?.name}</td>
                      <td className="p-3">{formatCurrency(product.totalCost)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
