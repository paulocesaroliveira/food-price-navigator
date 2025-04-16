
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter 
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
import {
  FilePenLine, 
  FileText, 
  Calculator, 
  PlusCircle, 
  X, 
  DollarSign, 
  PercentIcon, 
  ShoppingBag, 
  Tag, 
  TrendingUp, 
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Framer motion animations
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const Pricing = () => {
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatedPrice, setSimulatedPrice] = useState("32.50");
  const [selectedProduct, setSelectedProduct] = useState("prod-1");
  const { toast } = useToast();
  
  const calculatePrice = () => {
    toast({
      title: "Preço calculado com sucesso!",
      description: "O preço do produto foi calculado com base nos parâmetros informados.",
    });
  };
  
  const toggleSimulator = () => {
    setShowSimulator(!showSimulator);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tight">Precificação</h1>
          <p className="text-muted-foreground mt-1">
            Calcule os preços dos seus produtos com base nos custos e margens desejadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <FilePenLine className="h-4 w-4" />
            <span className="hidden md:inline">Exportar</span> PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Exportar</span> Excel
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-soft animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Produto e Custos
              </CardTitle>
              <CardDescription>Selecione o produto e configure os parâmetros de custo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="input-group">
                <Label htmlFor="product">Produto</Label>
                <Select 
                  defaultValue="prod-1" 
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                >
                  <SelectTrigger className="w-full">
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
              
              <div className="input-group">
                <Label htmlFor="wastage">Porcentagem de perda (%)</Label>
                <div className="relative">
                  <Input id="wastage" type="number" defaultValue="5" className="pl-7" />
                  <PercentIcon className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Despesas adicionais</h4>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                    <PlusCircle className="h-3.5 w-3.5 mr-1" />
                    Adicionar
                  </Button>
                </div>
                
                <motion.div 
                  className="space-y-3"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {[
                    { name: "Gás", value: "0.50" },
                    { name: "Energia", value: "0.25" },
                    { name: "Transporte", value: "10" }
                  ].map((expense, index) => (
                    <motion.div 
                      key={index}
                      variants={item}
                      className="grid grid-cols-12 gap-2 bg-muted/40 p-2 rounded-lg"
                    >
                      <div className="col-span-7">
                        <Input defaultValue={expense.name} placeholder="Nome" className="h-9" />
                      </div>
                      <div className="col-span-4">
                        <div className="relative">
                          <Input type="number" defaultValue={expense.value} placeholder="Valor" className="pl-6 h-9" />
                          <span className="absolute left-2 top-2 text-muted-foreground text-xs">R$</span>
                        </div>
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Margem e Taxas
              </CardTitle>
              <CardDescription>Configure margens de lucro e taxas aplicáveis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="input-group">
                <Label htmlFor="margin">Margem de lucro desejada (%)</Label>
                <div className="relative">
                  <Input id="margin" type="number" defaultValue="40" className="pl-7" />
                  <PercentIcon className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="input-group">
                <Label htmlFor="commission">Comissão de plataforma (%)</Label>
                <div className="relative">
                  <Input id="commission" type="number" defaultValue="12" className="pl-7" />
                  <PercentIcon className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="input-group">
                <Label htmlFor="tax">Percentual de imposto (%)</Label>
                <div className="relative">
                  <Input id="tax" type="number" defaultValue="6" className="pl-7" />
                  <PercentIcon className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full gap-2 mt-2" onClick={calculatePrice}>
                <Calculator className="h-4 w-4" />
                Calcular preço
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="h-full shadow-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Resultado da Precificação
                  </CardTitle>
                  <CardDescription>Caixa Degustação 8 Brigadeiros</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <div className="space-y-4">
                  <motion.div variants={item}>
                    <div className="pricing-result-card">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <DollarSign className="h-4 w-4" />
                        Custo total da produção
                      </div>
                      <div className="text-2xl font-semibold mt-1">{formatCurrency(pricingResults[0].totalProductionCost)}</div>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={item}>
                    <div className="pricing-result-card">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <DollarSign className="h-4 w-4" />
                        Custo por unidade
                      </div>
                      <div className="text-2xl font-semibold mt-1">{formatCurrency(pricingResults[0].unitCost)}</div>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={item}>
                    <div className={cn("pricing-result-card pricing-highlight shadow-soft", "bg-gradient-to-r from-green-50 to-green-100/50")}>
                      <div className="flex items-center gap-2 text-sm text-green-700 mb-1">
                        <Tag className="h-4 w-4" />
                        Preço de venda ideal
                      </div>
                      <div className="text-3xl font-semibold mt-1 text-green-800">{formatCurrency(pricingResults[0].sellingPrice)}</div>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={item}>
                    <div className="pricing-result-card">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <TrendingUp className="h-4 w-4" />
                        Lucro por unidade
                      </div>
                      <div className="text-2xl font-semibold mt-1 text-food-green">{formatCurrency(pricingResults[0].unitProfit)}</div>
                    </div>
                  </motion.div>
                </div>
                
                <div className="space-y-4">
                  <motion.div variants={item}>
                    <div className="pricing-result-card">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <PercentIcon className="h-4 w-4" />
                        Markup aplicado
                      </div>
                      <div className="text-2xl font-semibold mt-1">{formatPercentage(pricingResults[0].appliedMarkup)}</div>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={item}>
                    <div className="pricing-result-card">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <DollarSign className="h-4 w-4" />
                        Preço com comissão
                      </div>
                      <div className="text-2xl font-semibold mt-1">{formatCurrency(pricingResults[0].priceWithCommission)}</div>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={item}>
                    <div className="pricing-result-card">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <DollarSign className="h-4 w-4" />
                        Preço com impostos
                      </div>
                      <div className="text-2xl font-semibold mt-1">{formatCurrency(pricingResults[0].priceWithTaxes)}</div>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={item}>
                    <div className={cn("pricing-result-card", "bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-800 border-amber-200")}>
                      <div className="flex items-center gap-2 text-sm text-amber-700 mb-1">
                        <Tag className="h-4 w-4" />
                        Preço mínimo recomendado
                      </div>
                      <div className="text-2xl font-semibold mt-1 text-amber-800">{formatCurrency(pricingResults[0].minimumRecommendedPrice)}</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  onClick={toggleSimulator} 
                  className="w-full mb-4 gap-2"
                >
                  {showSimulator ? "Ocultar simulador" : "Mostrar simulador de preço"}
                  <Calculator className="h-4 w-4" />
                </Button>
                
                {showSimulator && (
                  <motion.div 
                    className="border rounded-xl p-5 bg-gradient-to-r from-blue-50 to-blue-100/30 border-blue-200 shadow-soft"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Simulador de Preço
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                      <div className="md:col-span-3">
                        <div className="text-sm text-blue-700 mb-1">Se eu vender por:</div>
                        <div className="relative">
                          <Input 
                            className="border-blue-300 bg-blue-50/50 focus:border-blue-400 pl-8" 
                            value={simulatedPrice}
                            onChange={(e) => setSimulatedPrice(e.target.value)}
                          />
                          <span className="absolute left-3 top-2.5 text-blue-700 font-medium">R$</span>
                        </div>
                      </div>
                      <div className="md:col-span-4">
                        <div className="text-sm text-blue-700 mb-1">Minha margem seria:</div>
                        <div className="flex gap-2 items-center">
                          <div className="text-xl font-medium text-blue-800 bg-blue-100/50 rounded-lg px-3 py-1.5">
                            43%
                          </div>
                          <div className="text-blue-700">
                            (lucro: {formatCurrency(14.00)})
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
