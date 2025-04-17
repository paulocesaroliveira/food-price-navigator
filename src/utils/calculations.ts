
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
 * Calculates the unit cost of a recipe
 * FIXED: Now correctly adds base per portion cost and portion ingredients cost
 */
export function calculateRecipeUnitCost(totalCost: number, portions: number, portionIngredientsTotalCost: number): number {
  if (portions <= 0) return 0;
  const basePerPortionCost = (totalCost - portionIngredientsTotalCost) / portions;
  return basePerPortionCost + (portionIngredientsTotalCost / portions);
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
export function calculateTotalProductionCost(
  productCost: number, 
  wastagePercentage: number,
  additionalCosts: { value: number; isPerUnit: boolean }[],
  quantity: number = 1
): number {
  // Calculate wastage cost
  const wastageMultiplier = 1 + (wastagePercentage / 100);
  const costWithWastage = productCost * wastageMultiplier;
  
  // Calculate additional costs
  const additionalCostsTotal = additionalCosts.reduce((total, cost) => {
    if (cost.isPerUnit) {
      return total + (cost.value * quantity);
    }
    return total + cost.value;
  }, 0);
  
  return costWithWastage + additionalCostsTotal;
}

/**
 * Calculates the selling price based on desired margin
 */
export function calculateSellingPrice(
  totalCost: number, 
  marginPercentage: number,
  quantity: number = 1
): number {
  const unitCost = totalCost / quantity;
  const marginMultiplier = 1 / (1 - (marginPercentage / 100));
  return unitCost * marginMultiplier;
}

/**
 * Calculates the price with platform commission
 */
export function calculatePriceWithCommission(
  sellingPrice: number, 
  commissionPercentage: number
): number {
  const commissionMultiplier = 1 / (1 - (commissionPercentage / 100));
  return sellingPrice * commissionMultiplier;
}

/**
 * Calculates the price with taxes
 */
export function calculatePriceWithTaxes(
  sellingPrice: number, 
  taxPercentage: number
): number {
  const taxMultiplier = 1 + (taxPercentage / 100);
  return sellingPrice * taxMultiplier;
}

/**
 * Calculates the unit profit
 */
export function calculateUnitProfit(
  sellingPrice: number, 
  unitCost: number
): number {
  return sellingPrice - unitCost;
}

/**
 * Calculates the markup percentage
 */
export function calculateMarkupPercentage(
  sellingPrice: number, 
  unitCost: number
): number {
  if (unitCost <= 0) return 0;
  return ((sellingPrice / unitCost) - 1) * 100;
}

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
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formats percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
