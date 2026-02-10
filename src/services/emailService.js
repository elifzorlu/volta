// Email Service for weekly digest and notifications
import { supabase } from '../lib/supabase';

// Send weekly digest email
export const sendWeeklyDigest = async (userId, email, userName) => {
  try {
    // Calculate date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate?.setDate(startDate?.getDate() - 7);

    const formatDate = (date) => {
      return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Fetch weekly stats from database
    const { data: logs, error: logsError } = await supabase?.from('daily_logs')?.select('*')?.eq('user_id', userId)?.gte('log_date', startDate?.toISOString()?.split('T')?.[0])?.lte('log_date', endDate?.toISOString()?.split('T')?.[0]);

    if (logsError) {
      console.error('Error fetching logs:', logsError);
      throw logsError;
    }

    // Calculate weekly statistics
    const totalHours = logs?.reduce((sum, log) => {
      const sessions = log?.work_sessions || [];
      const dayHours = sessions?.reduce((daySum, session) => {
        if (session?.start_time && session?.end_time) {
          const start = new Date(`2000-01-01T${session.start_time}`);
          const end = new Date(`2000-01-01T${session.end_time}`);
          return daySum + (end - start) / (1000 * 60 * 60);
        }
        return daySum;
      }, 0);
      return sum + dayHours;
    }, 0);

    const completedSessions = logs?.reduce((sum, log) => {
      return sum + (log?.work_sessions?.length || 0);
    }, 0);

    const avgScore = logs?.length > 0
      ? Math.round(logs?.reduce((sum, log) => sum + (log?.productivity_score || 0), 0) / logs?.length)
      : 0;

    const activeDays = logs?.length || 0;

    // Find top category
    const categoryCount = {};
    logs?.forEach(log => {
      log?.work_sessions?.forEach(session => {
        const cat = session?.category || 'Other';
        categoryCount[cat] = (categoryCount?.[cat] || 0) + 1;
      });
    });
    const topCategory = Object.keys(categoryCount)?.reduce((a, b) => 
      categoryCount?.[a] > categoryCount?.[b] ? a : b, 'N/A'
    );

    // Find best day
    const bestDayLog = logs?.reduce((best, log) => 
      (log?.productivity_score || 0) > (best?.productivity_score || 0) ? log : best
    , logs?.[0]);
    const bestDay = bestDayLog 
      ? new Date(bestDayLog.log_date)?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
      : 'N/A';

    const weeklyStats = {
      totalHours: Math.round(totalHours * 10) / 10,
      completedSessions,
      avgScore,
      activeDays,
      topCategory,
      bestDay,
      insight: activeDays >= 5 
        ? 'Incredible consistency this week! You\'re building powerful habits.' 
        : activeDays >= 3
        ? 'Solid progress! Keep showing up for yourself.'
        : 'Every session counts. Let\'s build momentum together.'
    };

    // Call Supabase Edge Function to send email
    const { data, error } = await supabase?.functions?.invoke('send-weekly-digest', {
      body: {
        email,
        userName,
        weeklyStats,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      }
    });

    if (error) {
      console.error('Error sending weekly digest:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send weekly digest:', error);
    return { success: false, error: error?.message };
  }
};

export default {
  sendWeeklyDigest
};