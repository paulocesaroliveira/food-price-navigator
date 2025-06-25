
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Calculator, Package, DollarSign, TrendingUp, Target } from "lucide-react";

const pricingSchema = z.object({
  productId: z.string().min(1, { message: "Produto é obrigatório" }),
  laborCost: z.coerce.number().min(0).default(0),
  laborCostType: z.enum(["fixed", "percentage"]).default("fixed"),
  overheadCost: z.coerce.number().min(0).default(0),
  overheadCostType: z.enum(["fixed", "percentage"]).default("fixed"),
  marketingCost: z.coerce.number().min(0).default(0),
  marketingCostType: z.enum(["fixed", "percentage"]).default("fixed"),
  deliveryCost: z.coerce.number().min(0).default(0),
  deliveryCostType: z.enum(["fixed", "percentage"]).default("fixed"),
  taxPercentage: z.coerce.number().min(0).max(100).default(0),
  platformFeePercentage: z.coerce.number().min(0).max(100).default(0),
  marginPercentage: z.coerce.number().min(0).default(30),
  sellingPrice: z.coerce.number().min(0).default(0),
});

interface PricingFormProps {
  onSuccess?: () => void;
}

export const PricingForm = ({ onSuccess }: PricingFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: products = [] } = useQuery({
    queryKey: ['products-for-pricing'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const form = useForm<z.infer<typeof pricingSchema>>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      productId: "",
      laborCost: 0,
      laborCostType: "fixed",
      overheadCost: 0,
      overheadCostType: "fixed",
      marketingCost: 0,
      marketingCostType: "fixed",
      deliveryCost: 0,
      deliveryCostType: "fixed",
      taxPercentage: 0,
      platformFeePercentage: 0,
      marginPercentage: 30,
      sellingPrice: 0,
    },
  });

  const watchedValues = form.watch();

  useEffect(() => {
    if (watchedValues.productId) {
      const product = products.find(p => p.id === watchedValues.productId);
      setSelectedProduct(product);
    }
  }, [watchedValues.productId, products]);

  // Calcular valores dinamicamente
  const baseCost = selectedProduct?.total_cost || 0;
  
  const laborCostValue = watchedValues.laborCostType === "percentage" 
    ? (baseCost * watchedValues.laborCost / 100) 
    : watchedValues.laborCost;
  
  const overheadCostValue = watchedValues.overheadCostType === "percentage" 
    ? (baseCost * watchedValues.overheadCost / 100) 
    : watchedValues.overheadCost;
  
  const marketingCostValue = watchedValues.marketingCostType === "percentage" 
    ? (baseCost * watchedValues.marketingCost / 100) 
    : watchedValues.marketingCost;
  
  const deliveryCostValue = watchedValues.deliveryCostType === "percentage" 
    ? (baseCost * watchedValues.deliveryCost / 100) 
    : watchedValues.deliveryCost;

  const totalIndirectCosts = laborCostValue + overheadCostValue + marketingCostValue + deliveryCostValue;
  const totalCost = baseCost + totalIndirectCosts;
  
  // Cálculo dinâmico baseado na margem ou preço de venda
  const calculatedSellingPrice = totalCost * (1 + watchedValues.marginPercentage / 100);
  const calculatedMargin = watchedValues.sellingPrice > 0 && totalCost > 0 
    ? ((watchedValues.sellingPrice - totalCost) / totalCost) * 100 
    : watchedValues.marginPercentage;
  
  const finalSellingPrice = watchedValues.sellingPrice > 0 ? watchedValues.sellingPrice : calculatedSellingPrice;
  const finalMargin = watchedValues.sellingPrice > 0 ? calculatedMargin : watchedValues.marginPercentage;
  const profit = finalSellingPrice - totalCost;

  const handleSubmit = async (values: z.infer<typeof pricingSchema>) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const pricingData = {
        user_id: user.id,
        product_id: values.productId,
        name: `Precificação - ${selectedProduct?.name}`,
        base_cost: baseCost,
        labor_cost: values.laborCost,
        labor_cost_type: values.laborCostType,
        overhead_cost: values.overheadCost,
        overhead_cost_type: values.overheadCostType,
        marketing_cost: values.marketingCost,
        marketing_cost_type: values.marketingCostType,
        delivery_cost: values.deliveryCost,
        delivery_cost_type: values.deliveryCostType,
        tax_percentage: values.taxPercentage,
        platform_fee_percentage: values.platformFeePercentage,
        margin_percentage: finalMargin,
        total_unit_cost: totalCost,
        final_price: finalSellingPrice,
        unit_profit: profit,
        actual_margin: finalMargin,
      };

      const { error } = await supabase
        .from('pricing_configs')
        .insert(pricingData);

      if (error) throw error;

      toast({
        title: "Precificação salva",
        description: "A configuração de precificação foi salva com sucesso.",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao salvar precificação:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar precificação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Precificação Inteligente</h1>
        <p className="text-gray-600">Configure sua precificação de forma inteligente e precisa</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Sessão 1: Nome do Produto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Nome do Produto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selecione o Produto</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha um produto para precificar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Sessão 2: Custo do Produto */}
          {selectedProduct && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Custo do Produto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Custo calculado automaticamente baseado nas receitas e embalagens</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(baseCost)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sessão 3: Custos Indiretos e Taxas */}
          {selectedProduct && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Custos Indiretos e Taxas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="laborCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custo de Mão de Obra</FormLabel>
                        <FormControl>
                          {watchedValues.laborCostType === "percentage" ? (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          ) : (
                            <CurrencyInput
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="R$ 0,00"
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="laborCostType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                            <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="overheadCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custos Gerais</FormLabel>
                        <FormControl>
                          {watchedValues.overheadCostType === "percentage" ? (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          ) : (
                            <CurrencyInput
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="R$ 0,00"
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="overheadCostType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                            <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="marketingCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custos de Marketing</FormLabel>
                        <FormControl>
                          {watchedValues.marketingCostType === "percentage" ? (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          ) : (
                            <CurrencyInput
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="R$ 0,00"
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="marketingCostType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                            <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="deliveryCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custos de Entrega</FormLabel>
                        <FormControl>
                          {watchedValues.deliveryCostType === "percentage" ? (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          ) : (
                            <CurrencyInput
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="R$ 0,00"
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryCostType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                            <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="taxPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Impostos (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="platformFeePercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa da Plataforma (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Total de Custos Indiretos</p>
                  <p className="text-xl font-bold text-orange-600">
                    {formatCurrency(totalIndirectCosts)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sessão 4: Margem de Lucro ou Preço de Venda */}
          {selectedProduct && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Margem de Lucro ou Preço de Venda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="marginPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Margem de Lucro (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="30"
                            value={finalMargin.toFixed(2)}
                            onChange={(e) => {
                              const margin = Number(e.target.value);
                              field.onChange(margin);
                              form.setValue('sellingPrice', 0);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço de Venda</FormLabel>
                        <FormControl>
                          <CurrencyInput
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              if (value > 0) {
                                const newMargin = totalCost > 0 ? ((value - totalCost) / totalCost) * 100 : 0;
                                form.setValue('marginPercentage', newMargin);
                              }
                            }}
                            placeholder="R$ 0,00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Os campos são dinâmicos - altere qualquer um e o outro será calculado automaticamente
                </p>
              </CardContent>
            </Card>
          )}

          {/* Sessão 5: Resumo */}
          {selectedProduct && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="h-5 w-5" />
                  Resumo dos Custos, Margem, Lucro e Valor de Venda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Custo Base</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(baseCost)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Custos Indiretos</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(totalIndirectCosts)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Custo Total</p>
                    <p className="text-lg font-semibold text-orange-600">
                      {formatCurrency(totalCost)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Margem</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {finalMargin.toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Preço de Venda</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(finalSellingPrice)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Lucro por Unidade</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(profit)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button 
              type="submit" 
              disabled={isLoading || !selectedProduct}
              className="px-8"
            >
              {isLoading ? "Salvando..." : "Salvar Precificação"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
