
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
  Cell
} from "recharts";
import { TrendingUp, Users, AlertCircle, Activity } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsTab = () => {
  // Query para crescimento de usuários
  const { data: userGrowthData } = useQuery({
    queryKey: ['admin-user-growth'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_growth_stats');
      if (error) throw error;
      
      return data?.map(item => ({
        date: new Date(item.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        novos_usuarios: item.new_users,
        total_usuarios: item.total_users
      })) || [];
    }
  });

  // Query para uso por funcionalidade
  const { data: featureUsageData } = useQuery({
    queryKey: ['admin-feature-usage'],
    queryFn: async () => {
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
    }
  });

  // Query para logs de erro
  const { data: errorLogsData } = useQuery({
    queryKey: ['admin-error-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      return data || [];
    }
  });

  // Query para estatísticas de erro por página
  const { data: errorsByPageData } = useQuery({
    queryKey: ['admin-errors-by-page'],
    queryFn: async () => {
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
    }
  });

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Usuários (7d)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userGrowthData?.slice(-7).reduce((sum, day) => sum + day.novos_usuarios, 0) || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcionalidades Ativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featureUsageData?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros (7d)</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorLogsData?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12%</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crescimento de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Usuários (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="novos_usuarios" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Novos Usuários"
                />
                <Line 
                  type="monotone" 
                  dataKey="total_usuarios" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Total de Usuários"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
      </div>

      {/* Logs de Erro e Distribuição por Página */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logs de Erro Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Logs de Erro Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {errorLogsData?.map((error) => (
                <div key={error.id} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-800 truncate">
                      {error.error_message}
                    </p>
                    <p className="text-xs text-red-600">
                      {error.page_path} • {new Date(error.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-center text-gray-500 py-4">Nenhum erro recente</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Erros por Página */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Erros por Página</CardTitle>
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
                Nenhum erro registrado
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsTab;
