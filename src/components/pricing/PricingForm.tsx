
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/calculations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const pricingSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  productId: z.string().min(1, "Produto é obrigatório"),
  wastagePercentage: z.number().min(0).max(100),
  platformFeePercentage: z.number().min(0).max(100),
  taxPercentage: z.number().min(0).max(100),
  laborCost: z.number().min(0),
  overheadCost: z.number().min(0),
  marketingCost: z.number().min(0),
  deliveryCost: z.number().min(0),
  otherCosts: z.number().min(0),
  marginPercentage: z.number().min(0),
  desiredSellingPrice: z.number().min(0),
  notes: z.string().optional(),
});

type PricingFormData = z.infer<typeof pricingSchema>;

interface ProductCostData {
  totalRecipeCost: number;
  totalPackagingCost: number;
  totalBaseCost: number;
}

interface PricingFormProps {
  onSubmit: (data: PricingFormData) => void;
  onCancel: () => void;
  initialData?: Partial<PricingFormData>;
  products: Array<{ id: string; name: string; total_cost?: number }>;
}

export const PricingForm: React.FC<PricingFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  products
}) => {
  const [selectedProductId, setSelectedProductId] = useState(initialData?.productId || "");
  const [productCosts, setProductCosts] = useState<ProductCostData>({
    totalRecipeCost: 0,
    totalPackagingCost: 0,
    totalBaseCost: 0
  });

  const form = useForm<PricingFormData>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      name: initialData?.name || "",
      productId: initialData?.productId || "",
      wastagePercentage: initialData?.wastagePercentage || 5,
      platformFeePercentage: initialData?.platformFeePercentage || 0,
      taxPercentage: initialData?.taxPercentage || 0,
      laborCost: initialData?.laborCost || 0,
      overheadCost: initialData?.overheadCost || 0,
      marketingCost: initialData?.marketingCost || 0,
      deliveryCost: initialData?.deliveryCost || 0,
      otherCosts: initialData?.otherCosts || 0,
      marginPercentage: initialData?.marginPercentage || 30,
      desiredSellingPrice: initialData?.desiredSellingPrice || 0,
      notes: initialData?.notes || "",
    },
  });

  // Query para buscar detalhes do produto selecionado
  const { data: productDetails } = useQuery({
    queryKey: ['product-details', selectedProductId],
    queryFn: async () => {
      if (!selectedProductId) return null;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: product, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          items:product_items(
            quantity,
            cost,
            recipe:recipes(name, unit_cost)
          ),
          packagingItems:product_packaging(
            quantity,
            cost,
            packaging:packaging(name, unit_cost)
          )
        `)
        .eq('id', selectedProductId)
        .eq('user_id', user.id)
        .single();

      if (productError) throw productError;
      return product;
    },
    enabled: !!selectedProductId
  });

  // Calcular custos do produto quando os detalhes mudarem
  useEffect(() => {
    if (productDetails) {
      const totalRecipeCost = productDetails.items?.reduce((sum: number, item: any) => 
        sum + (item.cost || 0), 0) || 0;
      
      const totalPackagingCost = productDetails.packagingItems?.reduce((sum: number, item: any) => 
        sum + (item.cost || 0), 0) || 0;
      
      const totalBaseCost = totalRecipeCost + totalPackagingCost;

      setProductCosts({
        totalRecipeCost,
        totalPackagingCost,
        totalBaseCost
      });
    } else {
      setProductCosts({
        totalRecipeCost: 0,
        totalPackagingCost: 0,
        totalBaseCost: 0
      });
    }
  }, [productDetails]);

  const watchedValues = form.watch();
  
  // Cálculos de precificação
  const baseCost = productCosts.totalBaseCost;
  const wastageAmount = baseCost * (watchedValues.wastagePercentage / 100);
  const totalCostWithWastage = baseCost + wastageAmount;
  
  const additionalCosts = (watchedValues.laborCost || 0) + 
                          (watchedValues.overheadCost || 0) + 
                          (watchedValues.marketingCost || 0) + 
                          (watchedValues.deliveryCost || 0) + 
                          (watchedValues.otherCosts || 0);
  
  const totalUnitCost = totalCostWithWastage + additionalCosts;
  
  // Calcular preço baseado na margem
  const priceByMargin = totalUnitCost > 0 ? totalUnitCost / (1 - (watchedValues.marginPercentage / 100)) : 0;
  const platformFee = priceByMargin * (watchedValues.platformFeePercentage / 100);
  const taxes = priceByMargin * (watchedValues.taxPercentage / 100);
  const finalPriceByMargin = priceByMargin + platformFee + taxes;
  
  // Calcular margem baseada no preço desejado
  const desiredPrice = watchedValues.desiredSellingPrice || 0;
  const desiredProfit = desiredPrice - totalUnitCost;
  const desiredMargin = desiredPrice > 0 ? ((desiredProfit / desiredPrice) * 100) : 0;

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    form.setValue('productId', productId);
  };

  const handleMarginChange = (margin: number) => {
    form.setValue('marginPercentage', margin);
    // Calcular e atualizar o preço baseado na margem
    if (totalUnitCost > 0) {
      const newPrice = totalUnitCost / (1 - (margin / 100));
      const newPlatformFee = newPrice * (watchedValues.platformFeePercentage / 100);
      const newTaxes = newPrice * (watchedValues.taxPercentage / 100);
      const newFinalPrice = newPrice + newPlatformFee + newTaxes;
      form.setValue('desiredSellingPrice', newFinalPrice);
    }
  };

  const handlePriceChange = (price: number) => {
    form.setValue('desiredSellingPrice', price);
    // Calcular e atualizar a margem baseada no preço
    if (price > 0 && totalUnitCost > 0) {
      const profit = price - totalUnitCost;
      const margin = (profit / price) * 100;
      form.setValue('marginPercentage', Math.max(0, margin));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      <div className="space-y-4">
        {/* Informações Básicas */}
        <Card className="w-full">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-lg">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm">Nome da Configuração</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Ex: Precificação Padrão"
                className="mt-1"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="product" className="text-sm">Produto</Label>
              <select
                id="product"
                className="w-full p-2 mt-1 border rounded-md text-sm"
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
              >
                <option value="">Selecione um produto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.productId && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.productId.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Custo do Produto */}
        <Card className="w-full">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-lg">Custo do Produto</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-xs text-blue-600 font-medium">Total Receitas</p>
                <p className="text-lg font-bold text-blue-700">
                  {formatCurrency(productCosts.totalRecipeCost)}
                </p>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-xs text-green-600 font-medium">Total Embalagens</p>
                <p className="text-lg font-bold text-green-700">
                  {formatCurrency(productCosts.totalPackagingCost)}
                </p>
              </div>
              
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-center">
                <p className="text-xs text-purple-600 font-medium">Custo Total Base</p>
                <p className="text-lg font-bold text-purple-700">
                  {formatCurrency(productCosts.totalBaseCost)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parâmetros de Precificação */}
        <Card className="w-full">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-lg">Parâmetros</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="wastage" className="text-sm">Perda (%)</Label>
                <Input
                  id="wastage"
                  type="number"
                  step="0.1"
                  className="mt-1"
                  {...form.register('wastagePercentage', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="platformFee" className="text-sm">Taxa Plataforma (%)</Label>
                <Input
                  id="platformFee"
                  type="number"
                  step="0.1"
                  className="mt-1"
                  {...form.register('platformFeePercentage', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="tax" className="text-sm">Impostos (%)</Label>
                <Input
                  id="tax"
                  type="number"
                  step="0.1"
                  className="mt-1"
                  {...form.register('taxPercentage', { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custos Adicionais */}
        <Card className="w-full">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-lg">Custos Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="labor" className="text-sm">Mão de Obra</Label>
                <Input
                  id="labor"
                  type="number"
                  step="0.01"
                  className="mt-1"
                  {...form.register('laborCost', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="overhead" className="text-sm">Custos Indiretos</Label>
                <Input
                  id="overhead"
                  type="number"
                  step="0.01"
                  className="mt-1"
                  {...form.register('overheadCost', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="marketing" className="text-sm">Marketing</Label>
                <Input
                  id="marketing"
                  type="number"
                  step="0.01"
                  className="mt-1"
                  {...form.register('marketingCost', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="delivery" className="text-sm">Entrega</Label>
                <Input
                  id="delivery"
                  type="number"
                  step="0.01"
                  className="mt-1"
                  {...form.register('deliveryCost', { valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="other" className="text-sm">Outros Custos</Label>
              <Input
                id="other"
                type="number"
                step="0.01"
                className="mt-1"
                {...form.register('otherCosts', { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Definição de Preço e Margem */}
        <Card className="w-full">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-lg">Definição de Preço e Margem</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="margin" className="text-sm">Margem Desejada (%)</Label>
                <Input
                  id="margin"
                  type="number"
                  step="0.1"
                  min="0"
                  className="mt-1"
                  value={watchedValues.marginPercentage}
                  onChange={(e) => handleMarginChange(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="desiredPrice" className="text-sm">Preço de Venda Desejado</Label>
                <Input
                  id="desiredPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="R$ 0,00"
                  className="mt-1"
                  value={watchedValues.desiredSellingPrice}
                  onChange={(e) => handlePriceChange(Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo de Cálculos */}
        <Card className="w-full">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-lg">Resumo de Cálculos</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Custo Base:</span>
              <span className="font-medium">{formatCurrency(baseCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Perdas ({watchedValues.wastagePercentage}%):</span>
              <span className="font-medium">{formatCurrency(wastageAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Custos Adicionais:</span>
              <span className="font-medium">{formatCurrency(additionalCosts)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Custo Total Unitário:</span>
              <span>{formatCurrency(totalUnitCost)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span>Preço de Venda:</span>
              <span className="font-semibold text-green-600">{formatCurrency(desiredPrice)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span>Lucro Unitário:</span>
              <span className={`font-semibold ${desiredProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(desiredProfit)}
              </span>
            </div>
            <div className="flex justify-between text-base">
              <span>Margem Efetiva:</span>
              <span className={`font-semibold ${desiredMargin >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                {desiredMargin.toFixed(1)}%
              </span>
            </div>
            
            {desiredProfit < 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-4">
                <p className="text-sm text-red-700">
                  ⚠️ Atenção: O preço atual resultará em prejuízo!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observações */}
        <Card className="w-full">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-lg">Observações</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <textarea
              className="w-full p-3 border rounded-md resize-none text-sm"
              rows={3}
              placeholder="Adicione observações sobre esta configuração de preços..."
              {...form.register('notes')}
            />
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} className="w-full sm:w-auto">
            Salvar Configuração
          </Button>
        </div>
      </div>
    </div>
  );
};
