import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import BrainCheckInRitual from './pages/BrainCheckInRitual';
import Today from './pages/today';
import History from './pages/history';
import Log from './pages/log';
import Schedule from './pages/schedule';
import PomodoroTimer from './pages/pomodoro-timer';
import Settings from './pages/settings';
import GoalSetting from './pages/goal-setting';

const Routes = () => {
  // Check if user has checked in today
  const today = new Date()?.toISOString()?.split('T')?.[0];
  const lastCheckIn = localStorage?.getItem('volta_brain_checkin_date');
  const hasCheckedInToday = lastCheckIn === today;

  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={hasCheckedInToday ? <Today /> : <BrainCheckInRitual />} />
        <Route path="/ritual" element={<BrainCheckInRitual />} />
        <Route path="/today" element={<Today />} />
        <Route path="/history" element={<History />} />
        <Route path="/log" element={<Log />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/pomodoro-timer" element={<PomodoroTimer />} />
        <Route path="/goal-setting" element={<GoalSetting />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
