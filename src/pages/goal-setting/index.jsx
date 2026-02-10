import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import DemoModeBanner from '../../components/DemoModeBanner';
import { useAuth } from '../../contexts/AuthContext';
import { productivityScoresService, dailyLogsService } from '../../services/voltaService';
import WeeklyTargets from './components/WeeklyTargets';
import MonthlyFocusHours from './components/MonthlyFocusHours';
import MilestoneTracking from './components/MilestoneTracking';

const GoalSetting = () => {
  const { user, isDemoMode } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentPerformance, setCurrentPerformance] = useState(null);
  const [goals, setGoals] = useState({
    weeklyTarget: 75,
    monthlyFocusHours: 120,
    milestones: [
      { id: 1, title: 'Achieve 80+ score for 5 consecutive days', completed: false, targetDate: '2026-03-01' },
      { id: 2, title: 'Complete 40 hours of deep work this month', completed: false, targetDate: '2026-02-28' },
      { id: 3, title: 'Maintain 7+ hours sleep for 2 weeks', completed: false, targetDate: '2026-02-24' }
    ]
  });

  useEffect(() => {
    loadCurrentPerformance();
  }, [user, isDemoMode]);

  const loadCurrentPerformance = async () => {
    try {
      setLoading(true);
      const today = new Date();
      
      // Get current week performance (last 7 days)
      const weekStart = new Date(today);
      weekStart?.setDate(today?.getDate() - 7);
      const { data: weekScores } = await productivityScoresService?.getByDateRange(
        user?.id || null,
        weekStart?.toISOString()?.split('T')?.[0],
        today?.toISOString()?.split('T')?.[0]
      );

      // Get current month performance
      const monthStart = new Date(today?.getFullYear(), today?.getMonth(), 1);
      const { data: monthLogs } = await dailyLogsService?.getByDateRange(
        user?.id || null,
        monthStart?.toISOString()?.split('T')?.[0],
        today?.toISOString()?.split('T')?.[0]
      );

      // Calculate current performance metrics
      const weekAverage = weekScores?.length > 0
        ? Math.round(weekScores?.reduce((sum, s) => sum + s?.score, 0) / weekScores?.length)
        : 0;

      // Calculate total focus hours from work sessions
      let totalFocusHours = 0;
      if (monthLogs?.length > 0) {
        monthLogs?.forEach(log => {
          if (log?.workSessions?.length > 0) {
            log?.workSessions?.forEach(session => {
              const start = session?.startTime?.split(':');
              const end = session?.endTime?.split(':');
              const hours = (parseInt(end?.[0]) - parseInt(start?.[0])) + (parseInt(end?.[1]) - parseInt(start?.[1])) / 60;
              totalFocusHours += hours;
            });
          }
        });
      }

      setCurrentPerformance({
        weekAverage,
        weekScores: weekScores || [],
        monthlyFocusHours: Math.round(totalFocusHours),
        monthLogs: monthLogs || []
      });

      setLoading(false);
    } catch (err) {
      console.error('Load current performance error:', err);
      setLoading(false);
    }
  };

  const handleWeeklyTargetChange = (newTarget) => {
    setGoals(prev => ({ ...prev, weeklyTarget: newTarget }));
  };

  const handleMonthlyHoursChange = (newHours) => {
    setGoals(prev => ({ ...prev, monthlyFocusHours: newHours }));
  };

  const handleMilestoneToggle = (milestoneId) => {
    setGoals(prev => ({
      ...prev,
      milestones: prev?.milestones?.map(m => 
        m?.id === milestoneId ? { ...m, completed: !m?.completed } : m
      )
    }));
  };

  const handleAddMilestone = (newMilestone) => {
    setGoals(prev => ({
      ...prev,
      milestones: [...prev?.milestones, { ...newMilestone, id: Date.now(), completed: false }]
    }));
  };

  const handleDeleteMilestone = (milestoneId) => {
    setGoals(prev => ({
      ...prev,
      milestones: prev?.milestones?.filter(m => m?.id !== milestoneId)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse mx-auto"></div>
          </div>
          <p className="text-muted-foreground text-sm tracking-wide">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Goal Setting - Volta</title>
      </Helmet>
      
      {isDemoMode && <DemoModeBanner />}
      
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
          {/* Header */}
          <div className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="Target" size={32} color="var(--color-accent)" strokeWidth={2} />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                Goal Setting
              </h1>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
              Set intentional productivity targets and track your progress against current performance data.
            </p>
          </div>

          {/* Goal Sections */}
          <div className="space-y-8 md:space-y-10 lg:space-y-12">
            {/* Weekly Productivity Targets */}
            <WeeklyTargets
              target={goals?.weeklyTarget}
              currentAverage={currentPerformance?.weekAverage}
              weekScores={currentPerformance?.weekScores}
              onTargetChange={handleWeeklyTargetChange}
            />

            {/* Monthly Focus Hours */}
            <MonthlyFocusHours
              target={goals?.monthlyFocusHours}
              currentHours={currentPerformance?.monthlyFocusHours}
              onTargetChange={handleMonthlyHoursChange}
            />

            {/* Milestone Tracking */}
            <MilestoneTracking
              milestones={goals?.milestones}
              onToggle={handleMilestoneToggle}
              onAdd={handleAddMilestone}
              onDelete={handleDeleteMilestone}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default GoalSetting;