
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

export interface CreateSaleRequest {
  sale_date: string;
  discount_amount?: number;
  discount_category_id?: string;
  sale_point_id?: string;
  notes?: string;
  items: CreateSaleItemRequest[];
  expenses?: CreateSaleExpenseRequest[];
}

export interface CreateSaleItemRequest {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface CreateSaleExpenseRequest {
  name: string;
  amount: number;
  type: 'expense' | 'tax' | 'fee';
  description?: string;
  category_id?: string;
}

export interface SaleInsert {
  sale_date: string;
  total_amount: number;
  total_cost: number;
  gross_profit: number;
  net_profit: number;
  discount_amount?: number;
  discount_category_id?: string;
  sale_point_id?: string;
  notes?: string;
  status?: 'completed' | 'cancelled' | 'pending';
  sale_number?: string;
}
