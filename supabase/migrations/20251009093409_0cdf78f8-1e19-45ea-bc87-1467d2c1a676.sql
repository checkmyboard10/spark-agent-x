-- Fix search_path for security definer functions
CREATE OR REPLACE FUNCTION prevent_last_admin_removal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count INTEGER;
  agency_id_val UUID;
BEGIN
  -- Buscar agency_id do usuário
  SELECT p.agency_id INTO agency_id_val
  FROM profiles p
  WHERE p.id = OLD.user_id;

  -- Se estiver deletando ou mudando role de um admin
  IF (TG_OP = 'DELETE' AND OLD.role = 'admin') OR 
     (TG_OP = 'UPDATE' AND OLD.role = 'admin' AND NEW.role != 'admin') THEN
    
    -- Contar quantos admins existem na mesma agency
    SELECT COUNT(*) INTO admin_count
    FROM user_roles ur
    JOIN profiles p ON ur.user_id = p.id
    WHERE ur.role = 'admin' 
      AND p.agency_id = agency_id_val
      AND ur.user_id != OLD.user_id;

    -- Se for o último admin, bloquear
    IF admin_count = 0 THEN
      RAISE EXCEPTION 'Não é possível remover ou rebaixar o último administrador da agency';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Fix search_path for ensure_first_user_is_admin
CREATE OR REPLACE FUNCTION ensure_first_user_is_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Contar quantos usuários existem na agency do novo usuário
  SELECT COUNT(*) INTO user_count
  FROM profiles p
  WHERE p.agency_id = NEW.agency_id;

  -- Se for o primeiro usuário, torná-lo admin
  IF user_count = 1 THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;