
export interface SaleExpenseCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  user_id: string;
  created_at: string;
}

export interface CreateSaleExpenseCategoryRequest {
  name: string;
  description?: string;
  color?: string;
}
