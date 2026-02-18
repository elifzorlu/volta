import Icon from '../../../components/AppIcon';

const DailyLogSummary = ({ logData }) => {
  const dailyContext = logData?.dailyContext || {};
  const sessions = logData?.sessions || [];

  const contextItems = [
    {
      icon: 'Moon',
      label: 'Sleep',
      value: dailyContext?.sleepHours || '7.5',
      unit: 'hours',
      subValue: dailyContext?.sleepQuality || 'Good'
    },
    {
      icon: 'Coffee',
      label: 'Total caffeine today',
      value: dailyContext?.caffeineTotal || '0',
      unit: 'mg'
    },
    {
      icon: 'Zap',
      label: 'Energy',
      value: dailyContext?.energyLevel || 'Medium',
      unit: ''
    }
  ];

  const getCategoryLabel = (category) => {
    const labels = {
      creative: 'Creative',
      analytical: 'Analytical',
      studying: 'Studying',
      administrative: 'Admin',
      mixed: 'Mixed'
    };
    return labels?.[category] || category;
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '0h';
    const [startHour, startMin] = start?.split(':')?.map(Number);
    const [endHour, endMin] = end?.split(':')?.map(Number);
    const durationMin = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    const hours = Math.floor(durationMin / 60);
    const mins = durationMin % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getEfficiencyColor = (efficiency) => {
    const value = parseInt(efficiency);
    if (value >= 4) return 'text-green-600';
    if (value >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFeltBadgeColor = (felt) => {
    switch (felt) {
      case 'locked-in':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'scattered':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'forced':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="mb-16 md:mb-20 lg:mb-24">
      <div className="border-t border-border pt-8 md:pt-10 lg:pt-12">
        <h2 className="text-lg md:text-xl font-medium text-foreground mb-6 md:mb-8">
          Daily Log Summary
        </h2>
        
        {/* Daily Context */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Daily Context</h3>
          <div className="space-y-3">
            {contextItems?.map((item, index) => (
              <div 
                key={index}
                className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                    <Icon 
                      name={item?.icon} 
                      size={18} 
                      color="var(--color-muted-foreground)" 
                      strokeWidth={2}
                    />
                  </div>
                  <span className="text-sm text-foreground">
                    {item?.label}
                  </span>
                </div>
                
                <div className="text-right">
                  <div>
                    <span className="text-base font-medium text-foreground">
                      {item?.value}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      {item?.unit}
                    </span>
                  </div>
                  {item?.subValue && (
                    <span className="text-xs text-muted-foreground capitalize">
                      {item?.subValue}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Work Sessions */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Work Sessions ({sessions?.length})
          </h3>
          <div className="space-y-4">
            {sessions?.length > 0 ? (
              sessions?.map((session, index) => (
                <div 
                  key={index}
                  className="p-4 bg-muted/30 rounded-lg border border-border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-medium text-foreground">
                          {getCategoryLabel(session?.category)}
                        </span>
                        {session?.felt && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${getFeltBadgeColor(session?.felt)}`}>
                            {session?.felt}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon name="Clock" size={14} strokeWidth={2} />
                        <span>{session?.startTime} - {session?.endTime}</span>
                        <span>•</span>
                        <span>{calculateDuration(session?.startTime, session?.endTime)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${getEfficiencyColor(session?.efficiency)}`}>
                        {session?.efficiency}/5
                      </div>
                      <div className="text-xs text-muted-foreground">efficiency</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Briefcase" size={32} color="var(--color-muted-foreground)" className="mx-auto mb-2" />
                <p className="text-sm">No work sessions logged yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyLogSummary;