import { useState } from 'react';
import Icon from '../../../components/AppIcon';

const DecisionFocusedPredictions = ({ predictions = [], dataSufficiency = null }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!predictions || predictions?.length === 0) {
    return (
      <div className="mb-16 md:mb-20 lg:mb-24">
        <div className="border-t border-border pt-8 md:pt-10 lg:pt-12">
          <h2 className="text-lg md:text-xl font-medium text-foreground mb-6 md:mb-8">
            Predictions → Decisions
          </h2>
          <div className="bg-muted/30 rounded-lg p-6 border border-border">
            <div className="flex items-start gap-3">
              <Icon
                name="TrendingUp"
                size={20}
                color="var(--color-muted-foreground)"
                strokeWidth={2}
                className="flex-shrink-0 mt-1"
              />
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Not enough data yet to generate actionable predictions.
                </p>
                {dataSufficiency?.recommendations?.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-1 mt-3">
                    {dataSufficiency?.recommendations?.map((rec, idx) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getConfidenceColor = (confidence) => {
    if (confidence === 'high') return 'text-accent';
    if (confidence === 'medium') return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getConfidenceBadge = (confidence) => {
    if (confidence === 'high') return 'High confidence';
    if (confidence === 'medium') return 'Medium confidence';
    return 'Low confidence';
  };

  const getTypeIcon = (type) => {
    if (type === 'creative_timing') return 'Lightbulb';
    if (type === 'caffeine_timing') return 'Coffee';
    if (type === 'sleep_optimization') return 'Moon';
    if (type === 'duration_optimization') return 'Clock';
    return 'TrendingUp';
  };

  return (
    <div className="mb-16 md:mb-20 lg:mb-24">
      <div className="border-t border-border pt-8 md:pt-10 lg:pt-12">
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-medium text-foreground mb-2">
            Predictions → Decisions
          </h2>
          <p className="text-sm text-muted-foreground">
            Specific actions with expected outcomes
          </p>
        </div>

        <div className="space-y-4">
          {predictions?.map((prediction, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-accent/5 to-transparent rounded-lg p-5 md:p-6 border border-accent/20 hover:border-accent/40 transition-all duration-300"
            >
              {/* Main Prediction */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon
                    name={getTypeIcon(prediction?.type)}
                    size={20}
                    color="var(--color-accent)"
                    strokeWidth={2}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-xs font-medium ${getConfidenceColor(prediction?.confidence)}`}>
                      {getConfidenceBadge(prediction?.confidence)}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      Based on {prediction?.sampleSize} similar days
                    </span>
                  </div>
                  <p className="text-base md:text-lg text-foreground leading-relaxed">
                    <span className="font-medium">If you {prediction?.action}</span>
                    <span className="text-muted-foreground">, </span>
                    <span className="text-accent font-medium">{prediction?.outcome}</span>
                  </p>
                </div>
              </div>

              {/* Expandable Explanation */}
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors"
              >
                <Icon
                  name={expandedIndex === index ? 'ChevronUp' : 'ChevronDown'}
                  size={14}
                  color="currentColor"
                  strokeWidth={2}
                />
                {expandedIndex === index ? 'Hide details' : 'Show details'}
              </button>

              {expandedIndex === index && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {prediction?.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
          <div className="flex items-start gap-3">
            <Icon
              name="Sparkles"
              size={18}
              color="var(--color-accent)"
              strokeWidth={2}
              className="flex-shrink-0 mt-0.5"
            />
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              These predictions are based on your historical patterns. The more you log, the more accurate they become.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionFocusedPredictions;
