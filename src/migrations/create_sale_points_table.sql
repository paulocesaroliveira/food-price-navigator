
-- Criar tabela para pontos de venda
CREATE TABLE sale_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir pontos de venda padrão
INSERT INTO sale_points (name, description) VALUES
('Loja', 'Venda presencial na loja'),
('iFood', 'Vendas através do iFood'),
('Online', 'Vendas online diretas');
