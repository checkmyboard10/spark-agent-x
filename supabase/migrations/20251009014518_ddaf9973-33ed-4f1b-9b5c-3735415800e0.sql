-- Criar tabela de notas internas nas conversas
CREATE TABLE public.conversation_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Criar tabela de tags para conversas
CREATE TABLE public.conversation_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  tag TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Criar tabela de respostas rápidas
CREATE TABLE public.quick_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'geral',
  shortcuts TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Adicionar campos para arquivamento de conversas
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Habilitar RLS
ALTER TABLE public.conversation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies para conversation_notes
CREATE POLICY "Users can view notes from their agency conversations"
ON public.conversation_notes FOR SELECT
USING (
  conversation_id IN (
    SELECT c.id FROM public.conversations c
    INNER JOIN public.clients cl ON c.client_id = cl.id
    INNER JOIN public.profiles p ON cl.agency_id = p.agency_id
    WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Users can create notes in their agency conversations"
ON public.conversation_notes FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT c.id FROM public.conversations c
    INNER JOIN public.clients cl ON c.client_id = cl.id
    INNER JOIN public.profiles p ON cl.agency_id = p.agency_id
    WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own notes"
ON public.conversation_notes FOR DELETE
USING (user_id = auth.uid());

-- RLS Policies para conversation_tags
CREATE POLICY "Users can view tags from their agency conversations"
ON public.conversation_tags FOR SELECT
USING (
  conversation_id IN (
    SELECT c.id FROM public.conversations c
    INNER JOIN public.clients cl ON c.client_id = cl.id
    INNER JOIN public.profiles p ON cl.agency_id = p.agency_id
    WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Users can manage tags in their agency conversations"
ON public.conversation_tags FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT c.id FROM public.conversations c
    INNER JOIN public.clients cl ON c.client_id = cl.id
    INNER JOIN public.profiles p ON cl.agency_id = p.agency_id
    WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Users can delete tags from their agency conversations"
ON public.conversation_tags FOR DELETE
USING (
  conversation_id IN (
    SELECT c.id FROM public.conversations c
    INNER JOIN public.clients cl ON c.client_id = cl.id
    INNER JOIN public.profiles p ON cl.agency_id = p.agency_id
    WHERE p.id = auth.uid()
  )
);

-- RLS Policies para quick_replies
CREATE POLICY "Users can view quick replies from their agency"
ON public.quick_replies FOR SELECT
USING (
  agency_id IN (SELECT agency_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can create quick replies in their agency"
ON public.quick_replies FOR INSERT
WITH CHECK (
  agency_id IN (SELECT agency_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can update quick replies from their agency"
ON public.quick_replies FOR UPDATE
USING (
  agency_id IN (SELECT agency_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can delete quick replies from their agency"
ON public.quick_replies FOR DELETE
USING (
  agency_id IN (SELECT agency_id FROM public.profiles WHERE id = auth.uid())
);

-- Criar índices para performance
CREATE INDEX idx_conversation_notes_conversation ON public.conversation_notes(conversation_id);
CREATE INDEX idx_conversation_notes_user ON public.conversation_notes(user_id);
CREATE INDEX idx_conversation_tags_conversation ON public.conversation_tags(conversation_id);
CREATE INDEX idx_quick_replies_agency ON public.quick_replies(agency_id);
CREATE INDEX idx_conversations_archived ON public.conversations(archived);

-- Trigger para updated_at em quick_replies
CREATE TRIGGER update_quick_replies_updated_at
  BEFORE UPDATE ON public.quick_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();