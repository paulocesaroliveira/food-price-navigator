
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  products, 
  pricingResults 
} from "@/utils/mockData";
import { formatCurrency, formatPercentage } from "@/utils/calculations";
import { FilePenLine, FileText, Calculator } from "lucide-react";

const Pricing = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Precificação</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Produto e Custos</CardTitle>
              <CardDescription>Selecione o produto e configure os parâmetros de custo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Produto</Label>
                <Select defaultValue="prod-1">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="wastage">Porcentagem de perda (%)</Label>
                <Input id="wastage" type="number" defaultValue="5" />
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Despesas adicionais</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-3">
                      <Input defaultValue="Gás" placeholder="Nome" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" defaultValue="0.50" placeholder="Valor" />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-3">
                      <Input defaultValue="Energia" placeholder="Nome" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" defaultValue="0.25" placeholder="Valor" />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-3">
                      <Input defaultValue="Transporte" placeholder="Nome" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" defaultValue="10" placeholder="Valor" />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Adicionar despesa
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Margem e Taxas</CardTitle>
              <CardDescription>Configure margens de lucro e taxas aplicáveis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="margin">Margem de lucro desejada (%)</Label>
                <Input id="margin" type="number" defaultValue="40" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="commission">Comissão de plataforma (%)</Label>
                <Input id="commission" type="number" defaultValue="12" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tax">Percentual de imposto (%)</Label>
                <Input id="tax" type="number" defaultValue="6" />
              </div>
              
              <Button className="w-full gap-2 mt-2">
                <Calculator className="h-4 w-4" />
                Calcular preço
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Resultado da Precificação</CardTitle>
                  <CardDescription>Caixa Degustação 8 Brigadeiros</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <FilePenLine className="h-4 w-4" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <FileText className="h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Custo total da produção</div>
                    <div className="text-2xl font-bold mt-1">{formatCurrency(pricingResults[0].totalProductionCost)}</div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Custo por unidade</div>
                    <div className="text-2xl font-bold mt-1">{formatCurrency(pricingResults[0].unitCost)}</div>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                    <div className="text-sm text-green-700">Preço de venda ideal</div>
                    <div className="text-3xl font-bold mt-1 text-green-800">{formatCurrency(pricingResults[0].sellingPrice)}</div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Lucro por unidade</div>
                    <div className="text-2xl font-bold mt-1 text-food-green">{formatCurrency(pricingResults[0].unitProfit)}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Markup aplicado</div>
                    <div className="text-2xl font-bold mt-1">{formatPercentage(pricingResults[0].appliedMarkup)}</div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Preço com comissão</div>
                    <div className="text-2xl font-bold mt-1">{formatCurrency(pricingResults[0].priceWithCommission)}</div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Preço com impostos</div>
                    <div className="text-2xl font-bold mt-1">{formatCurrency(pricingResults[0].priceWithTaxes)}</div>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                    <div className="text-sm text-amber-700">Preço mínimo recomendado</div>
                    <div className="text-2xl font-bold mt-1 text-amber-800">{formatCurrency(pricingResults[0].minimumRecommendedPrice)}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 border rounded-lg p-4 bg-blue-50 border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">Simulador de Preço</h3>
                <div className="grid grid-cols-7 gap-2 items-center">
                  <div className="col-span-3">
                    <div className="text-sm text-blue-700 mb-1">Se eu vender por:</div>
                    <Input className="border-blue-300 bg-blue-50 focus:border-blue-400" defaultValue="32.50" />
                  </div>
                  <div className="col-span-4">
                    <div className="text-sm text-blue-700 mb-1">Minha margem seria:</div>
                    <div className="text-xl font-medium text-blue-800">
                      43% (lucro: {formatCurrency(14.00)})
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
