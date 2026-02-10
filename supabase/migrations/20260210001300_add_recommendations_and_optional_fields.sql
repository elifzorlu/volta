-- Add optional fields and recommendations table for prediction engine
-- Extends existing Volta schema with mood tracking, tags, and AI recommendations

-- 1. Add optional columns to existing tables
ALTER TABLE public.daily_logs
ADD COLUMN IF NOT EXISTS mood_tone TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.work_sessions
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- 2. Create recommendations table
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    date_generated_for DATE NOT NULL,
    context TEXT NOT NULL CHECK (context IN ('overall', 'this_week', 'today')),
    payload JSONB NOT NULL,
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date_generated_for, context)
);

-- 3. Indexes for recommendations
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON public.recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_date_generated_for ON public.recommendations(date_generated_for);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_date_context ON public.recommendations(user_id, date_generated_for, context);

-- 4. Enable RLS
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "users_manage_own_recommendations" ON public.recommendations;
CREATE POLICY "users_manage_own_recommendations"
ON public.recommendations
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. Triggers
DROP TRIGGER IF EXISTS update_recommendations_updated_at ON public.recommendations;
CREATE TRIGGER update_recommendations_updated_at
    BEFORE UPDATE ON public.recommendations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Sample data for existing demo user
DO $$
DECLARE
    existing_user_id UUID;
    today_date DATE := CURRENT_DATE;
BEGIN
    -- Get existing demo user
    SELECT id INTO existing_user_id FROM public.user_profiles WHERE email = 'demo@volta.app' LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Add sample recommendations for demo user
        INSERT INTO public.recommendations (user_id, date_generated_for, context, payload, confidence)
        VALUES 
            (existing_user_id, today_date, 'overall', 
             jsonb_build_object(
                 'creative', jsonb_build_object(
                     'windows', jsonb_build_array(
                         jsonb_build_object('start', '09:00', 'end', '11:30', 'score', 0.85)
                     ),
                     'reason', 'Your creative sessions rate higher mid-morning after 7+ hours sleep.'
                 ),
                 'analytical', jsonb_build_object(
                     'windows', jsonb_build_array(
                         jsonb_build_object('start', '14:00', 'end', '16:30', 'score', 0.82)
                     ),
                     'reason', 'Analytical work shows peak efficiency in early afternoon.'
                 ),
                 'studying', jsonb_build_object(
                     'windows', jsonb_build_array(
                         jsonb_build_object('start', '19:00', 'end', '21:00', 'score', 0.78)
                     ),
                     'reason', 'Evening study sessions have consistent high efficiency ratings.'
                 )
             ), 0.75),
            (existing_user_id, today_date, 'this_week',
             jsonb_build_object(
                 'creative', jsonb_build_object(
                     'windows', jsonb_build_array(
                         jsonb_build_object('start', '10:00', 'end', '12:00', 'score', 0.88)
                     ),
                     'reason', 'This week shows stronger creative performance in late morning.'
                 ),
                 'analytical', jsonb_build_object(
                     'windows', jsonb_build_array(
                         jsonb_build_object('start', '15:00', 'end', '17:00', 'score', 0.84)
                     ),
                     'reason', 'Recent analytical sessions peak in mid-afternoon.'
                 ),
                 'studying', jsonb_build_object(
                     'windows', jsonb_build_array(
                         jsonb_build_object('start', '20:00', 'end', '22:00', 'score', 0.81)
                     ),
                     'reason', 'Late evening study sessions trending higher this week.'
                 )
             ), 0.82)
        ON CONFLICT (user_id, date_generated_for, context) DO NOTHING;
        
        RAISE NOTICE 'Sample recommendations added for demo user';
    ELSE
        RAISE NOTICE 'Demo user not found, skipping sample recommendations';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Sample recommendations insertion failed: %', SQLERRM;
END $$;