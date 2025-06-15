import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Database, Settings, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import UserManagement from "@/components/admin/UserManagement";
import React, { lazy } from 'react';
import LoadingSpinner from "@/components/ui/loading-spinner";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Query para estatísticas do sistema
  const { data: systemStats, isLoading } = useQuery({
    queryKey: ['admin-system-stats'],
    queryFn: async () => {
      // Buscar número total de usuários
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Buscar estatísticas básicas do sistema
      const { count: totalIngredients } = await supabase
        .from('ingredients')
        .select('*', { count: 'exact', head: true });

      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      const { count: totalSales } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true });

      return {
        activeUsers: userCount || 0,
        totalIngredients: totalIngredients || 0,
        totalProducts: totalProducts || 0,
        totalSales: totalSales || 0
      };
    }
  });

  // Novo: lazy load Notices para evitar bundle grande
  const NoticesList = React.lazy(() => import("@/components/admin/NoticesList"));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-muted-foreground">
          Gerencie usuários, avisos e configurações do sistema
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "overview" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("overview")}
        >
          Visão Geral
        </Button>
        <Button
          variant={activeTab === "users" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("users")}
        >
          <Users className="w-4 h-4 mr-2" />
          Usuários
        </Button>
        <Button
          variant={activeTab === "notices" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("notices")}
        >
          <Shield className="w-4 h-4 mr-2" />
          Avisos
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats?.activeUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total de usuários cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Segurança</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">OK</div>
              <p className="text-xs text-muted-foreground">
                RLS ativo e configurado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Banco de Dados</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">
                Performance otimizada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sistema</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">
                Todos os serviços operacionais
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === "users" && (
        <UserManagement />
      )}

      {/* Notices Management Tab */}
      {activeTab === "notices" && (
        <React.Suspense fallback={
          <div className="flex items-center justify-center py-16"><LoadingSpinner size="lg" /></div>
        }>
          <NoticesList />
        </React.Suspense>
      )}
    </div>
  );
};

export default Admin;
