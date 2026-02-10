-- Volta Productivity Tracking Schema
-- Tables: daily_logs, work_sessions, commitments, productivity_scores

-- 1. Types (ENUMs)
DROP TYPE IF EXISTS public.sleep_quality CASCADE;
CREATE TYPE public.sleep_quality AS ENUM ('excellent', 'good', 'fair', 'poor');

DROP TYPE IF EXISTS public.energy_level CASCADE;
CREATE TYPE public.energy_level AS ENUM ('high', 'medium', 'low');

DROP TYPE IF EXISTS public.work_category CASCADE;
CREATE TYPE public.work_category AS ENUM ('creative', 'analytical', 'studying', 'administrative', 'mixed');

DROP TYPE IF EXISTS public.felt_state CASCADE;
CREATE TYPE public.felt_state AS ENUM ('locked-in', 'scattered', 'forced');

DROP TYPE IF EXISTS public.commitment_type CASCADE;
CREATE TYPE public.commitment_type AS ENUM ('meeting', 'appointment', 'personal', 'class', 'workout', 'other');

DROP TYPE IF EXISTS public.day_of_week CASCADE;
CREATE TYPE public.day_of_week AS ENUM ('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun');

DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

-- 2. Core Tables
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role public.user_role DEFAULT 'user'::public.user_role,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    sleep_hours DECIMAL(3,1) NOT NULL CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
    sleep_quality public.sleep_quality NOT NULL,
    caffeine_total INTEGER NOT NULL CHECK (caffeine_total >= 0),
    energy_level public.energy_level NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, log_date)
);

CREATE TABLE IF NOT EXISTS public.work_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    daily_log_id UUID REFERENCES public.daily_logs(id) ON DELETE CASCADE,
    category public.work_category NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    efficiency INTEGER NOT NULL CHECK (efficiency >= 1 AND efficiency <= 5),
    felt public.felt_state,
    session_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS public.commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    day public.day_of_week NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    type public.commitment_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS public.productivity_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    daily_log_id UUID REFERENCES public.daily_logs(id) ON DELETE CASCADE,
    score_date DATE NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    caption TEXT,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, score_date)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

CREATE INDEX IF NOT EXISTS idx_daily_logs_user_id ON public.daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_log_date ON public.daily_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs(user_id, log_date);

CREATE INDEX IF NOT EXISTS idx_work_sessions_user_id ON public.work_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_daily_log_id ON public.work_sessions(daily_log_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_session_date ON public.work_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_work_sessions_user_date ON public.work_sessions(user_id, session_date);

CREATE INDEX IF NOT EXISTS idx_commitments_user_id ON public.commitments(user_id);
CREATE INDEX IF NOT EXISTS idx_commitments_day ON public.commitments(day);

CREATE INDEX IF NOT EXISTS idx_productivity_scores_user_id ON public.productivity_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_productivity_scores_score_date ON public.productivity_scores(score_date);
CREATE INDEX IF NOT EXISTS idx_productivity_scores_user_date ON public.productivity_scores(user_id, score_date);

-- 4. Functions (BEFORE RLS policies)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role)
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 5. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_scores ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (AFTER functions)
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_daily_logs" ON public.daily_logs;
CREATE POLICY "users_manage_own_daily_logs"
ON public.daily_logs
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_work_sessions" ON public.work_sessions;
CREATE POLICY "users_manage_own_work_sessions"
ON public.work_sessions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_commitments" ON public.commitments;
CREATE POLICY "users_manage_own_commitments"
ON public.commitments
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_productivity_scores" ON public.productivity_scores;
CREATE POLICY "users_manage_own_productivity_scores"
ON public.productivity_scores
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 7. Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_logs_updated_at ON public.daily_logs;
CREATE TRIGGER update_daily_logs_updated_at
    BEFORE UPDATE ON public.daily_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_work_sessions_updated_at ON public.work_sessions;
CREATE TRIGGER update_work_sessions_updated_at
    BEFORE UPDATE ON public.work_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_commitments_updated_at ON public.commitments;
CREATE TRIGGER update_commitments_updated_at
    BEFORE UPDATE ON public.commitments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_productivity_scores_updated_at ON public.productivity_scores;
CREATE TRIGGER update_productivity_scores_updated_at
    BEFORE UPDATE ON public.productivity_scores
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Mock Data
DO $$
DECLARE
    demo_user_uuid UUID := gen_random_uuid();
    demo_log_uuid UUID := gen_random_uuid();
    demo_log_uuid_2 UUID := gen_random_uuid();
BEGIN
    -- Create demo auth user (trigger creates user_profiles automatically)
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (demo_user_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'demo@volta.app', crypt('demo123', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Demo User'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
    ON CONFLICT (id) DO NOTHING;

    -- Create demo daily logs
    INSERT INTO public.daily_logs (id, user_id, log_date, sleep_hours, sleep_quality, caffeine_total, energy_level)
    VALUES 
        (demo_log_uuid, demo_user_uuid, CURRENT_DATE, 7.5, 'good'::public.sleep_quality, 200, 'medium'::public.energy_level),
        (demo_log_uuid_2, demo_user_uuid, CURRENT_DATE - INTERVAL '1 day', 8.0, 'excellent'::public.sleep_quality, 150, 'high'::public.energy_level)
    ON CONFLICT (user_id, log_date) DO NOTHING;

    -- Create demo work sessions
    INSERT INTO public.work_sessions (user_id, daily_log_id, category, start_time, end_time, efficiency, felt, session_date)
    VALUES 
        (demo_user_uuid, demo_log_uuid, 'creative'::public.work_category, '09:00', '11:30', 4, 'locked-in'::public.felt_state, CURRENT_DATE),
        (demo_user_uuid, demo_log_uuid, 'analytical'::public.work_category, '14:00', '16:30', 5, 'locked-in'::public.felt_state, CURRENT_DATE),
        (demo_user_uuid, demo_log_uuid, 'studying'::public.work_category, '19:00', '20:30', 3, 'scattered'::public.felt_state, CURRENT_DATE),
        (demo_user_uuid, demo_log_uuid_2, 'creative'::public.work_category, '08:30', '10:30', 5, 'locked-in'::public.felt_state, CURRENT_DATE - INTERVAL '1 day'),
        (demo_user_uuid, demo_log_uuid_2, 'analytical'::public.work_category, '13:00', '15:00', 4, 'locked-in'::public.felt_state, CURRENT_DATE - INTERVAL '1 day')
    ON CONFLICT (id) DO NOTHING;

    -- Create demo commitments
    INSERT INTO public.commitments (user_id, title, day, start_time, end_time, type)
    VALUES 
        (demo_user_uuid, 'Team Standup', 'Mon'::public.day_of_week, '09:00', '09:30', 'meeting'::public.commitment_type),
        (demo_user_uuid, 'Gym Session', 'Mon'::public.day_of_week, '18:00', '19:00', 'workout'::public.commitment_type),
        (demo_user_uuid, 'Doctor Appointment', 'Wed'::public.day_of_week, '14:00', '15:00', 'appointment'::public.commitment_type),
        (demo_user_uuid, 'Project Review', 'Fri'::public.day_of_week, '15:00', '16:00', 'meeting'::public.commitment_type)
    ON CONFLICT (id) DO NOTHING;

    -- Create demo productivity scores
    INSERT INTO public.productivity_scores (user_id, daily_log_id, score_date, score, caption, explanation)
    VALUES 
        (demo_user_uuid, demo_log_uuid, CURRENT_DATE, 78, 'Today felt like this.', 'You maintained strong focus with balanced rest. Your consistent sleep pattern and moderate caffeine intake supported sustained productivity throughout the day.'),
        (demo_user_uuid, demo_log_uuid_2, CURRENT_DATE - INTERVAL '1 day', 82, 'Exceptional day!', 'Exceptional day with high energy levels and deep work sessions. Your early morning routine and limited screen time before bed contributed to peak performance.')
    ON CONFLICT (user_id, score_date) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;