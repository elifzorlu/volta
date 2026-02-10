const TimerDisplay = ({ timeRemaining, totalTime, sessionType }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progress = ((totalTime - timeRemaining) / totalTime) * 100;

  // Calculate circle properties
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const sessionLabels = {
    'focus': 'Focus Time',
    'short-break': 'Short Break',
    'long-break': 'Long Break'
  };

  return (
    <div className="flex flex-col items-center justify-center mb-12">
      {/* Circular Progress */}
      <div className="relative w-80 h-80 flex items-center justify-center mb-6">
        {/* Background Circle */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="2"
            fill="none"
          />
          {/* Progress Circle */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="#39FF88"
            strokeWidth="2"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s linear'
            }}
          />
        </svg>

        {/* Time Display */}
        <div className="text-center z-10">
          <div className="text-6xl md:text-7xl font-normal text-foreground tracking-tight" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {String(minutes)?.padStart(2, '0')}:{String(seconds)?.padStart(2, '0')}
          </div>
          <div className="text-sm text-muted-foreground mt-4 tracking-wide">
            {sessionLabels?.[sessionType]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;