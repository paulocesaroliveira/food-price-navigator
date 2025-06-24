
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
  marginPercentage: z.number().min(0),
  platformFeePercentage: z.number().min(0).max(100),
  taxPercentage: z.number().min(0).max(100),
  laborCost: z.number().min(0),
  overheadCost: z.number().min(0),
  marketingCost: z.number().min(0),
  deliveryCost: z.number().min(0),
  otherCosts: z.number().min(0),
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
      marginPercentage: initialData?.marginPercentage || 30,
      platformFeePercentage: initialData?.platformFeePercentage || 0,
      taxPercentage: initialData?.taxPercentage || 0,
      laborCost: initialData?.laborCost || 0,
      overheadCost: initialData?.overheadCost || 0,
      marketingCost: initialData?.marketingCost || 0,
      deliveryCost: initialData?.deliveryCost || 0,
      otherCosts: initialData?.otherCosts || 0,
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
  
  const idealPrice = totalUnitCost / (1 - (watchedValues.marginPercentage / 100));
  const platformFee = idealPrice * (watchedValues.platformFeePercentage / 100);
  const taxes = idealPrice * (watchedValues.taxPercentage / 100);
  const finalPrice = idealPrice + platformFee + taxes;
  const unitProfit = finalPrice - totalUnitCost;
  const actualMargin = totalUnitCost > 0 ? ((unitProfit / finalPrice) * 100) : 0;

  // Cálculos para preço desejado
  const desiredPrice = watchedValues.desiredSellingPrice || 0;
  const desiredProfit = desiredPrice - totalUnitCost;
  const desiredMargin = desiredPrice > 0 ? ((desiredProfit / desiredPrice) * 100) : 0;

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    form.setValue('productId', productId);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Formulário */}
        <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
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

                <div>
                  <Label htmlFor="desiredPrice" className="text-sm">Preço de Venda Desejado</Label>
                  <Input
                    id="desiredPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="R$ 0,00"
                    className="mt-1"
                    {...form.register('desiredSellingPrice', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Parâmetros de Precificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Label htmlFor="margin" className="text-sm">Margem Desejada (%)</Label>
                  <Input
                    id="margin"
                    type="number"
                    step="0.1"
                    className="mt-1"
                    {...form.register('marginPercentage', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platformFee" className="text-sm">Taxa de Plataforma (%)</Label>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Custos Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full p-3 border rounded-md resize-none text-sm"
                rows={3}
                placeholder="Adicione observações sobre esta configuração de preços..."
                {...form.register('notes')}
              />
            </CardContent>
          </Card>
        </div>

        {/* Cards de Custo e Resumo - Lado direito */}
        <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
          {/* Custo do Produto - Seção dinâmica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Custo do Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-4">
                <Card className="p-3 sm:p-4 bg-blue-50 border-blue-200">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-blue-600 font-medium">Total Receitas</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-700">
                      {formatCurrency(productCosts.totalRecipeCost)}
                    </p>
                  </div>
                </Card>
                
                <Card className="p-3 sm:p-4 bg-green-50 border-green-200">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-green-600 font-medium">Total Embalagens</p>
                    <p className="text-lg sm:text-xl font-bold text-green-700">
                      {formatCurrency(productCosts.totalPackagingCost)}
                    </p>
                  </div>
                </Card>
                
                <Card className="p-3 sm:p-4 bg-purple-50 border-purple-200">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-purple-600 font-medium">Custo Total Base</p>
                    <p className="text-lg sm:text-xl font-bold text-purple-700">
                      {formatCurrency(productCosts.totalBaseCost)}
                    </p>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Resumo de Cálculos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
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
                <div className="flex justify-between text-base sm:text-lg font-semibold">
                  <span>Custo Total Unitário:</span>
                  <span>{formatCurrency(totalUnitCost)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Resultado da Precificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Preço Ideal:</span>
                  <span className="font-medium">{formatCurrency(idealPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxa de Plataforma:</span>
                  <span className="font-medium">{formatCurrency(platformFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Impostos:</span>
                  <span className="font-medium">{formatCurrency(taxes)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg sm:text-xl font-bold text-green-600">
                  <span>Preço Final:</span>
                  <span>{formatCurrency(finalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Lucro Unitário:</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(unitProfit)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Margem Efetiva:</span>
                  <span className="font-semibold text-purple-600">{actualMargin.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {desiredPrice > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-orange-600">Análise do Preço Desejado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Preço Desejado:</span>
                    <span className="font-semibold text-orange-600">{formatCurrency(desiredPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Lucro com Preço Desejado:</span>
                    <span className={`font-semibold ${desiredProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(desiredProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Margem com Preço Desejado:</span>
                    <span className={`font-semibold ${desiredMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {desiredMargin.toFixed(1)}%
                    </span>
                  </div>
                  {desiredProfit < 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-700">
                        ⚠️ Atenção: O preço desejado resultará em prejuízo!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 sm:pt-6 border-t">
        <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Cancelar
        </Button>
        <Button onClick={form.handleSubmit(onSubmit)} className="w-full sm:w-auto">
          Salvar Configuração
        </Button>
      </div>
    </div>
  );
};
