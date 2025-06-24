
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address1?: string;
  address2?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  addresses?: CustomerAddress[];
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  label: string;
  address: string;
  is_primary: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category?: {
    id: string;
    name: string;
  };
  categoryId?: string;
  category_id?: string;
  selling_price?: number;
  sellingPrice?: number;
  total_cost?: number;
  totalCost?: number;
  packaging_cost?: number;
  packagingCost?: number;
  calculatedPrice?: number;
  items?: ProductItem[];
  packagingItems?: ProductPackaging[];
  created_at: string;
  updated_at: string;
  user_id: string;
  imageUrl?: string;
}

export interface ProductItem {
  id?: string;
  recipeId: string;
  quantity: number;
  cost: number;
  recipe?: Recipe;
}

export interface ProductPackaging {
  id?: string;
  packagingId: string;
  quantity: number;
  cost: number;
  isPrimary: boolean;
  packaging?: Packaging;
}

export interface Recipe {
  id: string;
  name: string;
  unitCost?: number;
  unit_cost?: number;
  total_cost?: number;
  portions?: number;
  category?: {
    id: string;
    name: string;
  };
  image?: string;
  image_url?: string;
  notes?: string;
  baseIngredients?: RecipeIngredient[];
  portionIngredients?: RecipeIngredient[];
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
  cost: number;
  created_at: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit_cost: number;
  bulk_quantity: number;
  bulk_price: number;
  category_id?: string;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface Packaging {
  id: string;
  name: string;
  unitCost?: number;
  unit_cost?: number;
  type: string;
  imageUrl?: string;
  image_url?: string;
  bulkQuantity?: number;
  bulk_quantity?: number;
  bulkPrice?: number;
  bulk_price?: number;
  notes?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface OrderItem {
  id?: string;
  product_id: string;
  quantity: number;
  price_at_order: number;
  total_price: number;
  notes: string | null;
  product?: Product;
}

export interface OrderExpense {
  id: string;
  order_id: string;
  name: string;
  amount: number;
  type: string;
  description?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer?: Customer;
  scheduled_date?: string;
  scheduled_time?: string;
  total_amount: number;
  status: "Novo" | "Em preparo" | "Pronto" | "Finalizado" | "Cancelado";
  delivery_type: string;
  delivery_address?: string;
  payment_status?: string;
  payment_method?: string;
  notes?: string;
  origin: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  order_items?: OrderItem[];
  order_expenses?: OrderExpense[];
}

export interface AdditionalCost {
  id: string;
  name: string;
  value: number;
  type: 'fixed' | 'percentage';
  isPerUnit: boolean;
}

export interface PricingConfiguration {
  id: string;
  name: string;
  product_id: string;
  user_id: string;
  base_cost: number;
  packaging_cost: number;
  wastage_percentage: number;
  margin_percentage: number;
  platform_fee_percentage: number;
  tax_percentage: number;
  total_unit_cost: number;
  ideal_price: number;
  final_price: number;
  unit_profit: number;
  actual_margin: number;
  labor_cost?: number;
  labor_cost_type?: 'fixed' | 'percentage';
  overhead_cost?: number;
  overhead_cost_type?: 'fixed' | 'percentage';
  marketing_cost?: number;
  marketing_cost_type?: 'fixed' | 'percentage';
  delivery_cost?: number;
  delivery_cost_type?: 'fixed' | 'percentage';
  other_costs?: number;
  other_cost_type?: 'fixed' | 'percentage';
  target_margin_percentage?: number;
  minimum_price?: number;
  maximum_price?: number;
  competitor_price?: number;
  notes?: string;
  additionalCosts?: AdditionalCost[];
  created_at: string;
  updated_at: string;
}

export interface PricingResult {
  unitCost: number;
  sellingPrice: number;
  margin: number;
  profit: number;
  unitProfit: number;
  appliedMarkup: number;
  priceWithTaxes: number;
  priceWithCommission: number;
  minimumRecommendedPrice: number;
}

export interface Sale {
  id: string;
  sale_number: string;
  sale_date: string;
  total_amount: number;
  total_cost: number;
  gross_profit: number;
  net_profit: number;
  discount_amount?: number;
  discount_category_id?: string;
  sale_point_id?: string;
  notes?: string;
  status: 'completed' | 'cancelled' | 'pending';
  created_at: string;
  updated_at: string;
  sale_items?: SaleItem[];
  sale_expenses?: SaleExpense[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_cost: number;
  total_cost: number;
  created_at: string;
  product?: {
    id: string;
    name: string;
    total_cost: number;
  };
}

export interface SaleExpense {
  id: string;
  sale_id: string;
  name: string;
  amount: number;
  type: 'expense' | 'tax' | 'fee';
  description?: string;
  category_id?: string;
  created_at: string;
}
