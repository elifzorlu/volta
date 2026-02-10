const SessionStats = ({ completedPomodoros }) => {
  return (
    <div className="mb-12">
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <div className="text-sm text-muted-foreground mb-2 tracking-wide">
          Completed Today
        </div>
        <div className="text-4xl font-normal text-accent" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {completedPomodoros}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {completedPomodoros === 1 ? 'Pomodoro' : 'Pomodoros'}
        </div>
      </div>
    </div>
  );
};

export default SessionStats;