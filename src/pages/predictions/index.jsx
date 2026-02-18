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
  const { user } = useAuth();
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
  }, [user]);

  const loadPredictionData = async () => {
    try {
      setLoading(true);

      const { data: recentLogs, error } =
        await dailyLogsService?.getRecent(user?.id || null, 14);

      if (!error && recentLogs) {
        const workSessions = recentLogs?.flatMap(
          (log) => log?.workSessions || []
        );

        generateMLPredictions(recentLogs, workSessions);
        await callExternalMLAPI(recentLogs);
      }
    } catch (err) {
      console.error('Load prediction data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const callExternalMLAPI = async (recentLogs) => {
    try {
      setApiLoading(true);
      setApiError(null);

      if (!recentLogs || recentLogs.length < 3) {
        setApiError("Need at least 3 daily logs to run the ML prediction.");
        return;
      }

      // oldest → newest
      const last3 = recentLogs.slice(0, 3).reverse();

      const mapSleepQuality = (v) => {
        const s = String(v || "good").toLowerCase();
        if (["excellent", "good", "fair", "poor"].includes(s)) return s;
        return "good";
      };

      const mapEnergyLevel = (v) => {
        const s = String(v || "medium").toLowerCase();
        if (["high", "medium", "low"].includes(s)) return s;

        const n = Number(v);
        if (!isNaN(n)) return n >= 7 ? "high" : n <= 3 ? "low" : "medium";
        return "medium";
      };

      const payload = {
        recent_days: last3.map((log) => ({
          sleep_hours: Number(log?.sleepHours || 7),
          sleep_quality: mapSleepQuality(log?.sleepQuality),
          caffeine_total: Number(log?.caffeineTotal || 0),
          energy_level: mapEnergyLevel(log?.energyLevel),
          stress_level: Number(log?.stressLevel || 5),
          music: log?.music ? 1 : 0
        }))
      };

      const { data, error } = await mlBackendApi?.predict(payload);

      if (error) {
        setApiError(error);
        setApiPrediction(null);
      } else {
        setApiPrediction(data);
        setApiError(null);
      }
    } catch (err) {
      console.error('External ML API error:', err);
      setApiError(err?.message || "Failed to connect to ML backend");
      setApiPrediction(null);
    } finally {
      setApiLoading(false);
    }
  };

  const generateMLPredictions = (recentLogs, workSessions) => {
    try {
      const decisionsResult =
        decisionFocusedPredictions?.generateActionableInsights(
          recentLogs,
          workSessions
        );

      const scenariosResult =
        counterfactualSimulator?.simulateScenarios(
          recentLogs,
          workSessions
        );

      const dataSufficiency =
        uncertaintyCalibration?.assessDataSufficiency(
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-500">Generating predictions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <DemoModeBanner />

      <h1 className="text-3xl text-white mb-8">Predictions</h1>

      {/* Backend Prediction */}
      <div className="mb-12">
        <h2 className="text-xl text-white mb-4">ML Backend Prediction</h2>

        {apiLoading && (
          <p className="text-zinc-400">Connecting to ML backend...</p>
        )}

        {apiError && (
          <div className="text-red-400">
            <p className="font-semibold">API Error</p>
            <p className="text-sm">{apiError}</p>
          </div>
        )}

        {apiPrediction && (
          <div className="bg-zinc-900 p-6 rounded-lg space-y-4">
            <div>
              <p className="text-zinc-400 text-sm">
                Predicted Focus Minutes
              </p>
              <p className="text-3xl text-green-400">
                {apiPrediction?.predicted_focus_minutes}
              </p>
            </div>

            <div>
              <p className="text-zinc-400 text-sm">Confidence</p>
              <p className="text-white">
                {(apiPrediction?.confidence * 100).toFixed(0)}%
              </p>
            </div>

            <div>
              <p className="text-zinc-400 text-sm">
                Expected Range
              </p>
              <p className="text-white">
                {apiPrediction?.lower_bound} –{" "}
                {apiPrediction?.upper_bound} minutes
              </p>
            </div>

            {apiPrediction?.message && (
              <p className="text-zinc-400 text-sm">
                {apiPrediction?.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Local ML */}
      <DecisionFocusedPredictions
        predictions={mlPredictions?.decisions}
        dataSufficiency={mlPredictions?.dataSufficiency}
      />

      <CounterfactualSimulator
        scenarios={mlPredictions?.scenarios}
      />

      <UncertaintyCalibration
        dataSufficiency={mlPredictions?.dataSufficiency}
      />
    </div>
  );
};

export default Predictions;
