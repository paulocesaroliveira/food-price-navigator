
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, TrendingUp, DollarSign } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

const Relatorios = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        subtitle="Análise de performance e dados do seu negócio"
        icon={BarChart3}
        gradient="from-indigo-500 to-purple-600"
        action={
          <Button className="btn-gradient">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Relatório Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Receitas, custos e análise financeira</p>
            <Button className="w-full btn-gradient">Ver Relatório</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Relatório de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Performance de vendas e produtos</p>
            <Button className="w-full btn-gradient">Ver Relatório</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="custom-card">
        <CardHeader>
          <CardTitle>Dados Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Nenhum dado disponível ainda.</p>
            <p className="text-sm">Comece fazendo vendas para gerar relatórios!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;
