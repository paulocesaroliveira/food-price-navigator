
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Calculator, Settings, DollarSign, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import ProductSelector from "@/components/pricing/ProductSelector";
import PricingCalculator from "@/components/pricing/PricingCalculator";
import PricingConfigsList from "@/components/pricing/PricingConfigsList";
import { DynamicPricingForm } from "@/components/pricing/DynamicPricingForm";
import { formatCurrency } from "@/utils/calculations";
import { PageHeader } from "@/components/shared/PageHeader";
import { Product, PricingConfiguration } from "@/types";

const Pricing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDynamicForm, setShowDynamicForm] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(id, name)
        `)
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: configurations = [] } = useQuery({
    queryKey: ['pricing-configurations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('pricing_configs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handlePricingChange = (sellingPrice: number, marginPercentage: number) => {
    console.log('Pricing changed:', { sellingPrice, marginPercentage });
  };

  const avgMargin = configurations.length > 0 
    ? configurations.reduce((acc, config) => acc + (config.actual_margin || 0), 0) / configurations.length 
    : 0;

  const totalConfigs = configurations.length;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Precificação"
        subtitle="Configure e gerencie preços dos seus produtos"
        icon={Calculator}
        gradient="bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500"
        badges={[
          { icon: Settings, text: `${totalConfigs} configurações` },
          { icon: TrendingUp, text: `Margem média: ${avgMargin.toFixed(1)}%` }
        ]}
        actions={
          <Button 
            onClick={() => setShowDynamicForm(true)}
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Configuração
          </Button>
        }
      />

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculadora</TabsTrigger>
          <TabsTrigger value="configurations">Configurações</TabsTrigger>
          <TabsTrigger value="dynamic">Precificação Dinâmica</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Selecionar Produto</h3>
                <ProductSelector
                  products={products}
                  categories={categories}
                  onProductSelect={handleProductSelect}
                  selectedProduct={selectedProduct}
                />
              </CardContent>
            </Card>

            {selectedProduct && (
              <PricingCalculator 
                product={selectedProduct}
                onSave={async (config) => {
                  console.log('Saving configuration:', config);
                }}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="configurations" className="space-y-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <Input
              placeholder="Buscar configurações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <PricingConfigsList 
            configs={configurations}
            onView={(id) => console.log('View config:', id)}
            onEdit={(id) => console.log('Edit config:', id)}
            onDuplicate={(id) => console.log('Duplicate config:', id)}
            onDelete={(id) => console.log('Delete config:', id)}
          />
        </TabsContent>

        <TabsContent value="dynamic" className="space-y-6">
          <DynamicPricingForm 
            totalCost={selectedProduct?.total_cost || 0}
            onPricingChange={handlePricingChange}
          />
        </TabsContent>
      </Tabs>

      {showDynamicForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Nova Configuração de Preço</h2>
              <Button
                variant="ghost"
                onClick={() => setShowDynamicForm(false)}
              >
                ×
              </Button>
            </div>
            <DynamicPricingForm 
              totalCost={selectedProduct?.total_cost || 0}
              onPricingChange={handlePricingChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
