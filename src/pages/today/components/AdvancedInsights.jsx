import { useState } from 'react';
import Icon from '../../../components/AppIcon';

const AdvancedInsights = ({ recentLogs = [], workSessions = [], timeframe = 'overall' }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  // Analyze sleep correlation with productivity
  const analyzeSleepCorrelation = () => {
    if (!recentLogs || recentLogs?.length === 0) {
      return {
        correlation: 'insufficient_data',
        optimalRange: '7-9 hours',
        insight: 'Log more days to discover your optimal sleep pattern.',
        avgProductivityBySleep: {}
      };
    }

    // Group productivity by sleep ranges
    const sleepRanges = {
      '<6': [],
      '6-7': [],
      '7-8': [],
      '8-9': [],
      '>9': []
    };

    recentLogs?.forEach(log => {
      const sleep = log?.sleepHours || 0;
      const score = log?.productivityScores?.[0]?.score || 0;
      
      if (sleep < 6) sleepRanges?.['<6']?.push(score);
      else if (sleep < 7) sleepRanges?.['6-7']?.push(score);
      else if (sleep < 8) sleepRanges?.['7-8']?.push(score);
      else if (sleep < 9) sleepRanges?.['8-9']?.push(score);
      else sleepRanges?.['>9']?.push(score);
    });

    // Calculate averages
    const avgByRange = {};
    let bestRange = null;
    let bestAvg = 0;

    Object.keys(sleepRanges)?.forEach(range => {
      if (sleepRanges?.[range]?.length > 0) {
        const avg = sleepRanges?.[range]?.reduce((a, b) => a + b, 0) / sleepRanges?.[range]?.length;
        avgByRange[range] = Math.round(avg);
        if (avg > bestAvg) {
          bestAvg = avg;
          bestRange = range;
        }
      }
    });

    let correlation = 'neutral';
    let insight = '';

    if (bestRange === '7-8' || bestRange === '8-9') {
      correlation = 'strong_positive';
      insight = `Your productivity peaks with ${bestRange} hours of sleep (avg score: ${Math.round(bestAvg)}). Consistency in this range shows ${Math.round((bestAvg / 70) * 100 - 100)}% higher performance.`;
    } else if (bestRange === '6-7') {
      correlation = 'moderate';
      insight = `You perform well with ${bestRange} hours (avg score: ${Math.round(bestAvg)}), but 7-8 hours might unlock even better results.`;
    } else if (bestRange === '<6') {
      correlation = 'negative';
      insight = `Low sleep (<6 hours) correlates with lower productivity. Prioritizing 7-8 hours could significantly boost your performance.`;
    } else {
      correlation = 'positive';
      insight = `Your data shows better productivity with ${bestRange} hours of sleep (avg score: ${Math.round(bestAvg)}).`;
    }

    return {
      correlation,
      optimalRange: bestRange || '7-8',
      insight,
      avgProductivityBySleep: avgByRange
    };
  };

  // Analyze caffeine impact on focus efficiency
  const analyzeCaffeineImpact = () => {
    if (!recentLogs || recentLogs?.length === 0) {
      return {
        impact: 'insufficient_data',
        optimalRange: '100-200mg',
        insight: 'Log more days with caffeine tracking to see patterns.',
        avgEfficiencyByCaffeine: {}
      };
    }

    // Group efficiency by caffeine ranges
    const caffeineRanges = {
      '0': [],
      '1-100': [],
      '100-200': [],
      '200-300': [],
      '>300': []
    };

    recentLogs?.forEach(log => {
      const caffeine = log?.caffeineTotal || 0;
      const sessions = log?.workSessions || [];
      
      if (sessions?.length === 0) return;

      const avgEfficiency = sessions?.reduce((sum, s) => sum + (s?.efficiency || 0), 0) / sessions?.length;
      
      if (caffeine === 0) caffeineRanges?.['0']?.push(avgEfficiency);
      else if (caffeine <= 100) caffeineRanges?.['1-100']?.push(avgEfficiency);
      else if (caffeine <= 200) caffeineRanges?.['100-200']?.push(avgEfficiency);
      else if (caffeine <= 300) caffeineRanges?.['200-300']?.push(avgEfficiency);
      else caffeineRanges?.['>300']?.push(avgEfficiency);
    });

    // Calculate averages
    const avgByRange = {};
    let bestRange = null;
    let bestAvg = 0;

    Object.keys(caffeineRanges)?.forEach(range => {
      if (caffeineRanges?.[range]?.length > 0) {
        const avg = caffeineRanges?.[range]?.reduce((a, b) => a + b, 0) / caffeineRanges?.[range]?.length;
        avgByRange[range] = avg?.toFixed(1);
        if (avg > bestAvg) {
          bestAvg = avg;
          bestRange = range;
        }
      }
    });

    let impact = 'neutral';
    let insight = '';

    if (bestRange === '100-200' || bestRange === '200-300') {
      impact = 'optimal';
      insight = `Your focus efficiency peaks with ${bestRange}mg caffeine (avg ${bestAvg?.toFixed(1)}/5). This range shows ${Math.round(((bestAvg / 3.5) - 1) * 100)}% better focus than baseline.`;
    } else if (bestRange === '0') {
      impact = 'caffeine_free_optimal';
      insight = `Interestingly, you perform best without caffeine (avg ${bestAvg?.toFixed(1)}/5). Your natural energy rhythms are strong.`;
    } else if (bestRange === '>300') {
      impact = 'excessive';
      insight = `High caffeine (>300mg) shows diminishing returns. Consider reducing to 100-200mg for better sustained focus.`;
    } else {
      impact = 'moderate';
      insight = `Your focus is consistent with ${bestRange}mg caffeine (avg ${bestAvg?.toFixed(1)}/5).`;
    }

    return {
      impact,
      optimalRange: bestRange || '100-200mg',
      insight,
      avgEfficiencyByCaffeine: avgByRange
    };
  };

  // Analyze optimal focus times based on historical patterns
  const analyzeOptimalFocusTimes = () => {
    if (!workSessions || workSessions?.length === 0) {
      return {
        morningScore: 0,
        afternoonScore: 0,
        eveningScore: 0,
        bestPeriod: 'morning',
        insight: 'Log more work sessions to identify your peak focus times.',
        hourlyEfficiency: {}
      };
    }

    // Group sessions by time of day
    const timeBlocks = {
      morning: [], // 6am-12pm
      afternoon: [], // 12pm-6pm
      evening: [] // 6pm-12am
    };

    const hourlyData = {};

    workSessions?.forEach(session => {
      const startTime = session?.startTime || '00:00:00';
      const hour = parseInt(startTime?.split(':')?.[0]);
      const efficiency = session?.efficiency || 0;

      // Hourly tracking
      if (!hourlyData?.[hour]) hourlyData[hour] = [];
      hourlyData?.[hour]?.push(efficiency);

      // Time block tracking
      if (hour >= 6 && hour < 12) timeBlocks?.morning?.push(efficiency);
      else if (hour >= 12 && hour < 18) timeBlocks?.afternoon?.push(efficiency);
      else if (hour >= 18 && hour < 24) timeBlocks?.evening?.push(efficiency);
    });

    // Calculate averages
    const morningScore = timeBlocks?.morning?.length > 0 
      ? timeBlocks?.morning?.reduce((a, b) => a + b, 0) / timeBlocks?.morning?.length 
      : 0;
    const afternoonScore = timeBlocks?.afternoon?.length > 0 
      ? timeBlocks?.afternoon?.reduce((a, b) => a + b, 0) / timeBlocks?.afternoon?.length 
      : 0;
    const eveningScore = timeBlocks?.evening?.length > 0 
      ? timeBlocks?.evening?.reduce((a, b) => a + b, 0) / timeBlocks?.evening?.length 
      : 0;

    // Find best period
    let bestPeriod = 'morning';
    let bestScore = morningScore;
    if (afternoonScore > bestScore) {
      bestPeriod = 'afternoon';
      bestScore = afternoonScore;
    }
    if (eveningScore > bestScore) {
      bestPeriod = 'evening';
      bestScore = eveningScore;
    }

    // Calculate hourly efficiency
    const hourlyEfficiency = {};
    Object.keys(hourlyData)?.forEach(hour => {
      const avg = hourlyData?.[hour]?.reduce((a, b) => a + b, 0) / hourlyData?.[hour]?.length;
      hourlyEfficiency[hour] = avg?.toFixed(1);
    });

    // Find peak hours
    const sortedHours = Object.entries(hourlyEfficiency)
      ?.sort((a, b) => parseFloat(b?.[1]) - parseFloat(a?.[1]))
      ?.slice(0, 3);

    const peakHoursText = sortedHours?.map(([hour, eff]) => 
      `${hour}:00 (${eff}/5)`
    )?.join(', ');

    let insight = `Your ${bestPeriod} sessions show highest efficiency (avg ${bestScore?.toFixed(1)}/5). Peak hours: ${peakHoursText || 'tracking in progress'}.`;

    return {
      morningScore: morningScore?.toFixed(1),
      afternoonScore: afternoonScore?.toFixed(1),
      eveningScore: eveningScore?.toFixed(1),
      bestPeriod,
      insight,
      hourlyEfficiency
    };
  };

  // Generate personalized focus window recommendations
  const generatePersonalizedRecommendations = () => {
    const sleepAnalysis = analyzeSleepCorrelation();
    const caffeineAnalysis = analyzeCaffeineImpact();
    const focusTimeAnalysis = analyzeOptimalFocusTimes();

    const recommendations = [];

    // Sleep-based recommendation
    if (sleepAnalysis?.correlation === 'strong_positive') {
      recommendations?.push({
        icon: 'Moon',
        title: 'Protect Your Sleep Window',
        description: `Aim for ${sleepAnalysis?.optimalRange} hours consistently. Your data shows this is your productivity sweet spot.`,
        priority: 'high',
        color: '#8b5cf6'
      });
    } else if (sleepAnalysis?.correlation === 'negative') {
      recommendations?.push({
        icon: 'AlertCircle',
        title: 'Sleep Optimization Needed',
        description: 'Low sleep is impacting your performance. Prioritize 7-8 hours to unlock your full potential.',
        priority: 'critical',
        color: '#ef4444'
      });
    }

    // Caffeine-based recommendation
    if (caffeineAnalysis?.impact === 'optimal') {
      recommendations?.push({
        icon: 'Coffee',
        title: 'Caffeine Sweet Spot Found',
        description: `${caffeineAnalysis?.optimalRange}mg is your optimal range. Maintain this for consistent focus.`,
        priority: 'medium',
        color: '#f59e0b'
      });
    } else if (caffeineAnalysis?.impact === 'excessive') {
      recommendations?.push({
        icon: 'TrendingDown',
        title: 'Reduce Caffeine Intake',
        description: 'High caffeine shows diminishing returns. Try reducing to 100-200mg for better sustained energy.',
        priority: 'high',
        color: '#ef4444'
      });
    } else if (caffeineAnalysis?.impact === 'caffeine_free_optimal') {
      recommendations?.push({
        icon: 'Sparkles',
        title: 'Natural Energy Champion',
        description: 'Your performance is best without caffeine. Trust your natural rhythms.',
        priority: 'low',
        color: '#10b981'
      });
    }

    // Focus time recommendation
    if (focusTimeAnalysis?.bestPeriod) {
      const periodEmoji = {
        morning: '🌅',
        afternoon: '☀️',
        evening: '🌙'
      };
      
      recommendations?.push({
        icon: 'Clock',
        title: `${focusTimeAnalysis?.bestPeriod?.charAt(0)?.toUpperCase() + focusTimeAnalysis?.bestPeriod?.slice(1)} is Your Power Time`,
        description: `Schedule your most demanding work during ${focusTimeAnalysis?.bestPeriod} hours when your efficiency peaks at ${focusTimeAnalysis?.[`${focusTimeAnalysis?.bestPeriod}Score`]}/5.`,
        priority: 'high',
        color: '#06b6d4',
        emoji: periodEmoji?.[focusTimeAnalysis?.bestPeriod]
      });
    }

    // Pattern-based recommendation
    if (recentLogs?.length >= 7) {
      const recentAvgScore = recentLogs?.slice(0, 7)?.reduce((sum, log) => 
        sum + (log?.productivityScores?.[0]?.score || 0), 0
      ) / 7;

      if (recentAvgScore >= 75) {
        recommendations?.push({
          icon: 'TrendingUp',
          title: 'Momentum Building',
          description: `You're averaging ${Math.round(recentAvgScore)}/100 this week. Keep this rhythm going—you've found your groove.`,
          priority: 'low',
          color: '#10b981'
        });
      } else if (recentAvgScore < 60) {
        recommendations?.push({
          icon: 'Target',
          title: 'Reset & Refocus',
          description: 'Recent scores suggest you need recovery. Prioritize sleep and reduce workload for 2-3 days.',
          priority: 'high',
          color: '#f59e0b'
        });
      }
    }

    // Default recommendation if no data
    if (recommendations?.length === 0) {
      recommendations?.push({
        icon: 'BarChart',
        title: 'Build Your Baseline',
        description: 'Log 7+ days of data to unlock personalized insights about your optimal productivity patterns.',
        priority: 'medium',
        color: '#6366f1'
      });
    }

    return recommendations;
  };

  const sleepData = analyzeSleepCorrelation();
  const caffeineData = analyzeCaffeineImpact();
  const focusTimeData = analyzeOptimalFocusTimes();
  const recommendations = generatePersonalizedRecommendations();

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'border-red-500/50 bg-red-500/5';
      case 'high': return 'border-accent/50 bg-accent/5';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/5';
      case 'low': return 'border-green-500/50 bg-green-500/5';
      default: return 'border-border bg-muted/30';
    }
  };

  return (
    <div className="mb-16 md:mb-20 lg:mb-24">
      <div className="border-t border-border pt-8 md:pt-10 lg:pt-12">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-medium text-foreground">
            Advanced Insights
          </h2>
          <span className="text-xs md:text-sm text-muted-foreground capitalize">
            {timeframe === 'this_week' ? 'This Week' : 'Overall'}
          </span>
        </div>

        {/* Personalized Recommendations */}
        <div className="mb-8 md:mb-10">
          <h3 className="text-base md:text-lg font-medium text-foreground mb-4">
            Personalized Recommendations
          </h3>
          <div className="space-y-4">
            {recommendations?.map((rec, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 md:p-5 border transition-all duration-300 ${getPriorityColor(rec?.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 md:w-12 md:h-12 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${rec?.color}20` }}
                  >
                    {rec?.emoji ? (
                      <span className="text-xl md:text-2xl">{rec?.emoji}</span>
                    ) : (
                      <Icon
                        name={rec?.icon}
                        size={20}
                        color={rec?.color}
                        strokeWidth={2}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm md:text-base font-medium text-foreground mb-1">
                      {rec?.title}
                    </h4>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {rec?.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sleep Correlation Analysis */}
        <div className="mb-8 md:mb-10">
          <button
            onClick={() => toggleSection('sleep')}
            className="w-full flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-accent/30 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-purple-500/20 flex items-center justify-center">
                <Icon name="Moon" size={20} color="#8b5cf6" strokeWidth={2} />
              </div>
              <div className="text-left">
                <h3 className="text-sm md:text-base font-medium text-foreground">
                  Sleep Correlation
                </h3>
                <p className="text-xs text-muted-foreground">
                  Optimal: {sleepData?.optimalRange} hours
                </p>
              </div>
            </div>
            <Icon 
              name={expandedSection === 'sleep' ? 'ChevronUp' : 'ChevronDown'} 
              size={20} 
              color="var(--color-muted-foreground)" 
              strokeWidth={2} 
            />
          </button>
          
          {expandedSection === 'sleep' && (
            <div className="mt-4 p-4 md:p-5 bg-muted/20 rounded-lg border border-border">
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
                {sleepData?.insight}
              </p>
              {Object.keys(sleepData?.avgProductivityBySleep)?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground mb-2">Productivity by Sleep Range:</p>
                  {Object.entries(sleepData?.avgProductivityBySleep)?.map(([range, score]) => (
                    <div key={range} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{range} hours</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent rounded-full transition-all duration-500"
                            style={{ width: `${(score / 100) * 100}%` }}
                          />
                        </div>
                        <span className="text-foreground font-medium w-8 text-right">{score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Caffeine Impact Analysis */}
        <div className="mb-8 md:mb-10">
          <button
            onClick={() => toggleSection('caffeine')}
            className="w-full flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-accent/30 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-amber-500/20 flex items-center justify-center">
                <Icon name="Coffee" size={20} color="#f59e0b" strokeWidth={2} />
              </div>
              <div className="text-left">
                <h3 className="text-sm md:text-base font-medium text-foreground">
                  Caffeine Impact
                </h3>
                <p className="text-xs text-muted-foreground">
                  Optimal: {caffeineData?.optimalRange}
                </p>
              </div>
            </div>
            <Icon 
              name={expandedSection === 'caffeine' ? 'ChevronUp' : 'ChevronDown'} 
              size={20} 
              color="var(--color-muted-foreground)" 
              strokeWidth={2} 
            />
          </button>
          
          {expandedSection === 'caffeine' && (
            <div className="mt-4 p-4 md:p-5 bg-muted/20 rounded-lg border border-border">
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
                {caffeineData?.insight}
              </p>
              {Object.keys(caffeineData?.avgEfficiencyByCaffeine)?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground mb-2">Efficiency by Caffeine Range:</p>
                  {Object.entries(caffeineData?.avgEfficiencyByCaffeine)?.map(([range, eff]) => (
                    <div key={range} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{range}mg</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${(parseFloat(eff) / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-foreground font-medium w-8 text-right">{eff}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Optimal Focus Times */}
        <div className="mb-8 md:mb-10">
          <button
            onClick={() => toggleSection('focus')}
            className="w-full flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-accent/30 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-cyan-500/20 flex items-center justify-center">
                <Icon name="Clock" size={20} color="#06b6d4" strokeWidth={2} />
              </div>
              <div className="text-left">
                <h3 className="text-sm md:text-base font-medium text-foreground">
                  Optimal Focus Times
                </h3>
                <p className="text-xs text-muted-foreground capitalize">
                  Best: {focusTimeData?.bestPeriod}
                </p>
              </div>
            </div>
            <Icon 
              name={expandedSection === 'focus' ? 'ChevronUp' : 'ChevronDown'} 
              size={20} 
              color="var(--color-muted-foreground)" 
              strokeWidth={2} 
            />
          </button>
          
          {expandedSection === 'focus' && (
            <div className="mt-4 p-4 md:p-5 bg-muted/20 rounded-lg border border-border">
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
                {focusTimeData?.insight}
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Morning</p>
                  <p className="text-lg font-medium text-foreground">{focusTimeData?.morningScore}/5</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Afternoon</p>
                  <p className="text-lg font-medium text-foreground">{focusTimeData?.afternoonScore}/5</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Evening</p>
                  <p className="text-lg font-medium text-foreground">{focusTimeData?.eveningScore}/5</p>
                </div>
              </div>
              {Object.keys(focusTimeData?.hourlyEfficiency)?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground mb-2">Hourly Efficiency Breakdown:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(focusTimeData?.hourlyEfficiency)
                      ?.sort((a, b) => parseFloat(b?.[1]) - parseFloat(a?.[1]))
                      ?.slice(0, 6)
                      ?.map(([hour, eff]) => (
                        <div key={hour} className="flex items-center justify-between text-xs p-2 bg-muted/20 rounded">
                          <span className="text-muted-foreground">{hour}:00</span>
                          <span className="text-foreground font-medium">{eff}/5</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Note */}
        <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
          <div className="flex items-start gap-3">
            <Icon
              name="Info"
              size={18}
              color="var(--color-accent)"
              strokeWidth={2}
              className="flex-shrink-0 mt-0.5"
            />
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              These insights are generated from your logged data. The more you log, the more accurate and personalized your recommendations become.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedInsights;