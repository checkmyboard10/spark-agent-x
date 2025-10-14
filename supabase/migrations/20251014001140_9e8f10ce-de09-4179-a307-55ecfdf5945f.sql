-- Adicionar coluna client_id na tabela agent_flows para vincular flows diretamente aos clientes
ALTER TABLE agent_flows 
ADD COLUMN client_id UUID REFERENCES clients(id);

-- Migrar dados existentes: copiar client_id dos agents vinculados
UPDATE agent_flows
SET client_id = (
  SELECT agents.client_id 
  FROM agents 
  WHERE agents.id = agent_flows.agent_id
)
WHERE agent_id IS NOT NULL;

-- Criar índice para performance nas queries de listagem
CREATE INDEX idx_agent_flows_client_id ON agent_flows(client_id);

-- Atualizar RLS policies para suportar flows vinculados a clientes
DROP POLICY IF EXISTS "Users can manage flows from their agency" ON agent_flows;

CREATE POLICY "Users can manage flows from their agency" 
ON agent_flows 
FOR ALL 
USING (
  agency_id IN (
    SELECT agency_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
)
WITH CHECK (
  agency_id IN (
    SELECT agency_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);