// Demo data for unauthenticated users
// Provides realistic seeded data for full exploration of Volta

const today = new Date();
const formatDate = (daysAgo = 0) => {
  const date = new Date(today);
  date?.setDate(date?.getDate() - daysAgo);
  return date?.toISOString()?.split('T')?.[0];
};

const formatTime = (hour, minute = 0) => {
  return `${String(hour)?.padStart(2, '0')}:${String(minute)?.padStart(2, '0')}:00`;
};

// Demo user profile
export const demoUserProfile = {
  id: 'demo-user',
  email: 'demo@volta.app',
  fullName: 'Demo User',
  displayName: 'Demo User',
  timezone: 'America/Los_Angeles',
  role: 'user',
  evolutionBadges: ['first_week', 'consistency_3'],
  createdAt: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)?.toISOString()
};

// Check if demo mode should be active
export const isDemoMode = (userId) => {
  // Force demo mode if localStorage flag is set
  if (typeof window !== 'undefined') {
    const forceDemoMode = localStorage.getItem('volta_force_demo_mode');
    if (forceDemoMode === 'true') return true;
  }
  // Otherwise, demo mode if no user or user is demo user
  return !userId || userId === 'demo-user';
};

// Check if user has any data
export const userHasData = async (supabase, userId) => {
  if (!userId || isDemoMode(userId)) return false;
  
  try {
    const { data: logs } = await supabase?.from('daily_logs')?.select('id')?.eq('user_id', userId)?.limit(1);
    
    return logs && logs?.length > 0;
  } catch (error) {
    console.error('Error checking user data:', error);
    return false;
  }
};

// Generate demo daily logs for the past 14 days
export const demoDailyLogs = Array.from({ length: 14 }, (_, i) => {
  const daysAgo = i;
  const sleepHours = 6.5 + Math.random() * 2; // 6.5-8.5 hours
  const sleepQuality = Math.floor(3 + Math.random() * 3); // 3-5
  const caffeineTotal = Math.floor(100 + Math.random() * 200); // 100-300mg
  const energyLevel = Math.floor(3 + Math.random() * 3); // 3-5
  
  return {
    id: `demo-log-${i}`,
    userId: 'demo-user',
    logDate: formatDate(daysAgo),
    sleepHours: parseFloat(sleepHours?.toFixed(1)),
    sleepQuality,
    caffeineTotal,
    energyLevel,
    moodTone: ['calm', 'focused', 'energized', 'neutral']?.[Math.floor(Math.random() * 4)],
    notes: i % 3 === 0 ? 'Felt productive today' : null,
    createdAt: new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000)?.toISOString(),
    // Add work sessions directly to log for immediate availability
    workSessions: Array.from({ length: 2 + Math.floor(Math.random() * 3) }, (_, j) => {
      const category = ['creative', 'analytical', 'studying']?.[Math.floor(Math.random() * 3)];
      const startHour = 8 + Math.floor(Math.random() * 10);
      const duration = 1 + Math.floor(Math.random() * 3);
      const efficiency = 3 + Math.floor(Math.random() * 3);
      
      return {
        id: `demo-session-${i}-${j}`,
        userId: 'demo-user',
        dailyLogId: `demo-log-${i}`,
        category,
        startTime: formatTime(startHour),
        endTime: formatTime(startHour + duration),
        efficiency,
        felt: ['focused', 'productive', 'flow state', null]?.[Math.floor(Math.random() * 4)],
        tags: j % 2 === 0 ? ['deep work', 'morning'] : null,
        sessionDate: formatDate(daysAgo),
        createdAt: new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000)?.toISOString()
      };
    }),
    // Add productivity scores directly to log
    productivityScores: [{
      id: `demo-score-${i}`,
      userId: 'demo-user',
      dailyLogId: `demo-log-${i}`,
      scoreDate: formatDate(daysAgo),
      score: 65 + Math.floor(Math.random() * 30), // 65-95
      caption: ['Strong day', 'Solid performance', 'Peak focus', 'Good rhythm']?.[Math.floor(Math.random() * 4)],
      explanation: 'Consistent energy and focus throughout the day',
      createdAt: new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000)?.toISOString()
    }]
  };
});

// Generate demo work sessions
export const demoWorkSessions = [];
demoDailyLogs?.forEach((log, logIndex) => {
  const sessionsCount = 2 + Math.floor(Math.random() * 3); // 2-4 sessions per day
  
  for (let i = 0; i < sessionsCount; i++) {
    const category = ['creative', 'analytical', 'studying']?.[Math.floor(Math.random() * 3)];
    const startHour = 8 + Math.floor(Math.random() * 10); // 8am-6pm
    const duration = 1 + Math.floor(Math.random() * 3); // 1-3 hours
    const efficiency = 3 + Math.floor(Math.random() * 3); // 3-5
    
    demoWorkSessions?.push({
      id: `demo-session-${logIndex}-${i}`,
      userId: 'demo-user',
      dailyLogId: log?.id,
      category,
      startTime: formatTime(startHour),
      endTime: formatTime(startHour + duration),
      efficiency,
      felt: ['focused', 'productive', 'flow state', null]?.[Math.floor(Math.random() * 4)],
      tags: i % 2 === 0 ? ['deep work', 'morning'] : null,
      sessionDate: log?.logDate,
      createdAt: log?.createdAt
    });
  }
});

// Demo commitments (weekly schedule)
export const demoCommitments = [
  {
    id: 'demo-commit-1',
    userId: 'demo-user',
    title: 'Team Standup',
    day: 1, // Monday
    startTime: '09:00:00',
    endTime: '09:30:00',
    type: 'meeting',
    createdAt: new Date()?.toISOString()
  },
  {
    id: 'demo-commit-2',
    userId: 'demo-user',
    title: 'Focus Block',
    day: 1,
    startTime: '14:00:00',
    endTime: '16:00:00',
    type: 'work',
    createdAt: new Date()?.toISOString()
  },
  {
    id: 'demo-commit-3',
    userId: 'demo-user',
    title: 'Client Call',
    day: 2, // Tuesday
    startTime: '11:00:00',
    endTime: '12:00:00',
    type: 'meeting',
    createdAt: new Date()?.toISOString()
  },
  {
    id: 'demo-commit-4',
    userId: 'demo-user',
    title: 'Deep Work',
    day: 3, // Wednesday
    startTime: '10:00:00',
    endTime: '12:00:00',
    type: 'work',
    createdAt: new Date()?.toISOString()
  },
  {
    id: 'demo-commit-5',
    userId: 'demo-user',
    title: 'Project Review',
    day: 4, // Thursday
    startTime: '15:00:00',
    endTime: '16:00:00',
    type: 'meeting',
    createdAt: new Date()?.toISOString()
  },
  {
    id: 'demo-commit-6',
    userId: 'demo-user',
    title: 'Planning Session',
    day: 5, // Friday
    startTime: '09:00:00',
    endTime: '10:00:00',
    type: 'meeting',
    createdAt: new Date()?.toISOString()
  }
];

// Demo recommendations
export const demoRecommendations = {
  overall: {
    id: 'demo-rec-overall',
    userId: 'demo-user',
    dateGeneratedFor: formatDate(0),
    context: 'overall',
    payload: {
      creative: {
        windows: [
          { start: '09:00', end: '11:30', confidenceLevel: 'high' }
        ],
        reason: 'Your creative sessions rate higher mid-morning after 7+ hours sleep.'
      },
      analytical: {
        windows: [
          { start: '10:00', end: '12:30', confidenceLevel: 'high' }
        ],
        reason: 'Analytical work peaks late morning with consistent energy levels.'
      },
      studying: {
        windows: [
          { start: '08:00', end: '10:00', confidenceLevel: 'high' }
        ],
        reason: 'Early mornings show strongest retention patterns.'
      }
    },
    confidence: 0.82,
    createdAt: new Date()?.toISOString()
  },
  thisWeek: {
    id: 'demo-rec-week',
    userId: 'demo-user',
    dateGeneratedFor: formatDate(0),
    context: 'this_week',
    payload: {
      creative: {
        windows: [
          { start: '09:30', end: '11:30', confidenceLevel: 'high' }
        ],
        reason: 'This week shows stronger morning creative flow.'
      },
      analytical: {
        windows: [
          { start: '10:00', end: '12:00', confidenceLevel: 'high' }
        ],
        reason: 'Midday analytical sessions performing well this week.'
      },
      studying: {
        windows: [
          { start: '08:30', end: '10:30', confidenceLevel: 'high' }
        ],
        reason: 'Morning study sessions maintaining consistency.'
      }
    },
    confidence: 0.85,
    createdAt: new Date()?.toISOString()
  }
};

// Demo ML Predictions
export const demoMLPredictions = {
  decisionFocused: [
    {
      type: 'creative_timing',
      action: 'Do 20 min creative work at 9:10 AM',
      outcome: 'your day score is +7 on average',
      confidence: 'high',
      sampleSize: 18,
      explanation: 'Based on 18 similar morning sessions, your productivity score averages 86 vs 79 at other times.'
    },
    {
      type: 'caffeine_timing',
      action: 'Avoid caffeine after 2pm',
      outcome: 'tomorrow\'s score is -12 with late caffeine',
      confidence: 'medium',
      sampleSize: 12,
      explanation: 'Based on 12 days with high/late caffeine, next-day scores average 68 vs 80 with normal timing.'
    },
    {
      type: 'sleep_optimization',
      action: 'Sleep 7-8 hours instead of <7',
      outcome: 'your score improves by +15 on average',
      confidence: 'high',
      sampleSize: 22,
      explanation: 'Based on 22 days with 7-8h sleep, scores average 84 vs 69 with less sleep.'
    }
  ],
  counterfactual: [
    {
      type: 'sleep',
      title: 'What if you sleep 6h vs 7h vs 8h?',
      options: {
        '6h': { avgScore: 68, sampleSize: 8 },
        '7h': { avgScore: 79, sampleSize: 12 },
        '8h': { avgScore: 86, sampleSize: 15 }
      },
      recommendation: '8h',
      confidence: 'high'
    },
    {
      type: 'caffeine',
      title: 'What if caffeine is 0mg / 150mg / 300mg?',
      options: {
        '0mg': { avgScore: 72, sampleSize: 6 },
        '150mg': { avgScore: 82, sampleSize: 14 },
        '300mg': { avgScore: 75, sampleSize: 9 }
      },
      recommendation: '150mg',
      confidence: 'high'
    },
    {
      type: 'timing',
      title: 'What if you study in the morning vs afternoon vs evening?',
      options: {
        'morning': { avgScore: 85, sampleSize: 16 },
        'afternoon': { avgScore: 78, sampleSize: 11 },
        'evening': { avgScore: 71, sampleSize: 8 }
      },
      recommendation: 'morning',
      confidence: 'medium'
    }
  ],
  dataSufficiency: {
    overall: 'good',
    byFeature: {
      sleep: 'sufficient',
      caffeine: 'sufficient',
      timing: 'sufficient',
      duration: 'sufficient'
    },
    recommendations: []
  }
};

// Demo productivity scores
export const demoProductivityScores = demoDailyLogs?.map((log, index) => {
  const sessions = demoWorkSessions?.filter(s => s?.sessionDate === log?.logDate);
  
  // Calculate score based on log data
  let score = 0;
  score += (log?.sleepQuality / 5) * 25;
  score += (log?.energyLevel / 5) * 20;
  
  if (sessions?.length > 0) {
    const avgEfficiency = sessions?.reduce((sum, s) => sum + s?.efficiency, 0) / sessions?.length;
    score += (avgEfficiency / 5) * 35;
    
    const totalMinutes = sessions?.reduce((sum, s) => {
      const start = parseInt(s?.startTime?.split(':')?.[0]) * 60 + parseInt(s?.startTime?.split(':')?.[1]);
      const end = parseInt(s?.endTime?.split(':')?.[0]) * 60 + parseInt(s?.endTime?.split(':')?.[1]);
      return sum + (end - start);
    }, 0);
    const hours = totalMinutes / 60;
    score += Math.min(20, (hours / 6) * 20);
  }
  
  score = Math.round(score);
  
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
  
  return {
    id: `demo-score-${index}`,
    userId: 'demo-user',
    dailyLogId: log?.id,
    scoreDate: log?.logDate,
    score,
    caption,
    explanation,
    createdAt: log?.createdAt
  };
});

// Demo weekly comparison data
export const demoWeeklyComparison = {
  id: 'demo-weekly-comp',
  userId: 'demo-user',
  weekStart: formatDate(7),
  weekEnd: formatDate(0),
  insight: 'Your best creative time shifted earlier by 45 minutes this week.',
  createdAt: new Date()?.toISOString()
};

// Demo reflective insights
export const demoReflectiveInsights = [
  'Mornings are becoming your creative home.',
  'Your best thinking happens earlier when sleep is consistent.',
  'Late afternoons show stronger analytical patterns.',
  'Early sessions align with your natural energy peaks.'
];

// Demo recognition messages
export const demoRecognitionMessages = [
  'You used your best creative window today.',
  'You protected a deep-work block.',
  'You respected your energy today.',
  'You aligned with your natural rhythm.'
];

// Demo advanced insights data
export const demoAdvancedInsights = {
  sleepCorrelation: {
    optimalRange: '7-8',
    avgProductivityBySleep: {
      '<6': 58,
      '6-7': 68,
      '7-8': 82,
      '8-9': 79,
      '>9': 65
    },
    insight: 'Your productivity peaks with 7-8 hours of sleep (avg score: 82). Consistency in this range shows 20% higher performance.'
  },
  caffeineImpact: {
    optimalRange: '100-200mg',
    avgEfficiencyByCaffeine: {
      '0': '3.2',
      '1-100': '3.8',
      '100-200': '4.3',
      '200-300': '4.0',
      '>300': '3.5'
    },
    insight: 'Your focus efficiency peaks with 100-200mg caffeine (avg 4.3/5). This range shows 34% better focus than baseline.'
  },
  optimalFocusTimes: {
    morningScore: '4.2',
    afternoonScore: '3.8',
    eveningScore: '3.4',
    bestPeriod: 'morning',
    hourlyEfficiency: {
      '8': '4.5',
      '9': '4.3',
      '10': '4.2',
      '14': '3.9',
      '15': '3.8',
      '19': '3.5'
    },
    insight: 'Your morning sessions show highest efficiency (avg 4.2/5). Peak hours: 8:00 (4.5/5), 9:00 (4.3/5), 10:00 (4.2/5).'
  }
};

// Get today's demo data
export const getTodayDemoData = () => {
  const todayLog = demoDailyLogs?.[0]; // Most recent
  const todaySessions = demoWorkSessions?.filter(s => s?.sessionDate === todayLog?.logDate);
  const todayScore = demoProductivityScores?.[0];
  
  return {
    dailyLog: todayLog,
    workSessions: todaySessions,
    productivityScore: todayScore
  };
};

export default {
  demoDailyLogs,
  demoWorkSessions,
  demoCommitments,
  demoRecommendations,
  demoProductivityScores,
  demoWeeklyComparison,
  demoReflectiveInsights,
  demoRecognitionMessages,
  demoAdvancedInsights,
  isDemoMode,
  getTodayDemoData
};