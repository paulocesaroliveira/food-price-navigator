


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

export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  status: 'Novo' | 'Em preparo' | 'Pronto' | 'Finalizado' | 'Cancelado';
  delivery_type: 'Entrega' | 'Retirada';
  delivery_address: string;
  scheduled_date: string;
  scheduled_time: string;
  total_amount: number;
  payment_status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: string;
  payment_date?: string;
  notes: string;
  origin: 'manual' | 'site';
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  order_expenses?: OrderExpense[];
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
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


