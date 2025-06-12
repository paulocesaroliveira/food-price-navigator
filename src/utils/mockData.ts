
import { 
  Ingredient, 
  Recipe, 
  Product, 
  Category,
  PricingConfiguration,
  PricingResult
} from "../types";

export const mockCategories: Category[] = [
  { id: "1", name: "Carnes", user_id: "user1", created_at: "2024-01-01T00:00:00Z" },
  { id: "2", name: "Vegetais", user_id: "user1", created_at: "2024-01-01T00:00:00Z" },
  { id: "3", name: "Laticínios", user_id: "user1", created_at: "2024-01-01T00:00:00Z" },
  { id: "4", name: "Grãos", user_id: "user1", created_at: "2024-01-01T00:00:00Z" },
  { id: "5", name: "Temperos", user_id: "user1", created_at: "2024-01-01T00:00:00Z" }
];

export const mockProductCategories: Category[] = [
  { id: "1", name: "Pratos Principais", user_id: "user1", created_at: "2024-01-01T00:00:00Z" },
  { id: "2", name: "Sobremesas", user_id: "user1", created_at: "2024-01-01T00:00:00Z" },
  { id: "3", name: "Bebidas", user_id: "user1", created_at: "2024-01-01T00:00:00Z" },
  { id: "4", name: "Entradas", user_id: "user1", created_at: "2024-01-01T00:00:00Z" }
];

export const mockIngredients: Ingredient[] = [
  {
    id: "1",
    name: "Peito de Frango",
    unit_cost: 0.020,
    bulk_quantity: 1000,
    bulk_price: 20.00,
    category_id: "1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Arroz Branco",
    unit_cost: 0.008,
    bulk_quantity: 1000,
    bulk_price: 8.00,
    category_id: "4",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "3",
    name: "Feijão Carioca",
    unit_cost: 0.010,
    bulk_quantity: 1000,
    bulk_price: 10.00,
    category_id: "4",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "4",
    name: "Cebola",
    unit_cost: 0.005,
    bulk_quantity: 1000,
    bulk_price: 5.00,
    category_id: "2",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "5",
    name: "Alho",
    unit_cost: 0.015,
    bulk_quantity: 100,
    bulk_price: 1.50,
    category_id: "5",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
];

export const mockRecipes: Recipe[] = [
  {
    id: "1",
    name: "Frango Grelhado",
    unit_cost: 4.50,
    total_cost: 4.50,
    portions: 1,
    category: { id: "1", name: "Pratos Principais" },
    image: "/placeholder.svg",
    baseIngredients: [
      { id: "1", recipe_id: "1", ingredient_id: "1", quantity: 200, cost: 4.00, created_at: "2024-01-01T00:00:00Z" },
      { id: "2", recipe_id: "1", ingredient_id: "4", quantity: 50, cost: 0.25, created_at: "2024-01-01T00:00:00Z" },
      { id: "3", recipe_id: "1", ingredient_id: "5", quantity: 10, cost: 0.15, created_at: "2024-01-01T00:00:00Z" }
    ],
    portionIngredients: [
      { id: "4", recipe_id: "1", ingredient_id: "5", quantity: 5, cost: 0.10, created_at: "2024-01-01T00:00:00Z" }
    ]
  },
  {
    id: "2", 
    name: "Arroz com Feijão",
    unit_cost: 2.80,
    total_cost: 2.80,
    portions: 1,
    category: { id: "1", name: "Pratos Principais" },
    image: "/placeholder.svg",
    baseIngredients: [
      { id: "5", recipe_id: "2", ingredient_id: "2", quantity: 150, cost: 1.20, created_at: "2024-01-01T00:00:00Z" },
      { id: "6", recipe_id: "2", ingredient_id: "3", quantity: 150, cost: 1.50, created_at: "2024-01-01T00:00:00Z" }
    ],
    portionIngredients: [
      { id: "7", recipe_id: "2", ingredient_id: "4", quantity: 20, cost: 0.10, created_at: "2024-01-01T00:00:00Z" }
    ]
  },
  {
    id: "3",
    name: "Prato Completo",
    unit_cost: 7.30,
    total_cost: 7.30, 
    portions: 1,
    category: { id: "1", name: "Pratos Principais" },
    image: "/placeholder.svg",
    baseIngredients: [
      { id: "8", recipe_id: "3", ingredient_id: "1", quantity: 200, cost: 4.00, created_at: "2024-01-01T00:00:00Z" },
      { id: "9", recipe_id: "3", ingredient_id: "2", quantity: 150, cost: 1.20, created_at: "2024-01-01T00:00:00Z" }
    ],
    portionIngredients: [
      { id: "10", recipe_id: "3", ingredient_id: "3", quantity: 150, cost: 1.50, created_at: "2024-01-01T00:00:00Z" }
    ]
  }
];

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Prato Executivo de Frango",
    categoryId: "1",
    category_id: "1",
    selling_price: 18.00,
    total_cost: 7.50,
    packaging_cost: 0.50,
    calculatedPrice: 18.00,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    user_id: "user1",
    category: {
      id: "1",
      name: "Pratos Principais"
    },
    items: [
      {
        recipeId: "1",
        quantity: 1,
        cost: 4.50
      },
      {
        recipeId: "2", 
        quantity: 1,
        cost: 2.80
      }
    ]
  }
];

export const mockPricingConfigs: PricingConfiguration[] = [
  {
    id: "1",
    name: "Configuração Padrão",
    product_id: "1",
    user_id: "user1",
    base_cost: 7.50,
    packaging_cost: 0.50,
    wastage_percentage: 5,
    margin_percentage: 65,
    platform_fee_percentage: 0,
    tax_percentage: 0,
    total_unit_cost: 8.40,
    ideal_price: 18.00,
    final_price: 18.00,
    unit_profit: 9.60,
    actual_margin: 53.33,
    labor_cost: 0,
    overhead_cost: 0,
    marketing_cost: 0,
    delivery_cost: 0,
    other_costs: 0,
    target_margin_percentage: 65,
    minimum_price: 10.08,
    maximum_price: 25.00,
    competitor_price: 0,
    notes: "",
    additionalCosts: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
];

export const mockPricingResults: PricingResult[] = [
  {
    unitCost: 8.40,
    sellingPrice: 18.00,
    margin: 65,
    profit: 9.60,
    unitProfit: 9.60,
    appliedMarkup: 114.29,
    priceWithTaxes: 18.00,
    priceWithCommission: 18.00,
    minimumRecommendedPrice: 10.08
  }
];
