
import { useState, useMemo } from 'react';

export type SortOption = 'name' | 'category' | 'created_at' | 'cost' | 'price';
export type SortDirection = 'asc' | 'desc';

interface UseSortAndFilterProps<T> {
  items: T[];
  searchTerm: string;
  defaultSort?: SortOption;
  defaultDirection?: SortDirection;
}

export const useSortAndFilter = <T extends Record<string, any>>({
  items,
  searchTerm,
  defaultSort = 'name',
  defaultDirection = 'asc'
}: UseSortAndFilterProps<T>) => {
  const [sortBy, setSortBy] = useState<SortOption>(defaultSort);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultDirection);

  const filteredAndSortedItems = useMemo(() => {
    // Primeiro filtrar
    let filtered = items.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.name?.toLowerCase().includes(searchLower) ||
        item.category?.name?.toLowerCase().includes(searchLower) ||
        item.brand?.toLowerCase().includes(searchLower) ||
        item.type?.toLowerCase().includes(searchLower)
      );
    });

    // Depois ordenar
    filtered.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortBy) {
        case 'name':
          valueA = a.name || '';
          valueB = b.name || '';
          break;
        case 'category':
          valueA = a.category?.name || '';
          valueB = b.category?.name || '';
          break;
        case 'created_at':
          valueA = new Date(a.created_at || 0);
          valueB = new Date(b.created_at || 0);
          break;
        case 'cost':
          valueA = a.unit_cost || a.total_cost || 0;
          valueB = b.unit_cost || b.total_cost || 0;
          break;
        case 'price':
          valueA = a.selling_price || a.unit_price || 0;
          valueB = b.selling_price || b.unit_price || 0;
          break;
        default:
          valueA = a.name || '';
          valueB = b.name || '';
      }

      // Comparação
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB, 'pt-BR')
          : valueB.localeCompare(valueA, 'pt-BR');
      }

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [items, searchTerm, sortBy, sortDirection]);

  const handleSort = (option: SortOption) => {
    if (option === sortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('asc');
    }
  };

  return {
    sortedItems: filteredAndSortedItems,
    sortBy,
    sortDirection,
    handleSort
  };
};
