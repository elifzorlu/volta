import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
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

// Wrapper component to use hooks inside BrowserRouter context
const AnalyticsWrapper = ({ children }) => {
  useGoogleAnalytics();
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
            {/* Onboarding routes without navigation */}
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/personal-setup" element={<PersonalSetup />} />
            <Route path="/demo-introduction" element={<DemoIntroduction />} />
            
            {/* Root route with conditional rendering */}
            <Route path="/" element={getDefaultRoute()}>
              {onboardingComplete && hasCheckedInToday && <Route index element={<Today />} />}
            </Route>
            
            {/* Ritual page without navigation */}
            <Route path="/ritual" element={<BrainCheckInRitual />} />
            
            {/* All other pages with navigation */}
            <Route element={<NavigationContainer />}>
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
