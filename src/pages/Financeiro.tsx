
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  FileText, 
  Calculator,
  Target,
  CreditCard
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import FluxoCaixaTab from "@/components/financeiro/FluxoCaixaTab";
import ControleGastosTab from "@/components/financeiro/ControleGastosTab";
import RelatoriosFinanceirosTab from "@/components/financeiro/RelatoriosFinanceirosTab";
import OrcamentoMetasTab from "@/components/financeiro/OrcamentoMetasTab";

const Financeiro = () => {
  const [activeTab, setActiveTab] = useState("fluxo-caixa");

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Módulo Financeiro" 
        subtitle="Controle completo das suas finanças"
        icon={DollarSign}
        gradient="bg-gradient-to-r from-green-600 to-emerald-600"
      />

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receitas do Mês
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ 15.250,00</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Despesas do Mês
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ 8.420,00</div>
            <p className="text-xs text-muted-foreground">
              -5% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro Líquido
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">R$ 6.830,00</div>
            <p className="text-xs text-muted-foreground">
              Margem de 44.8%
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contas a Pagar
            </CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">R$ 2.150,00</div>
            <p className="text-xs text-muted-foreground">
              3 contas vencendo esta semana
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs do Módulo Financeiro */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fluxo-caixa" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Fluxo de Caixa
          </TabsTrigger>
          <TabsTrigger value="controle-gastos" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Controle de Gastos
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="orcamento" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Orçamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fluxo-caixa">
          <FluxoCaixaTab />
        </TabsContent>

        <TabsContent value="controle-gastos">
          <ControleGastosTab />
        </TabsContent>

        <TabsContent value="relatorios">
          <RelatoriosFinanceirosTab />
        </TabsContent>

        <TabsContent value="orcamento">
          <OrcamentoMetasTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financeiro;
