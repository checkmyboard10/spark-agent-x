-- PRIORIDADE 1: SEGURANÇA CRÍTICA

-- 1. Adicionar RLS policies para a tabela agencies
CREATE POLICY "Users can view their own agency"
ON public.agencies FOR SELECT
USING (
  id IN (
    SELECT agency_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can update their agency"
ON public.agencies FOR UPDATE
USING (
  id IN (
    SELECT agency_id FROM profiles WHERE id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 2. Adicionar DELETE policies para campaign_contacts
CREATE POLICY "Admins can delete campaign contacts"
ON public.campaign_contacts FOR DELETE
USING (
  campaign_id IN (
    SELECT campaigns.id FROM campaigns
    WHERE campaigns.client_id IN (
      SELECT clients.id FROM clients
      WHERE clients.agency_id IN (
        SELECT profiles.agency_id FROM profiles
        WHERE profiles.id = auth.uid()
      )
    )
  )
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 3. Adicionar DELETE policies para campaign_messages
CREATE POLICY "Admins can delete campaign messages"
ON public.campaign_messages FOR DELETE
USING (
  campaign_id IN (
    SELECT campaigns.id FROM campaigns
    WHERE campaigns.client_id IN (
      SELECT clients.id FROM clients
      WHERE clients.agency_id IN (
        SELECT profiles.agency_id FROM profiles
        WHERE profiles.id = auth.uid()
      )
    )
  )
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);