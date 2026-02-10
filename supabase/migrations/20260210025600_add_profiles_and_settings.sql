-- Add profile fields for Settings/Profile flow
-- Adds display_name and timezone to user_profiles table

-- 1. Add columns to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Los_Angeles';

-- 2. Update handle_new_user trigger to populate display_name and timezone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role, display_name, timezone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role),
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'timezone', 'America/Los_Angeles')
    )
    ON CONFLICT (id) DO UPDATE SET
        display_name = COALESCE(EXCLUDED.display_name, public.user_profiles.display_name),
        timezone = COALESCE(EXCLUDED.timezone, public.user_profiles.timezone);
    RETURN NEW;
END;
$$;

-- 3. Backfill existing users with display_name from full_name or email
DO $$
BEGIN
    UPDATE public.user_profiles
    SET 
        display_name = COALESCE(display_name, full_name, split_part(email, '@', 1)),
        timezone = COALESCE(timezone, 'America/Los_Angeles')
    WHERE display_name IS NULL OR timezone IS NULL;
END $$;