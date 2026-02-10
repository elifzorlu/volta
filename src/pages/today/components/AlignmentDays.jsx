import { TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

const AlignmentDays = ({ alignmentScore = 0, recentAlignmentDays = 0 }) => {
  const [affirmation, setAffirmation] = useState(null);

  // Affirmation messages based on alignment behavior
  const affirmations = [
    "You\'ve been working with your rhythm lately.",
    "You\'re listening to your energy more often.",
    "You\'ve been aligned more often lately.",
    "Your timing feels more natural these days.",
    "You\'re respecting your energy patterns.",
    "You've been honoring your focus windows.",
    "Your work rhythm is finding its flow."
  ];

  useEffect(() => {
    // Show affirmation occasionally when alignment is good
    // Only show if user has been aligned 3+ days in recent period
    if (recentAlignmentDays >= 3) {
      // 30% chance to show affirmation on component mount
      if (Math.random() < 0.3) {
        const randomAffirmation = affirmations?.[Math.floor(Math.random() * affirmations?.length)];
        setAffirmation(randomAffirmation);
      }
    }
  }, [recentAlignmentDays]);

  // Don't render anything if alignment is low and no affirmation
  if (!affirmation && alignmentScore < 60) {
    return null;
  }

  return (
    <div className="mb-6">
      {affirmation && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-base text-emerald-100 leading-relaxed">
                {affirmation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlignmentDays;