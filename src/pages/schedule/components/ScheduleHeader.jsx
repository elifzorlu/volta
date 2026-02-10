import Icon from '../../../components/AppIcon';

const ScheduleHeader = () => {
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon
            name="CalendarClock"
            size={24}
            color="var(--color-accent)"
            strokeWidth={2}
          />
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
          Schedule
        </h1>
      </div>
      <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
        Manage your busy hours and commitments. Volta will avoid recommending focus times during your scheduled activities.
      </p>
    </div>
  );
};

export default ScheduleHeader;