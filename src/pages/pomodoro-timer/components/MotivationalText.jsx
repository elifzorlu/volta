import { useState, useEffect } from 'react';

const MotivationalText = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const motivationalQuotes = [
    "Your focus is your superpower.",
    "Deep work creates deep results.",
    "Every minute of focus compounds.",
    "You\'re building something remarkable.",
    "This session is an investment in yourself.",
    "Distraction is the enemy of mastery.",
    "Your future self will thank you.",
    "Focus is a skill. You\'re practicing it now.",
    "Great work requires great concentration.",
    "You\'re in the zone. Stay here.",
    "This is where breakthroughs happen.",
    "Your attention is your most valuable asset."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % motivationalQuotes?.length);
    }, 45000); // Change quote every 45 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-12 text-center animate-fadeIn">
      <p className="text-lg text-foreground/80 tracking-wide max-w-md mx-auto">
        {motivationalQuotes?.[currentQuoteIndex]}
      </p>
    </div>
  );
};

export default MotivationalText;