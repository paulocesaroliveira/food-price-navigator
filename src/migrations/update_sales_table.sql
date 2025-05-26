
-- Adicionar campos de desconto e ponto de venda na tabela sales
ALTER TABLE sales 
ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN sale_point_id UUID REFERENCES sale_points(id);
