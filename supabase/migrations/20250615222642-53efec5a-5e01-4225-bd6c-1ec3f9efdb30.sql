
-- Adicionar coluna priority na tabela notices
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium';

-- Adicionar coluna para notificações de tickets
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS has_admin_response boolean DEFAULT false;

-- Criar trigger para marcar quando admin responde um ticket
CREATE OR REPLACE FUNCTION mark_admin_response()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_admin_response = true THEN
    UPDATE support_tickets 
    SET has_admin_response = true 
    WHERE id = NEW.ticket_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_mark_admin_response
  AFTER INSERT ON support_ticket_responses
  FOR EACH ROW
  EXECUTE FUNCTION mark_admin_response();
