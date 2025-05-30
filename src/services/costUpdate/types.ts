
export interface UpdateAllResult {
  updated_recipes: number;
  updated_products: number;
  errors: string[];
}

export interface UpdateChainResult {
  affected_recipes: number;
  affected_products: number;
  recipe_ids: string[];
  product_ids: string[];
}

export interface Ingredient {
  id: string;
  name: string;
  unit_cost: number;
  brand: string;
  unit: string;
}

export interface Packaging {
  id: string;
  name: string;
  unit_cost: number;
  type: string;
}
