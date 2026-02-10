import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const WeeklyTargets = ({ target, currentAverage, weekScores, onTargetChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTarget, setTempTarget] = useState(target);

  const handleSave = () => {
    const validTarget = Math.max(0, Math.min(100, parseInt(tempTarget) || 0));
    onTargetChange(validTarget);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempTarget(target);
    setIsEditing(false);
  };

  const progressPercentage = target > 0 ? Math.min(100, (currentAverage / target) * 100) : 0;
  const isOnTrack = currentAverage >= target;

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
          <Icon name="TrendingUp" size={24} color="var(--color-accent)" strokeWidth={2} />
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">
            Weekly Productivity Target
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

      {/* Target Input/Display */}
      <div className="mb-6">
        {isEditing ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-xs">
              <Input
                type="number"
                min="0"
                max="100"
                value={tempTarget}
                onChange={(e) => setTempTarget(e?.target?.value)}
                placeholder="Enter target score (0-100)"
                className="text-lg"
              />
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ backgroundColor: 'var(--color-accent)', color: '#000' }}
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#EDEDED' }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground">Target Score:</span>
            <span className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
              {target}
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        )}
      </div>

      {/* Current Performance */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Current Week Average</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">{currentAverage}</span>
            {isOnTrack ? (
              <Icon name="CheckCircle" size={20} color="var(--color-accent)" strokeWidth={2} />
            ) : (
              <Icon name="AlertCircle" size={20} color="#f59e0b" strokeWidth={2} />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: isOnTrack ? 'var(--color-accent)' : '#f59e0b'
            }}
          />
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          {isOnTrack ? (
            <span style={{ color: 'var(--color-accent)' }}>✓ On track to meet your target</span>
          ) : (
            <span style={{ color: '#f59e0b' }}>
              {target - currentAverage} points below target
            </span>
          )}
        </div>
      </div>

      {/* Week Breakdown */}
      {weekScores?.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-3">This Week's Scores</p>
          <div className="grid grid-cols-7 gap-2">
            {weekScores?.slice(-7)?.map((score, idx) => {
              const isAboveTarget = score?.score >= target;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center p-2 rounded-md transition-colors"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                >
                  <span className="text-xs text-muted-foreground mb-1">
                    {new Date(score?.scoreDate)?.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: isAboveTarget ? 'var(--color-accent)' : '#EDEDED' }}
                  >
                    {score?.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyTargets;