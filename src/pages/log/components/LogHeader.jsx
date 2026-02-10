import Icon from '../../../components/AppIcon';

const LogHeader = () => {
  const currentDate = new Date();
  const formattedDate = currentDate?.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const getGreeting = () => {
    const hour = currentDate?.getHours();
    if (hour < 12) return 'Good morning.';
    if (hour < 17) return 'Good afternoon.';
    return 'Good evening.';
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 lg:mb-12">
      <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon 
            name="PenLine" 
            size={20} 
            color="var(--color-accent)" 
            strokeWidth={2}
            className="lg:w-6 lg:h-6"
          />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">
            {getGreeting()}
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            {formattedDate}
          </p>
        </div>
      </div>

      <div className="space-y-2 lg:space-y-3">
        <p className="text-base lg:text-lg text-foreground/90">
          Take a moment to reflect on your day.
        </p>
        <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
          Answer each question thoughtfully. Your responses help generate personalized insights about your productivity patterns and well-being.
        </p>
      </div>
    </div>
  );
};

export default LogHeader;