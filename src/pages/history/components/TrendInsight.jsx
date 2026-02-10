import Icon from '../../../components/AppIcon';

const TrendInsight = ({ trend }) => {
  const getTrendIcon = () => {
    if (trend?.direction === 'up') return 'TrendingUp';
    if (trend?.direction === 'down') return 'TrendingDown';
    return 'Minus';
  };

  const getTrendColor = () => {
    if (trend?.direction === 'up') return 'var(--color-accent)';
    if (trend?.direction === 'down') return 'var(--color-error)';
    return 'var(--color-muted-foreground)';
  };

  return (
    <div className="bg-card border border-border rounded-md p-4 md:p-5 lg:p-6 mb-8 md:mb-10 lg:mb-12">
      <div className="flex items-start gap-3 md:gap-4 lg:gap-5">
        <div 
          className="bg-accent/10 rounded-md p-2 md:p-2.5 lg:p-3 flex-shrink-0"
          style={{ backgroundColor: `${getTrendColor()}15` }}
        >
          <Icon 
            name={getTrendIcon()} 
            size={24} 
            color={getTrendColor()}
            strokeWidth={2}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg lg:text-xl font-semibold text-foreground mb-2 md:mb-2.5 lg:mb-3">
            {trend?.title}
          </h3>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed">
            {trend?.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrendInsight;