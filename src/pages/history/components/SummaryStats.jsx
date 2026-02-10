import Icon from '../../../components/AppIcon';

const SummaryStats = ({ stats }) => {
  const statItems = [
    { 
      label: 'Average Score', 
      value: stats?.average, 
      icon: 'TrendingUp',
      description: 'Your mean productivity score'
    },
    { 
      label: 'Highest Score', 
      value: stats?.highest, 
      icon: 'ArrowUp',
      description: 'Your best performing day'
    },
    { 
      label: 'Lowest Score', 
      value: stats?.lowest, 
      icon: 'ArrowDown',
      description: 'Your lowest performing day'
    },
    { 
      label: 'Total Days', 
      value: stats?.totalDays, 
      icon: 'Calendar',
      description: 'Days tracked in this period'
    }
  ];

  return (
    <div className="space-y-3 md:space-y-4 lg:space-y-5">
      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground mb-4 md:mb-5 lg:mb-6">
        Summary Statistics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-5">
        {statItems?.map((item, index) => (
          <div 
            key={index}
            className="bg-card border border-border rounded-md p-4 md:p-5 lg:p-6 transition-all duration-250 hover:border-accent/30"
          >
            <div className="flex items-start justify-between mb-2 md:mb-3 lg:mb-4">
              <div className="flex-1">
                <p className="text-xs md:text-sm lg:text-base text-muted-foreground mb-1">
                  {item?.label}
                </p>
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-accent">
                  {item?.value}
                </p>
              </div>
              <div className="bg-accent/10 rounded-md p-2 md:p-2.5 lg:p-3">
                <Icon 
                  name={item?.icon} 
                  size={20} 
                  color="var(--color-accent)"
                  strokeWidth={2}
                />
              </div>
            </div>
            <p className="text-xs md:text-sm lg:text-base text-muted-foreground">
              {item?.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryStats;