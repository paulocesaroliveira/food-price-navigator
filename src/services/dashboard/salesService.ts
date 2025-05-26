
import { supabase } from "@/integrations/supabase/client";
import { DashboardFilters, SalesDataPoint } from "./types";

export async function getSalesData(filters: DashboardFilters): Promise<SalesDataPoint[]> {
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
