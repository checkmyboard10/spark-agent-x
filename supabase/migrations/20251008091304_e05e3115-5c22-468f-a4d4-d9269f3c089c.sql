-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  csv_meta JSONB DEFAULT '{}'::jsonb,
  followups JSONB DEFAULT '[]'::jsonb,
  total_contacts INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  replied_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign_contacts table
CREATE TABLE public.campaign_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'replied', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  last_interaction TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign_messages table
CREATE TABLE public.campaign_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.campaign_contacts(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  followup_level INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
CREATE POLICY "Users can view campaigns from their agency clients"
ON public.campaigns FOR SELECT
USING (
  client_id IN (
    SELECT id FROM public.clients
    WHERE agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create campaigns for their agency clients"
ON public.campaigns FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT id FROM public.clients
    WHERE agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update campaigns from their agency clients"
ON public.campaigns FOR UPDATE
USING (
  client_id IN (
    SELECT id FROM public.clients
    WHERE agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete campaigns from their agency clients"
ON public.campaigns FOR DELETE
USING (
  client_id IN (
    SELECT id FROM public.clients
    WHERE agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

-- RLS Policies for campaign_contacts
CREATE POLICY "Users can view campaign contacts from their agency"
ON public.campaign_contacts FOR SELECT
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns
    WHERE client_id IN (
      SELECT id FROM public.clients
      WHERE agency_id IN (
        SELECT agency_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can create campaign contacts for their agency"
ON public.campaign_contacts FOR INSERT
WITH CHECK (
  campaign_id IN (
    SELECT id FROM public.campaigns
    WHERE client_id IN (
      SELECT id FROM public.clients
      WHERE agency_id IN (
        SELECT agency_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can update campaign contacts from their agency"
ON public.campaign_contacts FOR UPDATE
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns
    WHERE client_id IN (
      SELECT id FROM public.clients
      WHERE agency_id IN (
        SELECT agency_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  )
);

-- RLS Policies for campaign_messages
CREATE POLICY "Users can view campaign messages from their agency"
ON public.campaign_messages FOR SELECT
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns
    WHERE client_id IN (
      SELECT id FROM public.clients
      WHERE agency_id IN (
        SELECT agency_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can create campaign messages for their agency"
ON public.campaign_messages FOR INSERT
WITH CHECK (
  campaign_id IN (
    SELECT id FROM public.campaigns
    WHERE client_id IN (
      SELECT id FROM public.clients
      WHERE agency_id IN (
        SELECT agency_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  )
);

-- Create indexes for better performance
CREATE INDEX idx_campaigns_client_id ON public.campaigns(client_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_scheduled_at ON public.campaigns(scheduled_at);
CREATE INDEX idx_campaign_contacts_campaign_id ON public.campaign_contacts(campaign_id);
CREATE INDEX idx_campaign_contacts_status ON public.campaign_contacts(status);
CREATE INDEX idx_campaign_messages_campaign_id ON public.campaign_messages(campaign_id);
CREATE INDEX idx_campaign_messages_contact_id ON public.campaign_messages(contact_id);

-- Trigger for updated_at on campaigns
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on campaign_contacts
CREATE TRIGGER update_campaign_contacts_updated_at
BEFORE UPDATE ON public.campaign_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();