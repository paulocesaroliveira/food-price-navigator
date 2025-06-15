
-- Tabela para rastrear uso de funcionalidades
CREATE TABLE public.feature_usage_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  feature_name TEXT NOT NULL,
  page_path TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para logs de erro
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  page_path TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para tickets de suporte
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'bug', 'feature_request', 'technical_issue', 'billing')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para respostas dos tickets
CREATE TABLE public.support_ticket_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  is_admin_response BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para feedback dos usuários
CREATE TABLE public.user_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'bug_report', 'feature_request', 'improvement')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  page_context TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'implemented', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.feature_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Políticas para feature_usage_log
CREATE POLICY "Users can insert their own usage logs" ON public.feature_usage_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage logs" ON public.feature_usage_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para error_logs
CREATE POLICY "Users can insert their own error logs" ON public.error_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all error logs" ON public.error_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para support_tickets
CREATE POLICY "Users can view their own tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" ON public.support_tickets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets" ON public.support_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para support_ticket_responses
CREATE POLICY "Users can view responses to their tickets" ON public.support_ticket_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id AND user_id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create responses to their tickets" ON public.support_ticket_responses
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      EXISTS (
        SELECT 1 FROM public.support_tickets 
        WHERE id = ticket_id AND user_id = auth.uid()
      ) OR 
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Políticas para user_feedback
CREATE POLICY "Users can view their own feedback" ON public.user_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback" ON public.user_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback" ON public.user_feedback
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_support_tickets_updated_at();

CREATE OR REPLACE FUNCTION update_user_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_feedback_updated_at
  BEFORE UPDATE ON public.user_feedback
  FOR EACH ROW EXECUTE FUNCTION update_user_feedback_updated_at();

-- Função para obter estatísticas de crescimento de usuários
CREATE OR REPLACE FUNCTION get_user_growth_stats()
RETURNS TABLE(
  date DATE,
  new_users INTEGER,
  total_users INTEGER
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH daily_registrations AS (
    SELECT 
      DATE(created_at) as reg_date,
      COUNT(*) as daily_count
    FROM public.profiles
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(created_at)
  ),
  date_series AS (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '30 days',
      CURRENT_DATE,
      INTERVAL '1 day'
    )::DATE as date
  )
  SELECT 
    ds.date,
    COALESCE(dr.daily_count, 0)::INTEGER as new_users,
    (
      SELECT COUNT(*)::INTEGER 
      FROM public.profiles 
      WHERE DATE(created_at) <= ds.date
    ) as total_users
  FROM date_series ds
  LEFT JOIN daily_registrations dr ON ds.date = dr.reg_date
  ORDER BY ds.date;
$$;
