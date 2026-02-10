import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DemoModeBanner from '../../components/DemoModeBanner';
import TimerDisplay from './components/TimerDisplay';
import SessionControls from './components/SessionControls';
import MotivationalText from './components/MotivationalText';
import ManualLogToggle from './components/ManualLogToggle';
import SessionStats from './components/SessionStats';

const PomodoroTimer = () => {
  const { user, userProfile, isDemoMode } = useAuth();
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
      if (!isRunning) {
        setTimeRemaining(newDurations?.[sessionType]);
      }
    }
  }, [userProfile, isDemoMode, sessionType, isRunning]);

  useEffect(() => {
    let interval = null;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      // Timer completed
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (sessionType === 'focus') {
      setCompletedPomodoros(prev => prev + 1);
      // Auto-switch to break
      const nextBreak = (completedPomodoros + 1) % pomodorosUntilLongBreak === 0 ? 'long-break' : 'short-break';
      setSessionType(nextBreak);
      setTimeRemaining(sessionDurations?.[nextBreak]);
    } else {
      // Break completed, switch to focus
      setSessionType('focus');
      setTimeRemaining(sessionDurations?.['focus']);
    }
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(sessionDurations?.[sessionType]);
  };

  const handleSessionTypeChange = (type) => {
    setSessionType(type);
    setTimeRemaining(sessionDurations?.[type]);
    setIsRunning(false);
  };

  const handleManualLogToggle = () => {
    setShowManualLog(!showManualLog);
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
            Focus Session
          </h1>
          <p className="text-sm text-muted-foreground tracking-wide">
            Study with intention. Track with precision.
          </p>
        </div>

        {/* Session Type Selector */}
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

        {/* Timer Display */}
        <TimerDisplay 
          timeRemaining={timeRemaining} 
          totalTime={sessionDurations?.[sessionType]}
          sessionType={sessionType}
        />

        {/* Motivational Text (only during focus sessions) */}
        {sessionType === 'focus' && isRunning && (
          <MotivationalText />
        )}

        {/* Session Controls */}
        <SessionControls 
          isRunning={isRunning}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
        />

        {/* Session Stats */}
        <SessionStats completedPomodoros={completedPomodoros} />

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