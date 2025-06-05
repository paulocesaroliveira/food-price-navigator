
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  Users, 
  Settings, 
  BarChart3,
  Database,
  Activity,
  UserCheck,
  DollarSign,
  Trash2,
  Edit,
  Plus,
  Search
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/calculations";
import { toast } from "@/hooks/use-toast";

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Buscar estatísticas gerais do sistema
  const { data: systemStats } = useQuery({
    queryKey: ['admin-system-stats'],
    queryFn: async () => {
      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Usuários ativos (com atividade nos últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsers } = await supabase
        .from('sales')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Total de vendas no sistema
      const { data: totalSales } = await supabase
        .from('sales')
        .select('total_amount');
      
      const totalRevenue = totalSales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;

      // Total de produtos no sistema
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalRevenue,
        totalProducts: totalProducts || 0
      };
    }
  });

  // Buscar todos os usuários para gerenciamento
  const { data: users, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Buscar contadores separadamente para cada usuário
      const usersWithStats = await Promise.all((data || []).map(async (user) => {
        // Contar vendas
        const { count: salesCount } = await supabase
          .from('sales')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Contar produtos
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Contar pedidos
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        return {
          ...user,
          salesCount: salesCount || 0,
          productsCount: productsCount || 0,
          ordersCount: ordersCount || 0
        };
      }));

      return usersWithStats;
    }
  });

  const filteredUsers = users?.filter(user =>
    user.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      toast({
        title: "Usuário excluído",
        description: "O usuário foi removido com sucesso.",
      });

      refetchUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Painel Administrativo"
        subtitle="Gerenciamento completo do SAAS TastyHub"
        icon={Shield}
        gradient="bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500"
        badges={[
          { icon: UserCheck, text: "Admin Exclusivo" },
          { icon: Activity, text: "Controle Total" }
        ]}
        actions={
          <Button 
            className="bg-white text-red-600 hover:bg-red-50 border-white shadow-lg"
          >
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
        }
      />

      {/* Estatísticas do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-xl p-3 bg-gradient-to-r from-blue-500 to-blue-600">
                <Users className="h-6 w-6 text-white" />
              </div>
              <Badge variant="secondary">Total</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {systemStats?.totalUsers || 0}
            </p>
            <p className="text-sm text-gray-500">Usuários Cadastrados</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-xl p-3 bg-gradient-to-r from-green-500 to-green-600">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <Badge variant="secondary">30 dias</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {systemStats?.activeUsers || 0}
            </p>
            <p className="text-sm text-gray-500">Usuários Ativos</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-xl p-3 bg-gradient-to-r from-purple-500 to-purple-600">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <Badge variant="secondary">Total</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(systemStats?.totalRevenue || 0)}
            </p>
            <p className="text-sm text-gray-500">Receita Total</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-xl p-3 bg-gradient-to-r from-orange-500 to-orange-600">
                <Database className="h-6 w-6 text-white" />
              </div>
              <Badge variant="secondary">Sistema</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {systemStats?.totalProducts || 0}
            </p>
            <p className="text-sm text-gray-500">Produtos Cadastrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Gerenciamento de Usuários */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gerenciamento de Usuários
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum usuário encontrado
              </div>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.id} className="bg-gray-50 hover:bg-gray-100 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.store_name?.charAt(0) || user.id.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {user.store_name || 'Loja sem nome'}
                          </h3>
                          <p className="text-sm text-gray-500">ID: {user.id}</p>
                          <p className="text-xs text-gray-400">
                            Cadastrado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          <p className="text-gray-600">
                            <span className="font-medium">{user.salesCount}</span> vendas
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">{user.productsCount}</span> produtos
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">{user.ordersCount}</span> pedidos
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ações Administrativas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="rounded-xl p-3 bg-gradient-to-r from-blue-500 to-blue-600">
                <Database className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Backup do Sistema</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Gerar backup completo de todos os dados do sistema
            </p>
            <Button className="w-full">
              Gerar Backup
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="rounded-xl p-3 bg-gradient-to-r from-green-500 to-green-600">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Relatórios Globais</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Gerar relatórios consolidados de todos os usuários
            </p>
            <Button className="w-full">
              Ver Relatórios
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="rounded-xl p-3 bg-gradient-to-r from-purple-500 to-purple-600">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Configurações Sistema</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Configurar parâmetros globais do sistema
            </p>
            <Button className="w-full">
              Configurar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
