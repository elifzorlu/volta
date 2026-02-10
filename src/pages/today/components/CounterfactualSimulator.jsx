import { useState } from 'react';
import Icon from '../../../components/AppIcon';

const CounterfactualSimulator = ({ scenarios = [] }) => {
  const [selectedScenario, setSelectedScenario] = useState(0);

  if (!scenarios || scenarios?.length === 0) {
    return null;
  }

  const currentScenario = scenarios?.[selectedScenario];

  const getScenarioIcon = (type) => {
    if (type === 'sleep') return 'Moon';
    if (type === 'caffeine') return 'Coffee';
    if (type === 'timing') return 'Clock';
    return 'GitBranch';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence === 'high') return 'text-accent';
    if (confidence === 'medium') return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getOptionColor = (optionKey, recommendedKey, avgScore) => {
    if (optionKey === recommendedKey) {
      return 'border-accent bg-accent/10';
    }
    if (avgScore >= 80) return 'border-green-500/30 bg-green-500/5';
    if (avgScore >= 70) return 'border-yellow-500/30 bg-yellow-500/5';
    return 'border-border bg-muted/20';
  };

  return (
    <div className="mb-16 md:mb-20 lg:mb-24">
      <div className="border-t border-border pt-8 md:pt-10 lg:pt-12">
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-medium text-foreground mb-2">
            What-If Scenarios
          </h2>
          <p className="text-sm text-muted-foreground">
            Simulate different choices and compare outcomes
          </p>
        </div>

        {/* Scenario Selector */}
        {scenarios?.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {scenarios?.map((scenario, index) => (
              <button
                key={index}
                onClick={() => setSelectedScenario(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 whitespace-nowrap ${
                  selectedScenario === index
                    ? 'border-accent bg-accent/10 text-accent' :'border-border bg-muted/20 text-muted-foreground hover:border-accent/50'
                }`}
              >
                <Icon
                  name={getScenarioIcon(scenario?.type)}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                />
                <span className="text-sm font-medium capitalize">{scenario?.type}</span>
              </button>
            ))}
          </div>
        )}

        {/* Current Scenario */}
        {currentScenario && (
          <div className="space-y-4">
            {/* Scenario Title */}
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Icon
                  name={getScenarioIcon(currentScenario?.type)}
                  size={20}
                  color="var(--color-accent)"
                  strokeWidth={2}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-medium text-foreground mb-1">
                  {currentScenario?.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${getConfidenceColor(currentScenario?.confidence)}`}>
                    {currentScenario?.confidence === 'high' ? 'High confidence' : currentScenario?.confidence === 'medium' ? 'Medium confidence' : 'Low confidence'}
                  </span>
                </div>
              </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(currentScenario?.options || {})?.map(([optionKey, optionData]) => (
                <div
                  key={optionKey}
                  className={`rounded-lg p-5 border-2 transition-all duration-300 ${
                    getOptionColor(optionKey, currentScenario?.recommendation, optionData?.avgScore)
                  }`}
                >
                  {/* Option Label */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">{optionKey}</span>
                    {optionKey === currentScenario?.recommendation && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20">
                        <Icon
                          name="Star"
                          size={12}
                          color="var(--color-accent)"
                          strokeWidth={2}
                          fill="var(--color-accent)"
                        />
                        <span className="text-xs text-accent font-medium">Best</span>
                      </div>
                    )}
                  </div>

                  {/* Score Display */}
                  <div className="mb-2">
                    <div className="text-3xl font-bold text-foreground">{optionData?.avgScore}</div>
                    <div className="text-xs text-muted-foreground">Avg productivity score</div>
                  </div>

                  {/* Sample Size */}
                  <div className="text-xs text-muted-foreground">
                    Based on {optionData?.sampleSize} days
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendation */}
            {currentScenario?.recommendation && (
              <div className="mt-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
                <div className="flex items-start gap-3">
                  <Icon
                    name="Lightbulb"
                    size={18}
                    color="var(--color-accent)"
                    strokeWidth={2}
                    className="flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm text-foreground font-medium mb-1">
                      Recommendation: {currentScenario?.recommendation}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This option shows the highest average productivity score based on your historical data.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <Icon
              name="Info"
              size={18}
              color="var(--color-muted-foreground)"
              strokeWidth={2}
              className="flex-shrink-0 mt-0.5"
            />
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              These simulations use your actual logged data to predict outcomes under different conditions. Results become more accurate with more data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounterfactualSimulator;
