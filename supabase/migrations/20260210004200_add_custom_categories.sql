-- Custom Categories Migration
-- Allows users to create personalized work type categories alongside default ones

-- Create custom_categories table
CREATE TABLE IF NOT EXISTS public.custom_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Briefcase',
    color TEXT NOT NULL DEFAULT '#10b981',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_category_name UNIQUE(user_id, name)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_custom_categories_user_id ON public.custom_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_categories_active ON public.custom_categories(user_id, is_active);

-- Enable RLS
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "users_manage_own_custom_categories" ON public.custom_categories;
CREATE POLICY "users_manage_own_custom_categories"
ON public.custom_categories
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_custom_categories_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_custom_categories_updated_at_trigger ON public.custom_categories;
CREATE TRIGGER update_custom_categories_updated_at_trigger
BEFORE UPDATE ON public.custom_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_custom_categories_updated_at();

-- Mock data: Add sample custom categories for demo
DO $$
DECLARE
    existing_user_id UUID;
BEGIN
    -- Get first user for demo data
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
    ) THEN
        SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
        
        IF existing_user_id IS NOT NULL THEN
            -- Insert sample custom categories
            INSERT INTO public.custom_categories (user_id, name, icon, color, is_active)
            VALUES 
                (existing_user_id, 'Deep Work', 'Focus', '#8b5cf6', true),
                (existing_user_id, 'Meetings', 'Users', '#f59e0b', true),
                (existing_user_id, 'Research', 'Search', '#06b6d4', true)
            ON CONFLICT (user_id, name) DO NOTHING;
        ELSE
            RAISE NOTICE 'No users found in user_profiles';
        END IF;
    ELSE
        RAISE NOTICE 'Table user_profiles does not exist';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;