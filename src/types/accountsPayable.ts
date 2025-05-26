
export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
}

export interface AccountPayable {
  id: string;
  category_id?: string;
  description: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'check';
  supplier?: string;
  notes?: string;
  attachment_url?: string;
  created_at: string;
  updated_at: string;
  category?: ExpenseCategory;
}

export interface AccountsPayableFilters {
  status?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  supplier?: string;
}
