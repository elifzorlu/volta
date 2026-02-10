/**
 * Google Analytics Event Tracking Utility
 * Provides helper functions to track user interactions and engagement
 */

/**
 * Track custom events in Google Analytics
 * @param {string} eventName - Name of the event (e.g., 'habit_logged', 'pomodoro_started')
 * @param {object} eventParams - Additional parameters for the event
 */
export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, {
      ...eventParams,
      timestamp: new Date()?.toISOString(),
    });
  }
};

/**
 * Track screen/page navigation
 * @param {string} screenName - Name of the screen being viewed
 */
export const trackScreenView = (screenName) => {
  trackEvent('screen_view', {
    screen_name: screenName,
    page_path: window.location?.pathname,
  });
};

/**
 * Track habit-related actions
 */
export const trackHabitEvent = (action, habitData = {}) => {
  trackEvent('habit_tracking', {
    action, // 'logged', 'completed', 'skipped', 'created'
    ...habitData,
  });
};

/**
 * Track Pomodoro timer events
 */
export const trackPomodoroEvent = (action, sessionData = {}) => {
  trackEvent('pomodoro_timer', {
    action, // 'started', 'completed', 'paused', 'cancelled'
    ...sessionData,
  });
};

/**
 * Track goal-setting interactions
 */
export const trackGoalEvent = (action, goalData = {}) => {
  trackEvent('goal_setting', {
    action, // 'created', 'updated', 'achieved', 'deleted'
    ...goalData,
  });
};

/**
 * Track brain check-in ritual completion
 */
export const trackBrainCheckIn = (checkInData = {}) => {
  trackEvent('brain_checkin', {
    ...checkInData,
  });
};

/**
 * Track user engagement metrics
 */
export const trackEngagement = (engagementType, data = {}) => {
  trackEvent('user_engagement', {
    engagement_type: engagementType,
    ...data,
  });
};

/**
 * Track feature usage
 */
export const trackFeatureUsage = (featureName, usageData = {}) => {
  trackEvent('feature_usage', {
    feature_name: featureName,
    ...usageData,
  });
};

/**
 * Track button clicks
 */
export const trackButtonClick = (buttonId, context = {}) => {
  trackEvent('button_click', {
    button_id: buttonId,
    page: window.location?.pathname,
    ...context,
  });
};

/**
 * Track form submissions
 */
export const trackFormSubmit = (formId, formData = {}) => {
  trackEvent('form_submit', {
    form_id: formId,
    page: window.location?.pathname,
    ...formData,
  });
};

export default {
  trackEvent,
  trackScreenView,
  trackHabitEvent,
  trackPomodoroEvent,
  trackGoalEvent,
  trackBrainCheckIn,
  trackEngagement,
  trackFeatureUsage,
  trackButtonClick,
  trackFormSubmit,
};