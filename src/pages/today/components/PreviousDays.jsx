import { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PreviousDays = ({ previousDays }) => {
  const [expandedDay, setExpandedDay] = useState(null);

  const toggleExpand = (id) => {
    setExpandedDay(expandedDay === id ? null : id);
  };

  const handleKeyDown = (e, id) => {
    if (e?.key === 'Enter' || e?.key === ' ') {
      e?.preventDefault();
      toggleExpand(id);
    }
  };

  return (
    <div className="mb-16 md:mb-20 lg:mb-24">
      <div className="border-t border-border pt-8 md:pt-10 lg:pt-12">
        <h2 className="text-lg md:text-xl font-medium text-foreground mb-6 md:mb-8">
          Previous Days
        </h2>
        
        <div className="space-y-2 md:space-y-3">
          {previousDays?.map((day) => (
            <div key={day?.id} className="border border-border rounded-md overflow-hidden">
              <button
                onClick={() => toggleExpand(day?.id)}
                onKeyDown={(e) => handleKeyDown(e, day?.id)}
                className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-muted/30 transition-colors duration-200"
                aria-expanded={expandedDay === day?.id}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <span className="text-sm md:text-base text-muted-foreground">
                    {day?.date}
                  </span>
                  <span className="text-muted-foreground opacity-40">·</span>
                  <span 
                    className="text-base md:text-lg font-medium"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {day?.score}
                  </span>
                </div>
                
                <Icon 
                  name={expandedDay === day?.id ? 'ChevronUp' : 'ChevronDown'} 
                  size={20} 
                  color="var(--color-muted-foreground)" 
                  strokeWidth={2}
                />
              </button>
              
              {expandedDay === day?.id && (
                <div className="px-4 md:px-5 pb-4 md:pb-5 pt-2 border-t border-border bg-muted/20">
                  <p className="text-sm md:text-base text-foreground leading-relaxed mb-4 md:mb-5">
                    {day?.explanation}
                  </p>
                  
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex justify-between text-sm md:text-base">
                      <span className="text-muted-foreground">Sleep</span>
                      <span className="text-foreground">{day?.sleep} hours</span>
                    </div>
                    <div className="flex justify-between text-sm md:text-base">
                      <span className="text-muted-foreground">Caffeine</span>
                      <span className="text-foreground">{day?.caffeine} cups</span>
                    </div>
                    <div className="flex justify-between text-sm md:text-base">
                      <span className="text-muted-foreground">Screen time</span>
                      <span className="text-foreground">{day?.screenTime} hours</span>
                    </div>
                    <div className="flex justify-between text-sm md:text-base">
                      <span className="text-muted-foreground">Workload</span>
                      <span className="text-foreground">{day?.workload}/10</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreviousDays;