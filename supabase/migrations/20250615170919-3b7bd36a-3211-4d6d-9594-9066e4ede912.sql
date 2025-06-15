
-- Criação da tabela de avisos/notícias (caso não exista)
CREATE TABLE IF NOT EXISTS public.notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  status text NOT NULL DEFAULT 'active', -- active | inactive | archived
  published_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id)
);

-- Habilitar RLS
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Políticas administrativas
CREATE POLICY "Admins podem criar avisos"
  ON public.notices
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar avisos"
  ON public.notices
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem excluir avisos"
  ON public.notices
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Todos podem ler avisos ativos
CREATE POLICY "Usuários podem ler avisos ativos"
  ON public.notices
  FOR SELECT
  USING (status = 'active');
