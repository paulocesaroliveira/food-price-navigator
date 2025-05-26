
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ProdutosTab = () => {
  const productSales = [
    { produto: "Bolo de Chocolate", vendas: 156, receita: 8900 },
    { produto: "Torta de Morango", vendas: 134, receita: 7850 },
    { produto: "Brigadeiro Gourmet", vendas: 245, receita: 4900 },
    { produto: "Cupcake Diversos", vendas: 189, receita: 5670 },
    { produto: "Pão de Açúcar", vendas: 98, receita: 3920 }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productSales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="produto" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Vendas']} />
                <Bar dataKey="vendas" fill="#E76F51" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita por Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productSales.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">{product.produto}</span>
                    <span className="text-sm text-muted-foreground">{product.vendas} unidades</span>
                  </div>
                  <span className="font-bold">{formatCurrency(product.receita)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProdutosTab;
