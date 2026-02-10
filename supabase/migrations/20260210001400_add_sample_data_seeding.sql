-- Sample data seeding function for new users
-- Creates realistic work sessions and daily context for demo purposes

CREATE OR REPLACE FUNCTION public.seed_sample_data_for_user(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    day_offset INTEGER;
    current_date DATE;
    log_id UUID;
    morning_session_id UUID;
    afternoon_session_id UUID;
    evening_session_id UUID;
BEGIN
    -- Create 14 days of sample data
    FOR day_offset IN 0..13 LOOP
        current_date := CURRENT_DATE - day_offset;
        
        -- Create daily log with varying context
        INSERT INTO public.daily_logs (
            id, user_id, log_date, sleep_hours, sleep_quality, 
            caffeine_total, energy_level, mood_tone, notes
        )
        VALUES (
            gen_random_uuid(),
            target_user_id,
            current_date,
            6.5 + (random() * 2.5), -- 6.5-9 hours
            CASE 
                WHEN random() < 0.3 THEN 'excellent'::public.sleep_quality
                WHEN random() < 0.6 THEN 'good'::public.sleep_quality
                WHEN random() < 0.9 THEN 'fair'::public.sleep_quality
                ELSE 'poor'::public.sleep_quality
            END,
            (100 + (random() * 200))::INTEGER, -- 100-300mg caffeine
            CASE 
                WHEN random() < 0.4 THEN 'high'::public.energy_level
                WHEN random() < 0.8 THEN 'medium'::public.energy_level
                ELSE 'low'::public.energy_level
            END,
            CASE 
                WHEN random() < 0.3 THEN 'focused'
                WHEN random() < 0.6 THEN 'motivated'
                WHEN random() < 0.8 THEN 'neutral'
                ELSE 'tired'
            END,
            'Sample data for demonstration'
        )
        RETURNING id INTO log_id;
        
        -- Create 2-4 work sessions per day
        -- Morning creative session (9-11 AM)
        IF random() < 0.8 THEN
            INSERT INTO public.work_sessions (
                id, user_id, daily_log_id, category, start_time, end_time,
                efficiency, felt, tags, session_date
            )
            VALUES (
                gen_random_uuid(),
                target_user_id,
                log_id,
                'creative'::public.work_category,
                '09:00:00'::TIME,
                '11:00:00'::TIME,
                (3 + (random() * 2))::INTEGER, -- 3-5 efficiency
                CASE 
                    WHEN random() < 0.5 THEN 'locked-in'::public.felt_state
                    WHEN random() < 0.8 THEN 'scattered'::public.felt_state
                    ELSE 'forced'::public.felt_state
                END,
                ARRAY['deep-work', 'design']::TEXT[],
                current_date
            );
        END IF;
        
        -- Afternoon analytical session (2-4 PM)
        IF random() < 0.9 THEN
            INSERT INTO public.work_sessions (
                id, user_id, daily_log_id, category, start_time, end_time,
                efficiency, felt, tags, session_date
            )
            VALUES (
                gen_random_uuid(),
                target_user_id,
                log_id,
                'analytical'::public.work_category,
                '14:00:00'::TIME,
                '16:30:00'::TIME,
                (3 + (random() * 2))::INTEGER,
                CASE 
                    WHEN random() < 0.6 THEN 'locked-in'::public.felt_state
                    WHEN random() < 0.9 THEN 'scattered'::public.felt_state
                    ELSE 'forced'::public.felt_state
                END,
                ARRAY['coding', 'research']::TEXT[],
                current_date
            );
        END IF;
        
        -- Evening studying session (7-9 PM)
        IF random() < 0.7 THEN
            INSERT INTO public.work_sessions (
                id, user_id, daily_log_id, category, start_time, end_time,
                efficiency, felt, tags, session_date
            )
            VALUES (
                gen_random_uuid(),
                target_user_id,
                log_id,
                'studying'::public.work_category,
                '19:00:00'::TIME,
                '21:00:00'::TIME,
                (2 + (random() * 3))::INTEGER,
                CASE 
                    WHEN random() < 0.4 THEN 'locked-in'::public.felt_state
                    WHEN random() < 0.7 THEN 'scattered'::public.felt_state
                    ELSE 'forced'::public.felt_state
                END,
                ARRAY['learning', 'review']::TEXT[],
                current_date
            );
        END IF;
        
        -- Occasional administrative session
        IF random() < 0.4 THEN
            INSERT INTO public.work_sessions (
                id, user_id, daily_log_id, category, start_time, end_time,
                efficiency, felt, tags, session_date
            )
            VALUES (
                gen_random_uuid(),
                target_user_id,
                log_id,
                'administrative'::public.work_category,
                '11:30:00'::TIME,
                '12:30:00'::TIME,
                (2 + (random() * 2))::INTEGER,
                'scattered'::public.felt_state,
                ARRAY['meetings', 'planning']::TEXT[],
                current_date
            );
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Sample data seeded successfully for user %', target_user_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Sample data seeding failed: %', SQLERRM;
END;
$$;

-- Automatically seed sample data for new users
CREATE OR REPLACE FUNCTION public.seed_data_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Seed sample data after a short delay to ensure user_profiles is created
    PERFORM public.seed_sample_data_for_user(NEW.id);
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Auto-seeding failed for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Create trigger to auto-seed data for new users
DROP TRIGGER IF EXISTS auto_seed_new_user_data ON public.user_profiles;
CREATE TRIGGER auto_seed_new_user_data
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.seed_data_for_new_user();