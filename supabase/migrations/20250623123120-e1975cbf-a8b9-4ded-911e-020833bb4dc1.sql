
-- Verificar e ajustar a estrutura de precificação no banco de dados
-- Adicionar campos necessários se não existirem
ALTER TABLE pricing_configs 
ADD COLUMN IF NOT EXISTS labor_cost_type text DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS overhead_cost_type text DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS marketing_cost_type text DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS delivery_cost_type text DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS other_cost_type text DEFAULT 'fixed';

-- Adicionar RLS policies para pricing_configs se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pricing_configs' 
        AND policyname = 'Users can view their own pricing configs'
    ) THEN
        CREATE POLICY "Users can view their own pricing configs" 
        ON pricing_configs FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pricing_configs' 
        AND policyname = 'Users can create their own pricing configs'
    ) THEN
        CREATE POLICY "Users can create their own pricing configs" 
        ON pricing_configs FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pricing_configs' 
        AND policyname = 'Users can update their own pricing configs'
    ) THEN
        CREATE POLICY "Users can update their own pricing configs" 
        ON pricing_configs FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pricing_configs' 
        AND policyname = 'Users can delete their own pricing configs'
    ) THEN
        CREATE POLICY "Users can delete their own pricing configs" 
        ON pricing_configs FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- Habilitar RLS na tabela pricing_configs se não estiver habilitado
ALTER TABLE pricing_configs ENABLE ROW LEVEL SECURITY;

-- Garantir que todas as foreign keys estão corretas
DO $$
BEGIN
    -- Verificar se a foreign key para products existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'pricing_configs_product_id_fkey' 
        AND table_name = 'pricing_configs'
    ) THEN
        ALTER TABLE pricing_configs 
        ADD CONSTRAINT pricing_configs_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
    END IF;
END $$;
