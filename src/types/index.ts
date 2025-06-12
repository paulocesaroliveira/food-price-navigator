
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
}

export interface Product {
  id: string;
  name: string;
  category?: {
    id: string;
    name: string;
  };
  categoryId?: string;
  selling_price?: number;
  total_cost?: number;
  calculatedPrice?: number;
  items?: ProductItem[];
  packagingItems?: ProductPackaging[];
  created_at: string;
  updated_at: string;
  user_id: string;
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
  unitCost: number;
  total_cost?: number;
  portions?: number;
  category?: {
    id: string;
    name: string;
  };
}

export interface Packaging {
  id: string;
  name: string;
  unitCost: number;
  type: string;
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
