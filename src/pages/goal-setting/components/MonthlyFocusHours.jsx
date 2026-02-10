import { useState } from 'react';
import Icon from '../../../components/AppIcon';

const MonthlyFocusHours = ({ target, currentHours, onTargetChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTarget, setTempTarget] = useState(target);

  const handleIncrement = () => {
    setTempTarget(prev => Math.min(500, prev + 10));
  };

  const handleDecrement = () => {
    setTempTarget(prev => Math.max(0, prev - 10));
  };

  const handleSave = () => {
    onTargetChange(tempTarget);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempTarget(target);
    setIsEditing(false);
  };

  const progressPercentage = target > 0 ? Math.min(100, (currentHours / target) * 100) : 0;
  const remainingHours = Math.max(0, target - currentHours);
  const isOnTrack = currentHours >= target;

  // Calculate daily average needed
  const today = new Date();
  const daysInMonth = new Date(today?.getFullYear(), today?.getMonth() + 1, 0)?.getDate();
  const daysRemaining = daysInMonth - today?.getDate();
  const dailyHoursNeeded = daysRemaining > 0 ? (remainingHours / daysRemaining)?.toFixed(1) : 0;

  return (
    <div 
      className="rounded-lg p-6 md:p-8 transition-all duration-300"
      style={{
        backgroundColor: '#0B0B0B',
        border: '1px solid rgba(255, 255, 255, 0.06)'
      }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon name="Clock" size={24} color="var(--color-accent)" strokeWidth={2} />
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">
            Monthly Focus Hours
          </h2>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-md hover:bg-white/5 transition-colors"
            aria-label="Edit target"
          >
            <Icon name="Edit" size={18} color="#EDEDED" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Target Adjustment */}
      <div className="mb-6">
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleDecrement}
                className="p-3 rounded-md transition-colors hover:bg-white/10"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                aria-label="Decrease hours"
              >
                <Icon name="Minus" size={20} color="#EDEDED" strokeWidth={2} />
              </button>
              <div className="text-center">
                <div className="text-5xl font-bold" style={{ color: 'var(--color-accent)' }}>
                  {tempTarget}
                </div>
                <div className="text-sm text-muted-foreground mt-1">hours/month</div>
              </div>
              <button
                onClick={handleIncrement}
                className="p-3 rounded-md transition-colors hover:bg-white/10"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                aria-label="Increase hours"
              >
                <Icon name="Plus" size={20} color="#EDEDED" strokeWidth={2} />
              </button>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-md text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--color-accent)', color: '#000' }}
              >
                Save Target
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 rounded-md text-sm font-medium transition-colors"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#EDEDED' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-5xl font-bold mb-2" style={{ color: 'var(--color-accent)' }}>
              {target}
            </div>
            <div className="text-sm text-muted-foreground">hours/month target</div>
          </div>
        )}
      </div>

      {/* Progress Visualization */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Current Progress</span>
          <span className="text-lg font-semibold text-foreground">
            {currentHours} / {target} hrs
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-2">
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: isOnTrack ? 'var(--color-accent)' : '#3b82f6'
            }}
          />
        </div>

        <div className="text-xs text-muted-foreground text-center">
          {progressPercentage?.toFixed(0)}% complete
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className="p-4 rounded-md"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Target" size={16} color="var(--color-accent)" strokeWidth={2} />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Remaining</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {remainingHours} hrs
          </div>
        </div>

        <div 
          className="p-4 rounded-md"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Calendar" size={16} color="var(--color-accent)" strokeWidth={2} />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Daily Needed</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {dailyHoursNeeded} hrs/day
          </div>
        </div>
      </div>

      {isOnTrack && (
        <div className="mt-4 p-3 rounded-md" style={{ backgroundColor: 'rgba(57, 255, 136, 0.1)' }}>
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" size={18} color="var(--color-accent)" strokeWidth={2} />
            <span className="text-sm" style={{ color: 'var(--color-accent)' }}>
              Excellent! You've reached your monthly target.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyFocusHours;