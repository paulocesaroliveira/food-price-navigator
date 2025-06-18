
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { TrendingUp, Users, AlertCircle, Activity, Database, Monitor } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsTab = () => {
  // Query para crescimento de usuários
  const { data: userGrowthData } = useQuery({
    queryKey: ['admin-user-growth'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_user_growth_stats');
        if (error) throw error;
        
        return data?.map(item => ({
          date: new Date(item.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
          novos_usuarios: item.new_users,
          total_usuarios: item.total_users
        })) || [];
      } catch (error) {
        console.error('Erro ao buscar crescimento de usuários:', error);
        return [];
      }
    }
  });

  // Query para uso por funcionalidade
  const { data: featureUsageData } = useQuery({
    queryKey: ['admin-feature-usage'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('feature_usage_log')
          .select('feature_name, page_path')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
          
        if (error) throw error;
        
        // Agrupar por funcionalidade
        const featureCount: Record<string, number> = {};
        data?.forEach(log => {
          const key = log.feature_name || log.page_path.split('/')[1] || 'Dashboard';
          featureCount[key] = (featureCount[key] || 0) + 1;
        });
        
        return Object.entries(featureCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      } catch (error) {
        console.error('Erro ao buscar uso de funcionalidades:', error);
        return [];
      }
    }
  });

  // Query para logs de erro
  const { data: errorLogsData } = useQuery({
    queryKey: ['admin-error-logs'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('error_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Erro ao buscar logs de erro:', error);
        return [];
      }
    }
  });

  // Query para estatísticas de erro por página
  const { data: errorsByPageData } = useQuery({
    queryKey: ['admin-errors-by-page'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('error_logs')
          .select('page_path')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
          
        if (error) throw error;
        
        const pageCount: Record<string, number> = {};
        data?.forEach(log => {
          const page = log.page_path || 'Desconhecido';
          pageCount[page] = (pageCount[page] || 0) + 1;
        });
        
        return Object.entries(pageCount)
          .map(([page, count]) => ({ page, count }))
          .sort((a, b) => b.count - a.count);
      } catch (error) {
        console.error('Erro ao buscar erros por página:', error);
        return [];
      }
    }
  });

  // Query para estatísticas gerais do sistema
  const { data: systemStats } = useQuery({
    queryKey: ['admin-system-stats'],
    queryFn: async () => {
      try {
        const [usersCount, salesCount, ordersCount, productsCount] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('sales').select('id', { count: 'exact' }),
          supabase.from('orders').select('id', { count: 'exact' }),
          supabase.from('products').select('id', { count: 'exact' })
        ]);

        return {
          totalUsers: usersCount.count || 0,
          totalSales: salesCount.count || 0,
          totalOrders: ordersCount.count || 0,
          totalProducts: productsCount.count || 0
        };
      } catch (error) {
        console.error('Erro ao buscar estatísticas do sistema:', error);
        return {
          totalUsers: 0,
          totalSales: 0,
          totalOrders: 0,
          totalProducts: 0
        };
      }
    }
  });

  // Query para atividade por hora
  const { data: hourlyActivityData } = useQuery({
    queryKey: ['admin-hourly-activity'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('feature_usage_log')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
          
        if (error) throw error;
        
        const hourlyCount: Record<number, number> = {};
        for (let i = 0; i < 24; i++) {
          hourlyCount[i] = 0;
        }
        
        data?.forEach(log => {
          const hour = new Date(log.created_at).getHours();
          hourlyCount[hour]++;
        });
        
        return Object.entries(hourlyCount).map(([hour, count]) => ({
          hour: `${hour}:00`,
          atividade: count
        }));
      } catch (error) {
        console.error('Erro ao buscar atividade por hora:', error);
        return [];
      }
    }
  });

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{userGrowthData?.slice(-7).reduce((sum, day) => sum + day.novos_usuarios, 0) || 0} nos últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalSales || 0}</div>
            <p className="text-xs text-muted-foreground">Registradas no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Processados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros (7d)</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorLogsData?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Registrados recentemente</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crescimento de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Usuários (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="novos_usuarios" 
                  stackId="1"
                  stroke="#8884d8" 
                  fill="#8884d8"
                  name="Novos Usuários"
                />
                <Area 
                  type="monotone" 
                  dataKey="total_usuarios" 
                  stackId="2"
                  stroke="#82ca9d" 
                  fill="#82ca9d"
                  name="Total de Usuários"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Atividade por Hora */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade por Hora (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="atividade" 
                  stroke="#ff7300" 
                  strokeWidth={2}
                  name="Atividade"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Funcionalidades Mais Usadas e Erros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uso por Funcionalidade */}
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades Mais Utilizadas (7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={featureUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Erros por Página */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Erros por Página (7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            {errorsByPageData && errorsByPageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={errorsByPageData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ page, count }) => `${page}: ${count}`}
                  >
                    {errorsByPageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <Monitor className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>Nenhum erro registrado!</p>
                  <p className="text-sm">Sistema funcionando corretamente</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Logs de Erro Detalhados */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Erro Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {errorLogsData && errorLogsData.length > 0 ? (
              errorLogsData.map((error) => (
                <div key={error.id} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-800 truncate">
                      {error.error_message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {error.page_path || 'Página desconhecida'}
                      </Badge>
                      <span className="text-xs text-red-600">
                        {new Date(error.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {error.error_stack && (
                      <details className="mt-2">
                        <summary className="text-xs text-red-700 cursor-pointer hover:text-red-800">
                          Ver stack trace
                        </summary>
                        <pre className="text-xs text-red-600 mt-1 bg-red-100 p-2 rounded max-h-20 overflow-y-auto">
                          {error.error_stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Monitor className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-medium text-green-600">Sistema estável!</p>
                <p className="text-sm">Nenhum erro recente registrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
