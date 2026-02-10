import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const NotificationSettings = ({ settings, onChange }) => {
  const [notificationTimes, setNotificationTimes] = useState(
    settings?.notificationTimes || ['09:00', '21:00']
  );
  const [notificationEnabled, setNotificationEnabled] = useState(
    settings?.notificationEnabled !== false
  );

  const notificationOptions = [
    {
      key: 'sessionCompletionAlerts',
      label: 'Session Completion Alerts',
      description: 'Get notified when a focus session or break ends',
      icon: 'Bell'
    },
    {
      key: 'breakReminders',
      label: 'Break Reminders',
      description: 'Gentle reminders to take breaks during long work sessions',
      icon: 'Clock'
    },
    {
      key: 'dailyReflectionPrompts',
      label: 'Daily Reflection Prompts',
      description: 'Evening prompts to log your day and reflect on productivity',
      icon: 'MessageSquare'
    },
    {
      key: 'soundEnabled',
      label: 'Sound Notifications',
      description: 'Play subtle sounds for timer completions and alerts',
      icon: 'Volume2'
    }
  ];

  const handleToggle = (key) => {
    onChange(key, !settings?.[key]);
  };

  const handleNotificationEnabledToggle = () => {
    const newValue = !notificationEnabled;
    setNotificationEnabled(newValue);
    onChange('notificationEnabled', newValue);
  };

  const handleTimeChange = (index, value) => {
    const newTimes = [...notificationTimes];
    newTimes[index] = value;
    setNotificationTimes(newTimes);
    onChange('notificationTimes', newTimes);
  };

  const handleAddTime = () => {
    const newTimes = [...notificationTimes, '12:00'];
    setNotificationTimes(newTimes);
    onChange('notificationTimes', newTimes);
  };

  const handleRemoveTime = (index) => {
    if (notificationTimes?.length <= 1) return; // Keep at least one time
    const newTimes = notificationTimes?.filter((_, i) => i !== index);
    setNotificationTimes(newTimes);
    onChange('notificationTimes', newTimes);
  };

  return (
    <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon name="Bell" size={20} color="#39FF88" />
        <h2 className="text-xl font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Notification Preferences
        </h2>
      </div>

      <div className="space-y-6">
        {/* Time-Based Daily Log Reminders */}
        <div className="p-4 bg-[rgba(57,255,136,0.03)] border border-[rgba(57,255,136,0.15)] rounded-lg">
          <div className="flex items-start gap-3 mb-4">
            <Icon name="Clock" size={18} color="#39FF88" className="mt-1" />
            <div className="flex-1">
              <h3 className="text-sm font-medium mb-1">Daily Log Reminders</h3>
              <p className="text-xs text-[rgba(237,237,237,0.6)] mb-3">
                Get gentle prompts at specific times to log your daily metrics and build consistent reflection habits
              </p>
              
              {/* Enable/Disable Toggle */}
              <div className="mb-4">
                <Checkbox
                  id="notification-enabled"
                  checked={notificationEnabled}
                  onChange={handleNotificationEnabledToggle}
                  label="Enable time-based reminders"
                />
              </div>

              {/* Time Pickers */}
              {notificationEnabled && (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-[rgba(237,237,237,0.8)]">
                    Reminder Times (your local timezone)
                  </label>
                  {notificationTimes?.map((time, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => handleTimeChange(index, e?.target?.value)}
                        className="flex-1 px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md text-sm text-[#EDEDED] focus:outline-none focus:border-[#39FF88] transition-colors"
                      />
                      {notificationTimes?.length > 1 && (
                        <button
                          onClick={() => handleRemoveTime(index)}
                          className="p-2 hover:bg-[rgba(255,255,255,0.05)] rounded-md transition-colors"
                        >
                          <Icon name="X" size={16} color="rgba(237,237,237,0.6)" />
                        </button>
                      )}
                    </div>
                  ))}
                  {notificationTimes?.length < 5 && (
                    <Button
                      onClick={handleAddTime}
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                    >
                      <Icon name="Plus" size={14} className="mr-2" />
                      Add Another Time
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Existing Notification Options */}
        {notificationOptions?.map((option) => (
          <div
            key={option?.key}
            className="flex items-start gap-4 p-4 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-colors"
          >
            <div className="mt-1">
              <Icon name={option?.icon} size={18} color="rgba(237,237,237,0.6)" />
            </div>
            <div className="flex-1">
              <Checkbox
                id={option?.key}
                checked={settings?.[option?.key]}
                onChange={() => handleToggle(option?.key)}
                label={option?.label}
                description={option?.description}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-[rgba(57,255,136,0.05)] border border-[rgba(57,255,136,0.2)] rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={16} color="#39FF88" className="mt-0.5" />
          <p className="text-xs text-[rgba(237,237,237,0.8)]">
            Browser notifications require permission. You'll be prompted when enabling these features.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;