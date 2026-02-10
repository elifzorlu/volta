-- Migration: Update profiles table to store onboarding data in settings JSONB field
-- This migration adds settings JSONB column to store sleep schedule and focus preferences

-- Add settings JSONB column to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::JSONB;

-- Add comment to document settings structure
COMMENT ON COLUMN public.user_profiles.settings IS 'JSONB field storing user preferences including sleepSchedule {bedtime, wakeTime} and focusPreferences {sessionLength, breakDuration, dailyGoal}';