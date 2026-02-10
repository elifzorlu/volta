-- Migration: Add habit tracking system
-- Purpose: Enable custom habit tracking with completion status and weekly statistics

-- Create habit_logs table for tracking custom habits
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    habit_title TEXT NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON public.habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_log_date ON public.habit_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON public.habit_logs(user_id, log_date);

-- Enable RLS
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only manage their own habit logs
DROP POLICY IF EXISTS "users_manage_own_habit_logs" ON public.habit_logs;
CREATE POLICY "users_manage_own_habit_logs"
ON public.habit_logs
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_habit_logs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_habit_logs_updated_at ON public.habit_logs;
CREATE TRIGGER trigger_update_habit_logs_updated_at
    BEFORE UPDATE ON public.habit_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_habit_logs_updated_at();

-- Mock data for demonstration
DO $$
DECLARE
    existing_user_id UUID;
    habit_date DATE;
BEGIN
    -- Get existing user
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
    ) THEN
        SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
        
        IF existing_user_id IS NOT NULL THEN
            -- Create sample habit logs for the past 2 weeks
            FOR i IN 0..13 LOOP
                habit_date := CURRENT_DATE - i;
                
                -- Morning Meditation habit (high completion rate)
                INSERT INTO public.habit_logs (user_id, habit_title, log_date, completed)
                VALUES (
                    existing_user_id,
                    'Morning Meditation',
                    habit_date,
                    (i % 7 != 0)  -- Completed 6 out of 7 days
                )
                ON CONFLICT DO NOTHING;
                
                -- Exercise habit (moderate completion rate)
                INSERT INTO public.habit_logs (user_id, habit_title, log_date, completed)
                VALUES (
                    existing_user_id,
                    'Exercise',
                    habit_date,
                    (i % 3 = 0)  -- Completed every 3rd day
                )
                ON CONFLICT DO NOTHING;
                
                -- Reading habit (improving trend)
                IF i < 7 THEN
                    -- Last week: better completion
                    INSERT INTO public.habit_logs (user_id, habit_title, log_date, completed)
                    VALUES (
                        existing_user_id,
                        'Read 30 Minutes',
                        habit_date,
                        (i % 2 = 0)  -- Completed every other day
                    )
                    ON CONFLICT DO NOTHING;
                ELSE
                    -- Previous week: lower completion
                    INSERT INTO public.habit_logs (user_id, habit_title, log_date, completed)
                    VALUES (
                        existing_user_id,
                        'Read 30 Minutes',
                        habit_date,
                        (i % 4 = 0)  -- Completed every 4th day
                    )
                    ON CONFLICT DO NOTHING;
                END IF;
            END LOOP;
            
            RAISE NOTICE 'Sample habit logs created successfully';
        ELSE
            RAISE NOTICE 'No users found. Run auth migration first.';
        END IF;
    ELSE
        RAISE NOTICE 'Table user_profiles does not exist. Run auth migration first.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;