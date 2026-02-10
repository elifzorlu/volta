# Volta - Supabase Integration Setup

## Database Configuration

Volta now uses Supabase to persist your productivity data across devices. Follow these steps to complete the setup:

### 1. Supabase Project Setup

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select an existing one
3. Navigate to **Settings** → **API**
4. Copy your **Project URL** and **anon/public key**

### 2. Environment Variables

Update your `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Database Migration

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase/migrations/20260210000600_volta_productivity_schema.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute the migration

### 4. Demo User Credentials

The migration creates a demo user for testing:

- **Email**: demo@volta.app
- **Password**: demo123

You can use these credentials to test the application immediately.

### 5. Verify Setup

1. Restart your development server
2. Navigate to the Log page
3. Fill out a daily log with work sessions
4. Click "Save Log"
5. Navigate to Today page to see your data
6. Check History page for trends

## Database Schema

The migration creates the following tables:

- **user_profiles**: User account information
- **daily_logs**: Daily context (sleep, caffeine, energy)
- **work_sessions**: Individual work sessions with efficiency ratings
- **commitments**: Weekly schedule commitments
- **productivity_scores**: Daily productivity scores and insights

## Features Enabled

✅ **Cross-Device Sync**: Your data is stored in the cloud and accessible from any device
✅ **Historical Analysis**: Track productivity trends over time (week, month, quarter)
✅ **Schedule Management**: Persist your weekly commitments
✅ **Work Session Tracking**: Log and analyze your work sessions by category
✅ **Productivity Insights**: Calculate and display productivity scores with explanations

## Troubleshooting

### "Missing Supabase environment variables" Error
- Ensure `.env` file exists in project root
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart development server after updating `.env`

### "relation does not exist" Error
- Run the database migration in Supabase SQL Editor
- Verify migration completed without errors

### "permission denied for table" Error
- Check that Row Level Security (RLS) policies are enabled
- Verify you're logged in with a valid user account

## Next Steps

1. Create your own user account (or use demo credentials)
2. Start logging your daily productivity data
3. Build up historical data for meaningful insights
4. Explore trends in the History page
5. Optimize your schedule based on productivity patterns