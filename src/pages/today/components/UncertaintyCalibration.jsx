import Icon from '../../../components/AppIcon';

const UncertaintyCalibration = ({ dataSufficiency = null }) => {
  if (!dataSufficiency) return null;

  const getOverallStatusColor = (status) => {
    if (status === 'excellent') return 'text-accent';
    if (status === 'good') return 'text-green-400';
    if (status === 'fair') return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getOverallStatusIcon = (status) => {
    if (status === 'excellent') return 'CheckCircle2';
    if (status === 'good') return 'CheckCircle';
    if (status === 'fair') return 'AlertCircle';
    return 'AlertTriangle';
  };

  const getOverallStatusText = (status) => {
    if (status === 'excellent') return 'Excellent data coverage';
    if (status === 'good') return 'Good data coverage';
    if (status === 'fair') return 'Fair data coverage';
    return 'Insufficient data';
  };

  const getFeatureStatusColor = (status) => {
    if (status === 'sufficient') return 'text-accent';
    return 'text-orange-400';
  };

  const getFeatureIcon = (feature) => {
    if (feature === 'sleep') return 'Moon';
    if (feature === 'caffeine') return 'Coffee';
    if (feature === 'timing') return 'Clock';
    if (feature === 'duration') return 'Timer';
    return 'Activity';
  };

  return (
    <div className="mb-16 md:mb-20 lg:mb-24">
      <div className="border-t border-border pt-8 md:pt-10 lg:pt-12">
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-medium text-foreground mb-2">
            Prediction Confidence
          </h2>
          <p className="text-sm text-muted-foreground">
            Data quality and reliability indicators
          </p>
        </div>

        {/* Overall Status */}
        <div className="mb-6 p-5 bg-gradient-to-br from-accent/5 to-transparent rounded-lg border border-accent/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Icon
                name={getOverallStatusIcon(dataSufficiency?.overall)}
                size={20}
                color="var(--color-accent)"
                strokeWidth={2}
              />
            </div>
            <div className="flex-1">
              <div className={`text-base font-medium ${getOverallStatusColor(dataSufficiency?.overall)}`}>
                {getOverallStatusText(dataSufficiency?.overall)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {dataSufficiency?.overall === 'excellent' && 'Your predictions are highly reliable with strong data support.'}
                {dataSufficiency?.overall === 'good' && 'Your predictions are reliable with adequate data support.'}
                {dataSufficiency?.overall === 'fair' && 'Your predictions are emerging. More data will improve accuracy.'}
                {dataSufficiency?.overall === 'insufficient' && 'Keep logging to unlock reliable predictions.'}
              </div>
            </div>
          </div>
        </div>

        {/* Feature-Specific Status */}
        {dataSufficiency?.byFeature && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {Object.entries(dataSufficiency?.byFeature)?.map(([feature, status]) => (
              <div
                key={feature}
                className="p-4 bg-muted/30 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon
                      name={getFeatureIcon(feature)}
                      size={16}
                      color="var(--color-muted-foreground)"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground capitalize">{feature} Analysis</div>
                    <div className={`text-xs ${getFeatureStatusColor(status)}`}>
                      {status === 'sufficient' ? '✓ Sufficient data' : '⚠ Need more data'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {dataSufficiency?.recommendations?.length > 0 && (
          <div className="p-4 bg-orange-500/5 rounded-lg border border-orange-500/20">
            <div className="flex items-start gap-3">
              <Icon
                name="Target"
                size={18}
                color="rgb(249 115 22)"
                strokeWidth={2}
                className="flex-shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground mb-2">To improve predictions:</div>
                <ul className="space-y-1">
                  {dataSufficiency?.recommendations?.map((rec, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Confidence Explanation */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <Icon
              name="Info"
              size={18}
              color="var(--color-muted-foreground)"
              strokeWidth={2}
              className="flex-shrink-0 mt-0.5"
            />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <p className="mb-2">
                <span className="font-medium text-foreground">High confidence:</span> 18+ similar days with consistent patterns
              </p>
              <p className="mb-2">
                <span className="font-medium text-foreground">Medium confidence:</span> 10+ similar days with moderate patterns
              </p>
              <p>
                <span className="font-medium text-foreground">Low confidence:</span> 5+ similar days (early patterns emerging)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UncertaintyCalibration;
