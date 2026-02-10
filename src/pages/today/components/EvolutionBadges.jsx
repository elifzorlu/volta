import { Award, Sparkles } from 'lucide-react';
import { useState } from 'react';

const EvolutionBadges = ({ badges = [], newBadge = null }) => {
  const [showNewBadge, setShowNewBadge] = useState(!!newBadge);

  // Badge definitions
  const badgeDefinitions = {
    'found-rhythm': {
      icon: '🎵',
      title: 'Found your rhythm',
      description: 'You discovered when you work best',
      gradient: 'from-violet-500 to-purple-500'
    },
    'stopped-forcing': {
      icon: '🌊',
      title: 'Stopped forcing it',
      description: 'You learned to work with your energy, not against it',
      gradient: 'from-cyan-500 to-blue-500'
    },
    'protected-deep-work': {
      icon: '🛡️',
      title: 'Protected deep work',
      description: 'You consistently honored your focus windows',
      gradient: 'from-amber-500 to-orange-500'
    },
    'energy-listener': {
      icon: '⚡',
      title: 'Energy listener',
      description: 'You started respecting your natural energy patterns',
      gradient: 'from-emerald-500 to-teal-500'
    },
    'rhythm-keeper': {
      icon: '🎯',
      title: 'Rhythm keeper',
      description: 'You maintained alignment with your natural flow',
      gradient: 'from-pink-500 to-rose-500'
    },
    'flow-finder': {
      icon: '✨',
      title: 'Flow finder',
      description: 'You discovered your optimal work state',
      gradient: 'from-indigo-500 to-purple-500'
    }
  };

  // Don't render if no badges
  if (!badges || badges?.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* New Badge Announcement */}
      {showNewBadge && newBadge && (
        <div className="mb-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-6 backdrop-blur-sm animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">Evolution Unlocked</h3>
              <p className="text-2xl mb-2">{badgeDefinitions?.[newBadge]?.icon}</p>
              <p className="text-base font-medium text-amber-100 mb-1">
                {badgeDefinitions?.[newBadge]?.title}
              </p>
              <p className="text-sm text-amber-200/80">
                {badgeDefinitions?.[newBadge]?.description}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Earned Badges Grid */}
      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-zinc-400" />
          <h3 className="text-sm font-medium text-zinc-400">Your Evolution</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {badges?.map((badgeKey) => {
            const badge = badgeDefinitions?.[badgeKey];
            if (!badge) return null;

            return (
              <div
                key={badgeKey}
                className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{badge?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white mb-1">
                      {badge?.title}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {badge?.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EvolutionBadges;