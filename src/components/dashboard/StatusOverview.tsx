import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/services/dashboard";

interface StatusOverviewProps {
  stats: DashboardStats | null;
}

const StatusOverview = ({ stats }: StatusOverviewProps) => {
  const defaultStats: DashboardStats = {
    todayRevenue: 0,
    todayOrders: 0,
    weekRevenue: 0,
    weekOrders: 0,
    monthRevenue: 0,
    monthOrders: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    avgOrderValue: 0,
    totalCustomers: 0
  };

  const currentStats = stats || defaultStats;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Geral</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Produtos Ativos</span>
            <span className="text-sm font-medium">12</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Receitas</span>
            <span className="text-sm font-medium">8</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-secondary h-2 rounded-full" style={{ width: '60%' }}></div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Pedidos Pendentes</span>
            <span className="text-sm font-medium">{currentStats.todayOrders}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-amber-500 h-2 rounded-full" style={{ width: '40%' }}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusOverview;
