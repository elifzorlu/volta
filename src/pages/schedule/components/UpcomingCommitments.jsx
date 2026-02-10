import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UpcomingCommitments = ({ commitments, onEditCommitment, onDeleteCommitment }) => {
  const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const sortedCommitments = [...commitments]?.sort((a, b) => {
    const dayDiff = dayOrder?.indexOf(a?.day) - dayOrder?.indexOf(b?.day);
    if (dayDiff !== 0) return dayDiff;
    
    const aTime = parseInt(a?.startTime?.split(':')?.[0]);
    const bTime = parseInt(b?.startTime?.split(':')?.[0]);
    return aTime - bTime;
  });

  const getTypeIcon = (type) => {
    const iconMap = {
      meeting: 'Users',
      appointment: 'Calendar',
      personal: 'User',
      class: 'GraduationCap',
      workout: 'Dumbbell',
      other: 'Clock'
    };
    return iconMap?.[type] || 'Clock';
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time?.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-muted/30 rounded-lg border border-border p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-medium text-foreground mb-6">
        Upcoming Commitments
      </h2>

      {sortedCommitments?.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <Icon
              name="CalendarX"
              size={24}
              color="var(--color-muted-foreground)"
              strokeWidth={2}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            No commitments scheduled yet.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Add your busy hours to help Volta recommend better focus times.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedCommitments?.map((commitment) => (
            <div
              key={commitment?.id}
              className="bg-background rounded-lg p-4 border border-border hover:border-accent/50 transition-all duration-200 group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon
                    name={getTypeIcon(commitment?.type)}
                    size={18}
                    color="var(--color-accent)"
                    strokeWidth={2}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground truncate">
                    {commitment?.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{commitment?.day}</span>
                    <span>•</span>
                    <span>
                      {formatTime(commitment?.startTime)} - {formatTime(commitment?.endTime)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      iconName="Pencil"
                      onClick={() => onEditCommitment(commitment?.id, commitment)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      iconName="Trash2"
                      onClick={() => onDeleteCommitment(commitment?.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingCommitments;