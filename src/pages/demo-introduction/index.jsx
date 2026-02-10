import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VoltaLogo from '../../components/VoltaLogo';
import Button from '../../components/ui/Button';
import ProductivityScore from '../today/components/ProductivityScore';
import DailyLogSummary from '../today/components/DailyLogSummary';
import { demoDailyLogs } from '../../utils/demoData';

const DemoIntroduction = () => {
  const navigate = useNavigate();
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Get today's demo data
  const todayLog = demoDailyLogs?.[0];
  const todayScore = todayLog?.productivityScores?.[0];

  const features = [
    {
      id: 'score',
      title: 'Productivity Score',
      description: 'A holistic view of your day based on sleep, energy, and work quality—not just hours logged.',
      position: 'top-[20%] left-[50%] -translate-x-1/2'
    },
    {
      id: 'log',
      title: 'Daily Log Summary',
      description: 'Track your work sessions with reflection, not surveillance. Quality over quantity.',
      position: 'top-[50%] left-[50%] -translate-x-1/2'
    },
    {
      id: 'navigation',
      title: 'Navigation',
      description: 'Explore your history, schedule commitments, and discover your best focus windows.',
      position: 'bottom-[10%] left-[50%] -translate-x-1/2'
    }
  ];

  const handleStartJourney = () => {
    // Check if user should see brain check-in
    const today = new Date()?.toISOString()?.split('T')?.[0];
    const lastCheckIn = localStorage?.getItem('volta_brain_checkin_date');
    
    if (lastCheckIn !== today) {
      navigate('/ritual');
    } else {
      navigate('/today');
    }
  };

  const handleSkipDemo = () => {
    navigate('/today');
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-center mb-6">
          <VoltaLogo className="h-8" />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl text-[#EDEDED] mb-3 font-light" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Here's what Volta looks like in action.
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto">
            This is sample data to help you understand how Volta tracks your productivity mindfully. 
            Tap the pulsing indicators to learn about each feature.
          </p>
        </div>
      </div>
      {/* Demo Content with Interactive Hotspots */}
      <div className="max-w-4xl mx-auto relative">
        {/* Sample Productivity Score */}
        <div className="relative mb-8">
          {activeTooltip === 'score' && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-20 bg-zinc-900 border border-[#39FF88] rounded-lg p-4 max-w-xs shadow-lg">
              <h3 className="text-[#39FF88] font-medium mb-2 text-sm">Productivity Score</h3>
              <p className="text-zinc-300 text-xs leading-relaxed">
                A holistic view of your day based on sleep, energy, and work quality—not just hours logged.
              </p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#39FF88]"></div>
            </div>
          )}
          
          {/* Pulsing Indicator */}
          <button
            onClick={() => setActiveTooltip(activeTooltip === 'score' ? null : 'score')}
            className="absolute top-4 right-4 z-10 w-6 h-6 rounded-full bg-[#39FF88] animate-pulse cursor-pointer hover:scale-110 transition-transform"
            aria-label="Learn about Productivity Score"
          >
            <span className="absolute inset-0 rounded-full bg-[#39FF88] opacity-50 animate-ping"></span>
          </button>
          
          <ProductivityScore score={todayScore?.score} caption={todayScore?.caption} explanation={todayScore?.explanation} />
        </div>

        {/* Sample Daily Log */}
        <div className="relative mb-8">
          {activeTooltip === 'log' && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-20 bg-zinc-900 border border-[#39FF88] rounded-lg p-4 max-w-xs shadow-lg">
              <h3 className="text-[#39FF88] font-medium mb-2 text-sm">Daily Log Summary</h3>
              <p className="text-zinc-300 text-xs leading-relaxed">
                Track your work sessions with reflection, not surveillance. Quality over quantity.
              </p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#39FF88]"></div>
            </div>
          )}
          
          {/* Pulsing Indicator */}
          <button
            onClick={() => setActiveTooltip(activeTooltip === 'log' ? null : 'log')}
            className="absolute top-4 right-4 z-10 w-6 h-6 rounded-full bg-[#39FF88] animate-pulse cursor-pointer hover:scale-110 transition-transform"
            aria-label="Learn about Daily Log"
          >
            <span className="absolute inset-0 rounded-full bg-[#39FF88] opacity-50 animate-ping"></span>
          </button>
          
          <DailyLogSummary logData={todayLog} />
        </div>

        {/* Navigation Preview */}
        <div className="relative mb-8">
          {activeTooltip === 'navigation' && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-20 bg-zinc-900 border border-[#39FF88] rounded-lg p-4 max-w-xs shadow-lg">
              <h3 className="text-[#39FF88] font-medium mb-2 text-sm">Navigation</h3>
              <p className="text-zinc-300 text-xs leading-relaxed">
                Explore your history, schedule commitments, and discover your best focus windows.
              </p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#39FF88]"></div>
            </div>
          )}
          
          {/* Pulsing Indicator */}
          <button
            onClick={() => setActiveTooltip(activeTooltip === 'navigation' ? null : 'navigation')}
            className="absolute top-4 right-4 z-10 w-6 h-6 rounded-full bg-[#39FF88] animate-pulse cursor-pointer hover:scale-110 transition-transform"
            aria-label="Learn about Navigation"
          >
            <span className="absolute inset-0 rounded-full bg-[#39FF88] opacity-50 animate-ping"></span>
          </button>
          
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
            <h3 className="text-[#EDEDED] text-lg mb-4 font-light" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Explore More
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Today', 'History', 'Schedule', 'Settings']?.map((item) => (
                <div key={item} className="bg-zinc-900 rounded-lg p-3 text-center">
                  <span className="text-zinc-400 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="max-w-4xl mx-auto mt-12">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleStartJourney}
            className="bg-[#39FF88] hover:bg-[#2ee077] text-black font-medium px-8 py-6 text-base rounded-xl transition-all duration-300 hover:scale-105"
          >
            Start My Journey
          </Button>
          
          <Button
            onClick={handleSkipDemo}
            variant="outline"
            className="border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white px-8 py-6 text-base rounded-xl"
          >
            Skip Demo
          </Button>
        </div>
        
        <p className="text-center text-xs text-zinc-600 mt-6">
          You can always return to demo mode in Settings.
        </p>
      </div>
    </div>
  );
};

export default DemoIntroduction;