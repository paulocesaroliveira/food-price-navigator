
import { 
  Ingredient, 
  Recipe, 
  Packaging, 
  Category, 
  Product,
  PricingConfiguration,
  PricingResult
} from "../types";

// Mock Categories
export const ingredientCategories: Category[] = [
  { id: "cat-ing-1", name: "Secos" },
  { id: "cat-ing-2", name: "Lácteos" },
  { id: "cat-ing-3", name: "Chocolates" },
  { id: "cat-ing-4", name: "Frutas" },
  { id: "cat-ing-5", name: "Especiarias" },
];

export const recipeCategories: Category[] = [
  { id: "cat-rec-1", name: "Doces" },
  { id: "cat-rec-2", name: "Bolos" },
  { id: "cat-rec-3", name: "Tortas" },
  { id: "cat-rec-4", name: "Salgados" },
];

// Mock Ingredients
export const ingredients: Ingredient[] = [
  {
    id: "ing-1",
    name: "Açúcar",
    categoryId: "cat-ing-1",
    unit: "g",
    brand: "Caravelas",
    supplier: "Supermercado Extra",
    packageQuantity: 1000,
    packagePrice: 3.99,
    unitCost: 0.00399,
  },
  {
    id: "ing-2",
    name: "Leite Condensado",
    categoryId: "cat-ing-2",
    unit: "g",
    brand: "Nestlé",
    supplier: "Atacadão",
    packageQuantity: 395,
    packagePrice: 6.49,
    unitCost: 0.01644,
  },
  {
    id: "ing-3",
    name: "Chocolate em Pó",
    categoryId: "cat-ing-3",
    unit: "g",
    brand: "Garoto",
    packageQuantity: 200,
    packagePrice: 9.99,
    unitCost: 0.04995,
  },
  {
    id: "ing-4",
    name: "Manteiga",
    categoryId: "cat-ing-2",
    unit: "g",
    brand: "Aviação",
    packageQuantity: 200,
    packagePrice: 10.9,
    unitCost: 0.0545,
  },
  {
    id: "ing-5",
    name: "Granulado",
    categoryId: "cat-ing-3",
    unit: "g",
    brand: "Harald",
    packageQuantity: 500,
    packagePrice: 15.9,
    unitCost: 0.0318,
  },
];

// Mock Recipes
export const recipes: Recipe[] = [
  {
    id: "rec-1",
    name: "Brigadeiro Tradicional",
    categoryId: "cat-rec-1",
    baseIngredients: [
      { id: "bi-1", ingredientId: "ing-2", quantity: 395, cost: 6.49 },
      { id: "bi-2", ingredientId: "ing-3", quantity: 50, cost: 2.50 },
      { id: "bi-3", ingredientId: "ing-4", quantity: 20, cost: 1.09 },
    ],
    portionIngredients: [
      { id: "pi-1", ingredientId: "ing-5", quantity: 5, cost: 0.159 },
    ],
    portions: 25,
    totalCost: 10.08 + 0.159 * 25,
    unitCost: 0.5592,
    notes: "Misturar todos os ingredientes e cozinhar em fogo baixo por 15 minutos.",
  },
  {
    id: "rec-2",
    name: "Brigadeiro de Morango",
    categoryId: "cat-rec-1",
    baseIngredients: [
      { id: "bi-4", ingredientId: "ing-2", quantity: 395, cost: 6.49 },
      { id: "bi-5", ingredientId: "ing-4", quantity: 20, cost: 1.09 },
    ],
    portionIngredients: [
      { id: "pi-2", ingredientId: "ing-5", quantity: 5, cost: 0.159 },
    ],
    portions: 25,
    totalCost: 7.58 + 0.159 * 25,
    unitCost: 0.4432,
    notes: "Adicionar essência de morango.",
  },
  {
    id: "rec-3",
    name: "Brigadeiro de Paçoca",
    categoryId: "cat-rec-1",
    baseIngredients: [
      { id: "bi-6", ingredientId: "ing-2", quantity: 395, cost: 6.49 },
      { id: "bi-7", ingredientId: "ing-4", quantity: 20, cost: 1.09 },
    ],
    portionIngredients: [
      { id: "pi-3", ingredientId: "ing-5", quantity: 5, cost: 0.159 },
    ],
    portions: 25,
    totalCost: 7.58 + 0.159 * 25,
    unitCost: 0.4432,
  },
];

// Mock Packaging
export const packaging: Packaging[] = [
  {
    id: "pkg-1",
    name: "Forminha de Papel",
    type: "Unidade",
    bulkQuantity: 100,
    bulkPrice: 15.90,
    unitCost: 0.159,
  },
  {
    id: "pkg-2",
    name: "Caixa de Presente",
    type: "Unidade",
    bulkQuantity: 50,
    bulkPrice: 99.50,
    unitCost: 1.99,
    notes: "Caixa com capacidade para 8 brigadeiros.",
  },
  {
    id: "pkg-3",
    name: "Saco de Celofane",
    type: "Unidade",
    bulkQuantity: 100,
    bulkPrice: 29.90,
    unitCost: 0.299,
  },
];

// Mock Products
export const products: Product[] = [
  {
    id: "prod-1",
    name: "Caixa Degustação 8 Brigadeiros",
    items: [
      { id: "item-1", recipeId: "rec-1", quantity: 4, cost: 2.2368 },
      { id: "item-2", recipeId: "rec-2", quantity: 2, cost: 0.8864 },
      { id: "item-3", recipeId: "rec-3", quantity: 2, cost: 0.8864 },
    ],
    packagingId: "pkg-2",
    packagingCost: 1.99,
    totalCost: 6.0,
  }
];

// Mock Pricing Configuration
export const pricingConfigurations: PricingConfiguration[] = [
  {
    productId: "prod-1",
    wastagePercentage: 5,
    additionalCosts: [
      { id: "add-1", name: "Gás", value: 0.50, isPerUnit: true },
      { id: "add-2", name: "Energia", value: 0.25, isPerUnit: true },
      { id: "add-3", name: "Transporte", value: 10, isPerUnit: false },
    ],
    desiredMarginPercentage: 40,
    platformFeePercentage: 12,
    taxPercentage: 6,
  }
];

// Mock Pricing Results
export const pricingResults: PricingResult[] = [
  {
    totalProductionCost: 18.50,
    unitCost: 18.50,
    sellingPrice: 30.83,
    unitProfit: 12.33,
    appliedMarkup: 66.67,
    priceWithCommission: 35.03,
    priceWithTaxes: 37.13,
    minimumRecommendedPrice: 23.13,
  }
];

// Chart data for dashboard
export const dashboardChartData = {
  barChart: [
    { name: "Brigadeiro Tradicional", profit: 12.33 },
    { name: "Brigadeiro de Morango", profit: 10.50 },
    { name: "Brigadeiro de Paçoca", profit: 9.75 },
    { name: "Caixa Degustação", profit: 16.80 },
  ],
  lineChart: [
    { month: "Jan", price: 28.99 },
    { month: "Fev", price: 28.99 },
    { month: "Mar", price: 29.99 },
    { month: "Abr", price: 29.99 },
    { month: "Mai", price: 30.83 },
    { month: "Jun", price: 30.83 },
  ]
};
