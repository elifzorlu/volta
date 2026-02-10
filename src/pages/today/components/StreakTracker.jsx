import { Trophy, Flame, TrendingUp, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

const StreakTracker = ({ currentStreak = 0, longestStreak = 0, lastLogDate = null }) => {
  const [showWarning, setShowWarning] = useState(false);

  // Milestone definitions
  const milestones = [
    { days: 3, label: 'Getting Started', icon: '🌱', color: 'text-green-400' },
    { days: 7, label: 'Week Warrior', icon: '⚡', color: 'text-yellow-400' },
    { days: 14, label: 'Two Week Champion', icon: '🔥', color: 'text-orange-400' },
    { days: 30, label: 'Monthly Master', icon: '💎', color: 'text-blue-400' },
    { days: 60, label: 'Consistency King', icon: '👑', color: 'text-purple-400' },
    { days: 100, label: 'Century Legend', icon: '🏆', color: 'text-amber-400' }
  ];

  // Find current milestone
  const currentMilestone = milestones?.filter(m => currentStreak >= m?.days)?.pop();
  const nextMilestone = milestones?.find(m => m?.days > currentStreak);

  // Check if user is at risk of losing streak
  useEffect(() => {
    if (!lastLogDate) {
      setShowWarning(false);
      return;
    }

    const today = new Date();
    today?.setHours(0, 0, 0, 0);
    const lastLog = new Date(lastLogDate);
    lastLog?.setHours(0, 0, 0, 0);
    const daysSinceLastLog = Math?.floor((today - lastLog) / (1000 * 60 * 60 * 24));

    // Show warning if last log was yesterday (streak at risk)
    setShowWarning(daysSinceLastLog === 1 && currentStreak > 0);
  }, [lastLogDate, currentStreak]);

  return (
    <div className="mb-8">
      {/* Main Streak Display */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Current Streak</h3>
              <p className="text-sm text-zinc-400">Consecutive days logged</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-white">{currentStreak}</div>
            <div className="text-sm text-zinc-400">{currentStreak === 1 ? 'day' : 'days'}</div>
          </div>
        </div>

        {/* Progress to Next Milestone */}
        {nextMilestone && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-zinc-400">Next milestone: {nextMilestone?.label}</span>
              <span className="text-sm font-medium text-zinc-300">
                {currentStreak}/{nextMilestone?.days}
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                style={{ width: `${(currentStreak / nextMilestone?.days) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Longest Streak */}
        {longestStreak > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-400">
              <Trophy className="w-4 h-4" />
              <span className="text-sm">Longest streak</span>
            </div>
            <span className="text-sm font-medium text-zinc-300">{longestStreak} days</span>
          </div>
        )}
      </div>

      {/* Reset Warning */}
      {showWarning && (
        <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-500 mb-1">Streak at Risk!</h4>
            <p className="text-sm text-amber-200/80">
              Log your productivity today to maintain your {currentStreak}-day streak. Don't break the chain!
            </p>
          </div>
        </div>
      )}

      {/* Milestone Badges */}
      {currentStreak > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Milestones Achieved
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {milestones?.map((milestone) => {
              const achieved = currentStreak >= milestone?.days;
              return (
                <div
                  key={milestone?.days}
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    achieved
                      ? 'bg-zinc-800/50 border-zinc-700' :'bg-zinc-900/30 border-zinc-800/50 opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{milestone?.icon}</span>
                    <span className={`text-xs font-medium ${
                      achieved ? milestone?.color : 'text-zinc-600'
                    }`}>
                      {milestone?.days}d
                    </span>
                  </div>
                  <div className={`text-xs ${
                    achieved ? 'text-zinc-300' : 'text-zinc-600'
                  }`}>
                    {milestone?.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* First Time Message */}
      {currentStreak === 0 && (
        <div className="mt-4 bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-4 text-center">
          <p className="text-sm text-zinc-400">
            Start your streak today! Log your productivity to begin tracking consecutive days.
          </p>
        </div>
      )}
    </div>
  );
};

export default StreakTracker;