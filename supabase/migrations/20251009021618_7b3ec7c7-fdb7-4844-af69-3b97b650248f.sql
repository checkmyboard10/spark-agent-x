-- Add flow execution support to agents table
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS flow_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS active_flow_id UUID REFERENCES agent_flows(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agents_flow_enabled ON agents(flow_enabled) WHERE flow_enabled = true;
CREATE INDEX IF NOT EXISTS idx_agents_active_flow ON agents(active_flow_id) WHERE active_flow_id IS NOT NULL;