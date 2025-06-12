
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, DollarSign } from "lucide-react";
import { formatCurrency } from "@/utils/calculations";

interface AccountsPayableStatsProps {
  totalPending: number;
  totalPaid: number;
  overdueCount: number;
  totalCount: number;
}

export const AccountsPayableStats = ({
  totalPending,
  totalPaid,
  overdueCount,
  totalCount
}: AccountsPayableStatsProps) => {
  const stats = [
    {
      title: "Total Pendente",
      value: formatCurrency(totalPending),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Total Pago",
      value: formatCurrency(totalPaid),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Contas Vencidas",
      value: overdueCount.toString(),
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "Total de Contas",
      value: totalCount.toString(),
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
