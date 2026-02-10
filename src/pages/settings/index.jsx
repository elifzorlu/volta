import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DemoModeBanner from '../../components/DemoModeBanner';
import PomodoroSettings from './components/PomodoroSettings';
import ThemeSettings from './components/ThemeSettings';
import NotificationSettings from './components/NotificationSettings';
import AccountSettings from './components/AccountSettings';
import ProfileSettings from './components/ProfileSettings';
import StartFreshSection from './components/StartFreshSection';
import DemoModeToggle from './components/DemoModeToggle';
import Button from '../../components/ui/Button';

const Settings = () => {
  const { user, userProfile, updateProfile, isDemoMode } = useAuth();
  const [settings, setSettings] = useState({
    // Pomodoro settings
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    pomodorosUntilLongBreak: 4,
    // Theme settings
    theme: 'default',
    // Notification settings
    sessionCompletionAlerts: true,
    breakReminders: true,
    dailyReflectionPrompts: true,
    soundEnabled: true,
    // Time-based notification settings
    notificationTimes: ['09:00', '21:00'],
    notificationEnabled: true
  });
  const [profileData, setProfileData] = useState({
    displayName: '',
    timezone: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load settings from user profile
  useEffect(() => {
    if (userProfile?.settings) {
      setSettings(prev => ({
        ...prev,
        ...userProfile?.settings
      }));
    }
    if (userProfile) {
      setProfileData({
        displayName: userProfile?.displayName || '',
        timezone: userProfile?.timezone || ''
      });
      // Load notification times from profile
      if (userProfile?.notificationTimes) {
        setSettings(prev => ({
          ...prev,
          notificationTimes: userProfile?.notificationTimes,
          notificationEnabled: userProfile?.notificationEnabled !== false
        }));
      }
    }
  }, [userProfile]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setSaveMessage(''); // Clear save message on change
  };

  const handleProfileSave = (data) => {
    setProfileData(data);
    setSaveMessage('');
  };

  const handleSaveSettings = async () => {
    if (isDemoMode) {
      setSaveMessage('Settings saved locally (Demo Mode)');
      localStorage.setItem('volta_settings', JSON.stringify({ ...settings, ...profileData }));
      localStorage.setItem('volta_notification_times', JSON.stringify(settings?.notificationTimes));
      localStorage.setItem('volta_notification_enabled', settings?.notificationEnabled?.toString());
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await updateProfile({ 
        settings,
        display_name: profileData?.displayName,
        timezone: profileData?.timezone,
        notification_times: settings?.notificationTimes,
        notification_enabled: settings?.notificationEnabled
      });
      if (error) {
        setSaveMessage('Failed to save settings');
      } else {
        setSaveMessage('Settings saved successfully');
      }
    } catch (error) {
      setSaveMessage('Error saving settings');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#EDEDED] pb-24 lg:pb-8">
      {isDemoMode && <DemoModeBanner />}
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Settings
          </h1>
          <p className="text-[rgba(237,237,237,0.6)] text-sm">
            Customize your Volta experience
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Profile Settings */}
          <ProfileSettings onSave={handleProfileSave} />

          {/* Demo Mode Toggle */}
          <DemoModeToggle />

          {/* Pomodoro Customization */}
          <PomodoroSettings 
            settings={settings}
            onChange={handleSettingChange}
          />

          {/* Theme Options */}
          <ThemeSettings 
            settings={settings}
            onChange={handleSettingChange}
          />

          {/* Notification Preferences */}
          <NotificationSettings 
            settings={settings}
            onChange={handleSettingChange}
          />

          {/* Start Fresh Section */}
          <StartFreshSection />

          {/* Account Management */}
          <AccountSettings />
        </div>

        {/* Save Button */}
        <div className="mt-12 flex items-center gap-4">
          <Button
            onClick={handleSaveSettings}
            loading={isSaving}
            disabled={isSaving}
            className="bg-[#39FF88] text-black hover:bg-[#39FF88]/90 font-medium px-8"
          >
            Save Settings
          </Button>
          {saveMessage && (
            <span className={`text-sm ${
              saveMessage?.includes('success') ? 'text-[#39FF88]' : 'text-[#FF4444]'
            }`}>
              {saveMessage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;