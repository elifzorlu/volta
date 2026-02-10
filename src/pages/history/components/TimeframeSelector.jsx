
import Icon from '../../../components/AppIcon';

const TimeframeSelector = ({ activeTimeframe, onTimeframeChange }) => {
  const timeframes = [
    { id: 'week', label: '7 Days', icon: 'Calendar' },
    { id: 'month', label: '30 Days', icon: 'CalendarDays' },
    { id: 'quarter', label: '90 Days', icon: 'CalendarRange' }
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-8 md:mb-10 lg:mb-12">
      {timeframes?.map((timeframe) => (
        <button
          key={timeframe?.id}
          onClick={() => onTimeframeChange(timeframe?.id)}
          className={`
            flex items-center gap-2 px-4 md:px-6 lg:px-8 py-2 md:py-2.5 lg:py-3
            text-sm md:text-base lg:text-lg font-medium
            rounded-md transition-all duration-250
            ${activeTimeframe === timeframe?.id
              ? 'bg-accent/10 text-accent border border-accent' :'bg-transparent text-muted-foreground border border-border hover:bg-muted/50 hover:text-foreground'
            }
          `}
          aria-pressed={activeTimeframe === timeframe?.id}
        >
          <Icon 
            name={timeframe?.icon} 
            size={16} 
            color={activeTimeframe === timeframe?.id ? 'var(--color-accent)' : 'currentColor'}
            strokeWidth={2}
          />
          <span className="hidden md:inline">{timeframe?.label}</span>
          <span className="md:hidden">{timeframe?.id === 'week' ? '7D' : timeframe?.id === 'month' ? '30D' : '90D'}</span>
        </button>
      ))}
    </div>
  );
};

export default TimeframeSelector;