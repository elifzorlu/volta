import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';


const AccountSettings = () => {
  const { user, isDemoMode } = useAuth();
  const [exportLoading, setExportLoading] = useState(false);

  const handleExportData = async () => {
    setExportLoading(true);
    // Simulate export process
    setTimeout(() => {
      setExportLoading(false);
      alert('Data export feature coming soon!');
    }, 1500);
  };

  const accountActions = [
    {
      icon: 'User',
      label: 'Profile Settings',
      description: 'Update your name, email, and profile information',
      action: () => alert('Profile settings coming soon!'),
      variant: 'ghost'
    },
    {
      icon: 'Download',
      label: 'Export Data',
      description: 'Download all your productivity data and insights',
      action: handleExportData,
      loading: exportLoading,
      variant: 'ghost'
    },
    {
      icon: 'Shield',
      label: 'Privacy & Security',
      description: 'Manage data privacy and security preferences',
      action: () => alert('Privacy settings coming soon!'),
      variant: 'ghost'
    },
    {
      icon: 'Trash2',
      label: 'Delete Account',
      description: 'Permanently delete your account and all data',
      action: () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
          alert('Account deletion coming soon!');
        }
      },
      variant: 'destructive',
      destructive: true
    }
  ];

  return (
    <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon name="Settings" size={20} color="#39FF88" />
        <h2 className="text-xl font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Account Management
        </h2>
      </div>

      {isDemoMode && (
        <div className="mb-6 p-4 bg-[rgba(255,180,0,0.1)] border border-[rgba(255,180,0,0.3)] rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="AlertCircle" size={16} color="#FFB800" className="mt-0.5" />
            <p className="text-xs text-[rgba(237,237,237,0.8)]">
              You're in Demo Mode. Sign in to access full account management features.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {accountActions?.map((action, index) => (
          <button
            key={index}
            onClick={action?.action}
            disabled={action?.loading || (isDemoMode && action?.destructive)}
            className={`w-full flex items-center gap-4 p-4 rounded-lg border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] transition-all text-left ${
              action?.destructive ? 'hover:border-[#FF4444] hover:bg-[rgba(255,68,68,0.05)]' : ''
            } ${
              action?.loading || (isDemoMode && action?.destructive) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className={`p-2 rounded-lg ${
              action?.destructive ? 'bg-[rgba(255,68,68,0.1)]' : 'bg-[rgba(57,255,136,0.1)]'
            }`}>
              <Icon 
                name={action?.icon} 
                size={18} 
                color={action?.destructive ? '#FF4444' : '#39FF88'} 
              />
            </div>
            <div className="flex-1">
              <h3 className={`font-medium text-sm mb-1 ${
                action?.destructive ? 'text-[#FF4444]' : ''
              }`}>
                {action?.label}
              </h3>
              <p className="text-xs text-[rgba(237,237,237,0.6)]">
                {action?.description}
              </p>
            </div>
            {action?.loading && (
              <div className="animate-spin">
                <Icon name="Loader2" size={16} color="rgba(237,237,237,0.6)" />
              </div>
            )}
          </button>
        ))}
      </div>

      {user && (
        <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2 text-xs text-[rgba(237,237,237,0.6)]">
            <Icon name="Mail" size={14} color="rgba(237,237,237,0.6)" />
            <span>{user?.email}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;