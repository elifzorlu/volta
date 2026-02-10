import { useState, useEffect } from 'react';
import DecisionFocusedPredictions from '../today/components/DecisionFocusedPredictions';
import CounterfactualSimulator from '../today/components/CounterfactualSimulator';
import UncertaintyCalibration from '../today/components/UncertaintyCalibration';
import DemoModeBanner from '../../components/DemoModeBanner';
import { useAuth } from '../../contexts/AuthContext';
import { dailyLogsService } from '../../services/voltaService';
import { decisionFocusedPredictions, counterfactualSimulator, uncertaintyCalibration } from '../../services/mlPredictionService';

const Predictions = () => {
  const { user, isDemoMode } = useAuth();
  const [timeframe, setTimeframe] = useState('overall');
  const [loading, setLoading] = useState(true);
  const [mlPredictions, setMlPredictions] = useState({ 
    decisions: [], 
    scenarios: [], 
    dataSufficiency: null 
  });

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
        
        // Generate ML predictions
        generateMLPredictions(recentLogs, workSessions);
      }
    } catch (err) {
      console.error('Load prediction data error:', err);
    } finally {
      setLoading(false);
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