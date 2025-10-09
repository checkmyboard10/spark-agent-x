-- Criar bucket para logos das agências
INSERT INTO storage.buckets (id, name, public)
VALUES ('agency-logos', 'agency-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policies para o bucket agency-logos
CREATE POLICY "Admins can upload agency logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'agency-logos' 
  AND (storage.foldername(name))[1] IN (
    SELECT agency_id::text FROM profiles WHERE id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update agency logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'agency-logos'
  AND (storage.foldername(name))[1] IN (
    SELECT agency_id::text FROM profiles WHERE id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Everyone can view agency logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'agency-logos');