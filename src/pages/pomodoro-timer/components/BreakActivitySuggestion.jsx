import { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { getBreakActivitySuggestion } from '../../../services/notificationService';

const BreakActivitySuggestion = ({ sessionType }) => {
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    // Only show during breaks
    if (sessionType === 'short-break' || sessionType === 'long-break') {
      setActivity(getBreakActivitySuggestion());
    }
  }, [sessionType]);

  const handleRefresh = () => {
    setActivity(getBreakActivitySuggestion());
  };

  if (sessionType === 'focus' || !activity) return null;

  return (
    <div className="max-w-md mx-auto mb-8">
      <div className="bg-[rgba(57,255,136,0.05)] border border-[rgba(57,255,136,0.2)] rounded-lg p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon name="Sparkles" size={18} color="#39FF88" />
            <h3 className="text-sm font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Break Activity Suggestion
            </h3>
          </div>
          <button
            onClick={handleRefresh}
            className="p-1 hover:bg-[rgba(255,255,255,0.05)] rounded transition-colors"
            title="Get another suggestion"
          >
            <Icon name="RefreshCw" size={16} color="rgba(237,237,237,0.6)" />
          </button>
        </div>
        
        <div className="space-y-2">
          <p className="text-base font-medium text-[#EDEDED]">
            {activity?.title}
          </p>
          <p className="text-sm text-[rgba(237,237,237,0.7)]">
            {activity?.description}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
          <p className="text-xs text-[rgba(237,237,237,0.5)]">
            Take this time to recharge and reset your focus
          </p>
        </div>
      </div>
    </div>
  );
};

export default BreakActivitySuggestion;