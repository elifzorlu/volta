import { Calendar, Coffee, Zap, Clock, TrendingUp } from 'lucide-react';

const PastLogsSection = ({ logs }) => {
  if (!logs || logs?.length === 0) {
    return (
      <div className="mt-8 p-8 bg-card border border-border rounded-lg text-center">
        <p className="text-muted-foreground">No logs available yet. Start logging your daily productivity to see your history here.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString?.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateTotalFocusTime = (sessions) => {
    if (!sessions || sessions?.length === 0) return 0;
    return sessions?.reduce((total, session) => {
      const duration = session?.duration || 0;
      return total + duration;
    }, 0);
  };

  const calculateAverageEfficiency = (sessions) => {
    if (!sessions || sessions?.length === 0) return 0;
    const totalEfficiency = sessions?.reduce((sum, session) => sum + (session?.efficiency || 0), 0);
    return (totalEfficiency / sessions?.length)?.toFixed(1);
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">Past Logs</h2>
        <p className="text-sm text-muted-foreground">Detailed view of your daily entries</p>
      </div>

      <div className="space-y-4">
        {logs?.map((log) => {
          const totalFocusTime = calculateTotalFocusTime(log?.workSessions);
          const avgEfficiency = calculateAverageEfficiency(log?.workSessions);
          const hours = Math.floor(totalFocusTime / 60);
          const minutes = totalFocusTime % 60;

          return (
            <div 
              key={log?.id} 
              className="bg-card border border-border rounded-lg p-4 md:p-6 hover:border-primary/50 transition-colors"
            >
              {/* Date Header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  {formatDate(log?.logDate)}
                </h3>
              </div>

              {/* Daily Context Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Sleep */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Sleep</p>
                    <p className="text-sm font-medium text-foreground">
                      {log?.sleepLength ? `${log?.sleepLength} hrs` : 'Not logged'}
                    </p>
                    {log?.wakeUpTime && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Woke at {formatTime(log?.wakeUpTime)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Caffeine */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Coffee className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Caffeine</p>
                    <p className="text-sm font-medium text-foreground">
                      {log?.caffeineTotal !== null && log?.caffeineTotal !== undefined
                        ? `${log?.caffeineTotal} mg`
                        : 'Not logged'}
                    </p>
                  </div>
                </div>

                {/* Energy Level */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Zap className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Energy Level</p>
                    <p className="text-sm font-medium text-foreground">
                      {log?.energyLevel ? `${log?.energyLevel}/5` : 'Not logged'}
                    </p>
                  </div>
                </div>

                {/* Focus Time */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Focus</p>
                    <p className="text-sm font-medium text-foreground">
                      {totalFocusTime > 0 
                        ? `${hours}h ${minutes}m` 
                        : 'No sessions'}
                    </p>
                    {avgEfficiency > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg efficiency: {avgEfficiency}/5
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Work Sessions */}
              {log?.workSessions && log?.workSessions?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-3">
                    Work Sessions ({log?.workSessions?.length})
                  </p>
                  <div className="space-y-2">
                    {log?.workSessions?.map((session, index) => (
                      <div 
                        key={session?.id || index} 
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {session?.category || 'Work Session'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(session?.startTime)} - {formatTime(session?.endTime)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            {session?.duration} min
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Efficiency: {session?.efficiency || 0}/5
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {log?.notes && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm text-foreground">{log?.notes}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PastLogsSection;