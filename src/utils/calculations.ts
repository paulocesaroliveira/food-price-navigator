export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

export const calculateMargin = (sellingPrice: number, cost: number): number => {
  if (sellingPrice === 0) return 0;
  return ((sellingPrice - cost) / sellingPrice) * 100;
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('pt-BR').format(d);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Pricing calculation functions
export const calculateTotalProductionCost = (
  baseCost: number,
  packagingCost: number,
  wastagePercentage: number,
  additionalCosts: any[] = []
): number => {
  const additionalCostTotal = additionalCosts.reduce((sum, cost) => sum + cost.value, 0);
  const subtotal = baseCost + packagingCost + additionalCostTotal;
  return subtotal * (1 + wastagePercentage / 100);
};

export const calculateSellingPrice = (
  totalCost: number,
  marginPercentage: number
): number => {
  return totalCost * (1 + marginPercentage / 100);
};

export const calculatePriceWithCommission = (
  sellingPrice: number,
  platformFeePercentage: number
): number => {
  return sellingPrice * (1 + platformFeePercentage / 100);
};

export const calculatePriceWithTaxes = (
  priceWithCommission: number,
  taxPercentage: number
): number => {
  return priceWithCommission * (1 + taxPercentage / 100);
};

export const calculateUnitProfit = (
  sellingPrice: number,
  unitCost: number
): number => {
  return sellingPrice - unitCost;
};

export const calculateMarkupPercentage = (
  sellingPrice: number,
  unitCost: number
): number => {
  if (unitCost === 0) return 0;
  return ((sellingPrice - unitCost) / unitCost) * 100;
};
