
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Package, TrendingUp, DollarSign, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProductData {
  totalProducts: number;
  averageCost: number;
  totalValue: number;
  topSellingProducts: Array<{ name: string; sold: number; revenue: number }>;
  productsByCategory: Array<{ category: string; count: number; color: string }>;
  costDistribution: Array<{ range: string; count: number }>;
}

const ProdutosTab = () => {
  const [productData, setProductData] = useState<ProductData>({
    totalProducts: 0,
    averageCost: 0,
    totalValue: 0,
    topSellingProducts: [],
    productsByCategory: [],
    costDistribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductData();
  }, []);

  const fetchProductData = async () => {
    try {
      setLoading(true);

      // Buscar produtos
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          product_categories(name)
        `);

      if (productsError) throw productsError;

      // Buscar vendas dos produtos nos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: saleItems, error: salesError } = await supabase
        .from('sale_items')
        .select(`
          *,
          products!inner(name),
          sales!inner(sale_date)
        `)
        .gte('sales.sale_date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (salesError) throw salesError;

      // Processar dados
      const totalProducts = products?.length || 0;
      const totalValue = products?.reduce((sum, product) => sum + (product.total_cost || 0), 0) || 0;
      const averageCost = totalProducts > 0 ? totalValue / totalProducts : 0;

      // Produtos mais vendidos
      const productSalesMap = new Map();
      saleItems?.forEach(item => {
        const productName = item.products?.name || 'Produto sem nome';
        if (!productSalesMap.has(productName)) {
          productSalesMap.set(productName, { name: productName, sold: 0, revenue: 0 });
        }
        const product = productSalesMap.get(productName);
        product.sold += item.quantity || 0;
        product.revenue += item.total_price || 0;
      });

      const topSellingProducts = Array.from(productSalesMap.values())
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);

      // Produtos por categoria
      const categoryMap = new Map();
      products?.forEach(product => {
        const categoryName = product.product_categories?.name || 'Sem categoria';
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
      });

      const categoryColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
      const productsByCategory = Array.from(categoryMap.entries()).map(([category, count], index) => ({
        category,
        count,
        color: categoryColors[index % categoryColors.length]
      }));

      // Distribuição de custos
      const costRanges = [
        { range: 'R$ 0-10', min: 0, max: 10 },
        { range: 'R$ 10-25', min: 10, max: 25 },
        { range: 'R$ 25-50', min: 25, max: 50 },
        { range: 'R$ 50-100', min: 50, max: 100 },
        { range: 'R$ 100+', min: 100, max: Infinity }
      ];

      const costDistribution = costRanges.map(range => ({
        range: range.range,
        count: products?.filter(product => {
          const cost = product.total_cost || 0;
          return cost >= range.min && cost < range.max;
        }).length || 0
      }));

      setProductData({
        totalProducts,
        averageCost,
        totalValue,
        topSellingProducts,
        productsByCategory,
        costDistribution
      });

    } catch (error) {
      console.error('Erro ao buscar dados de produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productData.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {productData.averageCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Por produto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {productData.totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Valor total dos produtos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productData.productsByCategory.length}</div>
            <p className="text-xs text-muted-foreground">Categorias diferentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos mais vendidos */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
            <CardDescription>Top 5 produtos por quantidade vendida (últimos 30 dias)</CardDescription>
          </CardHeader>
          <CardContent>
            {productData.topSellingProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productData.topSellingProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'sold' ? `${value} unidades` : `R$ ${Number(value).toFixed(2)}`,
                      name === 'sold' ? 'Vendidos' : 'Receita'
                    ]}
                  />
                  <Bar dataKey="sold" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Nenhuma venda registrada nos últimos 30 dias
              </div>
            )}
          </CardContent>
        </Card>

        {/* Produtos por categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos por Categoria</CardTitle>
            <CardDescription>Distribuição dos produtos por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            {productData.productsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productData.productsByCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ category, count }) => `${category}: ${count}`}
                  >
                    {productData.productsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Nenhum produto cadastrado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribuição de custos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Custos</CardTitle>
            <CardDescription>Produtos agrupados por faixa de custo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData.costDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} produtos`, 'Quantidade']} />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Receita por produto */}
        <Card>
          <CardHeader>
            <CardTitle>Receita por Produto</CardTitle>
            <CardDescription>Receita gerada pelos produtos mais vendidos</CardDescription>
          </CardHeader>
          <CardContent>
            {productData.topSellingProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productData.topSellingProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Receita']} />
                  <Bar dataKey="revenue" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Nenhuma receita registrada nos últimos 30 dias
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProdutosTab;
