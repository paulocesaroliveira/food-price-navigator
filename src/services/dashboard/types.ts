
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

export interface RecentOrder {
  id: string;
  customer: string;
  value: number;
  status: string;
  time: string;
}

export interface SalesDataPoint {
  day: string;
  value: number;
}
