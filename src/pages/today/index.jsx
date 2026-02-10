import { useState, useEffect } from 'react';
import GreetingHeader from './components/GreetingHeader';
import BrainCheckIn from './components/BrainCheckIn';
import ProductivityScore from './components/ProductivityScore';
import DailyLogSummary from './components/DailyLogSummary';
import PreviousDays from './components/PreviousDays';
import BestTimePredictions from './components/BestTimePredictions';
import SacredFocusWindow from './components/SacredFocusWindow';
import QuietRecognition from './components/QuietRecognition';
import ReflectiveInsight from './components/ReflectiveInsight';
import WeeklyComparison from './components/WeeklyComparison';
import BrainSignature from './components/BrainSignature';
import WeeklySummary from './components/WeeklySummary';
import AdvancedInsights from './components/AdvancedInsights';
import AlignmentDays from './components/AlignmentDays';
import ConsistencyMoments from './components/ConsistencyMoments';
import EvolutionBadges from './components/EvolutionBadges';

import DemoModeBanner from '../../components/DemoModeBanner';
import { useAuth } from '../../contexts/AuthContext';
import { dailyLogsService, productivityScoresService, recommendationsService, predictionEngineService, recognitionEngineService, productivityScoreCalculator, alignmentTrackingService } from '../../services/voltaService';

const Today = () => {
  const { user, isDemoMode } = useAuth();
  const [timeframe, setTimeframe] = useState('overall');
  const [todayData, setTodayData] = useState(null);
  const [logData, setLogData] = useState(null);
  const [previousDays, setPreviousDays] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [sacredWindow, setSacredWindow] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [reflectiveInsight, setReflectiveInsight] = useState(null);
  const [weeklyComparison, setWeeklyComparison] = useState(null);
  const [brainCheckInState, setBrainCheckInState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [recentLogsForInsights, setRecentLogsForInsights] = useState([]);
  const [allWorkSessions, setAllWorkSessions] = useState([]);
  const [alignmentData, setAlignmentData] = useState({ score: 0, recentDays: 0 });
  const [consistencyMoments, setConsistencyMoments] = useState([]);
  const [evolutionBadges, setEvolutionBadges] = useState({ badges: [], newBadge: null });

  useEffect(() => {
    loadTodayData();
    loadEngagementData();
    loadAlignmentData();
  }, [user, isDemoMode]);

  useEffect(() => {
    loadRecommendations();
  }, [user, isDemoMode, timeframe]);

  const handleBrainCheckIn = (state) => {
    setBrainCheckInState(state);
    console.log('Brain check-in:', state);
  };

  const loadEngagementData = async () => {
    try {
      // Load reflective insight
      const insight = await recognitionEngineService?.generateReflectiveInsight(user?.id || null);
      setReflectiveInsight(insight);

      // Load weekly comparison (only on Sundays or once per week)
      const today = new Date();
      const dayOfWeek = today?.getDay();
      if (dayOfWeek === 0) { // Sunday
        const comparison = await recognitionEngineService?.generateWeeklyComparison(user?.id || null);
        setWeeklyComparison(comparison);
      }
    } catch (err) {
      console.error('Load engagement data error:', err);
    }
  };

  const loadTodayData = async () => {
    try {
      setLoading(true);
      const today = new Date()?.toISOString()?.split('T')?.[0];
      
      // Load today's log
      const { data: todayLog, error: logError } = await dailyLogsService?.getByDate(user?.id || null, today);
      if (logError) {
        console.error('Error loading today log:', logError);
      } else if (todayLog) {
        const sessionsData = todayLog?.workSessions?.map(session => ({
          id: session?.id,
          category: session?.category,
          startTime: session?.startTime,
          endTime: session?.endTime,
          efficiency: session?.efficiency?.toString(),
          felt: session?.felt
        })) || [];

        setLogData({
          dailyContext: {
            sleepHours: todayLog?.sleepHours,
            sleepQuality: todayLog?.sleepQuality,
            caffeineTotal: todayLog?.caffeineTotal,
            energyLevel: todayLog?.energyLevel
          },
          sessions: sessionsData
        });

        // Calculate productivity score
        if (sessionsData?.length > 0) {
          const scoreData = productivityScoreCalculator?.calculateScore(todayLog, todayLog?.workSessions);
          setTodayData(scoreData);
          
          // Save score to database
          await productivityScoresService?.create(
            user?.id || null,
            todayLog?.id,
            today,
            scoreData?.score,
            scoreData?.caption,
            scoreData?.explanation
          );
        }

        // Check for recognition if there are sessions
        if (sessionsData?.length > 0 && recommendations) {
          const lastSession = sessionsData?.[sessionsData?.length - 1];
          const recognitionMsg = recognitionEngineService?.generateRecognition(lastSession, recommendations);
          if (recognitionMsg) {
            setRecognition(recognitionMsg);
            // Clear recognition after 10 seconds
            setTimeout(() => setRecognition(null), 10000);
          }
        }
      }

      // Load recent productivity scores
      const { data: scores, error: scoresError } = await productivityScoresService?.getRecent(user?.id || null, 7);
      if (scoresError) {
        console.error('Error loading scores:', scoresError);
      } else if (scores && scores?.length > 0) {
        // Set today's score if not already set
        if (!todayData) {
          const todayScore = scores?.find(s => s?.scoreDate === today);
          if (todayScore) {
            setTodayData({
              score: todayScore?.score,
              caption: todayScore?.caption,
              explanation: todayScore?.explanation
            });
          }
        }

        // Set previous days (excluding today)
        const previous = scores?.filter(s => s?.scoreDate !== today)?.map(s => ({
            id: s?.id,
            date: new Date(s.scoreDate)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            score: s?.score,
            explanation: s?.explanation,
            sleep: 0,
            caffeine: 0,
            screenTime: 0,
            workload: 0
          }));
        setPreviousDays(previous);
      }

      // Load recent logs for previous days context
      const { data: recentLogs, error: recentError } = await dailyLogsService?.getRecent(user?.id || null, 7);
      if (!recentError && recentLogs) {
        const logsWithScores = recentLogs?.filter(log => log?.logDate !== today)?.map(log => {
            const score = log?.productivityScores?.[0];
            return {
              id: log?.id,
              date: new Date(log.logDate)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              score: score?.score || 0,
              explanation: score?.explanation || 'No data available',
              sleep: log?.sleepHours || 0,
              caffeine: Math.round((log?.caffeineTotal || 0) / 100),
              screenTime: 0,
              workload: log?.workSessions?.length || 0
            };
          });
        setPreviousDays(logsWithScores);
        
        // Store full logs for advanced insights
        setRecentLogsForInsights(recentLogs);
        
        // Collect all work sessions for insights
        const sessions = recentLogs?.flatMap(log => log?.workSessions || []);
        setAllWorkSessions(sessions);
      }
    } catch (err) {
      console.error('Load today data error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const today = new Date()?.toISOString()?.split('T')?.[0];
      const { data, error } = await recommendationsService?.getByDateAndContext(user?.id || null, today, timeframe);
      
      if (error) {
        console.error('Error loading recommendations:', error);
      } else if (data) {
        setRecommendations(data);
        
        // Set sacred window (highest scoring window from any category)
        const payload = data?.payload;
        if (payload) {
          let bestWindow = null;
          let bestCategory = null;
          let bestScore = 0;

          ['creative', 'analytical', 'studying']?.forEach(category => {
            const categoryData = payload?.[category];
            if (categoryData?.windows && categoryData?.windows?.length > 0) {
              const window = categoryData?.windows?.[0];
              if (window?.score > bestScore) {
                bestScore = window?.score;
                bestWindow = window;
                bestCategory = category;
              }
            }
          });

          if (bestWindow) {
            setSacredWindow({ window: bestWindow, category: bestCategory });
          }
        }
      } else {
        // No recommendations found, generate them
        await handleRefreshRecommendations();
      }
    } catch (err) {
      console.error('Load recommendations error:', err);
    }
  };

  const loadAlignmentData = async () => {
    try {
      // Load alignment days
      const { data: alignmentResult } = await alignmentTrackingService?.getRecentAlignmentDays(user?.id || null);
      if (alignmentResult) {
        setAlignmentData({
          score: alignmentResult?.score || 0,
          recentDays: alignmentResult?.count || 0
        });
      }

      // Load consistency moments
      const { data: moments } = await alignmentTrackingService?.generateConsistencyMoments(user?.id || null);
      if (moments) {
        setConsistencyMoments(moments);
      }

      // Load evolution badges
      const { data: badgesResult } = await alignmentTrackingService?.checkEvolutionBadges(user?.id || null);
      if (badgesResult) {
        setEvolutionBadges(badgesResult);
      }
    } catch (err) {
      console.error('Load alignment data error:', err);
    }
  };

  const handleRefreshRecommendations = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await predictionEngineService?.generateRecommendations(user?.id || null, timeframe);
      
      if (error) {
        setError(error?.message || 'Failed to generate recommendations');
      } else if (data) {
        setRecommendations(data);
      }
    } catch (err) {
      console.error('Refresh recommendations error:', err);
      setError('Failed to refresh recommendations');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse mx-auto"></div>
          </div>
          <p className="text-zinc-600 text-sm tracking-wide">Preparing your insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <DemoModeBanner />
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <GreetingHeader />
        <WeeklySummary />
        <BrainCheckIn onCheckIn={handleBrainCheckIn} />

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
        {weeklyComparison && <WeeklyComparison comparison={weeklyComparison} />}
        
        {/* Alignment-based engagement */}
        <AlignmentDays 
          alignmentScore={alignmentData?.score} 
          recentAlignmentDays={alignmentData?.recentDays} 
        />
        
        <ConsistencyMoments moments={consistencyMoments} />
        
        <EvolutionBadges 
          badges={evolutionBadges?.badges} 
          newBadge={evolutionBadges?.newBadge} 
        />
        
        {sacredWindow && (
          <SacredFocusWindow 
            window={sacredWindow?.window} 
            category={sacredWindow?.category} 
          />
        )}
        
        {recognition && <QuietRecognition message={recognition} />}
        
        {/* Brain Signature */}
        <BrainSignature />

        {/* Productivity Score */}
        {todayData && (
          <ProductivityScore 
            score={todayData?.score}
            caption={todayData?.caption}
            explanation={todayData?.explanation}
          />
        )}
        
        <div className="mb-16 md:mb-20 lg:mb-24">
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => setTimeframe('overall')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                timeframe === 'overall' ?'bg-accent text-white' :'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Overall
            </button>
            <button
              onClick={() => setTimeframe('this_week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                timeframe === 'this_week' ?'bg-accent text-white' :'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              This Week
            </button>
            <button
              onClick={handleRefreshRecommendations}
              disabled={refreshing}
              className="px-4 py-2 rounded-md text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-all duration-300 disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <BestTimePredictions timeframe={timeframe} recommendations={recommendations} />
        </div>
        
        {/* Advanced Insights */}
        <AdvancedInsights 
          recentLogs={recentLogsForInsights} 
          workSessions={allWorkSessions}
          timeframe={timeframe}
        />
        
        {logData && <DailyLogSummary logData={logData} />}
        
        {previousDays?.length > 0 && <PreviousDays previousDays={previousDays} />}
        
        {reflectiveInsight && <ReflectiveInsight insight={reflectiveInsight} />}
      </div>
    </div>
  );
};

export default Today;