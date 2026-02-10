import { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import { habitLogsService } from '../../../services/voltaService';

const WeeklyHabitStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('thisWeek');

  useEffect(() => {
    loadWeeklyStats();
  }, [user?.id, selectedPeriod]);

  const getDateRange = () => {
    const today = new Date();
    const endDate = today?.toISOString()?.split('T')?.[0];
    
    let startDate;
    if (selectedPeriod === 'thisWeek') {
      const weekStart = new Date(today);
      weekStart?.setDate(today?.getDate() - 6);
      startDate = weekStart?.toISOString()?.split('T')?.[0];
    } else {
      const twoWeeksStart = new Date(today);
      twoWeeksStart?.setDate(today?.getDate() - 13);
      startDate = twoWeeksStart?.toISOString()?.split('T')?.[0];
    }
    
    return { startDate, endDate };
  };

  const loadWeeklyStats = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const { data, error } = await habitLogsService?.getWeeklyStats(
        user?.id,
        startDate,
        endDate
      );
      
      if (!error && data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load weekly stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 10) return { icon: 'TrendingUp', color: 'text-green-500' };
    if (trend < -10) return { icon: 'TrendingDown', color: 'text-red-500' };
    return { icon: 'Minus', color: 'text-muted-foreground' };
  };

  const getCompletionColor = (rate) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-blue-500';
    if (rate >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getInsight = (stat) => {
    if (stat?.completionRate >= 80) {
      return `Excellent consistency! You're building a strong ${stat?.habitTitle} habit.`;
    }
    if (stat?.trend > 10) {
      return `Great improvement! Your ${stat?.habitTitle} completion is trending upward.`;
    }
    if (stat?.currentStreak >= 3) {
      return `${stat?.currentStreak}-day streak! Keep the momentum going.`;
    }
    if (stat?.completionRate < 40) {
      return `Consider adjusting your ${stat?.habitTitle} goal to make it more achievable.`;
    }
    return `Stay consistent with ${stat?.habitTitle} to see better results.`;
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Loading habit statistics...</p>
        </div>
      </div>
    );
  }

  if (stats?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Icon name="BarChart3" size={20} color="var(--color-accent)" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Weekly Habit Statistics</h3>
        </div>
        <div className="text-center py-8">
          <Icon name="Target" size={48} color="var(--color-muted-foreground)" strokeWidth={1.5} className="mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No habit data yet. Start tracking habits to see your progress!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Icon name="BarChart3" size={20} color="var(--color-accent)" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Weekly Habit Statistics</h3>
            <p className="text-xs text-muted-foreground">Track which habits stick</p>
          </div>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod('thisWeek')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedPeriod === 'thisWeek' ?'bg-accent text-white' :'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setSelectedPeriod('twoWeeks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedPeriod === 'twoWeeks' ?'bg-accent text-white' :'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            2 Weeks
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-4">
        {stats?.map((stat, index) => {
          const trendInfo = getTrendIcon(stat?.trend);
          const completionColor = getCompletionColor(stat?.completionRate);
          
          return (
            <div
              key={index}
              className="bg-muted/30 border border-muted rounded-xl p-4 hover:border-accent/30 transition-all"
            >
              {/* Habit Title and Completion Rate */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Icon name="Target" size={16} color="var(--color-accent)" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{stat?.habitTitle}</h4>
                    <p className="text-xs text-muted-foreground">
                      {stat?.completedDays} of {stat?.totalDays} days
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Trend Indicator */}
                  <div className="flex items-center gap-1">
                    <Icon 
                      name={trendInfo?.icon} 
                      size={16} 
                      className={trendInfo?.color}
                      strokeWidth={2}
                    />
                    <span className={`text-xs font-medium ${trendInfo?.color}`}>
                      {stat?.trend > 0 ? '+' : ''}{stat?.trend}%
                    </span>
                  </div>
                  
                  {/* Completion Rate */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{stat?.completionRate}%</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2 mb-3">
                <div
                  className={`${completionColor} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${stat?.completionRate}%` }}
                />
              </div>

              {/* Current Streak */}
              {stat?.currentStreak > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Flame" size={14} color="#f59e0b" strokeWidth={2} />
                  <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{stat?.currentStreak} day</span> streak
                  </span>
                </div>
              )}

              {/* Insight */}
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 mt-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {getInsight(stat)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Tracking {stats?.length} habit{stats?.length !== 1 ? 's' : ''}
          </span>
          <span className="text-muted-foreground">
            Average completion: {Math.round(
              stats?.reduce((sum, s) => sum + s?.completionRate, 0) / stats?.length
            )}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyHabitStats;