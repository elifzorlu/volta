// Notification Service for time-based reminders
// Handles browser Notification API, permission requests, and scheduling

import { supabase } from '../lib/supabase';
import { isDemoMode } from '../utils/demoData';

// Request notification permission from browser
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return { granted: false, error: 'Notifications not supported' };
  }

  if (Notification.permission === 'granted') {
    return { granted: true };
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return { granted: permission === 'granted' };
  }

  return { granted: false, error: 'Permission denied' };
};

// Show browser notification
export const showNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const defaultOptions = {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'volta-reminder',
    requireInteraction: false,
    ...options
  };

  return new Notification(title, defaultOptions);
};

// Get notification times from user profile
export const getNotificationTimes = async (userId) => {
  // Demo mode: return from localStorage
  if (isDemoMode(userId)) {
    const stored = localStorage.getItem('volta_notification_times');
    return stored ? JSON.parse(stored) : ['09:00', '21:00'];
  }

  try {
    const { data, error } = await supabase?.from('user_profiles')?.select('notification_times, notification_enabled')?.eq('id', userId)?.single();

    if (error || !data?.notification_enabled) {
      return [];
    }

    return data?.notification_times || [];
  } catch (error) {
    console.error('Failed to get notification times:', error);
    return [];
  }
};

// Save notification times to user profile
export const saveNotificationTimes = async (userId, times, enabled) => {
  // Demo mode: save to localStorage
  if (isDemoMode(userId)) {
    localStorage.setItem('volta_notification_times', JSON.stringify(times));
    localStorage.setItem('volta_notification_enabled', enabled?.toString());
    return { success: true };
  }

  try {
    const { error } = await supabase?.from('user_profiles')?.update({
        notification_times: times,
        notification_enabled: enabled
      })?.eq('id', userId);

    return { success: !error, error };
  } catch (error) {
    console.error('Failed to save notification times:', error);
    return { success: false, error };
  }
};

// Check if it's time to show notification
export const shouldShowNotification = (notificationTimes, timezone) => {
  if (!notificationTimes?.length) return false;

  const now = new Date();
  const currentTime = now?.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone || 'America/Los_Angeles'
  });

  // Check if current time matches any notification time (within 1 minute)
  return notificationTimes?.some(time => {
    const [notifHour, notifMin] = time?.split(':')?.map(Number);
    const [currentHour, currentMin] = currentTime?.split(':')?.map(Number);
    
    return notifHour === currentHour && Math.abs(notifMin - currentMin) <= 1;
  });
};

// Show daily log reminder notification
export const showDailyLogReminder = () => {
  const messages = [
    'Time to reflect on your day 🌙',
    'How was your productivity today? 📊',
    'Quick check-in: Log your daily metrics ✨',
    'A moment to track your progress 🎯',
    'Reflect and log your day 💭'
  ];

  const randomMessage = messages?.[Math.floor(Math.random() * messages?.length)];

  return showNotification('Volta Daily Log', {
    body: randomMessage,
    tag: 'daily-log-reminder',
    requireInteraction: false
  });
};

// Show focus timer completion notification
export const showFocusTimerComplete = () => {
  return showNotification('Focus Session Complete! 🎯', {
    body: 'Great work! Time for a well-deserved break.',
    tag: 'focus-timer-complete',
    requireInteraction: false
  });
};

// Show break timer completion notification
export const showBreakTimerComplete = (breakType = 'short') => {
  const message = breakType === 'long' ?'Long break complete! Ready to dive back in?' :'Break time is over. Let\'s get back to focus!';
  
  return showNotification('Break Complete 🔔', {
    body: message,
    tag: 'break-timer-complete',
    requireInteraction: false
  });
};

// Get random break activity suggestion
export const getBreakActivitySuggestion = () => {
  const activities = [
    { title: '🚶 Take a Walk', description: 'Step outside for 5 minutes of fresh air' },
    { title: '💧 Hydrate', description: 'Drink a glass of water and stretch' },
    { title: '👀 Eye Rest', description: 'Look at something 20 feet away for 20 seconds' },
    { title: '🧘 Breathe', description: 'Try 5 deep breaths to reset your mind' },
    { title: '🎵 Music Break', description: 'Listen to your favorite song' },
    { title: '📱 Quick Chat', description: 'Send a message to someone you care about' },
    { title: '☕ Tea Time', description: 'Make yourself a warm beverage' },
    { title: '🌱 Plant Check', description: 'Water your plants or look at nature' },
    { title: '📝 Quick Journal', description: 'Write down one thing you\'re grateful for' },
    { title: '🤸 Stretch', description: 'Do some light stretches at your desk' },
    { title: '🧹 Tidy Up', description: 'Organize your workspace for 5 minutes' },
    { title: '🎨 Doodle', description: 'Draw something simple to reset creativity' }
  ];

  return activities?.[Math.floor(Math.random() * activities?.length)];
};

export default {
  requestNotificationPermission,
  showNotification,
  getNotificationTimes,
  saveNotificationTimes,
  shouldShowNotification,
  showDailyLogReminder,
  showFocusTimerComplete,
  showBreakTimerComplete,
  getBreakActivitySuggestion
};