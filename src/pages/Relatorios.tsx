
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, TrendingUp, DollarSign, FileText, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Link } from "react-router-dom";

const Relatorios = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        subtitle="Análise de performance e dados do seu negócio"
        icon={BarChart3}
        gradient="from-indigo-500 to-purple-600"
        actions={
          <Button className="btn-gradient">
            <Download className="h-4 w-4 mr-2" />
            Exportar Dados
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Relatório Financeiro */}
        <Link to="/financeiro" className="block">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow card-hover h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Relatório Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Receitas, custos, fluxo de caixa e análise de lucratividade.</p>
              <Button className="w-full btn-gradient">Ver Relatório</Button>
            </CardContent>
          </Card>
        </Link>

        {/* Relatório de Vendas */}
        <Link to="/sales" className="block">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow card-hover h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
                Relatório de Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Performance de vendas por produto, período e cliente.</p>
              <Button className="w-full btn-gradient">Ver Relatório</Button>
            </CardContent>
          </Card>
        </Link>

        {/* Relatório de Ingredientes e Receitas */}
        <Link to="/recipes" className="block">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow card-hover h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                Relatório de Ingredientes e Receitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Custos de ingredientes, rentabilidade de receitas e consumo.</p>
              <Button className="w-full btn-gradient">Ver Relatório</Button>
            </CardContent>
          </Card>
        </Link>

        {/* Adicionar mais cards de relatórios conforme necessário */}

      </div>

      <Card className="custom-card">
        <CardHeader>
          <CardTitle>Visão Geral dos Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Selecione um relatório acima para visualizar dados detalhados.</p>
            <p className="text-sm">Explore as análises para tomar decisões mais informadas!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;


