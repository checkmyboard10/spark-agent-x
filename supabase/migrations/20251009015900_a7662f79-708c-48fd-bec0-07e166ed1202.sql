-- Create agent_flows table
CREATE TABLE agent_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  nodes JSON NOT NULL DEFAULT '[]',
  edges JSON NOT NULL DEFAULT '[]',
  variables JSON DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(agent_id, name)
);

-- Create indexes for performance
CREATE INDEX idx_agent_flows_agent ON agent_flows(agent_id);
CREATE INDEX idx_agent_flows_active ON agent_flows(is_active);

-- Enable RLS
ALTER TABLE agent_flows ENABLE ROW LEVEL SECURITY;

-- RLS Policy for agent_flows
CREATE POLICY "Users can manage flows from their agency agents"
ON agent_flows FOR ALL
USING (
  agent_id IN (
    SELECT a.id FROM agents a
    INNER JOIN clients c ON a.client_id = c.id
    INNER JOIN profiles p ON c.agency_id = p.agency_id
    WHERE p.id = auth.uid()
  )
)
WITH CHECK (
  agent_id IN (
    SELECT a.id FROM agents a
    INNER JOIN clients c ON a.client_id = c.id
    INNER JOIN profiles p ON c.agency_id = p.agency_id
    WHERE p.id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_agent_flows_updated_at
  BEFORE UPDATE ON agent_flows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create flow_executions table
CREATE TABLE flow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES agent_flows(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  current_node_id TEXT,
  execution_log JSON DEFAULT '[]',
  variables JSON DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX idx_flow_executions_flow ON flow_executions(flow_id);
CREATE INDEX idx_flow_executions_conversation ON flow_executions(conversation_id);
CREATE INDEX idx_flow_executions_status ON flow_executions(status);

-- Enable RLS
ALTER TABLE flow_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policy for flow_executions
CREATE POLICY "Users can view executions from their agency flows"
ON flow_executions FOR SELECT
USING (
  flow_id IN (
    SELECT af.id FROM agent_flows af
    INNER JOIN agents a ON af.agent_id = a.id
    INNER JOIN clients c ON a.client_id = c.id
    INNER JOIN profiles p ON c.agency_id = p.agency_id
    WHERE p.id = auth.uid()
  )
);

CREATE POLICY "System can create executions"
ON flow_executions FOR INSERT
WITH CHECK (true);