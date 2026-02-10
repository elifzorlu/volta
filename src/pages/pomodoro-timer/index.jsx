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
      </div>
    </div>
  );
};

export default PomodoroTimer;