
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import FinanceiroTab from "@/components/relatorios/FinanceiroTab";
import VendasTab from "@/components/relatorios/VendasTab";
import { useToast } from "@/hooks/use-toast";

const Relatorios = () => {
  const [activeTab, setActiveTab] = useState("financeiro");
  const { toast } = useToast();

  const handleExportReport = (type: string) => {
    toast({
      title: "Exportando relatório",
      description: `O relatório ${type} será gerado em instantes.`,
    });
    
    setTimeout(() => {
      toast({
        title: "Relatório gerado",
        description: "O relatório foi gerado com sucesso e está sendo baixado.",
      });
    }, 2000);
  };

  const reports = [
    {
      id: "financeiro",
      title: "Financeiro",
      icon: BarChart3,
      description: "Receitas, comissões e análise financeira",
      component: FinanceiroTab
    },
    {
      id: "vendas",
      title: "Vendas",
      icon: BarChart3,
      description: "Performance de vendas e produtos",
      component: VendasTab
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Relatórios" 
        icon={BarChart3}
        gradient="bg-gradient-to-r from-indigo-600 to-purple-600"
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="text-sm text-muted-foreground">
          Selecione o tipo de relatório que deseja visualizar
        </div>
        <Button onClick={() => handleExportReport(activeTab)} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <TabsTrigger key={report.id} value={report.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{report.title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {reports.map((report) => {
          const Component = report.component;
          return (
            <TabsContent key={report.id} value={report.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <report.icon className="h-5 w-5" />
                    Relatório {report.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {report.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <Component />
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default Relatorios;
