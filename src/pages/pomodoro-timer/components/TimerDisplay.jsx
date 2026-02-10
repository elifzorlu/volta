import { Plus, Minus } from 'lucide-react';

const TimerDisplay = ({ timeRemaining, totalTime, sessionType, mode, onAdjustTime, isRunning }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progress = mode === 'timer' ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;

  // Calculate circle properties
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const sessionLabels = {
    'focus': 'Focus Time',
    'short-break': 'Short Break',
    'long-break': 'Long Break'
  };

  // Generate clock hour markers (12 positions)
  const hourMarkers = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180); // Start from top (12 o'clock)
    const markerRadius = radius + 15;
    const x = 160 + markerRadius * Math.cos(angle);
    const y = 160 + markerRadius * Math.sin(angle);
    return { x, y, label: i === 0 ? 12 : i };
  });

  return (
    <div className="flex flex-col items-center justify-center mb-12">
      {/* Clock-style Circular Display */}
      <div className="relative w-80 h-80 flex items-center justify-center mb-6">
        {/* Outer Clock Face */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Clock border */}
          <circle
            cx="160"
            cy="160"
            r={radius + 20}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
            fill="none"
          />
          
          {/* Hour markers */}
          {hourMarkers?.map((marker, i) => (
            <g key={i}>
              <circle
                cx={marker?.x}
                cy={marker?.y}
                r="2"
                fill="rgba(255, 255, 255, 0.3)"
              />
              <text
                x={marker?.x}
                y={marker?.y + (i === 0 ? -8 : i === 6 ? 12 : marker?.y < 160 ? -8 : 12)}
                textAnchor="middle"
                className="text-[10px] fill-muted-foreground"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {marker?.label}
              </text>
            </g>
          ))}

          {/* Background Circle */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Progress Circle (Timer mode only) */}
          {mode === 'timer' && (
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
              className="transform -rotate-90 origin-center"
              style={{
                transition: 'stroke-dashoffset 1s linear'
              }}
            />
          )}

          {/* Stopwatch indicator (Stopwatch mode only) */}
          {mode === 'stopwatch' && isRunning && (
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="#39FF88"
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
          )}
        </svg>

        {/* Time Display */}
        <div className="text-center z-10">
          <div className="text-6xl md:text-7xl font-normal text-foreground tracking-tight" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {String(minutes)?.padStart(2, '0')}:{String(seconds)?.padStart(2, '0')}
          </div>
          <div className="text-sm text-muted-foreground mt-4 tracking-wide">
            {mode === 'timer' ? sessionLabels?.[sessionType] : 'Elapsed Time'}
          </div>
        </div>
      </div>
      {/* Time Adjustment Controls (Timer mode only, when not running) */}
      {mode === 'timer' && !isRunning && (
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAdjustTime?.(-300)}
              className="p-2 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
              title="Decrease 5 minutes"
            >
              <Minus size={16} />
              <span className="text-xs ml-1">5m</span>
            </button>
            <button
              onClick={() => onAdjustTime?.(-60)}
              className="p-2 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
              title="Decrease 1 minute"
            >
              <Minus size={16} />
              <span className="text-xs ml-1">1m</span>
            </button>
          </div>

          <div className="text-xs text-muted-foreground px-4">
            Adjust Time
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAdjustTime?.(60)}
              className="p-2 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
              title="Increase 1 minute"
            >
              <Plus size={16} />
              <span className="text-xs ml-1">1m</span>
            </button>
            <button
              onClick={() => onAdjustTime?.(300)}
              className="p-2 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
              title="Increase 5 minutes"
            >
              <Plus size={16} />
              <span className="text-xs ml-1">5m</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerDisplay;