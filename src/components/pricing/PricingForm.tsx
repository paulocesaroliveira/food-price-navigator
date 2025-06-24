
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

      // Buscar produto com itens (receitas) e embalagens
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

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    form.setValue('productId', productId);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Configuração</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Ex: Precificação Padrão"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="product">Produto</Label>
                <select
                  id="product"
                  className="w-full p-2 border rounded-md"
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
                  <p className="text-sm text-red-500">{form.formState.errors.productId.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Custo do Produto - Seção dinâmica */}
          <Card>
            <CardHeader>
              <CardTitle>Custo do Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="text-center">
                    <p className="text-sm text-blue-600 font-medium">Total Receitas</p>
                    <p className="text-xl font-bold text-blue-700">
                      {formatCurrency(productCosts.totalRecipeCost)}
                    </p>
                  </div>
                </Card>
                
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="text-center">
                    <p className="text-sm text-green-600 font-medium">Total Embalagens</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency(productCosts.totalPackagingCost)}
                    </p>
                  </div>
                </Card>
                
                <Card className="p-4 bg-purple-50 border-purple-200">
                  <div className="text-center">
                    <p className="text-sm text-purple-600 font-medium">Custo Total Base</p>
                    <p className="text-xl font-bold text-purple-700">
                      {formatCurrency(productCosts.totalBaseCost)}
                    </p>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parâmetros de Precificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wastage">Perda (%)</Label>
                  <Input
                    id="wastage"
                    type="number"
                    step="0.1"
                    {...form.register('wastagePercentage', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="margin">Margem Desejada (%)</Label>
                  <Input
                    id="margin"
                    type="number"
                    step="0.1"
                    {...form.register('marginPercentage', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platformFee">Taxa de Plataforma (%)</Label>
                  <Input
                    id="platformFee"
                    type="number"
                    step="0.1"
                    {...form.register('platformFeePercentage', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="tax">Impostos (%)</Label>
                  <Input
                    id="tax"
                    type="number"
                    step="0.1"
                    {...form.register('taxPercentage', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custos Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="labor">Mão de Obra</Label>
                  <Input
                    id="labor"
                    type="number"
                    step="0.01"
                    {...form.register('laborCost', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="overhead">Custos Indiretos</Label>
                  <Input
                    id="overhead"
                    type="number"
                    step="0.01"
                    {...form.register('overheadCost', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marketing">Marketing</Label>
                  <Input
                    id="marketing"
                    type="number"
                    step="0.01"
                    {...form.register('marketingCost', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="delivery">Entrega</Label>
                  <Input
                    id="delivery"
                    type="number"
                    step="0.01"
                    {...form.register('deliveryCost', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="other">Outros Custos</Label>
                <Input
                  id="other"
                  type="number"
                  step="0.01"
                  {...form.register('otherCosts', { valueAsNumber: true })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo de Cálculos */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Cálculos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Custo Base:</span>
                  <span className="font-medium">{formatCurrency(baseCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Perdas ({watchedValues.wastagePercentage}%):</span>
                  <span className="font-medium">{formatCurrency(wastageAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Custos Adicionais:</span>
                  <span className="font-medium">{formatCurrency(additionalCosts)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Custo Total Unitário:</span>
                  <span>{formatCurrency(totalUnitCost)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resultado da Precificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Preço Ideal:</span>
                  <span className="font-medium">{formatCurrency(idealPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Plataforma:</span>
                  <span className="font-medium">{formatCurrency(platformFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impostos:</span>
                  <span className="font-medium">{formatCurrency(taxes)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold text-green-600">
                  <span>Preço Final:</span>
                  <span>{formatCurrency(finalPrice)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Lucro Unitário:</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(unitProfit)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Margem Efetiva:</span>
                  <span className="font-semibold text-purple-600">{actualMargin.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full p-3 border rounded-md resize-none"
                rows={4}
                placeholder="Adicione observações sobre esta configuração de preços..."
                {...form.register('notes')}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={form.handleSubmit(onSubmit)}>
          Salvar Configuração
        </Button>
      </div>
    </div>
  );
};
