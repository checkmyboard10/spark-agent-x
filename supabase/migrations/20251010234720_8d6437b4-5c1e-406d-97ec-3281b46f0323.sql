-- ETAPA 1.1: Tornar agent_id OPCIONAL na tabela agent_flows
ALTER TABLE agent_flows 
ALTER COLUMN agent_id DROP NOT NULL;

-- Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_agent_flows_agent 
ON agent_flows(agent_id) 
WHERE agent_id IS NOT NULL;

-- ETAPA 1.2: Adicionar coluna agency_id diretamente na tabela agent_flows
ALTER TABLE agent_flows 
ADD COLUMN agency_id UUID REFERENCES agencies(id);

-- Preencher agency_id existente via agents -> clients -> agencies
UPDATE agent_flows af
SET agency_id = c.agency_id
FROM agents a
JOIN clients c ON a.client_id = c.id
WHERE af.agent_id = a.id;

-- Tornar obrigatório após preencher dados existentes
ALTER TABLE agent_flows 
ALTER COLUMN agency_id SET NOT NULL;

-- Adicionar índice para performance
CREATE INDEX idx_agent_flows_agency_id ON agent_flows(agency_id);

-- Atualizar RLS policies para usar agency_id direto
DROP POLICY IF EXISTS "Users can manage flows from their agency agents" ON agent_flows;

CREATE POLICY "Users can manage flows from their agency"
ON agent_flows
FOR ALL
USING (
  agency_id IN (
    SELECT agency_id FROM profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  agency_id IN (
    SELECT agency_id FROM profiles WHERE id = auth.uid()
  )
);