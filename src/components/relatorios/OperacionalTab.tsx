
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Calendar, TrendingUp } from "lucide-react";

const OperacionalTab = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Processados</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">389</div>
            <p className="text-xs text-muted-foreground">98.5% entregues no prazo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio Preparo</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 min</div>
            <p className="text-xs text-muted-foreground">-5 min vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Cancelamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3%</div>
            <p className="text-xs text-muted-foreground">-0.5% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status dos Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Novos</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                  <span className="text-sm font-medium">15%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Em Preparo</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                  <span className="text-sm font-medium">35%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Prontos</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <span className="text-sm font-medium">25%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Entregues</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <span className="text-sm font-medium">25%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos em Estoque Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium">Farinha de Trigo</span>
                  <p className="text-sm text-muted-foreground">Estoque atual: 5kg</p>
                </div>
                <span className="text-sm text-red-600 font-medium">Crítico</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium">Açúcar Cristal</span>
                  <p className="text-sm text-muted-foreground">Estoque atual: 8kg</p>
                </div>
                <span className="text-sm text-yellow-600 font-medium">Baixo</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium">Ovos</span>
                  <p className="text-sm text-muted-foreground">Estoque atual: 15 unidades</p>
                </div>
                <span className="text-sm text-yellow-600 font-medium">Baixo</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OperacionalTab;
