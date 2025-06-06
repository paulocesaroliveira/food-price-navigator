
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";
import { DashboardFilters } from "@/services/dashboard";

interface DashboardHeaderProps {
  filters: DashboardFilters;
  onPeriodChange: (period: DashboardFilters['period']) => void;
  onCustomDateChange: (field: 'startDate' | 'endDate', value: string) => void;
}

const DashboardHeader = ({ filters, onPeriodChange, onCustomDateChange }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Select value={filters.period} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-40 bg-white border-blue-200 text-gray-900">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200">
          <SelectItem value="today">Hoje</SelectItem>
          <SelectItem value="week">Esta Semana</SelectItem>
          <SelectItem value="month">Este Mês</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>

      {filters.period === 'custom' && (
        <div className="flex gap-2 items-center">
          <div>
            <Label htmlFor="start-date" className="text-xs text-gray-700">De:</Label>
            <Input
              id="start-date"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => onCustomDateChange('startDate', e.target.value)}
              className="w-36 bg-white border-blue-200"
            />
          </div>
          <div>
            <Label htmlFor="end-date" className="text-xs text-gray-700">Até:</Label>
            <Input
              id="end-date"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => onCustomDateChange('endDate', e.target.value)}
              className="w-36 bg-white border-blue-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
