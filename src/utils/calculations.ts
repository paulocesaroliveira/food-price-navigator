/**
 * Calculates the unit cost of an ingredient
 */
export function calculateIngredientUnitCost(packagePrice: number, packageQuantity: number): number {
  if (packageQuantity <= 0) return 0;
  return packagePrice / packageQuantity;
}

/**
 * Calculates the cost of a specific quantity of an ingredient
 */
export function calculateIngredientCost(unitCost: number, quantity: number): number {
  return unitCost * quantity;
}

/**
 * Calculates the total cost of a recipe
 */
export function calculateRecipeTotalCost(
  baseIngredientsCost: number,
  portionIngredientsTotalCost: number
): number {
  return baseIngredientsCost + portionIngredientsTotalCost;
}

/**
 * Calculates the unit cost of a recipe by properly accounting for
 * base ingredients cost per portion and portion-specific ingredients
 */
export function calculateRecipeUnitCost(
  baseIngredientsCost: number,
  portionIngredientsTotalCost: number,
  portions: number
): number {
  if (portions <= 0) return 0;
  
  // Calculate base ingredients cost per portion
  const basePerPortionCost = baseIngredientsCost / portions;
  
  // Calculate portion ingredients cost per portion
  const portionIngredientsPerPortionCost = portionIngredientsTotalCost / portions;
  
  // Total unit cost is the sum of both costs per portion
  return basePerPortionCost + portionIngredientsPerPortionCost;
}

/**
 * Calculates the base cost per portion
 */
export function calculateBasePerPortionCost(baseIngredientsCost: number, portions: number): number {
  if (portions <= 0) return 0;
  return baseIngredientsCost / portions;
}

/**
 * Calculates the unit cost of packaging
 */
export function calculatePackagingUnitCost(bulkPrice: number, bulkQuantity: number): number {
  if (bulkQuantity <= 0) return 0;
  return bulkPrice / bulkQuantity;
}

/**
 * Calculates the total cost of a product
 */
export function calculateProductTotalCost(itemsTotalCost: number, packagingCost: number): number {
  return itemsTotalCost + packagingCost;
}

/**
 * Calculates the total cost of production including wastage and additional costs
 */
export const calculateTotalProductionCost = (
  baseCost: number,
  wastagePercentage: number,
  additionalCosts: { value: number; type?: 'fixed' | 'percentage'; isPerUnit: boolean }[]
): number => {
  // Add wastage to base cost
  const wastageMultiplier = 1 + (wastagePercentage / 100);
  let totalCost = baseCost * wastageMultiplier;
  
  // Add additional costs
  const additionalCostsTotal = additionalCosts.reduce((sum, cost) => {
    if (cost.type === 'percentage') {
      return sum + (baseCost * (cost.value / 100));
    }
    return sum + cost.value;
  }, 0);
  
  totalCost += additionalCostsTotal;
  
  return totalCost;
};

/**
 * Calculates the selling price based on desired margin
 */
export const calculateSellingPrice = (
  totalCost: number,
  marginPercentage: number
): number => {
  // Apply margin to total cost
  // Formula: sellingPrice = totalCost / (1 - margin/100)
  const marginMultiplier = 1 - (marginPercentage / 100);
  return totalCost / marginMultiplier;
};

/**
 * Calculates the price with platform commission
 */
export const calculatePriceWithCommission = (
  basePrice: number,
  commissionPercentage: number
): number => {
  // Apply commission to base price
  // Formula: finalPrice = basePrice / (1 - commission/100)
  if (commissionPercentage === 0) return basePrice;
  
  const commissionMultiplier = 1 - (commissionPercentage / 100);
  return basePrice / commissionMultiplier;
};

/**
 * Calculates the price with taxes
 */
export const calculatePriceWithTaxes = (
  basePrice: number,
  taxPercentage: number
): number => {
  // Apply tax to base price
  // Formula: finalPrice = basePrice * (1 + tax/100)
  const taxMultiplier = 1 + (taxPercentage / 100);
  return basePrice * taxMultiplier;
};

/**
 * Calculates the unit profit
 */
export const calculateUnitProfit = (
  sellingPrice: number,
  totalCost: number
): number => {
  return sellingPrice - totalCost;
};

/**
 * Calculates the markup percentage
 */
export const calculateMarkupPercentage = (
  sellingPrice: number,
  totalCost: number
): number => {
  if (totalCost === 0) return 0;
  return ((sellingPrice - totalCost) / sellingPrice) * 100;
};

/**
 * Calculates minimum recommended price
 */
export function calculateMinimumRecommendedPrice(
  unitCost: number,
  minimumMarginPercentage: number = 20
): number {
  const marginMultiplier = 1 / (1 - (minimumMarginPercentage / 100));
  return unitCost * marginMultiplier;
}

/**
 * Formats currency to BRL
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formats percentage
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Formats date
 */
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
};
