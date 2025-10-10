-- Criar tabela agent_knowledge_base
CREATE TABLE IF NOT EXISTS public.agent_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL UNIQUE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  extracted_content text,
  content_preview text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.agent_knowledge_base ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Usuários podem ver documentos dos agentes de sua agency
CREATE POLICY "Users can view knowledge base from their agency agents"
ON public.agent_knowledge_base 
FOR SELECT
USING (
  agent_id IN (
    SELECT a.id FROM agents a
    JOIN clients c ON a.client_id = c.id
    JOIN profiles p ON c.agency_id = p.agency_id
    WHERE p.id = auth.uid()
  )
);

-- RLS Policy: Admins e moderators podem gerenciar
CREATE POLICY "Admins and moderators can manage knowledge base"
ON public.agent_knowledge_base 
FOR ALL
USING (
  agent_id IN (
    SELECT a.id FROM agents a
    JOIN clients c ON a.client_id = c.id
    JOIN profiles p ON c.agency_id = p.agency_id
    WHERE p.id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'moderator'::app_role)
  )
)
WITH CHECK (
  agent_id IN (
    SELECT a.id FROM agents a
    JOIN clients c ON a.client_id = c.id
    JOIN profiles p ON c.agency_id = p.agency_id
    WHERE p.id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'moderator'::app_role)
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_agent_knowledge_base_updated_at
  BEFORE UPDATE ON public.agent_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar bucket de storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-knowledge', 'agent-knowledge', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Usuários podem fazer upload de arquivos para sua agency
CREATE POLICY "Users can upload knowledge files for their agency"
ON storage.objects 
FOR INSERT
WITH CHECK (
  bucket_id = 'agent-knowledge' AND
  auth.uid() IN (
    SELECT p.id FROM profiles p
    WHERE p.agency_id IS NOT NULL
  )
);

-- RLS Policy: Usuários podem baixar arquivos de sua agency
CREATE POLICY "Users can download knowledge files from their agency"
ON storage.objects 
FOR SELECT
USING (
  bucket_id = 'agent-knowledge' AND
  auth.uid() IN (
    SELECT p.id FROM profiles p
    WHERE p.agency_id IS NOT NULL
  )
);

-- RLS Policy: Usuários podem deletar arquivos
CREATE POLICY "Users can delete knowledge files"
ON storage.objects 
FOR DELETE
USING (
  bucket_id = 'agent-knowledge' AND
  auth.uid() IN (
    SELECT p.id FROM profiles p
    WHERE p.agency_id IS NOT NULL
  )
);