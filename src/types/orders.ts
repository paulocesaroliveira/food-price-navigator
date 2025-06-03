
export interface OrderExpense {
  id: string;
  order_id: string;
  name: string;
  amount: number;
  type: 'expense' | 'tax' | 'fee' | 'delivery';
  description?: string;
  created_at: string;
}

export interface CreateOrderExpenseRequest {
  name: string;
  amount: number;
  type: 'expense' | 'tax' | 'fee' | 'delivery';
  description?: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  label: string;
  address: string;
  is_primary: boolean;
  created_at: string;
}

export interface CreateCustomerAddressRequest {
  label: string;
  address: string;
  is_primary: boolean;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_order: number;
  total_price: number;
  notes?: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
  };
}
