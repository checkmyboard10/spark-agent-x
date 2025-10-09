-- Ensure app_role enum has all three values
-- First, check if we need to add 'moderator' to the enum
DO $$ 
BEGIN
    -- Try to add 'moderator' if it doesn't exist
    BEGIN
        ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'moderator';
    EXCEPTION
        WHEN duplicate_object THEN
            NULL; -- Value already exists, no problem
    END;
END $$;