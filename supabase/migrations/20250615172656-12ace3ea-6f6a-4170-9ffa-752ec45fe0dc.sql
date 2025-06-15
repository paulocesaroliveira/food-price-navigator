
-- Criação da tabela de log de remoção/exclusão definitiva de usuários
CREATE TABLE IF NOT EXISTS public.user_removal_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  removed_at timestamp with time zone DEFAULT now(),
  removed_by uuid REFERENCES auth.users(id) NOT NULL,
  reason text
);

-- Sugestão: depois de aplicar, podemos implementar o registro no log ao remover usuário via painel admin.
