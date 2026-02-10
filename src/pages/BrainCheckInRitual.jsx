import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/AppIcon';
import VoltaLogo from '../components/VoltaLogo';
import { restDayService } from '../services/voltaService';
import { useAuth } from '../contexts/AuthContext';

const BrainCheckInRitual = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedState, setSelectedState] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showRestDayModal, setShowRestDayModal] = useState(false);
  const [restDayDuration, setRestDayDuration] = useState(1);
  const [isSubmittingRest, setIsSubmittingRest] = useState(false);

  const handleCheckIn = (state) => {
    const today = new Date()?.toISOString()?.split('T')?.[0];
    localStorage?.setItem('volta_brain_checkin_date', today);
    localStorage?.setItem('volta_brain_checkin_state', state);
    setSelectedState(state);
    
    // Smooth transition to Today screen
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/today');
    }, 600);
  };

  const handleRestDay = async () => {
    setIsSubmittingRest(true);
    const today = new Date();
    const startDate = today?.toISOString()?.split('T')?.[0];
    const endDate = new Date(today?.getTime() + (restDayDuration - 1) * 24 * 60 * 60 * 1000)?.toISOString()?.split('T')?.[0];
    
    const userId = user?.id || 'demo-user';
    
    const { error } = await restDayService?.create(userId, {
      startDate,
      endDate,
      reason: 'User-initiated rest period'
    });

    setIsSubmittingRest(false);

    if (!error) {
      // Store rest day info in localStorage for demo mode
      localStorage?.setItem('volta_rest_day_start', startDate);
      localStorage?.setItem('volta_rest_day_end', endDate);
      
      // Transition to Today screen
      setIsTransitioning(true);
      setTimeout(() => {
        navigate('/today');
      }, 600);
    }
  };

  const brainStates = [
    { id: 'clear', label: 'Clear', icon: 'Sun', color: '#10b981' },
    { id: 'foggy', label: 'Foggy', icon: 'Cloud', color: '#6b7280' },
    { id: 'restless', label: 'Restless', icon: 'Zap', color: '#f59e0b' },
    { id: 'sharp', label: 'Sharp', icon: 'Sparkles', color: '#10b981' }
  ];

  return (
    <div className={`min-h-screen bg-black flex items-center justify-center px-4 transition-opacity duration-600 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <VoltaLogo className="h-8" />
        </div>
        
        {/* Heading */}
        <h1 className="text-2xl md:text-3xl text-white text-center mb-12 font-light">
          Before we begin — how does your brain feel?
        </h1>
        
        {/* Brain State Options */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {brainStates?.map((state) => (
            <button
              key={state?.id}
              onClick={() => handleCheckIn(state?.id)}
              className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-[#10b981]/50 hover:bg-zinc-900 transition-all duration-300 group active:scale-95"
            >
              <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon
                  name={state?.icon}
                  size={28}
                  color={state?.color}
                  strokeWidth={2}
                />
              </div>
              <span className="text-base text-zinc-400 group-hover:text-white transition-colors duration-300 font-medium">
                {state?.label}
              </span>
            </button>
          ))}
        </div>

        {/* Rest Day Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => setShowRestDayModal(true)}
            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-300 group"
          >
            <Icon name="Moon" size={20} color="#6b7280" strokeWidth={2} />
            <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
              I'm on rest
            </span>
          </button>
        </div>

        {/* Subtle hint */}
        <div className="text-center mt-8">
          <p className="text-sm text-zinc-600">One tap to begin</p>
        </div>
      </div>

      {/* Rest Day Modal */}
      {showRestDayModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <Icon name="Moon" size={24} color="#6b7280" strokeWidth={2} />
              </div>
              <h2 className="text-xl text-white font-light">Rest Period</h2>
            </div>

            <p className="text-zinc-400 text-sm mb-6">
              Take a break without affecting your alignment tracking. Your data stays clean.
            </p>

            <div className="mb-6">
              <label className="text-sm text-zinc-400 mb-2 block">How many days?</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setRestDayDuration(Math.max(1, restDayDuration - 1))}
                  className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                  disabled={restDayDuration <= 1}
                >
                  <Icon name="Minus" size={16} color="#fff" strokeWidth={2} />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-3xl text-white font-light">{restDayDuration}</span>
                  <span className="text-sm text-zinc-500 ml-2">{restDayDuration === 1 ? 'day' : 'days'}</span>
                </div>
                <button
                  onClick={() => setRestDayDuration(Math.min(30, restDayDuration + 1))}
                  className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                  disabled={restDayDuration >= 30}
                >
                  <Icon name="Plus" size={16} color="#fff" strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRestDayModal(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                disabled={isSubmittingRest}
              >
                Cancel
              </button>
              <button
                onClick={handleRestDay}
                className="flex-1 px-4 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmittingRest}
              >
                {isSubmittingRest ? 'Setting...' : 'Confirm Rest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrainCheckInRitual;