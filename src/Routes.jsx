import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NavigationContainer from "components/ui/NavigationContainer";
import NotFound from "pages/NotFound";
import BrainCheckInRitual from './pages/BrainCheckInRitual';
import Welcome from './pages/welcome';
import Auth from './pages/auth';
import PersonalSetup from './pages/personal-setup';
import DemoIntroduction from './pages/demo-introduction';
import Today from './pages/today';
import History from './pages/history';
import Log from './pages/log';
import Schedule from './pages/schedule';
import PomodoroTimer from './pages/pomodoro-timer';
import Settings from './pages/settings';
import GoalSetting from './pages/goal-setting';
import Predictions from './pages/predictions';
import useGoogleAnalytics from './hooks/useGoogleAnalytics';
import { useAuth } from './contexts/AuthContext';

// Wrapper component to use hooks inside BrowserRouter context
const AnalyticsWrapper = ({ children }) => {
  useGoogleAnalytics();
  return children;
};

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading, isDemoMode } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse mx-auto"></div>
          </div>
          <p className="text-zinc-600 text-sm tracking-wide">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Allow access in demo mode or if authenticated
  if (!user && !isDemoMode) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

// Auth route wrapper (redirects authenticated users away from auth page)
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse mx-auto"></div>
          </div>
          <p className="text-zinc-600 text-sm tracking-wide">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If user is authenticated, redirect to today page
  if (user) {
    const onboardingComplete = localStorage?.getItem('volta_onboarding_complete');
    return <Navigate to={onboardingComplete ? '/today' : '/personal-setup'} replace />;
  }
  
  return children;
};

const Routes = () => {
  // Check if onboarding is complete
  const onboardingComplete = localStorage?.getItem('volta_onboarding_complete');
  
  // Check if user has checked in today
  const today = new Date()?.toISOString()?.split('T')?.[0];
  const lastCheckIn = localStorage?.getItem('volta_brain_checkin_date');
  const hasCheckedInToday = lastCheckIn === today;

  // Determine the default route
  const getDefaultRoute = () => {
    if (!onboardingComplete) {
      return <Welcome />;
    }
    if (!hasCheckedInToday) {
      return <BrainCheckInRitual />;
    }
    return <NavigationContainer />;
  };

  return (
    <BrowserRouter>
      <AnalyticsWrapper>
        <ErrorBoundary>
          <ScrollToTop />
          <RouterRoutes>
            {/* Public onboarding routes */}
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/demo-introduction" element={<DemoIntroduction />} />
            
            {/* Auth route - redirects if already authenticated */}
            <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
            
            {/* Protected onboarding route */}
            <Route path="/personal-setup" element={<ProtectedRoute><PersonalSetup /></ProtectedRoute>} />
            
            {/* Root route with conditional rendering */}
            <Route path="/" element={getDefaultRoute()}>
              {onboardingComplete && hasCheckedInToday && <Route index element={<Today />} />}
            </Route>
            
            {/* Ritual page - protected */}
            <Route path="/ritual" element={<ProtectedRoute><BrainCheckInRitual /></ProtectedRoute>} />
            
            {/* All other pages with navigation - protected */}
            <Route element={<ProtectedRoute><NavigationContainer /></ProtectedRoute>}>
              <Route path="/today" element={<Today />} />
              <Route path="/history" element={<History />} />
              <Route path="/log" element={<Log />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/pomodoro-timer" element={<PomodoroTimer />} />
              <Route path="/goal-setting" element={<GoalSetting />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ErrorBoundary>
      </AnalyticsWrapper>
    </BrowserRouter>
  );
};

export default Routes;
