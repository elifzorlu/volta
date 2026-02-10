import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';

const NotificationSettings = ({ settings, onChange }) => {
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

  return (
    <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon name="Bell" size={20} color="#39FF88" />
        <h2 className="text-xl font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Notification Preferences
        </h2>
      </div>

      <div className="space-y-4">
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