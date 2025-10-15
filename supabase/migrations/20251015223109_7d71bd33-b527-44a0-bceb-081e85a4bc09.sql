-- Adicionar colunas para Evolution API na tabela whatsapp_connections
ALTER TABLE whatsapp_connections
ADD COLUMN IF NOT EXISTS instance_name TEXT,
ADD COLUMN IF NOT EXISTS webhook_url TEXT,
ADD COLUMN IF NOT EXISTS evolution_data JSONB DEFAULT '{}'::jsonb;

-- Criar índice para busca rápida por instance
CREATE INDEX IF NOT EXISTS idx_whatsapp_instance_name ON whatsapp_connections(instance_name);