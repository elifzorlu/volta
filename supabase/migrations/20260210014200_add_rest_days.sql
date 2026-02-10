-- Create rest_days table to track user rest periods
CREATE TABLE IF NOT EXISTS public.rest_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rest_days_user_id ON public.rest_days(user_id);
CREATE INDEX IF NOT EXISTS idx_rest_days_date_range ON public.rest_days(start_date, end_date);

-- Enable RLS
ALTER TABLE public.rest_days ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  -- Drop policies if they exist
  DROP POLICY IF EXISTS "Users can view their own rest days" ON public.rest_days;
  DROP POLICY IF EXISTS "Users can insert their own rest days" ON public.rest_days;
  DROP POLICY IF EXISTS "Users can update their own rest days" ON public.rest_days;
  DROP POLICY IF EXISTS "Users can delete their own rest days" ON public.rest_days;

  -- Create policies
  CREATE POLICY "Users can view their own rest days"
    ON public.rest_days FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own rest days"
    ON public.rest_days FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own rest days"
    ON public.rest_days FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete their own rest days"
    ON public.rest_days FOR DELETE
    USING (auth.uid() = user_id);
END $$;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_rest_days_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  DROP TRIGGER IF EXISTS set_rest_days_updated_at ON public.rest_days;
  CREATE TRIGGER set_rest_days_updated_at
    BEFORE UPDATE ON public.rest_days
    FOR EACH ROW
    EXECUTE FUNCTION public.update_rest_days_updated_at();
END $$;