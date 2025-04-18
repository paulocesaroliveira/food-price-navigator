
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
  ingredient_id: string;
  quantity: number;
  cost: number;
  ingredient?: Ingredient;
}

export interface Recipe {
  id: string;
  name: string;
  image?: string;
  categoryId?: string;
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
  type: string;
  bulkQuantity: number;
  bulkPrice: number;
  unitCost: number;
  imageUrl?: string;
  notes?: string;
}

export type ProductCategory = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  categoryId?: string | null;
  category?: ProductCategory;
  packagingId?: string;
  imageUrl?: string | null;
  items: ProductItem[];
  packagingItems?: ProductPackaging[];
  packagingCost: number;
  totalCost: number;
  calculatedPrice?: number;
};

export interface ProductItem {
  id: string;
  recipeId: string;
  quantity: number;
  cost: number;
  recipe?: Partial<Recipe>;
}

export interface ProductPackaging {
  id?: string;
  packagingId: string;
  quantity: number;
  cost: number;
  isPrimary: boolean;
  packaging?: Packaging;
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

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_order: number;
  total_price: number;
  notes: string | null;
  created_at: string;
  product?: {
    name: string;
  };
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: "Novo" | "Em preparo" | "Pronto" | "Finalizado" | "Cancelado";
  delivery_type: "Entrega" | "Retirada";
  delivery_address: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  total_amount: number;
  notes: string | null;
  origin: "site" | "manual";
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  items?: OrderItem[];
}

// Customer type definition
export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at?: string;
  address1?: string | null;
  address2?: string | null;
  notes?: string | null;
  origin?: "site" | "manual";
}
