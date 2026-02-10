import { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import ProductivityChart from '../../history/components/ProductivityChart';
import { productivityScoresService, dailyLogsService } from '../../../services/voltaService';
import { useAuth } from '../../../contexts/AuthContext';

const WeeklySummary = () => {
  const { user, isDemoMode } = useAuth();
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadWeeklySummary();
  }, [user, isDemoMode]);

  const loadWeeklySummary = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo?.setDate(today?.getDate() - 7);

      const startDate = sevenDaysAgo?.toISOString()?.split('T')?.[0];
      const endDate = today?.toISOString()?.split('T')?.[0];

      // Fetch productivity scores for the week
      const { data: scores, error: scoresError } = await productivityScoresService?.getByDateRange(
        user?.id || null,
        startDate,
        endDate
      );

      if (scoresError) {
        console.error('Error loading weekly scores:', scoresError);
        setLoading(false);
        return;
      }

      // Fetch daily logs with work sessions for focus window analysis
      const { data: logs, error: logsError } = await dailyLogsService?.getByDateRange(
        user?.id || null,
        startDate,
        endDate
      );

      if (logsError) {
        console.error('Error loading weekly logs:', logsError);
        setLoading(false);
        return;
      }

      // Process the data
      const summary = processWeeklySummary(scores, logs);
      setSummaryData(summary);
      setLoading(false);
    } catch (err) {
      console.error('Load weekly summary error:', err);
      setLoading(false);
    }
  };

  const processWeeklySummary = (scores, logs) => {
    if (!scores || scores?.length === 0) {
      return null;
    }

    // Calculate productivity trends
    const scoreValues = scores?.map(s => s?.score);
    const avgScore = Math.round(scoreValues?.reduce((sum, val) => sum + val, 0) / scores?.length);
    const highestScore = Math.max(...scoreValues);
    const lowestScore = Math.min(...scoreValues);

    // Calculate trend direction
    const firstHalf = scores?.slice(0, Math.floor(scores?.length / 2));
    const secondHalf = scores?.slice(Math.floor(scores?.length / 2));
    const firstAvg = firstHalf?.reduce((acc, s) => acc + s?.score, 0) / firstHalf?.length;
    const secondAvg = secondHalf?.reduce((acc, s) => acc + s?.score, 0) / secondHalf?.length;
    const percentChange = Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
    const trendDirection = percentChange > 5 ? 'up' : percentChange < -5 ? 'down' : 'neutral';

    // Format chart data
    const chartData = scores?.map(s => {
      const date = new Date(s?.scoreDate);
      const dateLabel = date?.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit' });
      return {
        date: dateLabel,
        score: s?.score
      };
    })?.reverse();

    // Analyze focus window effectiveness
    const focusAnalysis = analyzeFocusWindowEffectiveness(logs);

    // Generate personalized recommendations
    const recommendations = generateRecommendations(avgScore, trendDirection, focusAnalysis, logs);

    return {
      avgScore,
      highestScore,
      lowestScore,
      trendDirection,
      percentChange,
      chartData,
      focusAnalysis,
      recommendations,
      totalDays: scores?.length
    };
  };

  const analyzeFocusWindowEffectiveness = (logs) => {
    if (!logs || logs?.length === 0) {
      return null;
    }

    const categories = ['creative', 'analytical', 'studying'];
    const analysis = {};

    categories?.forEach(category => {
      const categorySessions = [];
      logs?.forEach(log => {
        const sessions = log?.workSessions?.filter(s => s?.category === category) || [];
        categorySessions?.push(...sessions);
      });

      if (categorySessions?.length === 0) {
        analysis[category] = {
          avgEfficiency: 0,
          totalSessions: 0,
          totalHours: 0,
          effectiveness: 'No data',
          bestTimeRange: null
        };
        return;
      }

      // Calculate average efficiency
      const avgEfficiency = categorySessions?.reduce((sum, s) => sum + (s?.efficiency || 0), 0) / categorySessions?.length;

      // Calculate total hours
      const totalMinutes = categorySessions?.reduce((sum, s) => {
        const start = timeToMinutes(s?.startTime);
        const end = timeToMinutes(s?.endTime);
        return sum + (end - start);
      }, 0);
      const totalHours = (totalMinutes / 60)?.toFixed(1);

      // Find best time range (most efficient sessions)
      const bestTimeRange = findBestTimeRange(categorySessions);

      // Determine effectiveness level
      let effectiveness = 'Low';
      if (avgEfficiency >= 4.5) effectiveness = 'Excellent';
      else if (avgEfficiency >= 3.5) effectiveness = 'Good';
      else if (avgEfficiency >= 2.5) effectiveness = 'Moderate';

      analysis[category] = {
        avgEfficiency: avgEfficiency?.toFixed(1),
        totalSessions: categorySessions?.length,
        totalHours,
        effectiveness,
        bestTimeRange
      };
    });

    return analysis;
  };

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr?.split(':')?.map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours)?.padStart(2, '0')}:${String(mins)?.padStart(2, '0')}`;
  };

  const findBestTimeRange = (sessions) => {
    if (sessions?.length === 0) return null;

    // Group sessions by hour and calculate average efficiency
    const hourlyEfficiency = {};
    sessions?.forEach(session => {
      const startHour = parseInt(session?.startTime?.split(':')?.[0]);
      if (!hourlyEfficiency?.[startHour]) {
        hourlyEfficiency[startHour] = { total: 0, count: 0 };
      }
      hourlyEfficiency[startHour].total += session?.efficiency || 0;
      hourlyEfficiency[startHour].count += 1;
    });

    // Find hour with highest average efficiency
    let bestHour = null;
    let bestAvg = 0;
    Object.keys(hourlyEfficiency)?.forEach(hour => {
      const avg = hourlyEfficiency?.[hour]?.total / hourlyEfficiency?.[hour]?.count;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestHour = parseInt(hour);
      }
    });

    if (bestHour === null) return null;

    const startTime = minutesToTime(bestHour * 60);
    const endTime = minutesToTime((bestHour + 2) * 60);
    return `${startTime} - ${endTime}`;
  };

  const generateRecommendations = (avgScore, trendDirection, focusAnalysis, logs) => {
    const recommendations = [];

    // Recommendation based on productivity trend
    if (trendDirection === 'up') {
      recommendations?.push({
        icon: 'TrendingUp',
        title: 'Momentum Building',
        description: 'Your productivity is trending upward. Keep maintaining your current routines and sleep patterns.'
      });
    } else if (trendDirection === 'down') {
      recommendations?.push({
        icon: 'TrendingDown',
        title: 'Adjust Your Approach',
        description: 'Consider reviewing your sleep quality and energy levels. Small adjustments can reverse the trend.'
      });
    } else {
      recommendations?.push({
        icon: 'Activity',
        title: 'Steady Performance',
        description: 'Your productivity is consistent. Look for opportunities to optimize your peak performance windows.'
      });
    }

    // Recommendation based on focus window effectiveness
    if (focusAnalysis) {
      const categories = Object.keys(focusAnalysis);
      const mostEffective = categories?.reduce((best, cat) => {
        const efficiency = parseFloat(focusAnalysis?.[cat]?.avgEfficiency || 0);
        const bestEfficiency = parseFloat(focusAnalysis?.[best]?.avgEfficiency || 0);
        return efficiency > bestEfficiency ? cat : best;
      }, categories?.[0]);

      const leastEffective = categories?.reduce((worst, cat) => {
        const efficiency = parseFloat(focusAnalysis?.[cat]?.avgEfficiency || 0);
        const worstEfficiency = parseFloat(focusAnalysis?.[worst]?.avgEfficiency || 0);
        return efficiency < worstEfficiency && efficiency > 0 ? cat : worst;
      }, categories?.[0]);

      if (focusAnalysis?.[mostEffective]?.avgEfficiency > 0) {
        recommendations?.push({
          icon: 'Zap',
          title: `${capitalize(mostEffective)} Work Excelling`,
          description: `Your ${mostEffective} sessions averaged ${focusAnalysis?.[mostEffective]?.avgEfficiency}/5 efficiency. Schedule more during ${focusAnalysis?.[mostEffective]?.bestTimeRange || 'your peak hours'}.`
        });
      }

      if (focusAnalysis?.[leastEffective]?.avgEfficiency > 0 && focusAnalysis?.[leastEffective]?.avgEfficiency < 3) {
        recommendations?.push({
          icon: 'AlertCircle',
          title: `Optimize ${capitalize(leastEffective)} Sessions`,
          description: `${capitalize(leastEffective)} work averaged ${focusAnalysis?.[leastEffective]?.avgEfficiency}/5. Try different times or break sessions into shorter blocks.`
        });
      }
    }

    // Recommendation based on sleep patterns
    if (logs && logs?.length > 0) {
      const avgSleep = logs?.reduce((sum, log) => sum + (log?.sleepHours || 0), 0) / logs?.length;
      if (avgSleep < 7) {
        recommendations?.push({
          icon: 'Moon',
          title: 'Prioritize Sleep',
          description: `You averaged ${avgSleep?.toFixed(1)} hours of sleep this week. Aim for 7-8 hours to boost productivity.`
        });
      }
    }

    return recommendations?.slice(0, 3); // Return top 3 recommendations
  };

  const capitalize = (str) => {
    return str?.charAt(0)?.toUpperCase() + str?.slice(1);
  };

  const getTrendIcon = () => {
    if (summaryData?.trendDirection === 'up') return 'TrendingUp';
    if (summaryData?.trendDirection === 'down') return 'TrendingDown';
    return 'Minus';
  };

  const getTrendColor = () => {
    if (summaryData?.trendDirection === 'up') return 'var(--color-accent)';
    if (summaryData?.trendDirection === 'down') return '#ef4444';
    return 'rgba(237, 237, 237, 0.6)';
  };

  if (loading) {
    return (
      <div className="mb-12 md:mb-16">
        <div className="bg-muted/10 border border-border/30 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Icon name="BarChart3" size={20} color="var(--color-accent)" />
            </div>
            <h3 className="text-lg md:text-xl font-medium text-foreground">Weekly Summary</h3>
          </div>
          <p className="text-sm text-muted-foreground">Loading your weekly insights...</p>
        </div>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="mb-12 md:mb-16">
        <div className="bg-muted/10 border border-border/30 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Icon name="BarChart3" size={20} color="var(--color-accent)" />
            </div>
            <h3 className="text-lg md:text-xl font-medium text-foreground">Weekly Summary</h3>
          </div>
          <p className="text-sm text-muted-foreground">Not enough data yet. Log more days to see your weekly summary.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12 md:mb-16">
      <div className="bg-muted/10 border border-border/30 rounded-2xl p-6 md:p-8 lg:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Icon name="BarChart3" size={20} color="var(--color-accent)" />
            </div>
            <h3 className="text-lg md:text-xl font-medium text-foreground">Weekly Summary</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-accent hover:text-accent/80 transition-colors flex items-center gap-2"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
            <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-background/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Average</p>
            <p className="text-2xl font-semibold text-foreground">{summaryData?.avgScore}</p>
          </div>
          <div className="bg-background/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Highest</p>
            <p className="text-2xl font-semibold text-accent">{summaryData?.highestScore}</p>
          </div>
          <div className="bg-background/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Lowest</p>
            <p className="text-2xl font-semibold text-muted-foreground">{summaryData?.lowestScore}</p>
          </div>
          <div className="bg-background/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Trend</p>
            <div className="flex items-center gap-2">
              <Icon name={getTrendIcon()} size={20} color={getTrendColor()} />
              <p className="text-2xl font-semibold" style={{ color: getTrendColor() }}>
                {Math.abs(summaryData?.percentChange)}%
              </p>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-8 mt-8">
            {/* Productivity Trend Chart */}
            <div>
              <h4 className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">Productivity Trend</h4>
              <ProductivityChart data={summaryData?.chartData} timeframe="week" />
            </div>

            {/* Focus Window Effectiveness */}
            {summaryData?.focusAnalysis && (
              <div>
                <h4 className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">Focus Window Effectiveness</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.keys(summaryData?.focusAnalysis)?.map(category => {
                    const analysis = summaryData?.focusAnalysis?.[category];
                    const getCategoryIcon = (cat) => {
                      if (cat === 'creative') return 'Lightbulb';
                      if (cat === 'analytical') return 'Brain';
                      if (cat === 'studying') return 'BookOpen';
                      return 'Zap';
                    };

                    return (
                      <div key={category} className="bg-background/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon name={getCategoryIcon(category)} size={18} color="var(--color-accent)" />
                          <p className="text-sm font-medium text-foreground capitalize">{category}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">Effectiveness</p>
                            <p className="text-sm font-semibold text-accent">{analysis?.effectiveness}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">Avg Efficiency</p>
                            <p className="text-sm font-medium text-foreground">{analysis?.avgEfficiency}/5</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">Total Hours</p>
                            <p className="text-sm font-medium text-foreground">{analysis?.totalHours}h</p>
                          </div>
                          {analysis?.bestTimeRange && (
                            <div className="mt-3 pt-3 border-t border-border/30">
                              <p className="text-xs text-muted-foreground mb-1">Best Time</p>
                              <p className="text-xs font-medium text-accent">{analysis?.bestTimeRange}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Personalized Recommendations */}
            {summaryData?.recommendations && summaryData?.recommendations?.length > 0 && (
              <div>
                <h4 className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">Recommendations</h4>
                <div className="space-y-3">
                  {summaryData?.recommendations?.map((rec, index) => (
                    <div key={index} className="bg-accent/5 border border-accent/20 rounded-lg p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Icon name={rec?.icon} size={16} color="var(--color-accent)" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">{rec?.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{rec?.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklySummary;