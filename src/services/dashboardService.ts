
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  weekRevenue: number;
  weekOrders: number;
  monthRevenue: number;
  monthOrders: number;
  revenueGrowth: number;
  ordersGrowth: number;
  avgOrderValue: number;
  totalCustomers: number;
}

export interface DashboardFilters {
  period: 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
}

export async function getDashboardStats(filters: DashboardFilters): Promise<DashboardStats | null> {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Calcular datas baseadas no filtro
    let startDate: string;
    let endDate: string = todayStr;
    
    switch (filters.period) {
      case 'today':
        startDate = todayStr;
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      case 'custom':
        startDate = filters.startDate || todayStr;
        endDate = filters.endDate || todayStr;
        break;
      default:
        startDate = todayStr;
    }

    // Buscar vendas do período
    const { data: sales, error: salesError } = await supabase
      .from("sales")
      .select("*")
      .gte("sale_date", startDate)
      .lte("sale_date", endDate);

    if (salesError) throw salesError;

    // Buscar pedidos do período
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", `${startDate}T00:00:00`)
      .lte("created_at", `${endDate}T23:59:59`);

    if (ordersError) throw ordersError;

    // Buscar total de clientes
    const { count: totalCustomers, error: customersError } = await supabase
      .from("customers")
      .select("*", { count: 'exact', head: true });

    if (customersError) throw customersError;

    // Calcular estatísticas
    const todayRevenue = sales
      ?.filter(sale => sale.sale_date === todayStr)
      ?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;

    const todayOrders = orders
      ?.filter(order => order.created_at.startsWith(todayStr))
      ?.length || 0;

    const weekRevenue = sales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
    const weekOrders = orders?.length || 0;

    // Para crescimento, buscar período anterior para comparação
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - 7);
    const prevEndDate = new Date(endDate);
    prevEndDate.setDate(prevEndDate.getDate() - 7);

    const { data: prevSales } = await supabase
      .from("sales")
      .select("*")
      .gte("sale_date", prevStartDate.toISOString().split('T')[0])
      .lte("sale_date", prevEndDate.toISOString().split('T')[0]);

    const { data: prevOrders } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", `${prevStartDate.toISOString().split('T')[0]}T00:00:00`)
      .lte("created_at", `${prevEndDate.toISOString().split('T')[0]}T23:59:59`);

    const prevRevenue = prevSales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
    const prevOrdersCount = prevOrders?.length || 0;

    const revenueGrowth = prevRevenue > 0 ? ((weekRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersGrowth = prevOrdersCount > 0 ? ((weekOrders - prevOrdersCount) / prevOrdersCount) * 100 : 0;

    const avgOrderValue = weekOrders > 0 ? weekRevenue / weekOrders : 0;

    return {
      todayRevenue,
      todayOrders,
      weekRevenue,
      weekOrders,
      monthRevenue: weekRevenue, // Será igual ao período selecionado
      monthOrders: weekOrders,
      revenueGrowth,
      ordersGrowth,
      avgOrderValue,
      totalCustomers: totalCustomers || 0
    };

  } catch (error: any) {
    console.error("Erro ao buscar estatísticas do dashboard:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível carregar as estatísticas: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
}

export async function getRecentOrders() {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        customer:customers(name)
      `)
      .order("created_at", { ascending: false })
      .limit(4);

    if (error) throw error;

    return orders?.map(order => ({
      id: order.order_number,
      customer: order.customer?.name || 'Cliente não encontrado',
      value: order.total_amount,
      status: order.status,
      time: new Date(order.created_at).toLocaleString('pt-BR')
    })) || [];

  } catch (error: any) {
    console.error("Erro ao buscar pedidos recentes:", error.message);
    toast({
      title: "Erro",
      description: `Não foi possível carregar pedidos recentes: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
}

export async function getSalesData(filters: DashboardFilters) {
  try {
    const today = new Date();
    let startDate: Date;
    
    switch (filters.period) {
      case 'today':
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'custom':
        startDate = filters.startDate ? new Date(filters.startDate) : new Date(today);
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
    }

    const { data: sales, error } = await supabase
      .from("sales")
      .select("*")
      .gte("sale_date", startDate.toISOString().split('T')[0])
      .order("sale_date", { ascending: true });

    if (error) throw error;

    // Agrupar vendas por dia
    const salesByDay = sales?.reduce((acc, sale) => {
      const date = new Date(sale.sale_date);
      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
      
      if (!acc[dayName]) {
        acc[dayName] = 0;
      }
      acc[dayName] += sale.total_amount || 0;
      return acc;
    }, {} as Record<string, number>) || {};

    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    return days.map(day => ({
      day,
      value: salesByDay[day] || 0
    }));

  } catch (error: any) {
    console.error("Erro ao buscar dados de vendas:", error.message);
    return [];
  }
}
