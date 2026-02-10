import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import ResetDataModal from './ResetDataModal';
import { supabase } from '../../../lib/supabase';

const StartFreshSection = () => {
  const { user, isDemoMode, userProfile, updateProfile } = useAuth();
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleResetData = async (deleteProfile) => {
    if (isDemoMode) {
      // Clear local storage for demo mode
      localStorage.removeItem('volta_demo_data');
      localStorage.removeItem('volta_settings');
      setResetMessage('Demo data cleared successfully');
      setShowResetModal(false);
      setTimeout(() => {
        setResetMessage('');
        window.location?.reload();
      }, 1500);
      return;
    }

    setResetting(true);
    try {
      const userId = user?.id;

      // Delete data in order (children first)
      await supabase?.from('work_sessions')?.delete()?.eq('user_id', userId);
      await supabase?.from('daily_logs')?.delete()?.eq('user_id', userId);
      await supabase?.from('commitments')?.delete()?.eq('user_id', userId);
      await supabase?.from('productivity_scores')?.delete()?.eq('user_id', userId);
      await supabase?.from('recommendations')?.delete()?.eq('user_id', userId);
      await supabase?.from('custom_categories')?.delete()?.eq('user_id', userId);
      await supabase?.from('rest_days')?.delete()?.eq('user_id', userId);

      // Clear evolution badges from profile
      await supabase?.from('user_profiles')?.update({ evolution_badges: [] })?.eq('id', userId);

      // Delete profile if requested
      if (deleteProfile) {
        await updateProfile?.({ display_name: null, timezone: 'America/Los_Angeles' });
      }

      setResetMessage('Data reset successfully');
      setShowResetModal(false);
      
      // Reload page after short delay to show fresh state
      setTimeout(() => {
        window.location?.reload();
      }, 1500);
    } catch (error) {
      console.error('Reset error:', error);
      setResetMessage('Failed to reset data: ' + error?.message);
    } finally {
      setResetting(false);
      setTimeout(() => setResetMessage(''), 3000);
    }
  };

  return (
    <>
      <div className="border border-[rgba(255,68,68,0.2)] rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Icon name="RotateCcw" size={20} color="#FF4444" />
          <h2 className="text-xl font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Start Fresh
          </h2>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-[rgba(237,237,237,0.7)]">
            Reset all your productivity data and start with a clean slate. This action cannot be undone.
          </p>

          <Button
            onClick={() => setShowResetModal(true)}
            className="bg-transparent border border-[#FF4444] text-[#FF4444] hover:bg-[rgba(255,68,68,0.1)] font-medium"
          >
            <Icon name="Trash2" size={16} color="#FF4444" className="mr-2" />
            Reset My Data
          </Button>

          {resetMessage && (
            <div className={`text-sm ${
              resetMessage?.includes('success') ? 'text-[#39FF88]' : 'text-[#FF4444]'
            }`}>
              {resetMessage}
            </div>
          )}
        </div>
      </div>

      <ResetDataModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetData}
        loading={resetting}
      />
    </>
  );
};

export default StartFreshSection;