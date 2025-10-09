-- Create enums for integrations
CREATE TYPE public.whatsapp_status AS ENUM ('disconnected', 'connecting', 'connected');
CREATE TYPE public.conversation_status AS ENUM ('active', 'waiting', 'closed');
CREATE TYPE public.message_direction AS ENUM ('incoming', 'outgoing');
CREATE TYPE public.message_type AS ENUM ('text', 'image', 'audio', 'document');
CREATE TYPE public.message_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');
CREATE TYPE public.integration_status AS ENUM ('active', 'expired', 'revoked');
CREATE TYPE public.webhook_status AS ENUM ('success', 'failed');

-- WhatsApp Connections Table
CREATE TABLE public.whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  status public.whatsapp_status NOT NULL DEFAULT 'disconnected',
  qr_code TEXT,
  phone_number TEXT,
  connected_at TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id)
);

-- Conversations Table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  contact_phone TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  status public.conversation_status NOT NULL DEFAULT 'active',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages Table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  direction public.message_direction NOT NULL,
  content TEXT NOT NULL,
  message_type public.message_type NOT NULL DEFAULT 'text',
  status public.message_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Google Integrations Table
CREATE TABLE public.google_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  calendar_id TEXT NOT NULL,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_sync TIMESTAMPTZ,
  status public.integration_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id)
);

-- Webhooks Table
CREATE TABLE public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  retry_policy JSONB DEFAULT '{"max_retries": 3, "backoff_multiplier": 2}'::jsonb,
  last_triggered_at TIMESTAMPTZ,
  last_status public.webhook_status,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Webhook Logs Table
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Enable RLS
ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whatsapp_connections
CREATE POLICY "Users can view whatsapp connections from their agency"
  ON public.whatsapp_connections FOR SELECT
  USING (client_id IN (
    SELECT id FROM public.clients 
    WHERE agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage whatsapp connections for their agency"
  ON public.whatsapp_connections FOR ALL
  USING (client_id IN (
    SELECT id FROM public.clients 
    WHERE agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  ))
  WITH CHECK (client_id IN (
    SELECT id FROM public.clients 
    WHERE agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations from their agency"
  ON public.conversations FOR SELECT
  USING (client_id IN (
    SELECT id FROM public.clients 
    WHERE agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage conversations for their agency"
  ON public.conversations FOR ALL
  USING (client_id IN (
    SELECT id FROM public.clients 
    WHERE agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  ))
  WITH CHECK (client_id IN (
    SELECT id FROM public.clients 
    WHERE agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

-- RLS Policies for messages
CREATE POLICY "Users can view messages from their agency conversations"
  ON public.messages FOR SELECT
  USING (conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE client_id IN (
      SELECT id FROM public.clients 
      WHERE agency_id IN (
        SELECT agency_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can manage messages for their agency conversations"
  ON public.messages FOR ALL
  USING (conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE client_id IN (
      SELECT id FROM public.clients 
      WHERE agency_id IN (
        SELECT agency_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  ))
  WITH CHECK (conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE client_id IN (
      SELECT id FROM public.clients 
      WHERE agency_id IN (
        SELECT agency_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  ));

-- RLS Policies for google_integrations
CREATE POLICY "Users can view google integrations from their agency"
  ON public.google_integrations FOR SELECT
  USING (client_id IN (
    SELECT id FROM public.clients 
    WHERE agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage google integrations for their agency"
  ON public.google_integrations FOR ALL
  USING (client_id IN (
    SELECT id FROM public.clients 
    WHERE agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  ))
  WITH CHECK (client_id IN (
    SELECT id FROM public.clients 
    WHERE agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

-- RLS Policies for webhooks
CREATE POLICY "Users can view webhooks from their agency"
  ON public.webhooks FOR SELECT
  USING (client_id IN (
    SELECT id FROM public.clients 
    WHERE agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage webhooks for their agency"
  ON public.webhooks FOR ALL
  USING (client_id IN (
    SELECT id FROM public.clients 
    WHERE agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  ))
  WITH CHECK (client_id IN (
    SELECT id FROM public.clients 
    WHERE agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  ));

-- RLS Policies for webhook_logs
CREATE POLICY "Users can view webhook logs from their agency"
  ON public.webhook_logs FOR SELECT
  USING (webhook_id IN (
    SELECT id FROM public.webhooks 
    WHERE client_id IN (
      SELECT id FROM public.clients 
      WHERE agency_id IN (
        SELECT agency_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  ));

CREATE POLICY "System can create webhook logs"
  ON public.webhook_logs FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_whatsapp_connections_client_id ON public.whatsapp_connections(client_id);
CREATE INDEX idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX idx_conversations_agent_id ON public.conversations(agent_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_google_integrations_client_id ON public.google_integrations(client_id);
CREATE INDEX idx_webhooks_client_id ON public.webhooks(client_id);
CREATE INDEX idx_webhook_logs_webhook_id ON public.webhook_logs(webhook_id);

-- Triggers for updated_at
CREATE TRIGGER update_whatsapp_connections_updated_at
  BEFORE UPDATE ON public.whatsapp_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_google_integrations_updated_at
  BEFORE UPDATE ON public.google_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();