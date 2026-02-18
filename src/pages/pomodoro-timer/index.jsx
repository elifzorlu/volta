import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DemoModeBanner from '../../components/DemoModeBanner';
import TimerDisplay from './components/TimerDisplay';
import SessionControls from './components/SessionControls';
import MotivationalText from './components/MotivationalText';
import ManualLogToggle from './components/ManualLogToggle';
import SessionStats from './components/SessionStats';
import BreakActivitySuggestion from './components/BreakActivitySuggestion';
import { Clock } from 'lucide-react';
import { 
  requestNotificationPermission, 
  getNotificationTimes, 
  shouldShowNotification, 
  showDailyLogReminder,
  showFocusTimerComplete,
  showBreakTimerComplete
} from '../../services/notificationService';
import { trackPomodoroEvent, trackScreenView } from '../../utils/analytics';
import { trackHabitEvent } from '../../utils/analytics';
import { dailyLogsService } from '../../services/voltaService';

const PomodoroTimer = () => {
  const { user, userProfile, isDemoMode } = useAuth();
  const [mode, setMode] = useState('timer'); // 'timer' or 'stopwatch'
  const [sessionType, setSessionType] = useState('focus'); // 'focus', 'short-break', 'long-break'
  const [sessionDurations, setSessionDurations] = useState({
    'focus': 25 * 60,
    'short-break': 5 * 60,
    'long-break': 15 * 60
  });
  const [pomodorosUntilLongBreak, setPomodorosUntilLongBreak] = useState(4);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showManualLog, setShowManualLog] = useState(false);
  
  // Stopwatch state
  const [elapsedTime, setElapsedTime] = useState(0);

  // Session tracking for auto-logging
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [showProductivityPrompt, setShowProductivityPrompt] = useState(false);
  const [productivityRating, setProductivityRating] = useState('');
  const [sessionFelt, setSessionFelt] = useState('');
  const [completedSessions, setCompletedSessions] = useState(0);

  // Track screen view on mount
  useEffect(() => {
    trackScreenView('Pomodoro Timer');
  }, []);

  // Load custom settings from user profile or localStorage
  useEffect(() => {
    let customSettings = null;

    if (isDemoMode) {
      // Load from localStorage in demo mode
      const savedSettings = localStorage.getItem('volta_settings');
      if (savedSettings) {
        customSettings = JSON.parse(savedSettings);
      }
    } else if (userProfile?.settings) {
      // Load from user profile when authenticated
      customSettings = userProfile?.settings;
    }

    if (customSettings) {
      const focusDuration = customSettings?.focusDuration || 25;
      const shortBreakDuration = customSettings?.shortBreakDuration || 5;
      const longBreakDuration = customSettings?.longBreakDuration || 15;
      const pomodorosCount = customSettings?.pomodorosUntilLongBreak || 4;

      const newDurations = {
        'focus': focusDuration * 60,
        'short-break': shortBreakDuration * 60,
        'long-break': longBreakDuration * 60
      };

      setSessionDurations(newDurations);
      setPomodorosUntilLongBreak(pomodorosCount);
      
      // Update current time remaining if not running
      if (!isRunning && mode === 'timer') {
        setTimeRemaining(newDurations?.[sessionType]);
      }
    }
  }, [userProfile, isDemoMode, sessionType, isRunning, mode]);

  // Timer countdown effect
  useEffect(() => {
    let interval = null;

    if (mode === 'timer' && isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (mode === 'timer' && timeRemaining === 0) {
      // Timer completed
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining, mode]);

  // Stopwatch count-up effect
  useEffect(() => {
    let interval = null;

    if (mode === 'stopwatch' && isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode]);

  // Notification scheduling effect
  useEffect(() => {
    let notificationInterval = null;

    const checkAndShowNotifications = async () => {
      if (!user) return;

      // Request permission if not already granted
      if (Notification?.permission === 'default') {
        await requestNotificationPermission();
      }

      if (Notification?.permission !== 'granted') return;

      // Get user's notification times and timezone
      const notificationTimes = await getNotificationTimes(user?.id);
      const timezone = userProfile?.timezone || 'America/Los_Angeles';

      // Check if it's time to show notification
      if (shouldShowNotification(notificationTimes, timezone)) {
        showDailyLogReminder();
      }
    };

    // Check every minute
    checkAndShowNotifications();
    notificationInterval = setInterval(checkAndShowNotifications, 60000);

    return () => {
      if (notificationInterval) clearInterval(notificationInterval);
    };
  }, [user, userProfile]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Track Pomodoro completion event
    trackPomodoroEvent('completed', {
      session_type: sessionType,
      mode: mode,
      completed_pomodoros: sessionType === 'focus' ? completedPomodoros + 1 : completedPomodoros,
      user_type: user?.id ? 'authenticated' : 'demo'
    });
    
    if (sessionType === 'focus') {
      setCompletedPomodoros(prev => prev + 1);
      // Show focus completion notification
      if (Notification?.permission === 'granted') {
        showFocusTimerComplete();
      }
      // Show productivity prompt after focus session
      setShowProductivityPrompt(true);
      // Auto-switch to break
      const nextBreak = (completedPomodoros + 1) % pomodorosUntilLongBreak === 0 ? 'long-break' : 'short-break';
      setSessionType(nextBreak);
      setTimeRemaining(sessionDurations?.[nextBreak]);
    } else {
      // Show break completion notification
      if (Notification?.permission === 'granted') {
        showBreakTimerComplete(sessionType);
      }
      // Break completed, switch to focus
      setSessionType('focus');
      setTimeRemaining(sessionDurations?.['focus']);
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    setSessionStartTime(new Date());
    
    // Track Pomodoro start event
    trackPomodoroEvent('started', {
      session_type: sessionType,
      mode: mode,
      duration: mode === 'timer' ? timeRemaining : null,
      user_type: user?.id ? 'authenticated' : 'demo'
    });
  };

  const handlePause = () => {
    setIsRunning(false);
    
    // Track Pomodoro pause event
    trackPomodoroEvent('paused', {
      session_type: sessionType,
      mode: mode,
      time_remaining: mode === 'timer' ? timeRemaining : null,
      elapsed_time: mode === 'stopwatch' ? elapsedTime : null
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'timer') {
      setTimeRemaining(sessionDurations?.[sessionType]);
    } else {
      setElapsedTime(0);
    }
  };

  const handleSessionTypeChange = (type) => {
    setSessionType(type);
    setTimeRemaining(sessionDurations?.[type]);
    setIsRunning(false);
  };

  const handleManualLogToggle = () => {
    setShowManualLog(!showManualLog);
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    if (newMode === 'timer') {
      setTimeRemaining(sessionDurations?.[sessionType]);
    } else {
      setElapsedTime(0);
    }
  };

  const adjustTime = (amount) => {
    if (mode === 'timer' && !isRunning) {
      const newTime = Math.max(60, timeRemaining + amount);
      setTimeRemaining(newTime);
    }
  };

  const handleSessionComplete = async () => {
    setShowProductivityPrompt(true);
  };

  const handleProductivitySubmit = async (productivityLevel, sessionFeeling) => {
    if (!user?.id && !isDemoMode) {
      console.error('No user session');
      setShowProductivityPrompt(false);
      return;
    }

    try {
      const today = new Date()?.toISOString()?.split('T')?.[0];
      const now = new Date();
      const startTime = new Date(now?.getTime() - (sessionDurations?.['focus'] * 1000));
      
      const userId = isDemoMode ? null : user?.id;

      // Fetch existing log to get daily context
      const { data: existingLog } = await dailyLogsService?.getByDate(userId, today);

      // Prepare daily context - use existing values or defaults
      const dailyContext = existingLog ? {
        sleepHours: existingLog?.sleepHours,
        sleepQuality: existingLog?.sleepQuality,
        caffeineTotal: existingLog?.caffeineTotal,
        energyLevel: existingLog?.energyLevel,
        moodTone: existingLog?.moodTone,
        notes: existingLog?.notes
      } : {
        sleepHours: 7,
        sleepQuality: 'good',
        caffeineTotal: 0,
        energyLevel: 'medium',
        moodTone: null,
        notes: null
      };

      // Create session data
      const sessionData = [{
        category: 'pomodoro',
        startTime: startTime?.toTimeString()?.slice(0, 5),
        endTime: now?.toTimeString()?.slice(0, 5),
        efficiency: productivityLevel,
        felt: sessionFeeling,
        tags: ['pomodoro', 'focus']
      }];

      // Save to database - this will append to existing sessions
      await dailyLogsService?.create(userId, dailyContext, sessionData, today);

      // Track analytics
      trackHabitEvent('pomodoro_completed', {
        duration: sessionDurations?.['focus'] / 60,
        productivity_level: productivityLevel,
        session_feeling: sessionFeeling,
        user_type: user?.id ? 'authenticated' : 'demo'
      });

      setShowProductivityPrompt(false);
      setCompletedSessions(prev => prev + 1);
    } catch (error) {
      console.error('Failed to save pomodoro session:', error);
      setShowProductivityPrompt(false);
    }
  };

  const handleProductivityCancel = () => {
    setShowProductivityPrompt(false);
    setProductivityRating('');
    setSessionFelt('');
    setSessionStartTime(null);
  };

  // Format duration for display (e.g., "25m", "5m")
  const formatDuration = (seconds) => {
    return `${Math.round(seconds / 60)}m`;
  };

  return (
    <div className="min-h-screen bg-black">
      <DemoModeBanner />
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        {/* Header */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-normal text-foreground tracking-tight mb-2">
            {mode === 'timer' ? 'Focus Session' : 'Stopwatch'}
          </h1>
          <p className="text-sm text-muted-foreground tracking-wide">
            {mode === 'timer' ? 'Study with intention. Track with precision.' : 'Track your time freely.'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex justify-center gap-3 mb-12">
          <button
            onClick={() => handleModeSwitch('timer')}
            className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all duration-300 ${
              mode === 'timer' ? 'bg-accent text-black' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Clock size={18} />
            Timer
          </button>
          <button
            onClick={() => handleModeSwitch('stopwatch')}
            className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all duration-300 ${
              mode === 'stopwatch' ? 'bg-accent text-black' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Clock size={18} />
            Stopwatch
          </button>
        </div>

        {/* Session Type Selector (Timer mode only) */}
        {mode === 'timer' && (
          <div className="flex justify-center gap-2 mb-12">
            <button
              onClick={() => handleSessionTypeChange('focus')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-300 ${
                sessionType === 'focus' ? 'bg-accent text-black' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Focus ({formatDuration(sessionDurations?.['focus'])})
            </button>
            <button
              onClick={() => handleSessionTypeChange('short-break')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-300 ${
                sessionType === 'short-break' ? 'bg-accent text-black' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Short Break ({formatDuration(sessionDurations?.['short-break'])})
            </button>
            <button
              onClick={() => handleSessionTypeChange('long-break')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-300 ${
                sessionType === 'long-break' ? 'bg-accent text-black' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Long Break ({formatDuration(sessionDurations?.['long-break'])})
            </button>
          </div>
        )}

        {/* Timer Display */}
        <TimerDisplay 
          timeRemaining={mode === 'timer' ? timeRemaining : elapsedTime}
          totalTime={mode === 'timer' ? sessionDurations?.[sessionType] : 0}
          sessionType={sessionType}
          mode={mode}
          onAdjustTime={adjustTime}
          isRunning={isRunning}
        />

        {/* Motivational Text (only during focus sessions) */}
        {mode === 'timer' && sessionType === 'focus' && isRunning && (
          <MotivationalText />
        )}

        {/* Break Activity Suggestion (only during breaks) */}
        {mode === 'timer' && (sessionType === 'short-break' || sessionType === 'long-break') && (
          <BreakActivitySuggestion sessionType={sessionType} />
        )}

        {/* Session Controls */}
        <SessionControls 
          isRunning={isRunning}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
        />

        {/* Session Stats (Timer mode only) */}
        {mode === 'timer' && (
          <SessionStats completedPomodoros={completedPomodoros} />
        )}

        {/* Manual Log Toggle */}
        <ManualLogToggle 
          showManualLog={showManualLog}
          onToggle={handleManualLogToggle}
        />

        {/* Productivity Prompt Modal */}
        {showProductivityPrompt && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Session Complete!</h3>
                <p className="text-sm text-muted-foreground">How productive was this session?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Productivity Level</label>
                  <div className="flex gap-2">
                    {['1', '2', '3', '4', '5']?.map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setProductivityRating(rating)}
                        className={`flex-1 py-3 rounded-md text-sm font-medium transition-all ${
                          productivityRating === rating
                            ? 'bg-accent text-black' :'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">1 = Barely productive, 5 = Extremely productive</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">How did it feel?</label>
                  <div className="flex gap-2">
                    {[{ value: 'locked-in', label: 'Locked-in' }, { value: 'scattered', label: 'Scattered' }, { value: 'forced', label: 'Forced' }]?.map(option => (
                      <button
                        key={option?.value}
                        type="button"
                        onClick={() => setSessionFelt(option?.value)}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                          sessionFelt === option?.value
                            ? 'bg-accent text-black' :'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {option?.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleProductivityCancel}
                  className="flex-1 py-2 px-4 rounded-md text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleProductivitySubmit}
                  disabled={!productivityRating}
                  className="flex-1 py-2 px-4 rounded-md text-sm font-medium bg-accent text-black hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;