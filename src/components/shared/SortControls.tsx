
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { SortOption, SortDirection } from '@/hooks/useSortAndFilter';

interface SortControlsProps {
  sortBy: SortOption;
  sortDirection: SortDirection;
  onSort: (option: SortOption) => void;
  availableOptions: Array<{
    value: SortOption;
    label: string;
  }>;
}

export const SortControls: React.FC<SortControlsProps> = ({
  sortBy,
  sortDirection,
  onSort,
  availableOptions
}) => {
  return (
    <div className="flex items-center gap-2">
      <Select value={sortBy} onValueChange={(value) => onSort(value as SortOption)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          {availableOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSort(sortBy)}
        className="px-2"
      >
        {sortDirection === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
