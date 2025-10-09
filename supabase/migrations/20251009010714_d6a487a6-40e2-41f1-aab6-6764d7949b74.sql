-- Fase 4.1: Adicionar colunas de personalização em agencies
ALTER TABLE agencies 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS custom_domain text,
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{
  "company_name": "AI WhatsApp",
  "support_email": "suporte@aiwhatsapp.app",
  "timezone": "America/Sao_Paulo",
  "language": "pt-BR",
  "hide_branding": false
}'::jsonb;

-- Fase 4.2: Criar tabela de convites
CREATE TABLE IF NOT EXISTS invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  email text NOT NULL,
  role app_role NOT NULL,
  invited_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS invites_agency_id_idx ON invites(agency_id);
CREATE INDEX IF NOT EXISTS invites_email_idx ON invites(email);
CREATE INDEX IF NOT EXISTS invites_token_idx ON invites(token);

-- RLS para invites
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invites from their agency"
ON invites FOR SELECT
USING (agency_id IN (
  SELECT agency_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Admins can create invites"
ON invites FOR INSERT
WITH CHECK (
  agency_id IN (SELECT agency_id FROM profiles WHERE id = auth.uid())
  AND has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete invites"
ON invites FOR DELETE
USING (
  agency_id IN (SELECT agency_id FROM profiles WHERE id = auth.uid())
  AND has_role(auth.uid(), 'admin')
);

-- Fase 4.4: Criar tabela de estatísticas da agência
CREATE TABLE IF NOT EXISTS agency_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  date date NOT NULL,
  total_messages_sent int DEFAULT 0,
  total_messages_received int DEFAULT 0,
  active_conversations int DEFAULT 0,
  campaigns_sent int DEFAULT 0,
  webhook_calls int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agency_id, date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS agency_stats_agency_id_idx ON agency_stats(agency_id);
CREATE INDEX IF NOT EXISTS agency_stats_date_idx ON agency_stats(date DESC);

-- RLS para agency_stats
ALTER TABLE agency_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stats from their agency"
ON agency_stats FOR SELECT
USING (agency_id IN (
  SELECT agency_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "System can insert stats"
ON agency_stats FOR INSERT
WITH CHECK (true);

-- Trigger para atualizar updated_at em agencies
CREATE TRIGGER update_agencies_updated_at
  BEFORE UPDATE ON agencies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();