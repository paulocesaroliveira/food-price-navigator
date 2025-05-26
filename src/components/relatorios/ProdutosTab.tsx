
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const ProdutosTab = () => {
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['product-sales-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          unit_price,
          total_price,
          products (
            name
          )
        `);

      if (error) throw error;

      // Agrupar dados por produto
      const productSales = data?.reduce((acc, item) => {
        const productName = item.products?.name || 'Produto sem nome';
        if (!acc[productName]) {
          acc[productName] = {
            produto: productName,
            vendas: 0,
            receita: 0
          };
        }
        acc[productName].vendas += item.quantity;
        acc[productName].receita += item.total_price || 0;
        return acc;
      }, {} as Record<string, any>) || {};

      return Object.values(productSales).sort((a, b) => b.receita - a.receita).slice(0, 5);
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8">
          <p>Carregando dados dos produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {salesData && salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="produto" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Vendas']} />
                  <Bar dataKey="vendas" fill="#E76F51" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">Nenhum dado de vendas encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita por Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData && salesData.length > 0 ? (
                salesData.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium">{product.produto}</span>
                      <span className="text-sm text-muted-foreground">{product.vendas} unidades</span>
                    </div>
                    <span className="font-bold">{formatCurrency(product.receita)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">Nenhum dado de receita encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProdutosTab;
