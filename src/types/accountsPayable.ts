
export interface AccountPayable {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: 'pending' | 'paid' | 'cancelled';
  payment_method?: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'check';
  supplier?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  category_id?: string;
  category?: ExpenseCategory;
  attachment_url?: string;
}

export interface CreateAccountPayable {
  description: string;
  amount: number;
  due_date: string;
  status?: 'pending' | 'paid' | 'cancelled';
  payment_method?: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'check';
  supplier?: string;
  notes?: string;
  category_id?: string;
  attachment_url?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface AccountsPayableFilterData {
  search?: string;
  status?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}
