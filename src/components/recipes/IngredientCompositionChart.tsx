
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/utils/calculations";

interface ChartData {
  name: string;
  cost: number;
  percentage: number;
}

interface IngredientCompositionChartProps {
  data: ChartData[];
}

// Cores para o gráfico
const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", 
  "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57"
];

export const IngredientCompositionChart = ({ data }: IngredientCompositionChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Adicione ingredientes para visualizar a composição
      </div>
    );
  }

  // Função customizada para o tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">{item.name}</p>
          <p>Custo: {formatCurrency(item.cost)}</p>
          <p>Percentual: {item.percentage.toFixed(2)}%</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="cost"
            nameKey="name"
            label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
