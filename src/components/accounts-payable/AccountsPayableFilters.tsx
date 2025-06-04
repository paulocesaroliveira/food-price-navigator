
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Calendar, X } from "lucide-react";
import type { AccountsPayableFilterData, ExpenseCategory } from "@/types/accountsPayable";

interface AccountsPayableFiltersProps {
  filters: AccountsPayableFilterData;
  categories: ExpenseCategory[];
  onFiltersChange: (filters: AccountsPayableFilterData) => void;
  onClearFilters: () => void;
}

export const AccountsPayableFilters = ({
  filters,
  categories,
  onFiltersChange,
  onClearFilters
}: AccountsPayableFiltersProps) => {
  const updateFilter = (key: keyof AccountsPayableFilterData, value: string) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== "all");

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Busca */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por descrição ou fornecedor..."
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status */}
          <Select value={filters.status || "all"} onValueChange={(value) => updateFilter("status", value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="paid">Pagos</SelectItem>
              <SelectItem value="overdue">Vencidos</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>

          {/* Categoria */}
          <Select value={filters.category || "all"} onValueChange={(value) => updateFilter("category", value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Data Inicial */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => updateFilter("startDate", e.target.value)}
              className="w-[140px]"
            />
            <span className="text-sm text-gray-500">até</span>
            <Input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => updateFilter("endDate", e.target.value)}
              className="w-[140px]"
            />
          </div>

          {/* Botão limpar filtros */}
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
