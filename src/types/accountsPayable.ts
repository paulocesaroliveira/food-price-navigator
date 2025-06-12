
export interface AccountPayable {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: 'pending' | 'paid' | 'cancelled';
  payment_method?: string;
  supplier?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}
