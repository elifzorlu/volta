import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';

const BrainCheckIn = ({ onCheckIn }) => {
  const { user, isDemoMode } = useAuth();
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [selectedState, setSelectedState] = useState(null);

  useEffect(() => {
    // Check if user has already checked in today
    const today = new Date()?.toISOString()?.split('T')?.[0];
    const lastCheckIn = localStorage?.getItem('volta_brain_checkin_date');
    if (lastCheckIn === today) {
      setHasCheckedIn(true);
      setSelectedState(localStorage?.getItem('volta_brain_checkin_state'));
    }
  }, []);

  const handleCheckIn = (state) => {
    const today = new Date()?.toISOString()?.split('T')?.[0];
    localStorage?.setItem('volta_brain_checkin_date', today);
    localStorage?.setItem('volta_brain_checkin_state', state);
    setSelectedState(state);
    setHasCheckedIn(true);
    
    // Callback for parent component
    if (onCheckIn) {
      onCheckIn(state);
    }
  };

  // Always hide since ritual happens on separate screen now
  if (hasCheckedIn) return null;

  const brainStates = [
    { id: 'clear', label: 'Clear', icon: 'Sun', color: 'var(--color-accent)' },
    { id: 'foggy', label: 'Foggy', icon: 'Cloud', color: 'var(--color-muted-foreground)' },
    { id: 'restless', label: 'Restless', icon: 'Zap', color: 'var(--color-warning)' },
    { id: 'sharp', label: 'Sharp', icon: 'Sparkles', color: 'var(--color-accent)' }
  ];

  return (
    <div className="mb-16 md:mb-20 opacity-0 animate-fadeIn">
      <div className="bg-muted/10 border border-border/30 rounded-2xl p-8 md:p-10">
        <p className="text-base md:text-lg text-foreground mb-6 text-center">
          Before we begin — how does your brain feel?
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {brainStates?.map((state) => (
            <button
              key={state?.id}
              onClick={() => handleCheckIn(state?.id)}
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-muted/20 border border-border/50 hover:border-accent/50 hover:bg-accent/5 transition-all duration-250 group"
            >
              <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-250">
                <Icon
                  name={state?.icon}
                  size={24}
                  color={state?.color}
                  strokeWidth={2}
                />
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-250">
                {state?.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrainCheckIn;