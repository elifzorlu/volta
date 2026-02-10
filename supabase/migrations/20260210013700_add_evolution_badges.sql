-- Add evolution_badges column to user_profiles table
-- This column stores the list of earned evolution badges for the Volta alignment system

DO $$
BEGIN
  -- Add evolution_badges column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'evolution_badges'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN evolution_badges text[] DEFAULT '{}'::text[];
  END IF;
END $$;