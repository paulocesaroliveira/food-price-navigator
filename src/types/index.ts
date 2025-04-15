// Basic types
export interface Category {
  id: string;
  name: string;
}

export interface Ingredient {
  id: string;
  name: string;
  image?: string;
  categoryId: string;
  unit: 'g' | 'ml';
  brand: string;
  supplier?: string;
  packageQuantity: number;
  packagePrice: number;
  unitCost: number;
}

export interface RecipeIngredient {
  id?: string;
  ingredientId?: string;
  ingredient_id?: string; // For compatibility with existing code
  quantity: number;
  cost: number;
}

export interface Recipe {
  id: string;
  name: string;
  image?: string;
  categoryId: string;
  baseIngredients: RecipeIngredient[];
  portionIngredients: RecipeIngredient[];
  portions: number;
  totalCost: number;
  unitCost: number;
  notes?: string;
}

export interface Packaging {
  id: string;
  name: string;
  image?: string;
  type: string;
  bulkQuantity: number;
  bulkPrice: number;
  unitCost: number;
  notes?: string;
}

export interface ProductItem {
  id: string;
  recipeId: string;
  quantity: number;
  cost: number;
}

export interface Product {
  id: string;
  name: string;
  items: ProductItem[];
  packagingId: string;
  packagingCost: number;
  totalCost: number;
}

export interface PricingConfiguration {
  productId: string;
  wastagePercentage: number;
  additionalCosts: AdditionalCost[];
  desiredMarginPercentage: number;
  platformFeePercentage: number;
  taxPercentage: number;
}

export interface AdditionalCost {
  id: string;
  name: string;
  value: number;
  isPerUnit: boolean;
}

export interface PricingResult {
  totalProductionCost: number;
  unitCost: number;
  sellingPrice: number;
  unitProfit: number;
  appliedMarkup: number;
  priceWithCommission: number;
  priceWithTaxes: number;
  minimumRecommendedPrice: number;
}
