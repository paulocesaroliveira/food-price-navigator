
-- Verificar e corrigir políticas RLS para a tabela notices
-- Permitir que admins vejam todos os avisos (não apenas os ativos)
DROP POLICY IF EXISTS "Usuários podem ler avisos ativos" ON public.notices;
DROP POLICY IF EXISTS "Admins podem ler todos os avisos" ON public.notices;

-- Criar política para admins lerem todos os avisos
CREATE POLICY "Admins podem ler todos os avisos"
  ON public.notices
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Manter política para usuários comuns verem apenas avisos ativos
CREATE POLICY "Usuários podem ler avisos ativos"
  ON public.notices
  FOR SELECT
  USING (status = 'active' AND NOT public.has_role(auth.uid(), 'admin'));

-- Verificar se a função has_role existe, se não, criar
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Verificar se existe um usuário admin, se não, criar um para o usuário atual
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE role = 'admin'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (auth.uid(), 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- Verificar e corrigir políticas para user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Permitir que admins vejam todos os roles
CREATE POLICY "Admins podem ver todos os roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Permitir que usuários vejam apenas seus próprios roles
CREATE POLICY "Usuários podem ver seus próprios roles"
  ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid() AND NOT public.has_role(auth.uid(), 'admin'));

-- Permitir que admins gerenciem roles
CREATE POLICY "Admins podem inserir roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar roles"
  ON public.user_roles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar roles"
  ON public.user_roles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Verificar políticas da tabela profiles para acesso admin
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Permitir que admins vejam todos os perfis
CREATE POLICY "Admins podem ver todos os perfis"
  ON public.profiles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Permitir que usuários vejam apenas seu próprio perfil
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles
  FOR SELECT
  USING (id = auth.uid() AND NOT public.has_role(auth.uid(), 'admin'));

-- Permitir inserção de perfis para novos usuários
CREATE POLICY "Usuários podem criar seu próprio perfil"
  ON public.profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Permitir que usuários atualizem seu próprio perfil
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid());

-- Permitir que admins atualizem qualquer perfil
CREATE POLICY "Admins podem atualizar qualquer perfil"
  ON public.profiles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
