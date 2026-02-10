import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';

const DemoModeToggle = () => {
  const { isDemoMode, isAuthenticated } = useAuth();
  const [localDemoMode, setLocalDemoMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('volta_force_demo_mode');
    setLocalDemoMode(stored === 'true');
  }, []);

  const handleToggle = () => {
    const newValue = !localDemoMode;
    setLocalDemoMode(newValue);
    localStorage.setItem('volta_force_demo_mode', String(newValue));
    
    // Reload to apply changes
    setTimeout(() => {
      window.location?.reload();
    }, 300);
  };

  // Only show if user is authenticated (otherwise they're already in demo mode)
  if (!isAuthenticated) {
    return (
      <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="Eye" size={20} color="#39FF88" />
          <h2 className="text-xl font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Demo Mode
          </h2>
        </div>
        <p className="text-sm text-[rgba(237,237,237,0.7)]">
          You are currently viewing demo data. Sign in to track your own productivity.
        </p>
        <div className="mt-4 p-4 bg-[rgba(57,255,136,0.05)] border border-[rgba(57,255,136,0.2)] rounded-lg">
          <p className="text-xs text-[rgba(237,237,237,0.8)]">
            💡 Start tracking to personalize your Volta experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="Eye" size={20} color="#39FF88" />
        <h2 className="text-xl font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Demo Mode
        </h2>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-[rgba(237,237,237,0.7)]">
          Toggle between your real data and demo data for exploration.
        </p>

        <div className="flex items-center justify-between p-4 bg-[rgba(255,255,255,0.02)] rounded-lg border border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-3">
            <Icon 
              name={localDemoMode ? 'Eye' : 'EyeOff'} 
              size={18} 
              color={localDemoMode ? '#39FF88' : 'rgba(237,237,237,0.6)'} 
            />
            <div>
              <p className="text-sm font-medium">
                {localDemoMode ? 'Using Demo Data' : 'Using My Data'}
              </p>
              <p className="text-xs text-[rgba(237,237,237,0.5)]">
                {localDemoMode ? 'Viewing sample data only' : 'Viewing your real productivity data'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localDemoMode ? 'bg-[#39FF88]' : 'bg-[rgba(255,255,255,0.1)]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localDemoMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {localDemoMode && (
          <div className="p-4 bg-[rgba(255,180,0,0.1)] border border-[rgba(255,180,0,0.3)] rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="AlertCircle" size={16} color="#FFB800" className="mt-0.5" />
              <p className="text-xs text-[rgba(237,237,237,0.8)]">
                Demo mode is active. No changes will be saved to your account.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoModeToggle;