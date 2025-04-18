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

export type ProductCategory = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  categoryId?: string;
  category?: ProductCategory | null;
  items: ProductItem[];
  packagingId?: string;
  packagingCost: number;
  packagingItems?: ProductPackaging[];
  totalCost: number;
  imageUrl?: string | null;
};

export interface ProductItem {
  id?: string;
  recipeId: string;
  recipe?: {
    id: string;
    name: string;
    image_url?: string;
    unit_cost: number;
  } | null;
  quantity: number;
  cost: number;
}

export interface ProductPackaging {
  id?: string;
  packagingId: string;
  packaging?: {
    id: string;
    name: string;
    image_url?: string;
    unit_cost: number;
  } | null;
  quantity: number;
  cost: number;
  isPrimary?: boolean;
}

export interface PricingConfiguration {
  id: string;
  name: string;
  productId: string;
  baseCost: number;
  packagingCost: number;
  wastagePercentage: number;
  additionalCosts: AdditionalCost[];
  desiredMarginPercentage: number;
  platformFeePercentage: number;
  taxPercentage: number;
  totalUnitCost: number;
  idealPrice: number;
  finalPrice: number;
  unitProfit: number;
  actualMargin: number;
  createdAt: string;
  updatedAt: string;
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
