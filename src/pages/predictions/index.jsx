import { useState, useEffect } from 'react';
import DecisionFocusedPredictions from '../today/components/DecisionFocusedPredictions';
import CounterfactualSimulator from '../today/components/CounterfactualSimulator';
import UncertaintyCalibration from '../today/components/UncertaintyCalibration';
import DemoModeBanner from '../../components/DemoModeBanner';
import { useAuth } from '../../contexts/AuthContext';
import { dailyLogsService } from '../../services/voltaService';
import { decisionFocusedPredictions, counterfactualSimulator, uncertaintyCalibration } from '../../services/mlPredictionService';
import { mlBackendApi } from '../../services/mlApiService';

const Predictions = () => {
  const { user, isDemoMode } = useAuth();
  const [timeframe, setTimeframe] = useState('overall');
  const [loading, setLoading] = useState(true);
  const [mlPredictions, setMlPredictions] = useState({ 
    decisions: [], 
    scenarios: [], 
    dataSufficiency: null 
  });
  const [apiPrediction, setApiPrediction] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    loadPredictionData();
  }, [user, isDemoMode, timeframe]);

  const loadPredictionData = async () => {
    try {
      setLoading(true);
      
      // Load recent logs for ML predictions
      const { data: recentLogs, error: recentError } = await dailyLogsService?.getRecent(user?.id || null, 14);
      
      if (!recentError && recentLogs) {
        // Collect all work sessions
        const workSessions = recentLogs?.flatMap(log => log?.workSessions || []);
        
        // Generate local ML predictions (existing functionality)
        generateMLPredictions(recentLogs, workSessions);
        
        // Call external ML API
        await callExternalMLAPI(recentLogs, workSessions);
      }
    } catch (err) {
      console.error('Load prediction data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const callExternalMLAPI = async (recentLogs, workSessions) => {
    try {
      setApiLoading(true);
      setApiError(null);
      
      // Get the most recent log for current state
      const latestLog = recentLogs?.[0];
      if (!latestLog) {
        setApiError('No recent data available for prediction');
        return;
      }

      // Transform work sessions to API format
      const transformedSessions = workSessions?.slice(0, 10)?.map(session => {
        const hour = parseInt(session?.startTime?.split(':')?.[0] || 0);
        let timeOfDay = 'afternoon';
        if (hour >= 5 && hour < 12) timeOfDay = 'morning';
        else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
        else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
        else timeOfDay = 'night';

        return {
          time_of_day: timeOfDay,
          duration: session?.duration || 0
        };
      }) || [];

      // Prepare payload for API
      const payload = {
        sleep_hours: latestLog?.sleepHours || 7,
        caffeine_mg: latestLog?.caffeineTotal || 0,
        energy_level: latestLog?.energyLevel || 5,
        work_sessions: transformedSessions
      };

      // Call the external ML API
      const { data, error } = await mlBackendApi?.predict(payload);
      
      if (error) {
        setApiError(error);
        setApiPrediction(null);
      } else {
        setApiPrediction(data);
        setApiError(null);
      }
    } catch (err) {
      console.error('External ML API call error:', err);
      setApiError(err?.message || 'Failed to connect to ML backend');
      setApiPrediction(null);
    } finally {
      setApiLoading(false);
    }
  };

  const generateMLPredictions = (recentLogs, workSessions) => {
    try {
      // Generate decision-focused predictions
      const decisionsResult = decisionFocusedPredictions?.generateActionableInsights(
        recentLogs,
        workSessions,
        timeframe
      );

      // Generate counterfactual scenarios
      const scenariosResult = counterfactualSimulator?.simulateScenarios(
        recentLogs,
        workSessions
      );

      // Assess data sufficiency
      const dataSufficiency = uncertaintyCalibration?.assessDataSufficiency(
        recentLogs,
        workSessions
      );

      setMlPredictions({
        decisions: decisionsResult?.predictions || [],
        scenarios: scenariosResult?.scenarios || [],
        dataSufficiency
      });
    } catch (err) {
      console.error('Generate ML predictions error:', err);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse mx-auto"></div>
          </div>
          <p className="text-zinc-600 text-sm tracking-wide">Generating predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <DemoModeBanner />
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-light text-[#EDEDED] mb-3 tracking-tight">
            Predictions
          </h1>
          <p className="text-sm text-zinc-500 tracking-wide">
            Intelligent insights and forecasting for better decisions
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex justify-center gap-2 mb-12">
          <button
            onClick={() => setTimeframe('overall')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              timeframe === 'overall' ?'bg-[#39FF88] text-black' :'bg-[#0B0B0B] text-zinc-400 hover:bg-[#0B0B0B]/80 border border-white/5'
            }`}
          >
            Overall
          </button>
          <button
            onClick={() => setTimeframe('this_week')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              timeframe === 'this_week' ?'bg-[#39FF88] text-black' :'bg-[#0B0B0B] text-zinc-400 hover:bg-[#0B0B0B]/80 border border-white/5'
            }`}
          >
            This Week
          </button>
        </div>

        {/* ML Backend Prediction Results */}
        {(apiPrediction || apiError || apiLoading) && (
          <div className="mb-16">
            <h2 className="text-xl font-light text-[#EDEDED] mb-6 tracking-tight">
              ML Backend Predictions
            </h2>
            
            {apiLoading && (
              <div className="bg-[#0B0B0B] border border-white/5 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#39FF88] rounded-full animate-pulse"></div>
                  <p className="text-zinc-400 text-sm">Connecting to ML backend...</p>
                </div>
              </div>
            )}

            {apiError && (
              <div className="bg-[#0B0B0B] border border-red-500/20 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="text-red-400 text-sm font-medium mb-1">API Connection Error</p>
                    <p className="text-zinc-500 text-xs">{apiError}</p>
                    <p className="text-zinc-600 text-xs mt-2">Make sure VITE_ML_API_BASE_URL is configured correctly</p>
                  </div>
                </div>
              </div>
            )}

            {apiPrediction && !apiLoading && (
              <div className="bg-[#0B0B0B] border border-[#39FF88]/20 rounded-lg p-6">
                <div className="space-y-6">
                  {/* Predicted Score */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-zinc-400 text-sm">Predicted Score</span>
                      <span className="text-[#39FF88] text-2xl font-light">
                        {apiPrediction?.predicted_score?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-2">
                      <div 
                        className="bg-[#39FF88] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(apiPrediction?.predicted_score || 0) * 10}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-zinc-400 text-sm">Confidence</span>
                      <span className="text-zinc-300 text-lg font-light">
                        {((apiPrediction?.confidence || 0) * 100)?.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(apiPrediction?.confidence || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Suggested Focus Windows */}
                  {apiPrediction?.suggested_focus_windows && apiPrediction?.suggested_focus_windows?.length > 0 && (
                    <div>
                      <h3 className="text-zinc-400 text-sm mb-3">Suggested Focus Windows</h3>
                      <div className="space-y-2">
                        {apiPrediction?.suggested_focus_windows?.map((window, idx) => (
                          <div 
                            key={idx}
                            className="bg-zinc-900/50 border border-white/5 rounded-md p-3 flex items-center justify-between"
                          >
                            <span className="text-zinc-300 text-sm">{window}</span>
                            <div className="w-1.5 h-1.5 bg-[#39FF88] rounded-full"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Current Predictions - Decision-Focused */}
        <div className="mb-16">
          <h2 className="text-xl font-light text-[#EDEDED] mb-6 tracking-tight">
            Current Predictions
          </h2>
          <DecisionFocusedPredictions 
            predictions={mlPredictions?.decisions} 
            dataSufficiency={mlPredictions?.dataSufficiency}
          />
        </div>

        {/* What-If Scenarios */}
        <div className="mb-16">
          <h2 className="text-xl font-light text-[#EDEDED] mb-6 tracking-tight">
            What-If Scenarios
          </h2>
          <CounterfactualSimulator scenarios={mlPredictions?.scenarios} />
        </div>

        {/* Trend Forecasting - Uncertainty Calibration */}
        <div className="mb-16">
          <h2 className="text-xl font-light text-[#EDEDED] mb-6 tracking-tight">
            Trend Forecasting
          </h2>
          <UncertaintyCalibration dataSufficiency={mlPredictions?.dataSufficiency} />
        </div>
      </div>
    </div>
  );
};

export default Predictions;