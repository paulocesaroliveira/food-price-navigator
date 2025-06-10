
-- Deletar todos os dados de usuários das tabelas especificadas
-- Começando pelas tabelas que dependem de outras (foreign keys) na ordem correta

-- Deletar primeiro itens de transações de revenda que referenciam produtos
DELETE FROM resale_transaction_items;
DELETE FROM resale_transactions;

-- Deletar primeiro itens de vendas e pedidos que referenciam produtos
DELETE FROM sale_items;
DELETE FROM order_items;
DELETE FROM order_expenses;
DELETE FROM published_products;

-- Deletar configurações de preços que referenciam produtos
DELETE FROM pricing_configs;
DELETE FROM pricing_expenses;
DELETE FROM additional_costs;

-- Deletar ingredientes de receitas primeiro
DELETE FROM recipe_base_ingredients;
DELETE FROM recipe_portion_ingredients;

-- Deletar itens de produtos
DELETE FROM product_items;
DELETE FROM product_packaging;

-- Deletar produtos
DELETE FROM products;

-- Deletar receitas
DELETE FROM recipes;

-- Deletar embalagens
DELETE FROM packaging;

-- Deletar ingredientes
DELETE FROM ingredients;

-- Deletar categorias relacionadas
DELETE FROM recipe_categories;
DELETE FROM ingredient_categories;
DELETE FROM product_categories;
