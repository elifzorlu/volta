import { useState } from 'react';
import Icon from '../../../components/AppIcon';

const BestTimePredictions = ({ timeframe = 'overall', recommendations = null }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Default predictions with single optimal period per category
  const defaultPredictions = {
    overall: [
      {
        icon: 'Lightbulb',
        workType: 'Creative Work',
        predictions: [
          {
            bestTime: '9:00 AM - 11:30 AM',
            confidence: 'High confidence',
            reason: 'Your creative sessions show 34% higher efficiency (avg 4.2/5) in morning hours after 7+ hours of sleep with moderate caffeine intake.'
          }
        ]
      },
      {
        icon: 'Brain',
        workType: 'Analytical/Assignment Work',
        predictions: [
          {
            bestTime: '2:00 PM - 4:30 PM',
            confidence: 'High confidence',
            reason: 'Analytical sessions peak in early afternoon (avg efficiency 4.0/5) when caffeine levels are optimal and you report feeling "locked-in".'
          }
        ]
      },
      {
        icon: 'BookOpen',
        workType: 'Studying & Cramming',
        predictions: [
          {
            bestTime: '7:00 PM - 9:00 PM',
            confidence: 'High confidence',
            reason: 'Study sessions show better efficiency (3.8/5) in evening hours, especially after moderate-energy days with good sleep quality.'
          }
        ]
      }
    ],
    this_week: [
      {
        icon: 'Lightbulb',
        workType: 'Creative Work',
        predictions: [
          {
            bestTime: '8:30 AM - 10:30 AM',
            confidence: 'High confidence',
            reason: 'This week shows exceptional creative output (avg 4.5/5 efficiency) in early morning, particularly on days with 8+ hours sleep and high energy.'
          }
        ]
      },
      {
        icon: 'Brain',
        workType: 'Analytical/Assignment Work',
        predictions: [
          {
            bestTime: '1:30 PM - 3:30 PM',
            confidence: 'High confidence',
            reason: 'Your analytical sessions this week peak after lunch (avg 4.3/5) with 150-250mg caffeine, showing 28% improvement over other times.'
          }
        ]
      },
      {
        icon: 'BookOpen',
        workType: 'Studying & Cramming',
        predictions: [
          {
            bestTime: '6:30 PM - 8:30 PM',
            confidence: 'High confidence',
            reason: 'Evening study sessions this week show consistent 3.5-4.0/5 efficiency, especially when you report feeling "locked-in" rather than "forced".'
          }
        ]
      }
    ]
  };

  // Parse recommendations from database
  const parsedPredictions = recommendations?.payload ? [
    {
      icon: 'Lightbulb',
      workType: 'Creative Work',
      predictions: parseWindowsWithConfidence(recommendations?.payload?.creative)
    },
    {
      icon: 'Brain',
      workType: 'Analytical/Assignment Work',
      predictions: parseWindowsWithConfidence(recommendations?.payload?.analytical)
    },
    {
      icon: 'BookOpen',
      workType: 'Studying & Cramming',
      predictions: parseWindowsWithConfidence(recommendations?.payload?.studying)
    }
  ] : null;

  const currentPredictions = parsedPredictions || defaultPredictions?.[timeframe] || defaultPredictions?.overall;

  function parseWindowsWithConfidence(categoryData) {
    if (!categoryData?.windows || categoryData?.windows?.length === 0) {
      return [{
        bestTime: 'No data yet',
        confidence: 'Low confidence',
        reason: categoryData?.reason || 'Log more sessions to get recommendations.'
      }];
    }

    // Return only the first window (highest confidence)
    const topWindow = categoryData?.windows?.[0];
    return [{
      bestTime: `${topWindow?.start} - ${topWindow?.end}`,
      confidence: getConfidenceLabelFromLevel(topWindow?.confidenceLevel),
      reason: categoryData?.reason || 'Based on your recent work patterns.'
    }];
  }

  function getConfidenceLabelFromLevel(level) {
    if (level === 'high') return 'High confidence';
    if (level === 'medium') return 'Medium confidence';
    return 'Low confidence';
  }

  const getConfidenceColor = (confidence) => {
    if (confidence?.includes('High confidence')) {
      return 'text-accent';
    }
    if (confidence?.includes('Medium confidence')) {
      return 'text-yellow-400';
    }
    return 'text-muted-foreground';
  };

  return (
    <div className="mb-16 md:mb-20 lg:mb-24">
      <div className="border-t border-border pt-8 md:pt-10 lg:pt-12">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-medium text-foreground">
            Suggested focus windows
          </h2>
          <span className="text-xs md:text-sm text-muted-foreground capitalize">
            {timeframe === 'this_week' ? 'This Week' : 'Overall'}
          </span>
        </div>

        <div className="space-y-8 md:space-y-10">
          {currentPredictions?.map((workTypeData, index) => (
            <div key={index} className="space-y-4">
              {/* Work Type Header */}
              <div className="flex items-center gap-3 md:gap-4">
                <div 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: workTypeData?.color ? `${workTypeData?.color}20` : 'var(--color-accent-alpha)'
                  }}
                >
                  <Icon
                    name={workTypeData?.icon}
                    size={20}
                    color={workTypeData?.color || 'var(--color-accent)'}
                    strokeWidth={2}
                  />
                </div>
                <h3 className="text-base md:text-lg font-medium text-foreground">
                  {workTypeData?.workType}
                </h3>
              </div>

              {/* Single Optimal Period */}
              <div className="space-y-3 md:space-y-4 pl-0 md:pl-16">
                {workTypeData?.predictions?.map((prediction, predIndex) => (
                  <div
                    key={predIndex}
                    className="bg-muted/30 rounded-lg p-4 md:p-5 border border-border hover:border-accent/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-sm md:text-base text-accent font-medium">
                        {prediction?.bestTime}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className={`text-xs md:text-sm font-medium ${getConfidenceColor(prediction?.confidence)}`}>
                        {prediction?.confidence}
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {prediction?.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 md:mt-8 p-4 bg-accent/5 rounded-lg border border-accent/20">
          <div className="flex items-start gap-3">
            <Icon
              name="Info"
              size={18}
              color="var(--color-accent)"
              strokeWidth={2}
              className="flex-shrink-0 mt-0.5"
            />
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              {recommendations 
                ? 'These windows show your optimal productivity period for each work type based on your logged patterns.'
                : 'Start logging your work sessions to discover your optimal productivity window for each work type.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestTimePredictions;