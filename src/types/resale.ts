
export interface Reseller {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  commission_percentage: number;
  total_sales: number;
  status: 'active' | 'inactive';
  join_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ResaleTransaction {
  id: string;
  user_id: string;
  reseller_id: string;
  transaction_date: string;
  delivery_time?: string;
  total_amount: number;
  commission_amount: number;
  status: 'pending' | 'delivered' | 'paid' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  reseller?: Reseller;
  resale_transaction_items?: ResaleTransactionItem[];
}

export interface ResaleTransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  product?: {
    id: string;
    name: string;
  };
}

export interface CreateResellerRequest {
  name: string;
  email?: string;
  phone?: string;
  commission_percentage: number;
  notes?: string;
}

export interface CreateTransactionRequest {
  reseller_id: string;
  transaction_date: string;
  delivery_time?: string;
  notes?: string;
  items: CreateTransactionItemRequest[];
}

export interface CreateTransactionItemRequest {
  product_id: string;
  quantity: number;
  unit_price: number;
}
