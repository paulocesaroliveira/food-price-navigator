
-- Passo 1: Adicionar coluna para indicar se o usuário está bloqueado
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;

-- Dica: Depois de aplicar você poderá atualizar esse campo pelo painel admin!
