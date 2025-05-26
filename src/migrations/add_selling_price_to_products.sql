
-- Adicionar campo selling_price na tabela products
ALTER TABLE products 
ADD COLUMN selling_price DECIMAL(10, 2) DEFAULT 0;
