-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create agencies table (multi-tenant base)
CREATE TABLE public.agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#10b981',
  secondary_color TEXT DEFAULT '#06b6d4',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  agency_id UUID REFERENCES public.agencies ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES public.agencies ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create agents table
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('support', 'sales', 'general')),
  prompt TEXT NOT NULL,
  humanization_enabled BOOLEAN DEFAULT true,
  typing_delay_ms INTEGER DEFAULT 1500,
  tools JSONB DEFAULT '[]'::jsonb,
  is_calendar_enabled BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for clients (agency-scoped)
CREATE POLICY "Users can view clients from their agency"
  ON public.clients FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create clients in their agency"
  ON public.clients FOR INSERT
  WITH CHECK (
    agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update clients in their agency"
  ON public.clients FOR UPDATE
  USING (
    agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete clients in their agency"
  ON public.clients FOR DELETE
  USING (
    agency_id IN (
      SELECT agency_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for agents
CREATE POLICY "Users can view agents from their agency clients"
  ON public.agents FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM public.clients
      WHERE agency_id IN (
        SELECT agency_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create agents for their agency clients"
  ON public.agents FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients
      WHERE agency_id IN (
        SELECT agency_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update agents from their agency clients"
  ON public.agents FOR UPDATE
  USING (
    client_id IN (
      SELECT id FROM public.clients
      WHERE agency_id IN (
        SELECT agency_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete agents from their agency clients"
  ON public.agents FOR DELETE
  USING (
    client_id IN (
      SELECT id FROM public.clients
      WHERE agency_id IN (
        SELECT agency_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert demo agency
INSERT INTO public.agencies (id, name, subdomain, primary_color, secondary_color)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Demo Agency',
  'demo',
  '#10b981',
  '#06b6d4'
);