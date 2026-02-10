import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ProfileSettings = ({ onSave }) => {
  const { userProfile, isDemoMode } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [autoDetectedTimezone, setAutoDetectedTimezone] = useState('');

  // Auto-detect timezone on mount
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat()?.resolvedOptions()?.timeZone;
      setAutoDetectedTimezone(detected);
      if (!userProfile?.timezone) {
        setTimezone(detected);
      }
    } catch (error) {
      console.error('Failed to detect timezone:', error);
      setAutoDetectedTimezone('America/Los_Angeles');
    }
  }, []);

  // Load user profile data
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile?.displayName || userProfile?.fullName || '');
      setTimezone(userProfile?.timezone || autoDetectedTimezone || 'America/Los_Angeles');
    }
  }, [userProfile, autoDetectedTimezone]);

  const handleSave = () => {
    onSave?.({ displayName, timezone });
  };

  const commonTimezones = [
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  ];

  return (
    <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon name="User" size={20} color="#39FF88" />
        <h2 className="text-xl font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Profile
        </h2>
      </div>
      {isDemoMode && (
        <div className="mb-6 p-4 bg-[rgba(255,180,0,0.1)] border border-[rgba(255,180,0,0.3)] rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="AlertCircle" size={16} color="#FFB800" className="mt-0.5" />
            <p className="text-xs text-[rgba(237,237,237,0.8)]">
              Profile changes in Demo Mode are saved locally only.
            </p>
          </div>
        </div>
      )}
      <div className="space-y-6">
        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[rgba(237,237,237,0.8)]">
            Display Name
          </label>
          <Input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e?.target?.value)}
            placeholder="How should we greet you?"
            className="w-full"
          />
          <p className="text-xs text-[rgba(237,237,237,0.5)] mt-2">
            This name will appear in your daily greeting.
          </p>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[rgba(237,237,237,0.8)]">
            Timezone
          </label>
          <Select
            value={timezone}
            onChange={(e) => setTimezone(e?.target?.value)}
            className="w-full"
          >
            {commonTimezones?.map((tz) => (
              <option key={tz?.value} value={tz?.value}>
                {tz?.label}
              </option>
            ))}
          </Select>
          {autoDetectedTimezone && (
            <p className="text-xs text-[rgba(237,237,237,0.5)] mt-2">
              Auto-detected: {autoDetectedTimezone}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;