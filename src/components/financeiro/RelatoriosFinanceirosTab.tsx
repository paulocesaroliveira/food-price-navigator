
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  PieChart,
  Calendar
} from "lucide-react";

const RelatoriosFinanceirosTab = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("mes-atual");

  // Dados mock para DRE
  const dreData = {
    receitas: {
      vendasProdutos: 15250,
      outrasReceitas: 850,
      total: 16100
    },
    custos: {
      materiaPrima: 3200,
      maoDeObra: 2100,
      embalagens: 800,
      total: 6100
    },
    despesas: {
      aluguel: 1200,
      energia: 650,
      transporte: 900,
      marketing: 450,
      outras: 320,
      total: 3520
    }
  };

  const lucroLiquido = dreData.receitas.total - dreData.custos.total - dreData.despesas.total;
  const margemLucro = (lucroLiquido / dreData.receitas.total) * 100;

  // Dados mock para indicadores
  const kpis = [
    { name: "ROI", value: "24.5%", change: "+3.2%", trend: "up" },
    { name: "Margem Bruta", value: "62.1%", change: "+1.8%", trend: "up" },
    { name: "Ticket Médio", value: "R$ 85,50", change: "-2.1%", trend: "down" },
    { name: "Custo por Venda", value: "R$ 32,80", change: "+0.5%", trend: "up" }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Filtros e Ações */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mes-atual">Mês Atual</SelectItem>
            <SelectItem value="trimestre">Trimestre</SelectItem>
            <SelectItem value="semestre">Semestre</SelectItem>
            <SelectItem value="ano">Ano Atual</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className={`flex items-center gap-1 text-sm ${
                  kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.trend === 'up' ? 
                    <TrendingUp className="h-4 w-4" /> : 
                    <TrendingDown className="h-4 w-4" />
                  }
                  {kpi.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Relatórios */}
      <Tabs defaultValue="dre" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dre" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            DRE
          </TabsTrigger>
          <TabsTrigger value="lucratividade" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Lucratividade
          </TabsTrigger>
          <TabsTrigger value="balanco" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Balanço
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dre">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Demonstrativo do Resultado do Exercício (DRE)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Receitas */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-green-700 border-b border-green-200 pb-2">
                  RECEITAS OPERACIONAIS
                </h3>
                <div className="pl-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Vendas de Produtos</span>
                    <span className="font-medium">{formatCurrency(dreData.receitas.vendasProdutos)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outras Receitas</span>
                    <span className="font-medium">{formatCurrency(dreData.receitas.outrasReceitas)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-green-600 border-t pt-2">
                    <span>TOTAL DE RECEITAS</span>
                    <span>{formatCurrency(dreData.receitas.total)}</span>
                  </div>
                </div>
              </div>

              {/* Custos */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-red-700 border-b border-red-200 pb-2">
                  CUSTOS DOS PRODUTOS VENDIDOS
                </h3>
                <div className="pl-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Matéria Prima</span>
                    <span className="font-medium">({formatCurrency(dreData.custos.materiaPrima)})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mão de Obra</span>
                    <span className="font-medium">({formatCurrency(dreData.custos.maoDeObra)})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Embalagens</span>
                    <span className="font-medium">({formatCurrency(dreData.custos.embalagens)})</span>
                  </div>
                  <div className="flex justify-between font-bold text-red-600 border-t pt-2">
                    <span>TOTAL DE CUSTOS</span>
                    <span>({formatCurrency(dreData.custos.total)})</span>
                  </div>
                </div>
              </div>

              {/* Lucro Bruto */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between font-bold text-blue-700 text-lg">
                  <span>LUCRO BRUTO</span>
                  <span>{formatCurrency(dreData.receitas.total - dreData.custos.total)}</span>
                </div>
              </div>

              {/* Despesas */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-orange-700 border-b border-orange-200 pb-2">
                  DESPESAS OPERACIONAIS
                </h3>
                <div className="pl-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Aluguel</span>
                    <span className="font-medium">({formatCurrency(dreData.despesas.aluguel)})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Energia</span>
                    <span className="font-medium">({formatCurrency(dreData.despesas.energia)})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transporte</span>
                    <span className="font-medium">({formatCurrency(dreData.despesas.transporte)})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing</span>
                    <span className="font-medium">({formatCurrency(dreData.despesas.marketing)})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outras Despesas</span>
                    <span className="font-medium">({formatCurrency(dreData.despesas.outras)})</span>
                  </div>
                  <div className="flex justify-between font-bold text-orange-600 border-t pt-2">
                    <span>TOTAL DE DESPESAS</span>
                    <span>({formatCurrency(dreData.despesas.total)})</span>
                  </div>
                </div>
              </div>

              {/* Lucro Líquido */}
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <div className="flex justify-between font-bold text-green-700 text-xl">
                  <span>LUCRO LÍQUIDO</span>
                  <span>{formatCurrency(lucroLiquido)}</span>
                </div>
                <div className="text-sm text-green-600 mt-1">
                  Margem de Lucro: {formatPercentage(margemLucro)}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lucratividade">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Lucratividade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>Relatório de lucratividade por produto em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balanco">
          <Card>
            <CardHeader>
              <CardTitle>Balanço Patrimonial Simplificado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>Balanço patrimonial em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RelatoriosFinanceirosTab;
