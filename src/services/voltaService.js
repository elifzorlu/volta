import { supabase } from '../lib/supabase';
import { toCamelCase, toSnakeCase } from '../utils/cn';
import { isDemoMode, demoDailyLogs, demoWorkSessions, demoCommitments, demoRecommendations, demoMLPredictions } from '../utils/demoData';

// Add missing demo data variables
const demoUserProfile = {
  id: 'demo-user',
  name: 'Demo User',
  email: 'demo@example.com',
  createdAt: new Date()?.toISOString()
};

const getTodayDemoData = () => {
  const today = new Date()?.toISOString()?.split('T')?.[0];
  return {
    dailyLog: demoDailyLogs?.find(log => log?.logDate === today) || demoDailyLogs?.[0],
    workSessions: demoWorkSessions?.filter(s => s?.sessionDate === today)
  };
};

const demoProductivityScores = [
  { id: 'demo-score-1', dailyLogId: 'demo-log-1', scoreDate: new Date()?.toISOString()?.split('T')?.[0], score: 85, caption: 'Strong performance', explanation: 'You maintained good focus today.' },
  { id: 'demo-score-2', dailyLogId: 'demo-log-2', scoreDate: new Date(Date.now() - 86400000)?.toISOString()?.split('T')?.[0], score: 75, caption: 'Solid effort', explanation: 'Good work overall.' }
];

// Helper function to check schema errors
function isSchemaError(error) {
  if (!error) return false;
  
  if (error?.code && typeof error?.code === 'string') {
    const errorClass = error?.code?.substring(0, 2);
    if (errorClass === '42' || errorClass === '08') {
      return true;
    }
    if (errorClass === '23') {
      return false;
    }
  }
  
  if (error?.message) {
    const schemaErrorPatterns = [
      /relation.*does not exist/i,
      /column.*does not exist/i,
      /function.*does not exist/i,
      /syntax error/i,
      /invalid.*syntax/i,
      /type.*does not exist/i,
      /undefined.*column/i,
      /undefined.*table/i,
      /undefined.*function/i,
    ];
    
    return schemaErrorPatterns?.some(pattern => pattern?.test(error?.message));
  }
  
  return false;
}

// Profile Service
export const profileService = {
  async getProfile(userId) {
    // Demo mode: return demo profile
    if (isDemoMode(userId)) {
      return { data: demoUserProfile, error: null };
    }

    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('*')
        ?.eq('id', userId)
        ?.single();

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        return { data: null, error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateProfile(userId, updates) {
    // Demo mode: save to localStorage
    if (isDemoMode(userId)) {
      const stored = localStorage.getItem('volta_demo_profile');
      const current = stored ? JSON.parse(stored) : demoUserProfile;
      const updated = { ...current, ...updates };
      localStorage.setItem('volta_demo_profile', JSON.stringify(updated));
      return { data: updated, error: null };
    }

    try {
      const snakeCaseUpdates = toSnakeCase(updates);
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.update(snakeCaseUpdates)
        ?.eq('id', userId)
        ?.select()
        ?.single();

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        return { data: null, error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Custom Categories Service
export const customCategoriesService = {
  async getAll(userId) {
    // Demo mode: return demo custom categories
    if (isDemoMode(userId)) {
      return {
        data: [
          { id: 'demo-1', userId, name: 'Deep Work', icon: 'Focus', color: '#8b5cf6', isActive: true },
          { id: 'demo-2', userId, name: 'Meetings', icon: 'Users', color: '#f59e0b', isActive: true },
          { id: 'demo-3', userId, name: 'Research', icon: 'Search', color: '#06b6d4', isActive: true }
        ],
        error: null
      };
    }

    try {
      const { data, error } = await supabase
        ?.from('custom_categories')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.eq('is_active', true)
        ?.order('created_at', { ascending: true });

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        return { data: null, error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Get custom categories error:', error);
      throw error;
    }
  },

  async create(userId, categoryData) {
    // Demo mode: return mock success
    if (isDemoMode(userId)) {
      return {
        data: {
          id: `demo-${Date.now()}`,
          userId,
          ...categoryData,
          isActive: true,
          createdAt: new Date()?.toISOString()
        },
        error: null
      };
    }

    try {
      const { data, error } = await supabase
        ?.from('custom_categories')
        ?.insert({
          user_id: userId,
          name: categoryData?.name,
          icon: categoryData?.icon || 'Briefcase',
          color: categoryData?.color || '#10b981',
          is_active: true
        })
        ?.select()
        ?.single();

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        return { data: null, error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Create custom category error:', error);
      throw error;
    }
  },

  async update(userId, categoryId, updates) {
    // Demo mode: return mock success
    if (isDemoMode(userId)) {
      return {
        data: { id: categoryId, userId, ...updates },
        error: null
      };
    }

    try {
      const { data, error } = await supabase
        ?.from('custom_categories')
        ?.update(toSnakeCase(updates))
        ?.eq('id', categoryId)
        ?.eq('user_id', userId)
        ?.select()
        ?.single();

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        return { data: null, error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Update custom category error:', error);
      throw error;
    }
  },

  async delete(userId, categoryId) {
    // Demo mode: return mock success
    if (isDemoMode(userId)) {
      return { data: { success: true }, error: null };
    }

    try {
      // Soft delete by setting is_active to false
      const { data, error } = await supabase
        ?.from('custom_categories')
        ?.update({ is_active: false })
        ?.eq('id', categoryId)
        ?.eq('user_id', userId)
        ?.select()
        ?.single();

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        return { data: null, error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Delete custom category error:', error);
      throw error;
    }
  }
};

// Daily Logs Service
export const dailyLogsService = {
  async create(userId, dailyContext, sessions, logDate = new Date()?.toISOString()?.split('T')?.[0]) {
    console.log('[dailyLogsService.create] Called with:', {
      userId,
      dailyContext,
      sessions,
      logDate
    });

    // Demo mode: return mock success
    if (isDemoMode(userId)) {
      console.log('[dailyLogsService.create] Demo mode - returning mock data');
      return {
        data: {
          dailyLog: getTodayDemoData()?.dailyLog,
          workSessions: getTodayDemoData()?.workSessions
        },
        error: null
      };
    }

    try {
      // Check if a log already exists for this date
      console.log('[dailyLogsService.create] Checking for existing log...');
      const { data: existingLog, error: checkError } = await supabase
        ?.from('daily_logs')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.eq('log_date', logDate)
        ?.single();

      console.log('[dailyLogsService.create] Existing log check:', { existingLog, checkError });

      let dailyLog;

      if (existingLog) {
        console.log('[dailyLogsService.create] Log exists - updating...');
        // Log exists - only update if new context values are provided
        const updateData = {
          user_id: userId,
          log_date: logDate
        };

        // Only update fields that have values
        if (dailyContext?.sleepHours) {
          updateData.sleep_hours = parseFloat(dailyContext?.sleepHours);
        }
        if (dailyContext?.sleepQuality) {
          updateData.sleep_quality = dailyContext?.sleepQuality;
        }
        if (dailyContext?.caffeineTotal) {
          // ADD to existing caffeine total instead of replacing
          const newCaffeineAmount = parseInt(dailyContext?.caffeineTotal);
          const existingCaffeineTotal = existingLog?.caffeine_total || 0;
          updateData.caffeine_total = existingCaffeineTotal + newCaffeineAmount;
          console.log('[dailyLogsService.create] Cumulative caffeine:', {
            existing: existingCaffeineTotal,
            adding: newCaffeineAmount,
            newTotal: updateData?.caffeine_total
          });
        }
        if (dailyContext?.energyLevel) {
          updateData.energy_level = dailyContext?.energyLevel;
        }
        if (dailyContext?.moodTone) {
          updateData.mood_tone = dailyContext?.moodTone;
        }
        if (dailyContext?.notes) {
          updateData.notes = dailyContext?.notes;
        }

        console.log('[dailyLogsService.create] Update data:', updateData);

        const { data: updatedLog, error: updateError } = await supabase
          ?.from('daily_logs')
          ?.update(updateData)
          ?.eq('user_id', userId)
          ?.eq('log_date', logDate)
          ?.select()
          ?.single();

        console.log('[dailyLogsService.create] Update result:', { updatedLog, updateError });

        if (updateError) {
          if (isSchemaError(updateError)) {
            console.error('Schema error:', updateError?.message);
            throw updateError;
          }
          return { data: null, error: updateError };
        }

        dailyLog = updatedLog;
      } else {
        console.log('[dailyLogsService.create] No existing log - creating new...');
        // No existing log - create new one with all required fields
        const insertData = {
          user_id: userId,
          log_date: logDate,
          sleep_hours: parseFloat(dailyContext?.sleepHours),
          sleep_quality: dailyContext?.sleepQuality,
          caffeine_total: parseInt(dailyContext?.caffeineTotal),
          energy_level: dailyContext?.energyLevel,
          mood_tone: dailyContext?.moodTone || null,
          notes: dailyContext?.notes || null
        };

        console.log('[dailyLogsService.create] Insert data:', insertData);

        const { data: newLog, error: logError } = await supabase
          ?.from('daily_logs')
          ?.insert(insertData)
          ?.select()
          ?.single();

        console.log('[dailyLogsService.create] Insert result:', { newLog, logError });

        if (logError) {
          if (isSchemaError(logError)) {
            console.error('Schema error:', logError?.message);
            throw logError;
          }
          return { data: null, error: logError };
        }

        dailyLog = newLog;
      }

      // Insert new work sessions (append to existing ones, don't delete)
      console.log('[dailyLogsService.create] Inserting work sessions...');
      const sessionsData = sessions?.map(session => ({
        user_id: userId,
        daily_log_id: dailyLog?.id,
        category: session?.category,
        start_time: session?.startTime,
        end_time: session?.endTime,
        efficiency: parseInt(session?.efficiency),
        felt: session?.felt || null,
        tags: session?.tags || null,
        session_date: logDate
      }));

      console.log('[dailyLogsService.create] Sessions data to insert:', sessionsData);

      const { data: workSessions, error: sessionsError } = await supabase
        ?.from('work_sessions')
        ?.insert(sessionsData)
        ?.select();

      console.log('[dailyLogsService.create] Sessions insert result:', { workSessions, sessionsError });

      if (sessionsError) {
        if (isSchemaError(sessionsError)) {
          console.error('Schema error:', sessionsError?.message);
          throw sessionsError;
        }
        return { data: null, error: sessionsError };
      }

      const result = { 
        data: { 
          dailyLog: toCamelCase(dailyLog), 
          workSessions: toCamelCase(workSessions) 
        }, 
        error: null 
      };

      console.log('[dailyLogsService.create] Success! Returning:', result);
      return result;
    } catch (error) {
      console.error('[dailyLogsService.create] Caught error:', error);
      throw error;
    }
  },

  async getByDate(userId, date) {
    // Demo mode: return demo data for the date
    if (isDemoMode(userId)) {
      const demoLog = demoDailyLogs?.find(log => log?.logDate === date);
      if (!demoLog) return { data: null, error: null };
      
      const demoSessions = demoWorkSessions?.filter(s => s?.sessionDate === date);
      return {
        data: {
          ...demoLog,
          workSessions: demoSessions
        },
        error: null
      };
    }

    try {
      const { data, error } = await supabase?.from('daily_logs')?.select(`
          *,
          work_sessions(*)
        `)?.eq('user_id', userId)?.eq('log_date', date)?.single();

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        if (error?.code === 'PGRST116') {
          return { data: null, error: null };
        }
        return { data: null, error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Get daily log error:', error);
      throw error;
    }
  },

  async getRecent(userId, limit = 7) {
    // Demo mode: return recent demo logs
    if (isDemoMode(userId)) {
      const recentLogs = demoDailyLogs?.slice(0, limit)?.map(log => {
        const sessions = demoWorkSessions?.filter(s => s?.sessionDate === log?.logDate);
        let score = demoProductivityScores?.find(s => s?.dailyLogId === log?.id);
        return {
          ...log,
          workSessions: sessions,
          productivityScores: score ? [score] : []
        };
      });
      return { data: recentLogs, error: null };
    }

    try {
      const { data, error } = await supabase?.from('daily_logs')?.select(`
          *,
          work_sessions(*),
          productivity_scores(*)
        `)?.eq('user_id', userId)?.order('log_date', { ascending: false })?.limit(limit);

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        if (error?.code === 'PGRST116') {
          return { data: [], error: null };
        }
        return { data: [], error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Get recent logs error:', error);
      throw error;
    }
  },

  async getByDateRange(userId, startDate, endDate) {
    // Demo mode: filter demo logs by date range
    if (isDemoMode(userId)) {
      const filteredLogs = demoDailyLogs?.filter(log => log?.logDate >= startDate && log?.logDate <= endDate)?.map(log => {
          const sessions = demoWorkSessions?.filter(s => s?.sessionDate === log?.logDate);
          let score = demoProductivityScores?.find(s => s?.dailyLogId === log?.id);
          return {
            ...log,
            workSessions: sessions,
            productivityScores: score ? [score] : []
          };
        });
      return { data: filteredLogs, error: null };
    }

    try {
      const { data, error } = await supabase?.from('daily_logs')?.select(`
          *,
          work_sessions(*),
          productivity_scores(*)
        `)?.eq('user_id', userId)?.gte('log_date', startDate)?.lte('log_date', endDate)?.order('log_date', { ascending: false });

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        if (error?.code === 'PGRST116') {
          return { data: [], error: null };
        }
        return { data: [], error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Get logs by date range error:', error);
      throw error;
    }
  }
};

// Work Sessions Service
export const workSessionsService = {
  async getByUserId(userId, limit = 50) {
    // Demo mode: return demo sessions
    if (isDemoMode(userId)) {
      return { data: demoWorkSessions?.slice(0, limit), error: null };
    }

    try {
      const { data, error } = await supabase?.from('work_sessions')?.select('*')?.eq('user_id', userId)?.order('session_date', { ascending: false })?.order('start_time', { ascending: false })?.limit(limit);

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        if (error?.code === 'PGRST116') {
          return { data: [], error: null };
        }
        return { data: [], error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Get work sessions error:', error);
      throw error;
    }
  },

  async getByCategory(userId, category) {
    // Demo mode: filter demo sessions by category
    if (isDemoMode(userId)) {
      const filtered = demoWorkSessions?.filter(s => s?.category === category);
      return { data: filtered, error: null };
    }

    try {
      const { data, error } = await supabase?.from('work_sessions')?.select('*')?.eq('user_id', userId)?.eq('category', category)?.order('session_date', { ascending: false });

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        if (error?.code === 'PGRST116') {
          return { data: [], error: null };
        }
        return { data: [], error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Get sessions by category error:', error);
      throw error;
    }
  }
};

// Commitments Service
export const commitmentsService = {
  async getAll(userId) {
    // Demo mode: return demo commitments
    if (isDemoMode(userId)) {
      return { data: demoCommitments, error: null };
    }

    try {
      const { data, error } = await supabase?.from('commitments')?.select('*')?.eq('user_id', userId)?.order('day', { ascending: true })?.order('start_time', { ascending: true });

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        if (error?.code === 'PGRST116') {
          return { data: [], error: null };
        }
        return { data: [], error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Get commitments error:', error);
      throw error;
    }
  },

  async create(userId, commitment) {
    // Demo mode: return mock success
    if (isDemoMode(userId)) {
      return {
        data: {
          id: `demo-commit-${Date.now()}`,
          userId: 'demo-user',
          ...commitment
        },
        error: null
      };
    }

    try {
      const { data, error } = await supabase?.from('commitments')?.insert({
          user_id: userId,
          title: commitment?.title,
          day: commitment?.day,
          start_time: commitment?.startTime,
          end_time: commitment?.endTime,
          type: commitment?.type
        })?.select()?.single();

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        return { data: null, error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Create commitment error:', error);
      throw error;
    }
  },

  async update(id, commitment) {
    // Demo mode: return mock success
    if (isDemoMode(id)) {
      return { data: { id, ...commitment }, error: null };
    }

    try {
      const updateData = toSnakeCase(commitment);
      const { data, error } = await supabase?.from('commitments')?.update(updateData)?.eq('id', id)?.select()?.single();

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        return { data: null, error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Update commitment error:', error);
      throw error;
    }
  },

  async delete(id) {
    // Demo mode: return mock success
    if (isDemoMode(id)) {
      return { error: null };
    }

    try {
      const { error } = await supabase?.from('commitments')?.delete()?.eq('id', id);

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Delete commitment error:', error);
      throw error;
    }
  }
};

// Productivity Scores Service
export const productivityScoresService = {
  async create(userId, dailyLogId, scoreDate, score, caption, explanation) {
    // Demo mode: return mock success
    if (isDemoMode(userId)) {
      return {
        data: {
          id: `demo-score-${Date.now()}`,
          userId: 'demo-user',
          dailyLogId,
          scoreDate,
          overallScore: score,
          createdAt: new Date()?.toISOString()
        },
        error: null
      };
    }

    try {
      const { data, error } = await supabase?.from('productivity_scores')?.insert({
          user_id: userId,
          daily_log_id: dailyLogId,
          score_date: scoreDate,
          score: score,
          caption: caption,
          explanation: explanation
        })?.select()?.single();

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        return { data: null, error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Create productivity score error:', error);
      throw error;
    }
  },

  async getByDateRange(userId, startDate, endDate) {
    // Demo mode: filter demo scores by date range
    if (isDemoMode(userId)) {
      const filtered = demoProductivityScores?.filter(
        s => s?.scoreDate >= startDate && s?.scoreDate <= endDate
      );
      return { data: filtered, error: null };
    }

    try {
      const { data, error } = await supabase?.from('productivity_scores')?.select('*')?.eq('user_id', userId)?.gte('score_date', startDate)?.lte('score_date', endDate)?.order('score_date', { ascending: false });

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        if (error?.code === 'PGRST116') {
          return { data: [], error: null };
        }
        return { data: [], error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Get productivity scores error:', error);
      throw error;
    }
  },

  async getRecent(userId, limit = 7) {
    // Demo mode: return recent demo scores
    if (isDemoMode(userId)) {
      return { data: demoProductivityScores?.slice(0, limit), error: null };
    }

    try {
      const { data, error } = await supabase?.from('productivity_scores')?.select('*')?.eq('user_id', userId)?.order('score_date', { ascending: false })?.limit(limit);

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        if (error?.code === 'PGRST116') {
          return { data: [], error: null };
        }
        return { data: [], error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Get recent scores error:', error);
      throw error;
    }
  }
};

// Recommendations Service
export const recommendationsService = {
  async getByDateAndContext(userId, date, context) {
    // Demo mode: return demo recommendations
    if (isDemoMode(userId)) {
      const demoRec = context === 'this_week' 
        ? demoRecommendations?.thisWeek 
        : demoRecommendations?.overall;
      return { data: demoRec, error: null };
    }

    try {
      const { data, error } = await supabase?.from('recommendations')?.select('*')?.eq('user_id', userId)?.eq('date_generated_for', date)?.eq('context', context)?.single();

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        if (error?.code === 'PGRST116') {
          return { data: null, error: null };
        }
        return { data: null, error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Get recommendation error:', error);
      throw error;
    }
  },

  async create(userId, dateGeneratedFor, context, payload, confidence) {
    // Demo mode: return mock success
    if (isDemoMode(userId)) {
      return {
        data: {
          id: `demo-rec-${Date.now()}`,
          userId: 'demo-user',
          dateGeneratedFor,
          context,
          payload,
          confidence,
          createdAt: new Date()?.toISOString()
        },
        error: null
      };
    }

    try {
      const { data, error } = await supabase?.from('recommendations')?.insert({
          user_id: userId,
          date_generated_for: dateGeneratedFor,
          context: context,
          payload: payload,
          confidence: confidence
        })?.select()?.single();

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        return { data: null, error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Create recommendation error:', error);
      throw error;
    }
  },

  async upsert(userId, dateGeneratedFor, context, payload, confidence) {
    // Demo mode: return mock success
    if (isDemoMode(userId)) {
      return {
        data: {
          id: `demo-rec-${Date.now()}`,
          userId: 'demo-user',
          dateGeneratedFor,
          context,
          payload,
          confidence,
          createdAt: new Date()?.toISOString()
        },
        error: null
      };
    }

    try {
      const { data, error } = await supabase?.from('recommendations')?.upsert({
          user_id: userId,
          date_generated_for: dateGeneratedFor,
          context: context,
          payload: payload,
          confidence: confidence
        }, {
          onConflict: 'user_id,date_generated_for,context'
        })?.select()?.single();

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        return { data: null, error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Upsert recommendation error:', error);
      throw error;
    }
  }
};

// Prediction Engine Service
export const predictionEngineService = {
  async generateRecommendations(userId, context = 'overall') {
    // Demo mode: return demo recommendations
    if (isDemoMode(userId)) {
      const demoRec = context === 'this_week' 
        ? demoRecommendations?.thisWeek 
        : demoRecommendations?.overall;
      return { data: demoRec, error: null };
    }

    try {
      const today = new Date()?.toISOString()?.split('T')?.[0];
      const daysBack = context === 'this_week' ? 7 : 90;
      const startDate = new Date();
      startDate?.setDate(startDate?.getDate() - daysBack);
      const startDateStr = startDate?.toISOString()?.split('T')?.[0];

      // Fetch work sessions for the period
      const { data: sessions, error: sessionsError } = await supabase?.from('work_sessions')?.select('*')?.eq('user_id', userId)?.gte('session_date', startDateStr)?.lte('session_date', today)?.order('session_date', { ascending: false });

      if (sessionsError) {
        if (isSchemaError(sessionsError)) {
          console.error('Schema error:', sessionsError?.message);
          throw sessionsError;
        }
        return { data: null, error: sessionsError };
      }

      if (!sessions || sessions?.length === 0) {
        return { 
          data: null, 
          error: { message: 'Not enough data to generate recommendations. Log more work sessions.' } 
        };
      }

      // Fetch commitments for busy schedule filtering
      const { data: commitments, error: commitmentsError } = await supabase?.from('commitments')?.select('*')?.eq('user_id', userId);

      if (commitmentsError && !isSchemaError(commitmentsError)) {
        console.warn('Could not load commitments:', commitmentsError);
      }

      // Generate predictions using time bins
      const predictions = generateTimeBinPredictions(sessions, commitments || [], context);

      // Store recommendations
      const { data: recommendation, error: saveError } = await recommendationsService?.upsert(
        userId,
        today,
        context,
        predictions?.payload,
        predictions?.confidence
      );

      if (saveError) {
        console.error('Failed to save recommendations:', saveError);
        return { data: predictions, error: null };
      }

      return { data: toCamelCase(recommendation), error: null };
    } catch (error) {
      console.error('Generate recommendations error:', error);
      throw error;
    }
  },

  // Get ML predictions for demo mode
  getMLPredictions(userId) {
    if (isDemoMode(userId)) {
      return {
        decisions: demoMLPredictions?.decisionFocused || [],
        scenarios: demoMLPredictions?.counterfactual || [],
        dataSufficiency: demoMLPredictions?.dataSufficiency || null
      };
    }
    return { decisions: [], scenarios: [], dataSufficiency: null };
  }
};

// Helper function: Generate time bin predictions
function generateTimeBinPredictions(sessions, commitments, context) {
  const categories = ['creative', 'analytical', 'studying'];
  const payload = {};
  let totalSupport = 0;

  categories?.forEach(category => {
    const categorySessions = sessions?.filter(s => s?.category === category);
    
    if (categorySessions?.length === 0) {
      payload[category] = {
        windows: [],
        reason: `No ${category} sessions logged yet. Start tracking to get recommendations.`
      };
      return;
    }

    // Create 30-min time bins (48 bins for 24 hours)
    const bins = Array(48)?.fill(0)?.map(() => ({ totalWeight: 0, count: 0 }));

    categorySessions?.forEach(session => {
      const startMinutes = timeToMinutes(session?.start_time);
      const endMinutes = timeToMinutes(session?.end_time);
      const efficiency = session?.efficiency || 3;
      
      // Calculate recency weight (more recent = higher weight)
      const sessionDate = new Date(session?.session_date);
      const today = new Date();
      const daysAgo = Math.floor((today - sessionDate) / (1000 * 60 * 60 * 24));
      const recencyWeight = context === 'this_week' 
        ? Math.max(0.5, 1 - (daysAgo / 14)) 
        : Math.max(0.3, 1 - (daysAgo / 180));

      // Distribute weight across time bins
      const startBin = Math.floor(startMinutes / 30);
      const endBin = Math.floor(endMinutes / 30);

      for (let bin = startBin; bin <= endBin && bin < 48; bin++) {
        const weight = efficiency * recencyWeight;
        bins[bin].totalWeight += weight;
        bins[bin].count += 1;
      }
    });

    // Apply smoothing (average with neighbors)
    const smoothedBins = bins?.map((bin, idx) => {
      const prev = idx > 0 ? bins?.[idx - 1] : bin;
      const next = idx < 47 ? bins?.[idx + 1] : bin;
      return {
        score: (prev?.totalWeight + bin?.totalWeight * 2 + next?.totalWeight) / 4,
        count: bin?.count
      };
    });

    // Find top contiguous windows (2-3 hour blocks)
    const windows = findMultipleConfidenceWindows(smoothedBins, commitments, sessions);
    const support = categorySessions?.length;
    totalSupport += support;

    // Generate reason
    const avgEfficiency = categorySessions?.reduce((sum, s) => sum + (s?.efficiency || 3), 0) / categorySessions?.length;
    const topWindow = windows?.[0];
    const timeOfDay = topWindow ? getTimeOfDay(topWindow?.start) : 'various times';
    
    let reason = `Your ${category} sessions rate higher ${timeOfDay}`;
    if (avgEfficiency >= 4) {
      reason += ' with strong efficiency ratings.';
    } else if (avgEfficiency >= 3) {
      reason += ' based on recent patterns.';
    } else {
      reason += '. Consider optimizing your schedule.';
    }

    payload[category] = { windows, reason };
  });

  // Calculate overall confidence
  const confidence = Math.min(0.95, Math.max(0.3, totalSupport / 30));

  return { payload, confidence };
}

// Helper: Convert time string to minutes
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr?.split(':')?.map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

// Helper: Convert minutes to time string
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours)?.padStart(2, '0')}:${String(mins)?.padStart(2, '0')}`;
}

// Helper: Find multiple windows with different confidence levels
function findMultipleConfidenceWindows(bins, commitments, sessions) {
  const windowSize = 5; // 2.5 hours (5 * 30min bins)
  const candidates = [];

  for (let i = 0; i <= bins?.length - windowSize; i++) {
    const windowBins = bins?.slice(i, i + windowSize);
    const avgScore = windowBins?.reduce((sum, b) => sum + b?.score, 0) / windowSize;
    const support = windowBins?.reduce((sum, b) => sum + b?.count, 0);

    if (support > 0) {
      const startMinutes = i * 30;
      const endMinutes = (i + windowSize) * 30;
      
      // Check for commitment overlaps
      const hasOverlap = checkCommitmentOverlap(startMinutes, endMinutes, commitments);
      
      if (!hasOverlap) {
        // Calculate confidence based on score and support
        const normalizedScore = avgScore / 5; // Normalize to 0-1 range
        const supportFactor = Math.min(support / 10, 1); // More sessions = higher confidence
        const confidenceScore = (normalizedScore * 0.7) + (supportFactor * 0.3);
        
        candidates?.push({
          start: minutesToTime(startMinutes),
          end: minutesToTime(endMinutes),
          score: Math.round(avgScore * 100) / 100,
          confidence: confidenceScore
        });
      }
    }
  }

  // Sort by score
  const sortedCandidates = candidates?.sort((a, b) => b?.score - a?.score);
  
  // Categorize windows by confidence level
  const result = [];
  
  // High confidence: top scoring windows with confidence >= 0.6
  const highConfidence = sortedCandidates?.filter(w => w?.confidence >= 0.6)?.[0];
  if (highConfidence) {
    result?.push({
      start: highConfidence?.start,
      end: highConfidence?.end,
      score: highConfidence?.score,
      confidenceLevel: 'high'
    });
  }
  
  // Medium confidence: windows with confidence 0.4-0.6
  const mediumConfidence = sortedCandidates?.filter(w => 
    w?.confidence >= 0.4 && w?.confidence < 0.6 &&
    !isTimeOverlapping(w, result)
  )?.[0];
  if (mediumConfidence) {
    result?.push({
      start: mediumConfidence?.start,
      end: mediumConfidence?.end,
      score: mediumConfidence?.score,
      confidenceLevel: 'medium'
    });
  }
  
  // Low confidence: windows with confidence < 0.4
  const lowConfidence = sortedCandidates?.filter(w => 
    w?.confidence < 0.4 &&
    !isTimeOverlapping(w, result)
  )?.[0];
  if (lowConfidence) {
    result?.push({
      start: lowConfidence?.start,
      end: lowConfidence?.end,
      score: lowConfidence?.score,
      confidenceLevel: 'low'
    });
  }
  
  return result;
}

// Helper: Check if time windows overlap
function isTimeOverlapping(window, existingWindows) {
  const startMinutes = timeToMinutes(window?.start);
  const endMinutes = timeToMinutes(window?.end);
  
  return existingWindows?.some(existing => {
    const existingStart = timeToMinutes(existing?.start);
    const existingEnd = timeToMinutes(existing?.end);
    
    // Check for any overlap
    return (startMinutes < existingEnd && endMinutes > existingStart);
  });
}

// Helper: Check if time window overlaps with commitments
function checkCommitmentOverlap(startMinutes, endMinutes, commitments) {
  const today = new Date();
  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']?.[today?.getDay()];

  return commitments?.some(commitment => {
    if (commitment?.day !== dayOfWeek) return false;

    const commitmentStart = timeToMinutes(commitment?.start_time);
    const commitmentEnd = timeToMinutes(commitment?.end_time);

    // Check for overlap
    return !(endMinutes <= commitmentStart || startMinutes >= commitmentEnd);
  });
}

// Helper: Get time of day description
function getTimeOfDay(timeStr) {
  const minutes = timeToMinutes(timeStr);
  if (minutes < 360) return 'early morning';
  if (minutes < 720) return 'mid-morning';
  if (minutes < 840) return 'around midday';
  if (minutes < 1020) return 'in early afternoon';
  if (minutes < 1140) return 'in late afternoon';
  if (minutes < 1320) return 'in the evening';
  return 'late evening';
}

// Recognition Engine Service
export const recognitionEngineService = {
  generateRecognition(session, recommendations) {
    if (!session || !recommendations?.payload) return null;

    const category = session?.category;
    const categoryData = recommendations?.payload?.[category];
    
    if (!categoryData?.windows || categoryData?.windows?.length === 0) return null;

    // Check if session overlaps with recommended window
    const sessionStart = timeToMinutes(session?.startTime);
    const sessionEnd = timeToMinutes(session?.endTime);
    
    const overlapsWindow = categoryData?.windows?.some(window => {
      const windowStart = timeToMinutes(window?.start);
      const windowEnd = timeToMinutes(window?.end);
      return !(sessionEnd <= windowStart || sessionStart >= windowEnd);
    });

    if (!overlapsWindow) return null;

    // Generate recognition based on efficiency and felt
    const efficiency = parseInt(session?.efficiency);
    const felt = session?.felt;

    if (efficiency >= 4 && overlapsWindow) {
      return "You used your best creative window today.";
    }
    
    if (overlapsWindow && felt === 'locked-in') {
      return "You protected a deep-work block.";
    }
    
    if (overlapsWindow) {
      return "You respected your energy today.";
    }

    return null;
  },

  async generateReflectiveInsight(userId) {
    try {
      // Get overall and this week sessions
      const today = new Date()?.toISOString()?.split('T')?.[0];
      const weekAgo = new Date();
      weekAgo?.setDate(weekAgo?.getDate() - 7);
      const weekAgoStr = weekAgo?.toISOString()?.split('T')?.[0];

      const { data: recentSessions, error: recentError } = await supabase
        ?.from('work_sessions')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.gte('session_date', weekAgoStr)
        ?.lte('session_date', today);

      if (recentError || !recentSessions || recentSessions?.length < 3) {
        return null;
      }

      // Analyze patterns
      const morningSessions = recentSessions?.filter(s => {
        const minutes = timeToMinutes(s?.start_time);
        return minutes >= 300 && minutes < 720; // 5am - 12pm
      });

      const eveningSessions = recentSessions?.filter(s => {
        const minutes = timeToMinutes(s?.start_time);
        return minutes >= 1080; // after 6pm
      });

      const morningAvgEfficiency = morningSessions?.length > 0
        ? morningSessions?.reduce((sum, s) => sum + (s?.efficiency || 0), 0) / morningSessions?.length
        : 0;

      const eveningAvgEfficiency = eveningSessions?.length > 0
        ? eveningSessions?.reduce((sum, s) => sum + (s?.efficiency || 0), 0) / eveningSessions?.length
        : 0;

      // Generate insight
      if (morningSessions?.length >= 3 && morningAvgEfficiency >= 3.5) {
        return "Mornings are becoming your creative home.";
      }

      if (eveningSessions?.length >= 3 && eveningAvgEfficiency < 3) {
        return "Late evenings are costing you focus.";
      }

      if (morningAvgEfficiency > eveningAvgEfficiency + 0.5) {
        return "Your best thinking happens earlier when sleep is consistent.";
      }

      return null;
    } catch (error) {
      console.error('Generate reflective insight error:', error);
      return null;
    }
  },

  async generateWeeklyComparison(userId) {
    try {
      // Demo mode: return demo comparison
      if (isDemoMode(userId)) {
        const demoComparisons = [
          "You protected your focus 22% more than last week.",
          "Your creative window moved earlier.",
          "You stopped fighting your energy.",
          "You gave yourself 3 more deep-work blocks than last week.",
          "Your morning routine became 40% more consistent.",
          "You respected your limits better this week."
        ];
        const randomIndex = Math.floor(Math.random() * demoComparisons?.length);
        return demoComparisons?.[randomIndex];
      }

      const today = new Date();
      const thisWeekStart = new Date();
      thisWeekStart?.setDate(today?.getDate() - 7);
      const lastWeekStart = new Date();
      lastWeekStart?.setDate(today?.getDate() - 14);

      const thisWeekStartStr = thisWeekStart?.toISOString()?.split('T')?.[0];
      const lastWeekStartStr = lastWeekStart?.toISOString()?.split('T')?.[0];
      const todayStr = today?.toISOString()?.split('T')?.[0];

      // Get this week's sessions
      const { data: thisWeekSessions, error: thisWeekError } = await supabase
        ?.from('work_sessions')?.select('*')?.eq('user_id', userId)?.gte('session_date', thisWeekStartStr)?.lte('session_date', todayStr);

      // Get last week's sessions
      const { data: lastWeekSessions, error: lastWeekError } = await supabase
        ?.from('work_sessions')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.gte('session_date', lastWeekStartStr)
        ?.lt('session_date', thisWeekStartStr);

      if (thisWeekError || lastWeekError || !thisWeekSessions || !lastWeekSessions) {
        return null;
      }

      if (thisWeekSessions?.length < 3 || lastWeekSessions?.length < 3) {
        return null;
      }

      // Calculate focus protection (high efficiency sessions)
      const thisWeekHighEfficiency = thisWeekSessions?.filter(s => s?.efficiency >= 4)?.length;
      const lastWeekHighEfficiency = lastWeekSessions?.filter(s => s?.efficiency >= 4)?.length;
      
      if (thisWeekHighEfficiency > lastWeekHighEfficiency && lastWeekHighEfficiency > 0) {
        const percentIncrease = Math.round(((thisWeekHighEfficiency - lastWeekHighEfficiency) / lastWeekHighEfficiency) * 100);
        if (percentIncrease >= 15) {
          return `You protected your focus ${percentIncrease}% more than last week.`;
        }
      }

      // Compare average start times for creative work
      const thisWeekCreative = thisWeekSessions?.filter(s => s?.category === 'creative');
      const lastWeekCreative = lastWeekSessions?.filter(s => s?.category === 'creative');

      if (thisWeekCreative?.length >= 2 && lastWeekCreative?.length >= 2) {
        const thisWeekAvgStart = thisWeekCreative?.reduce((sum, s) => sum + timeToMinutes(s?.start_time), 0) / thisWeekCreative?.length;
        const lastWeekAvgStart = lastWeekCreative?.reduce((sum, s) => sum + timeToMinutes(s?.start_time), 0) / lastWeekCreative?.length;
        
        const diff = Math.abs(thisWeekAvgStart - lastWeekAvgStart);
        
        if (diff >= 30) {
          const direction = thisWeekAvgStart < lastWeekAvgStart ? 'earlier' : 'later';
          return `Your creative window moved ${direction}.`;
        }
      }

      // Deep work blocks comparison
      const thisWeekDeepWork = thisWeekSessions?.filter(s => s?.efficiency >= 4 && 
        (timeToMinutes(s?.end_time) - timeToMinutes(s?.start_time)) >= 90)?.length;
      const lastWeekDeepWork = lastWeekSessions?.filter(s => s?.efficiency >= 4 && 
        (timeToMinutes(s?.end_time) - timeToMinutes(s?.start_time)) >= 90)?.length;
      
      if (thisWeekDeepWork > lastWeekDeepWork) {
        const diff = thisWeekDeepWork - lastWeekDeepWork;
        return `You gave yourself ${diff} more deep-work block${diff > 1 ? 's' : ''} than last week.`;
      }

      // Energy respect (sessions aligned with energy levels)
      const thisWeekAvgEfficiency = thisWeekSessions?.reduce((sum, s) => sum + (s?.efficiency || 0), 0) / thisWeekSessions?.length;
      const lastWeekAvgEfficiency = lastWeekSessions?.reduce((sum, s) => sum + (s?.efficiency || 0), 0) / lastWeekSessions?.length;
      
      if (thisWeekAvgEfficiency > lastWeekAvgEfficiency + 0.3) {
        return "You stopped fighting your energy.";
      }

      // Morning consistency
      const thisWeekMorningSessions = thisWeekSessions?.filter(s => {
        const minutes = timeToMinutes(s?.start_time);
        return minutes >= 300 && minutes < 720;
      })?.length;
      const lastWeekMorningSessions = lastWeekSessions?.filter(s => {
        const minutes = timeToMinutes(s?.start_time);
        return minutes >= 300 && minutes < 720;
      })?.length;
      
      if (thisWeekMorningSessions > lastWeekMorningSessions && lastWeekMorningSessions > 0) {
        const percentIncrease = Math.round(((thisWeekMorningSessions - lastWeekMorningSessions) / lastWeekMorningSessions) * 100);
        if (percentIncrease >= 30) {
          return `Your morning routine became ${percentIncrease}% more consistent.`;
        }
      }

      return null;
    } catch (error) {
      console.error('Get logs by date range error:', error);
      throw error;
    }
  }
};

// Brain Signature Service
export const brainSignatureService = {
  async generateBrainSignature(userId) {
    try {
      // Demo mode: return demo brain signature
      if (isDemoMode(userId)) {
        return {
          data: {
            signature: 'The Morning Creative',
            explanation: 'Your best ideas happen before noon.',
            dominantCategory: 'creative',
            dominantTimeWindow: 'morning',
            pattern: 'early-peak'
          },
          error: null
        };
      }

      const today = new Date()?.toISOString()?.split('T')?.[0];
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo?.setDate(ninetyDaysAgo?.getDate() - 90);
      const startDateStr = ninetyDaysAgo?.toISOString()?.split('T')?.[0];

      // Fetch work sessions for the last 90 days
      const { data: sessions, error: sessionsError } = await supabase
        ?.from('work_sessions')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.gte('session_date', startDateStr)
        ?.lte('session_date', today)
        ?.order('session_date', { ascending: false });

      if (sessionsError) {
        if (isSchemaError(sessionsError)) {
          console.error('Schema error:', sessionsError?.message);
          throw sessionsError;
        }
        return { data: null, error: sessionsError };
      }

      if (!sessions || sessions?.length < 5) {
        return {
          data: {
            signature: 'The Emerging Pattern',
            explanation: 'Keep logging sessions to discover your cognitive rhythm.',
            dominantCategory: null,
            dominantTimeWindow: null,
            pattern: 'insufficient-data'
          },
          error: null
        };
      }

      // Classify brain signature
      const signature = classifyBrainSignature(sessions);
      return { data: signature, error: null };
    } catch (error) {
      console.error('Generate brain signature error:', error);
      throw error;
    }
  }
};

// Helper: Classify brain signature based on sessions
function classifyBrainSignature(sessions) {
  // Analyze category distribution
  const categoryCount = {
    creative: 0,
    analytical: 0,
    studying: 0
  };

  const categoryEfficiency = {
    creative: [],
    analytical: [],
    studying: []
  };

  const timeDistribution = {
    earlyMorning: [], // 5am-9am
    morning: [], // 9am-12pm
    afternoon: [], // 12pm-5pm
    evening: [], // 5pm-9pm
    night: [] // 9pm-5am
  };

  sessions?.forEach(session => {
    const category = session?.category;
    const efficiency = session?.efficiency || 3;
    const startMinutes = timeToMinutes(session?.start_time);

    categoryCount[category]++;
    categoryEfficiency?.[category]?.push(efficiency);

    // Classify time of day
    if (startMinutes >= 300 && startMinutes < 540) {
      timeDistribution?.earlyMorning?.push({ category, efficiency });
    } else if (startMinutes >= 540 && startMinutes < 720) {
      timeDistribution?.morning?.push({ category, efficiency });
    } else if (startMinutes >= 720 && startMinutes < 1020) {
      timeDistribution?.afternoon?.push({ category, efficiency });
    } else if (startMinutes >= 1020 && startMinutes < 1260) {
      timeDistribution?.evening?.push({ category, efficiency });
    } else {
      timeDistribution?.night?.push({ category, efficiency });
    }
  });

  // Find dominant category
  const dominantCategory = Object.keys(categoryCount)?.reduce((a, b) => 
    categoryCount?.[a] > categoryCount?.[b] ? a : b
  );

  // Calculate average efficiency per category
  const avgEfficiency = {};
  Object.keys(categoryEfficiency)?.forEach(cat => {
    const efficiencies = categoryEfficiency?.[cat];
    avgEfficiency[cat] = efficiencies?.length > 0
      ? efficiencies?.reduce((sum, e) => sum + e, 0) / efficiencies?.length
      : 0;
  });

  // Find dominant time window
  const timeWindowSizes = {
    earlyMorning: timeDistribution?.earlyMorning?.length,
    morning: timeDistribution?.morning?.length,
    afternoon: timeDistribution?.afternoon?.length,
    evening: timeDistribution?.evening?.length,
    night: timeDistribution?.night?.length
  };

  const dominantTimeWindow = Object.keys(timeWindowSizes)?.reduce((a, b) => 
    timeWindowSizes?.[a] > timeWindowSizes?.[b] ? a : b
  );

  // Calculate average efficiency per time window
  const timeWindowEfficiency = {};
  Object.keys(timeDistribution)?.forEach(window => {
    const sessions = timeDistribution?.[window];
    timeWindowEfficiency[window] = sessions?.length > 0
      ? sessions?.reduce((sum, s) => sum + s?.efficiency, 0) / sessions?.length
      : 0;
  });

  // Determine pattern type
  let pattern = 'balanced';
  const sessionDurations = sessions?.map(s => {
    const start = timeToMinutes(s?.start_time);
    const end = timeToMinutes(s?.end_time);
    return end - start;
  });
  const avgDuration = sessionDurations?.reduce((sum, d) => sum + d, 0) / sessionDurations?.length;

  if (avgDuration < 90) {
    pattern = 'sprint'; // Short bursts
  } else if (avgDuration > 180) {
    pattern = 'marathon'; // Long sessions
  }

  // Check for late-blooming pattern (efficiency increases over time)
  const firstHalfSessions = sessions?.slice(Math.floor(sessions?.length / 2));
  const secondHalfSessions = sessions?.slice(0, Math.floor(sessions?.length / 2));
  
  const firstHalfAvg = firstHalfSessions?.reduce((sum, s) => sum + (s?.efficiency || 3), 0) / firstHalfSessions?.length;
  const secondHalfAvg = secondHalfSessions?.reduce((sum, s) => sum + (s?.efficiency || 3), 0) / secondHalfSessions?.length;
  
  if (secondHalfAvg > firstHalfAvg + 0.5) {
    pattern = 'late-blooming';
  }

  // Check for split-day pattern (both morning and evening high)
  if (timeWindowEfficiency?.morning >= 3.5 && timeWindowEfficiency?.evening >= 3.5) {
    pattern = 'split-day';
  }

  // Generate signature name and explanation
  const { signature, explanation } = generateSignatureName(
    dominantCategory,
    dominantTimeWindow,
    pattern,
    avgEfficiency,
    timeWindowEfficiency
  );

  return {
    signature,
    explanation,
    dominantCategory,
    dominantTimeWindow,
    pattern
  };
}

// Helper: Generate signature name and explanation
function generateSignatureName(category, timeWindow, pattern, categoryEfficiency, timeEfficiency) {
  const categoryLabel = {
    creative: 'Creative',
    analytical: 'Analyst',
    studying: 'Learner'
  };

  const timeLabel = {
    earlyMorning: 'Early Morning',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night-Shift'
  };

  // Calculate efficiency variance for pattern detection
  const efficiencyValues = Object.values(timeEfficiency);
  const maxEff = Math.max(...efficiencyValues);
  const minEff = Math.min(...efficiencyValues);
  const variance = maxEff - minEff;
  
  // Calculate category dominance
  const categoryValues = Object.values(categoryEfficiency);
  const categoryMax = Math.max(...categoryValues);
  const categoryVariance = categoryMax - Math.min(...categoryValues);

  // Pattern-based signatures (expanded)
  if (pattern === 'late-blooming') {
    const signatures = [
      {
        signature: `The ${categoryLabel?.[category]} Late-Bloomer`,
        explanation: 'Your efficiency improves as you build momentum over time.'
      },
      {
        signature: 'The Momentum Builder',
        explanation: 'You warm up slowly but finish strong—your best work comes after the first hour.'
      },
      {
        signature: 'The Crescendo Mind',
        explanation: 'Like a symphony, your focus builds to a powerful finale.'
      }
    ];
    return signatures?.[Math.floor(Math.random() * signatures?.length)];
  }

  if (pattern === 'sprint') {
    const signatures = [
      {
        signature: 'The Focus Sprinter',
        explanation: 'You excel in short, intense bursts of concentrated work.'
      },
      {
        signature: 'The Pomodoro Perfectionist',
        explanation: 'Your brain thrives on tight time boxes—45 minutes is your sweet spot.'
      },
      {
        signature: 'The Lightning Thinker',
        explanation: 'Quick strikes of deep focus are your superpower.'
      },
      {
        signature: 'The Burst Optimizer',
        explanation: 'You pack more insight into 30 minutes than most do in 3 hours.'
      }
    ];
    return signatures?.[Math.floor(Math.random() * signatures?.length)];
  }

  if (pattern === 'marathon') {
    const signatures = [
      {
        signature: 'The Slow Burner',
        explanation: 'You thrive in extended deep-work sessions with sustained focus.'
      },
      {
        signature: 'The Deep Diver',
        explanation: 'You need 90+ minutes to hit flow—but once there, you\'re unstoppable.'
      },
      {
        signature: 'The Endurance Mind',
        explanation: 'Long sessions are where you shine—your focus deepens over hours.'
      },
      {
        signature: 'The Flow State Architect',
        explanation: 'You build cathedrals of thought in 3-hour blocks.'
      }
    ];
    return signatures?.[Math.floor(Math.random() * signatures?.length)];
  }

  if (pattern === 'split-day') {
    const signatures = [
      {
        signature: 'The Split-Day Thinker',
        explanation: 'You have two peak windows—morning clarity and evening flow.'
      },
      {
        signature: 'The Dual-Peak Performer',
        explanation: 'Your energy rises twice: once at dawn, again at dusk.'
      },
      {
        signature: 'The Biphasic Brain',
        explanation: 'You operate on two gears—morning logic, evening creativity.'
      }
    ];
    return signatures?.[Math.floor(Math.random() * signatures?.length)];
  }

  // High variance = inconsistent energy (new pattern)
  if (variance > 1.5) {
    const signatures = [
      {
        signature: 'The Chaotic Genius',
        explanation: 'Your productivity is unpredictable—but when you peak, you soar.'
      },
      {
        signature: 'The Wild Card',
        explanation: 'Your best work happens when you least expect it.'
      },
      {
        signature: 'The Storm Chaser',
        explanation: 'You ride waves of inspiration—calm, then lightning.'
      }
    ];
    return signatures?.[Math.floor(Math.random() * signatures?.length)];
  }

  // Low variance = consistent energy (new pattern)
  if (variance < 0.5) {
    const signatures = [
      {
        signature: 'The Steady Engine',
        explanation: 'Your productivity is remarkably consistent—no peaks, no crashes.'
      },
      {
        signature: 'The Metronome Mind',
        explanation: 'You deliver the same quality output, any time of day.'
      },
      {
        signature: 'The All-Day Performer',
        explanation: 'Your energy stays flat and reliable from dawn to dusk.'
      }
    ];
    return signatures?.[Math.floor(Math.random() * signatures?.length)];
  }

  // Time-based signatures (expanded with more variety)
  if (timeWindow === 'earlyMorning') {
    const signatures = [
      {
        signature: `The ${timeLabel?.[timeWindow]} ${categoryLabel?.[category]}`,
        explanation: 'Your best ideas happen before noon.'
      },
      {
        signature: 'The Dawn Architect',
        explanation: 'You build empires before breakfast—5am is your power hour.'
      },
      {
        signature: 'The Sunrise Strategist',
        explanation: 'While the world sleeps, your mind is sharpest.'
      },
      {
        signature: 'The First Light Thinker',
        explanation: 'Your neurons fire fastest when the sky turns pink.'
      }
    ];
    return signatures?.[Math.floor(Math.random() * signatures?.length)];
  }

  if (timeWindow === 'morning') {
    const signatures = [
      {
        signature: `The ${timeLabel?.[timeWindow]} ${categoryLabel?.[category]}`,
        explanation: 'Your best ideas happen before noon.'
      },
      {
        signature: 'The Morning Catalyst',
        explanation: 'Your brain peaks between 9-11am—protect this window fiercely.'
      },
      {
        signature: 'The AM Optimizer',
        explanation: 'Meetings after lunch? Never. Your mornings are sacred.'
      },
      {
        signature: 'The Pre-Noon Powerhouse',
        explanation: 'You accomplish more before lunch than most do all day.'
      },
      {
        signature: 'The Coffee-Fueled Visionary',
        explanation: 'First cup + morning light = your creative peak.'
      }
    ];
    return signatures?.[Math.floor(Math.random() * signatures?.length)];
  }

  if (timeWindow === 'night') {
    const signatures = [
      {
        signature: `The ${timeLabel?.[timeWindow]} ${categoryLabel?.[category]}`,
        explanation: 'Your mind comes alive when the world quiets down.'
      },
      {
        signature: 'The Midnight Architect',
        explanation: 'Your best code ships after 11pm—silence is your fuel.'
      },
      {
        signature: 'The Nocturnal Innovator',
        explanation: 'When others sleep, you create your masterpieces.'
      },
      {
        signature: 'The Moon-Powered Mind',
        explanation: 'Darkness brings clarity—your neurons fire after sunset.'
      },
      {
        signature: 'The 2am Philosopher',
        explanation: 'Your deepest insights arrive when the clock strikes midnight.'
      },
      {
        signature: 'The Night Owl Savant',
        explanation: 'You don\'t fight your circadian rhythm—you own it.'
      }
    ];
    return signatures?.[Math.floor(Math.random() * signatures?.length)];
  }

  if (timeWindow === 'afternoon') {
    const signatures = [
      {
        signature: `The Afternoon ${categoryLabel?.[category]}`,
        explanation: 'You hit your stride in the middle of the day.'
      },
      {
        signature: 'The Post-Lunch Performer',
        explanation: 'While others crash at 2pm, you\'re just getting started.'
      },
      {
        signature: 'The Midday Maverick',
        explanation: 'Your focus peaks when the sun is highest.'
      },
      {
        signature: 'The Second-Wind Specialist',
        explanation: 'You defy the afternoon slump—1-4pm is your zone.'
      },
      {
        signature: 'The Solar-Powered Thinker',
        explanation: 'Peak sunlight = peak performance for your brain.'
      }
    ];
    return signatures?.[Math.floor(Math.random() * signatures?.length)];
  }

  if (timeWindow === 'evening') {
    const signatures = [
      {
        signature: `The Evening ${categoryLabel?.[category]}`,
        explanation: 'Your focus sharpens as the day winds down.'
      },
      {
        signature: 'The Twilight Tactician',
        explanation: 'Your best decisions happen between 5-8pm.'
      },
      {
        signature: 'The Dusk Dynamo',
        explanation: 'As others log off, your productivity curve spikes.'
      },
      {
        signature: 'The Golden Hour Mind',
        explanation: 'Your creativity blooms when the workday ends.'
      },
      {
        signature: 'The After-Hours Achiever',
        explanation: 'You save your hardest problems for after dinner.'
      }
    ];
    return signatures?.[Math.floor(Math.random() * signatures?.length)];
  }

  // Category-dominant signatures (when one category is clearly dominant)
  if (categoryVariance > 1.0) {
    if (category === 'creative') {
      const signatures = [
        {
          signature: 'The Idea Factory',
          explanation: 'You generate concepts faster than you can capture them.'
        },
        {
          signature: 'The Creative Cyclone',
          explanation: 'Your imagination runs wild—structure is your only limit.'
        },
        {
          signature: 'The Visionary Architect',
          explanation: 'You see possibilities others miss—your mind builds futures.'
        },
        {
          signature: 'The Divergent Thinker',
          explanation: 'Linear thinking bores you—you connect dots across dimensions.'
        }
      ];
      return signatures?.[Math.floor(Math.random() * signatures?.length)];
    }

    if (category === 'analytical') {
      const signatures = [
        {
          signature: 'The Logic Engine',
          explanation: 'You dissect problems with surgical precision.'
        },
        {
          signature: 'The Pattern Detective',
          explanation: 'You spot trends and anomalies others overlook.'
        },
        {
          signature: 'The Systems Architect',
          explanation: 'You see the matrix—every variable, every connection.'
        },
        {
          signature: 'The Convergent Mind',
          explanation: 'You take chaos and extract signal with ruthless efficiency.'
        },
        {
          signature: 'The Debugger Supreme',
          explanation: 'Complex problems don\'t scare you—they energize you.'
        }
      ];
      return signatures?.[Math.floor(Math.random() * signatures?.length)];
    }

    if (category === 'studying') {
      const signatures = [
        {
          signature: 'The Knowledge Sponge',
          explanation: 'You absorb information at an extraordinary rate.'
        },
        {
          signature: 'The Perpetual Student',
          explanation: 'Learning isn\'t a task—it\'s your natural state.'
        },
        {
          signature: 'The Synthesis Master',
          explanation: 'You don\'t just learn—you connect ideas across domains.'
        },
        {
          signature: 'The Curiosity Engine',
          explanation: 'Every answer leads to three new questions.'
        }
      ];
      return signatures?.[Math.floor(Math.random() * signatures?.length)];
    }
  }

  // Balanced signatures (when no clear pattern emerges)
  const balancedSignatures = [
    {
      signature: 'The Adaptive Mind',
      explanation: 'You shift gears seamlessly—creative, then analytical, then back.'
    },
    {
      signature: 'The Versatile Performer',
      explanation: 'No single pattern defines you—you excel across contexts.'
    },
    {
      signature: 'The Contextual Genius',
      explanation: 'Your productivity depends on the task, not the time.'
    },
    {
      signature: 'The Flexible Thinker',
      explanation: 'You adapt your work style to match the challenge.'
    },
    {
      signature: 'The Multi-Modal Mind',
      explanation: 'You operate on multiple frequencies—no single rhythm defines you.'
    },
    {
      signature: 'The Shapeshifter',
      explanation: 'Your cognitive style changes with your environment.'
    },
    {
      signature: 'The Renaissance Brain',
      explanation: 'You refuse to be boxed in—every day brings a new mode.'
    }
  ];

  return balancedSignatures?.[Math.floor(Math.random() * balancedSignatures?.length)];
}

// Productivity Score Calculation Service
export const productivityScoreCalculator = {
  calculateScore(dailyLog, workSessions) {
    if (!dailyLog || !workSessions || workSessions?.length === 0) {
      return {
        score: 0,
        caption: 'No data',
        explanation: 'Log your day to see your productivity score.'
      };
    }

    // Factors:
    // 1. Sleep quality (0-25 points)
    // 2. Energy level (0-20 points)
    // 3. Work session efficiency (0-35 points)
    // 4. Total productive time (0-20 points)

    let score = 0;

    // Sleep quality contribution (0-25)
    // Map ENUM values to numeric scores
    const sleepQualityMap = {
      'excellent': 5,
      'good': 4,
      'fair': 3,
      'poor': 2
    };
    const sleepQualityValue = sleepQualityMap?.[dailyLog?.sleepQuality] || 3;
    const sleepScore = (sleepQualityValue / 5) * 25;
    score += sleepScore;

    // Energy level contribution (0-20)
    // Map ENUM values to numeric scores
    const energyLevelMap = {
      'high': 5,
      'medium': 3,
      'low': 1
    };
    const energyLevelValue = energyLevelMap?.[dailyLog?.energyLevel] || 3;
    const energyScore = (energyLevelValue / 5) * 20;
    score += energyScore;

    // Work session efficiency (0-35)
    const avgEfficiency = workSessions?.reduce((sum, s) => sum + (s?.efficiency || 3), 0) / workSessions?.length;
    const efficiencyScore = (avgEfficiency / 5) * 35;
    score += efficiencyScore;

    // Total productive time (0-20)
    const totalMinutes = workSessions?.reduce((sum, s) => {
      const start = timeToMinutes(s?.startTime || s?.start_time);
      const end = timeToMinutes(s?.endTime || s?.end_time);
      return sum + (end - start);
    }, 0);
    const hours = totalMinutes / 60;
    const timeScore = Math.min(20, (hours / 6) * 20); // Max at 6 hours
    score += timeScore;

    // Round to nearest integer
    score = Math.round(score);

    // Generate caption and explanation
    let caption = '';
    let explanation = '';

    if (score >= 85) {
      caption = 'Exceptional day';
      explanation = 'You were firing on all cylinders today—great sleep, high energy, and focused work.';
    } else if (score >= 70) {
      caption = 'Strong performance';
      explanation = 'You maintained good focus and energy throughout the day.';
    } else if (score >= 55) {
      caption = 'Solid effort';
      explanation = 'You got meaningful work done despite some challenges.';
    } else if (score >= 40) {
      caption = 'Building momentum';
      explanation = 'Not your best day, but you showed up and made progress.';
    } else {
      caption = 'Recovery mode';
      explanation = 'Some days are for rest and reset. Tomorrow is a new opportunity.';
    }

    return { score, caption, explanation };
  }
};

// Streak Calculation Service
export const streakService = {
  calculateStreak(dailyLogs) {
    if (!dailyLogs || dailyLogs?.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastLogDate: null };
    }

    // Sort logs by date descending (most recent first)
    const sortedLogs = [...dailyLogs]?.sort((a, b) => 
      new Date(b?.logDate) - new Date(a?.logDate)
    );

    const today = new Date();
    today?.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastLogDate = sortedLogs?.[0]?.logDate || null;

    // Calculate current streak (from most recent log backwards)
    let expectedDate = new Date(today);
    
    for (let i = 0; i < sortedLogs?.length; i++) {
      const logDate = new Date(sortedLogs?.[i]?.logDate);
      logDate?.setHours(0, 0, 0, 0);

      // Check if this log matches the expected date
      if (logDate?.getTime() === expectedDate?.getTime()) {
        currentStreak++;
        expectedDate?.setDate(expectedDate?.getDate() - 1);
      } else if (i === 0 && logDate?.getTime() === new Date(today?.getTime() - 24 * 60 * 60 * 1000)?.setHours(0, 0, 0, 0)) {
        // If first log is yesterday, start counting from yesterday
        currentStreak++;
        expectedDate = new Date(logDate);
        expectedDate?.setDate(expectedDate?.getDate() - 1);
      } else {
        // Streak broken
        break;
      }
    }

    // Calculate longest streak (scan all logs)
    let previousDate = null;
    
    for (let i = 0; i < sortedLogs?.length; i++) {
      const logDate = new Date(sortedLogs?.[i]?.logDate);
      logDate?.setHours(0, 0, 0, 0);

      if (previousDate === null) {
        tempStreak = 1;
      } else {
        const dayDiff = Math?.floor((previousDate - logDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          // Consecutive day
          tempStreak++;
        } else {
          // Streak broken, check if it was the longest
          longestStreak = Math?.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }

      previousDate = logDate;
    }

    // Final check for longest streak
    longestStreak = Math?.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
      lastLogDate
    };
  },

  async getStreakData(userId) {
    // Demo mode: calculate from demo data
    if (isDemoMode(userId)) {
      return {
        data: this.calculateStreak(demoDailyLogs),
        error: null
      };
    }

    try {
      // Fetch all daily logs for the user (last 365 days to capture longest streak)
      const oneYearAgo = new Date();
      oneYearAgo?.setFullYear(oneYearAgo?.getFullYear() - 1);
      const oneYearAgoStr = oneYearAgo?.toISOString()?.split('T')?.[0];

      const { data: logs, error } = await supabase
        ?.from('daily_logs')
        ?.select('id, log_date')
        ?.eq('user_id', userId)
        ?.gte('log_date', oneYearAgoStr)
        ?.order('log_date', { ascending: false });

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        return { data: null, error };
      }

      const streakData = this.calculateStreak(toCamelCase(logs));
      return { data: streakData, error: null };
    } catch (error) {
      console.error('Get streak data error:', error);
      throw error;
    }
  }
};

// Rest Day Service
export const restDayService = {
  async create(userId, restDayData) {
    // Demo mode: store in localStorage
    if (isDemoMode(userId)) {
      const demoRestDays = JSON.parse(localStorage?.getItem('volta_demo_rest_days') || '[]');
      const newRestDay = {
        id: `demo-rest-${Date.now()}`,
        userId,
        startDate: restDayData?.startDate,
        endDate: restDayData?.endDate,
        reason: restDayData?.reason || 'Rest period',
        createdAt: new Date()?.toISOString()
      };
      demoRestDays?.push(newRestDay);
      localStorage?.setItem('volta_demo_rest_days', JSON.stringify(demoRestDays));
      return { data: newRestDay, error: null };
    }

    try {
      const { data, error } = await supabase
        ?.from('rest_days')
        ?.insert([toSnakeCase({ userId, ...restDayData })])
        ?.select()
        ?.single();

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        return { data: null, error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Create rest day error:', error);
      return { data: null, error };
    }
  },

  async getAll(userId) {
    // Demo mode: return from localStorage
    if (isDemoMode(userId)) {
      const demoRestDays = JSON.parse(localStorage?.getItem('volta_demo_rest_days') || '[]');
      return { data: demoRestDays, error: null };
    }

    try {
      const { data, error } = await supabase
        ?.from('rest_days')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.order('start_date', { ascending: false });

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        return { data: null, error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Get rest days error:', error);
      return { data: null, error };
    }
  },

  async isRestDay(userId, date) {
    // Demo mode: check localStorage
    if (isDemoMode(userId)) {
      const demoRestDays = JSON.parse(localStorage?.getItem('volta_demo_rest_days') || '[]');
      return demoRestDays?.some(rd => {
        const checkDate = new Date(date);
        const start = new Date(rd?.startDate);
        const end = new Date(rd?.endDate);
        return checkDate >= start && checkDate <= end;
      });
    }

    try {
      const { data, error } = await supabase
        ?.from('rest_days')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.lte('start_date', date)
        ?.gte('end_date', date)
        ?.limit(1);

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          return false;
        }
        return false;
      }

      return data && data?.length > 0;
    } catch (error) {
      console.error('Check rest day error:', error);
      return false;
    }
  },

  async delete(userId, restDayId) {
    // Demo mode: remove from localStorage
    if (isDemoMode(userId)) {
      const demoRestDays = JSON.parse(localStorage?.getItem('volta_demo_rest_days') || '[]');
      const filtered = demoRestDays?.filter(rd => rd?.id !== restDayId);
      localStorage?.setItem('volta_demo_rest_days', JSON.stringify(filtered));
      return { error: null };
    }

    try {
      const { error } = await supabase
        ?.from('rest_days')
        ?.delete()
        ?.eq('id', restDayId)
        ?.eq('user_id', userId);

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Delete rest day error:', error);
      return { error };
    }
  }
};

// Habit Logs Service
export const habitLogsService = {
  async getAll(userId, startDate = null, endDate = null) {
    // Demo mode: return demo habit logs
    if (isDemoMode(userId)) {
      const today = new Date();
      const demoHabits = [];
      
      // Generate 14 days of demo data
      for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date?.setDate(date?.getDate() - i);
        const dateStr = date?.toISOString()?.split('T')?.[0];
        
        demoHabits?.push(
          { id: `demo-med-${i}`, userId, habitTitle: 'Morning Meditation', logDate: dateStr, completed: i % 7 !== 0, createdAt: date?.toISOString() },
          { id: `demo-ex-${i}`, userId, habitTitle: 'Exercise', logDate: dateStr, completed: i % 3 === 0, createdAt: date?.toISOString() },
          { id: `demo-read-${i}`, userId, habitTitle: 'Read 30 Minutes', logDate: dateStr, completed: i < 7 ? i % 2 === 0 : i % 4 === 0, createdAt: date?.toISOString() }
        );
      }
      
      return { data: demoHabits, error: null };
    }

    try {
      let query = supabase
        ?.from('habit_logs')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.order('log_date', { ascending: false });

      if (startDate) {
        query = query?.gte('log_date', startDate);
      }
      if (endDate) {
        query = query?.lte('log_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        if (error?.code === 'PGRST116') {
          return { data: [], error: null };
        }
        return { data: [], error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Get habit logs error:', error);
      return { data: [], error };
    }
  },

  async getByDate(userId, logDate) {
    // Demo mode: filter demo data by date
    if (isDemoMode(userId)) {
      const { data } = await this.getAll(userId);
      return { data: data?.filter(h => h?.logDate === logDate), error: null };
    }

    try {
      const { data, error } = await supabase
        ?.from('habit_logs')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.eq('log_date', logDate)
        ?.order('created_at', { ascending: true });

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        if (error?.code === 'PGRST116') {
          return { data: [], error: null };
        }
        return { data: [], error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Get habit logs by date error:', error);
      return { data: [], error };
    }
  },

  async create(userId, habitTitle, logDate = new Date()?.toISOString()?.split('T')?.[0], completed = false) {
    // Demo mode: return mock success
    if (isDemoMode(userId)) {
      return {
        data: {
          id: `demo-${Date.now()}`,
          userId,
          habitTitle,
          logDate,
          completed,
          createdAt: new Date()?.toISOString()
        },
        error: null
      };
    }

    try {
      const { data, error } = await supabase
        ?.from('habit_logs')
        ?.insert({
          user_id: userId,
          habit_title: habitTitle,
          log_date: logDate,
          completed
        })
        ?.select()
        ?.single();

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        return { data: null, error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Create habit log error:', error);
      return { data: null, error };
    }
  },

  async updateCompletion(userId, habitLogId, completed) {
    // Demo mode: return mock success
    if (isDemoMode(userId)) {
      return {
        data: { id: habitLogId, userId, completed },
        error: null
      };
    }

    try {
      const { data, error } = await supabase
        ?.from('habit_logs')
        ?.update({ completed })
        ?.eq('id', habitLogId)
        ?.eq('user_id', userId)
        ?.select()
        ?.single();

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        return { data: null, error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Update habit completion error:', error);
      return { data: null, error };
    }
  },

  async delete(userId, habitLogId) {
    // Demo mode: return mock success
    if (isDemoMode(userId)) {
      return { data: { success: true }, error: null };
    }

    try {
      const { data, error } = await supabase
        ?.from('habit_logs')
        ?.delete()
        ?.eq('id', habitLogId)
        ?.eq('user_id', userId)
        ?.select()
        ?.single();

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        return { data: null, error };
      }

      return { data: toCamelCase(data), error: null };
    } catch (error) {
      console.error('Delete habit log error:', error);
      return { data: null, error };
    }
  },

  // Get weekly statistics for all habits
  async getWeeklyStats(userId, startDate, endDate) {
    // Demo mode: calculate from demo data
    if (isDemoMode(userId)) {
      const { data: allLogs } = await this.getAll(userId, startDate, endDate);
      return this.calculateWeeklyStats(allLogs);
    }

    try {
      const { data, error } = await supabase
        ?.from('habit_logs')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.gte('log_date', startDate)
        ?.lte('log_date', endDate);

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        }
        if (error?.code === 'PGRST116') {
          return { data: [], error: null };
        }
        return { data: [], error };
      }

      const camelData = toCamelCase(data);
      return this.calculateWeeklyStats(camelData);
    } catch (error) {
      console.error('Get weekly stats error:', error);
      return { data: [], error };
    }
  },

  // Helper function to calculate statistics from habit logs
  calculateWeeklyStats(logs) {
    if (!logs || logs?.length === 0) {
      return { data: [], error: null };
    }

    // Group by habit title
    const habitGroups = logs?.reduce((acc, log) => {
      if (!acc?.[log?.habitTitle]) {
        acc[log?.habitTitle] = [];
      }
      acc?.[log?.habitTitle]?.push(log);
      return acc;
    }, {});

    // Calculate stats for each habit
    const stats = Object.keys(habitGroups)?.map(habitTitle => {
      const habitLogs = habitGroups?.[habitTitle];
      const totalDays = habitLogs?.length;
      const completedDays = habitLogs?.filter(log => log?.completed)?.length;
      const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

      // Calculate trend (compare first half vs second half)
      const midpoint = Math.floor(totalDays / 2);
      const sortedLogs = habitLogs?.sort((a, b) => new Date(a?.logDate) - new Date(b?.logDate));
      const firstHalf = sortedLogs?.slice(0, midpoint);
      const secondHalf = sortedLogs?.slice(midpoint);
      
      const firstHalfRate = firstHalf?.length > 0 
        ? (firstHalf?.filter(log => log?.completed)?.length / firstHalf?.length) * 100 
        : 0;
      const secondHalfRate = secondHalf?.length > 0 
        ? (secondHalf?.filter(log => log?.completed)?.length / secondHalf?.length) * 100 
        : 0;
      
      const trend = secondHalfRate - firstHalfRate;

      // Calculate current streak
      let currentStreak = 0;
      const sortedDesc = [...sortedLogs]?.reverse();
      for (const log of sortedDesc) {
        if (log?.completed) {
          currentStreak++;
        } else {
          break;
        }
      }

      return {
        habitTitle,
        totalDays,
        completedDays,
        completionRate: Math.round(completionRate),
        trend: Math.round(trend),
        currentStreak,
        logs: habitLogs
      };
    });

    // Sort by completion rate descending
    stats?.sort((a, b) => b?.completionRate - a?.completionRate);

    return { data: stats, error: null };
  }
};

// Alignment Tracking Service
export const alignmentTrackingService = {
  // Calculate alignment score for a day
  calculateDailyAlignment(dailyLog, workSessions, recommendations) {
    if (!dailyLog || !workSessions || workSessions?.length === 0) {
      return { aligned: false, score: 0, reasons: [] };
    }

    let alignmentScore = 0;
    const reasons = [];

    // Check if worked during recommended windows
    if (recommendations?.payload) {
      const recommendedWindows = [];
      ['creative', 'analytical', 'studying']?.forEach(category => {
        const windows = recommendations?.payload?.[category]?.windows || [];
        recommendedWindows?.push(...windows);
      });

      // Check if any work session overlaps with recommended windows
      workSessions?.forEach(session => {
        const sessionStart = new Date(`2000-01-01T${session?.startTime}`);
        const sessionEnd = new Date(`2000-01-01T${session?.endTime}`);

        recommendedWindows?.forEach(window => {
          const windowStart = new Date(`2000-01-01T${window?.start}`);
          const windowEnd = new Date(`2000-01-01T${window?.end}`);

          // Check for overlap
          if (sessionStart < windowEnd && sessionEnd > windowStart) {
            alignmentScore += 20;
            reasons?.push('Worked during recommended window');
          }
        });
      });
    }

    // Check if respected energy levels
    const avgEfficiency = workSessions?.reduce((sum, s) => sum + (parseInt(s?.efficiency) || 0), 0) / workSessions?.length;
    if (avgEfficiency >= 7) {
      alignmentScore += 30;
      reasons?.push('High efficiency maintained');
    }

    // Check if energy level matched work intensity
    if (dailyLog?.energyLevel) {
      const energyScore = parseInt(dailyLog?.energyLevel);
      if (energyScore >= 7 && avgEfficiency >= 7) {
        alignmentScore += 20;
        reasons?.push('Energy matched work intensity');
      } else if (energyScore <= 5 && workSessions?.length <= 2) {
        alignmentScore += 20;
        reasons?.push('Respected low energy');
      }
    }

    // Check sleep quality alignment
    if (dailyLog?.sleepQuality === 'great' || dailyLog?.sleepQuality === 'good') {
      alignmentScore += 15;
      reasons?.push('Good sleep foundation');
    }

    // Check if didn't overwork
    const totalWorkMinutes = workSessions?.reduce((sum, s) => {
      const start = new Date(`2000-01-01T${s?.startTime}`);
      const end = new Date(`2000-01-01T${s?.endTime}`);
      return sum + (end - start) / (1000 * 60);
    }, 0);

    if (totalWorkMinutes <= 480) { // 8 hours or less
      alignmentScore += 15;
      reasons?.push('Sustainable work duration');
    }

    return {
      aligned: alignmentScore >= 60,
      score: Math.min(alignmentScore, 100),
      reasons
    };
  },

  // Get recent alignment days count (last 14 days)
  async getRecentAlignmentDays(userId) {
    if (isDemoMode(userId)) {
      return { data: { count: 8, score: 75 }, error: null };
    }

    try {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo?.setDate(fourteenDaysAgo?.getDate() - 14);
      const startDate = fourteenDaysAgo?.toISOString()?.split('T')?.[0];

      const { data: logs, error } = await supabase?.from('daily_logs')?.select('*, work_sessions(*)')?.eq('user_id', userId)?.gte('log_date', startDate)?.order('log_date', { ascending: false });

      if (error) return { data: null, error };

      let alignedDays = 0;
      let totalScore = 0;

      // Filter out rest days before calculating alignment
      for (const log of logs) {
        const isRest = await restDayService?.isRestDay(userId, log?.log_date);
        if (!isRest) {
          const alignment = this.calculateDailyAlignment(log, log?.work_sessions, null);
          if (alignment?.aligned) {
            alignedDays++;
            totalScore += alignment?.score;
          }
        }
      }

      const avgScore = alignedDays > 0 ? Math.round(totalScore / alignedDays) : 0;

      return { data: { count: alignedDays, score: avgScore }, error: null };
    } catch (error) {
      console.error('Get recent alignment days error:', error);
      return { data: null, error };
    }
  },

  // Generate consistency moments
  async generateConsistencyMoments(userId) {
    if (isDemoMode(userId)) {
      return {
        data: [
          { type: 'focus', message: 'You protected your focus window 3 times this week.' },
          { type: 'energy', message: "You didn't force late-night work this week." }
        ],
        error: null
      };
    }

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo?.setDate(sevenDaysAgo?.getDate() - 7);
      const startDate = sevenDaysAgo?.toISOString()?.split('T')?.[0];

      const { data: logs, error } = await supabase?.from('daily_logs')?.select('*, work_sessions(*)')?.eq('user_id', userId)?.gte('log_date', startDate)?.order('log_date', { ascending: false });

      if (error) return { data: [], error };

      const moments = [];

      // Filter out rest days
      const activeLogs = [];
      for (const log of logs) {
        const isRest = await restDayService?.isRestDay(userId, log?.log_date);
        if (!isRest) {
          activeLogs?.push(log);
        }
      }

      // Check for protected focus windows
      let focusWindowCount = 0;
      activeLogs?.forEach(log => {
        log?.work_sessions?.forEach(session => {
          const efficiency = parseInt(session?.efficiency);
          if (efficiency >= 8) {
            focusWindowCount++;
          }
        });
      });

      if (focusWindowCount >= 3) {
        moments?.push({
          type: 'focus',
          message: `You protected your focus window ${focusWindowCount} times this week.`
        });
      }

      // Check for avoiding late-night work
      let lateNightSessions = 0;
      activeLogs?.forEach(log => {
        log?.work_sessions?.forEach(session => {
          const startHour = parseInt(session?.start_time?.split(':')?.[0]);
          if (startHour >= 22 || startHour <= 5) {
            lateNightSessions++;
          }
        });
      });

      if (lateNightSessions === 0 && activeLogs?.length >= 5) {
        moments?.push({
          type: 'rest',
          message: "You didn't force late-night work this week."
        });
      }

      // Check for respecting low energy days
      let lowEnergyRespected = 0;
      activeLogs?.forEach(log => {
        const energyLevel = parseInt(log?.energy_level);
        const sessionCount = log?.work_sessions?.length || 0;
        if (energyLevel <= 5 && sessionCount <= 2) {
          lowEnergyRespected++;
        }
      });

      if (lowEnergyRespected >= 2) {
        moments?.push({
          type: 'energy',
          message: 'You respected your low energy days this week.'
        });
      }

      return { data: moments, error: null };
    } catch (error) {
      console.error('Generate consistency moments error:', error);
      return { data: [], error };
    }
  },

  // Check and award evolution badges
  async checkEvolutionBadges(userId) {
    if (isDemoMode(userId)) {
      return {
        data: {
          badges: ['found-rhythm', 'energy-listener'],
          newBadge: null
        },
        error: null
      };
    }

    try {
      // Get user profile to check existing badges
      const { data: profile, error: profileError } = await supabase?.from('user_profiles')?.select('evolution_badges')?.eq('user_id', userId)?.single();

      if (profileError) return { data: { badges: [], newBadge: null }, error: profileError };

      const existingBadges = profile?.evolution_badges || [];
      let newBadge = null;

      // Get historical data for badge checks
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo?.setDate(thirtyDaysAgo?.getDate() - 30);
      const startDate = thirtyDaysAgo?.toISOString()?.split('T')?.[0];

      const { data: logs, error: logsError } = await supabase?.from('daily_logs')?.select('*, work_sessions(*)')?.eq('user_id', userId)?.gte('log_date', startDate)?.order('log_date', { ascending: false });

      if (logsError) return { data: { badges: existingBadges, newBadge: null }, error: logsError };

      // Filter out rest days
      const activeLogs = [];
      for (const log of logs) {
        const isRest = await restDayService?.isRestDay(userId, log?.log_date);
        if (!isRest) {
          activeLogs?.push(log);
        }
      }

      // Badge: Found your rhythm (worked during optimal windows 10+ times)
      if (!existingBadges?.includes('found-rhythm')) {
        let optimalWorkCount = 0;
        activeLogs?.forEach(log => {
          log?.work_sessions?.forEach(session => {
            const efficiency = parseInt(session?.efficiency);
            const startHour = parseInt(session?.start_time?.split(':')?.[0]);
            if (efficiency >= 4 && startHour >= 8 && startHour <= 17) {
              optimalWorkCount++;
            }
          });
        });

        if (optimalWorkCount >= 10) {
          existingBadges?.push('found-rhythm');
          newBadge = 'found-rhythm';
        }
      }

      // Badge: Stopped forcing it (respected low energy 5+ times)
      if (!existingBadges?.includes('stopped-forcing')) {
        let respectCount = 0;
        activeLogs?.forEach(log => {
          const energyLevel = parseInt(log?.energy_level);
          const sessionCount = log?.work_sessions?.length || 0;
          if (energyLevel <= 5 && sessionCount <= 2) {
            respectCount++;
          }
        });

        if (respectCount >= 5) {
          existingBadges?.push('stopped-forcing');
          newBadge = newBadge || 'stopped-forcing';
        }
      }

      // Badge: Protected deep work (8+ efficiency sessions 15+ times)
      if (!existingBadges?.includes('protected-deep-work')) {
        let deepWorkCount = 0;
        activeLogs?.forEach(log => {
          log?.work_sessions?.forEach(session => {
            const efficiency = parseInt(session?.efficiency);
            if (efficiency >= 8) {
              deepWorkCount++;
            }
          });
        });

        if (deepWorkCount >= 15) {
          existingBadges?.push('protected-deep-work');
          newBadge = newBadge || 'protected-deep-work';
        }
      }

      // Update profile with new badges if any were earned
      if (newBadge) {
        await supabase?.from('user_profiles')?.update({ evolution_badges: existingBadges })?.eq('user_id', userId);
      }

      return { data: { badges: existingBadges, newBadge }, error: null };
    } catch (error) {
      console.error('Check evolution badges error:', error);
      return { data: { badges: [], newBadge: null }, error };
    }
  }
};