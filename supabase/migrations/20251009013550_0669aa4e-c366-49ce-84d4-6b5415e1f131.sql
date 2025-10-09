-- Adicionar RLS policy para user_roles
CREATE POLICY "Users can view roles from their agency"
ON public.user_roles FOR SELECT
USING (
  user_id IN (
    SELECT id FROM profiles 
    WHERE agency_id IN (
      SELECT agency_id FROM profiles WHERE id = auth.uid()
    )
  )
);