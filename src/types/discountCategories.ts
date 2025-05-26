
export interface DiscountCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  user_id: string;
  created_at: string;
}

export interface CreateDiscountCategoryRequest {
  name: string;
  description?: string;
  color?: string;
}
