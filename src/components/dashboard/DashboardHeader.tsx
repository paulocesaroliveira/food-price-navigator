import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardFilters } from "@/services/dashboard";

interface DashboardHeaderProps {
  filters: DashboardFilters;
  onPeriodChange: (period: DashboardFilters['period']) => void;
  onCustomDateChange: (field: 'startDate' | 'endDate', value: string) => void;
}

const DashboardHeader = ({ filters, onPeriodChange, onCustomDateChange }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>
      
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={filters.period} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>

        {filters.period === 'custom' && (
          <div className="flex gap-2 items-center">
            <div>
              <Label htmlFor="start-date" className="text-xs">De:</Label>
              <Input
                id="start-date"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onCustomDateChange('startDate', e.target.value)}
                className="w-36"
              />
            </div>
            <div>
              <Label htmlFor="end-date" className="text-xs">Até:</Label>
              <Input
                id="end-date"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onCustomDateChange('endDate', e.target.value)}
                className="w-36"
              />
            </div>
          </div>
        )}

        <Button variant="outline" size="sm" asChild>
          <Link to="/relatorios">
            <Calendar className="h-4 w-4 mr-2" />
            Relatórios
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
