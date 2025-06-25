
-- Verificar se há alguma restrição na coluna unit da tabela ingredients
-- e garantir que 'un' seja aceito como valor válido
ALTER TABLE ingredients 
DROP CONSTRAINT IF EXISTS ingredients_unit_check;

-- Adicionar constraint correta que aceita 'un' como valor válido
ALTER TABLE ingredients 
ADD CONSTRAINT ingredients_unit_check 
CHECK (unit IN ('g', 'ml', 'un'));
