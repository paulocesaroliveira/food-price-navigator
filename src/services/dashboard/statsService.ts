
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DashboardStats, DashboardFilters } from "./types";

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
