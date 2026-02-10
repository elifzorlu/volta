-- Add notification preferences to user_profiles
-- Supports time-based daily log reminders

-- 1. Add notification_times column (array of time strings)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS notification_times TEXT[] DEFAULT ARRAY['09:00', '21:00'];

-- 2. Add notification_enabled column
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT true;

-- 3. Backfill existing users with default notification times
DO $$
BEGIN
    UPDATE public.user_profiles
    SET 
        notification_times = ARRAY['09:00', '21:00'],
        notification_enabled = true
    WHERE notification_times IS NULL;
END $$;