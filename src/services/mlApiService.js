// ML API Service Layer
// Connects to external ML backend for predictions, what-if scenarios, and trend forecasting
// Replace BASE_URL with your actual ML backend endpoint

const ML_API_BASE_URL = import.meta.env?.VITE_ML_API_BASE_URL || 'http://localhost:8000';

// Helper function for API calls
const apiCall = async (endpoint, method = 'GET', body = null) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${ML_API_BASE_URL}${endpoint}`, options);
    
    if (!response?.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response?.json();
    return { data, error: null };
  } catch (error) {
    console.error(`ML API call failed [${endpoint}]:`, error?.message);
    return { data: null, error: error?.message };
  }
};

// Prediction Endpoints
export const predictionApi = {
  /**
   * Get productivity predictions based on historical data
   * @param {Object} payload - User data for predictions
   * @param {string} payload.userId - User ID
   * @param {Array} payload.recentLogs - Recent daily logs
   * @param {Array} payload.workSessions - Recent work sessions
   * @param {string} payload.timeframe - Prediction timeframe ('today', 'tomorrow', 'week')
   * @returns {Promise<Object>} Prediction results
   */
  async getProductivityPredictions(payload) {
    return await apiCall('/predictions/productivity', 'POST', payload);
  },

  /**
   * Get optimal timing predictions for different activities
   * @param {Object} payload - User data and activity type
   * @param {string} payload.userId - User ID
   * @param {Array} payload.historicalData - Historical performance data
   * @param {string} payload.activityType - Type of activity ('creative', 'analytical', 'physical')
   * @returns {Promise<Object>} Optimal timing recommendations
   */
  async getOptimalTimingPredictions(payload) {
    return await apiCall('/predictions/optimal-timing', 'POST', payload);
  },

  /**
   * Get personalized recommendations based on user patterns
   * @param {Object} payload - User context
   * @param {string} payload.userId - User ID
   * @param {Object} payload.currentState - Current user state (sleep, caffeine, etc.)
   * @param {Array} payload.goals - User goals
   * @returns {Promise<Object>} Personalized recommendations
   */
  async getPersonalizedRecommendations(payload) {
    return await apiCall('/predictions/recommendations', 'POST', payload);
  },

  /**
   * Get confidence-calibrated predictions with uncertainty estimates
   * @param {Object} payload - Prediction request with data quality info
   * @param {string} payload.userId - User ID
   * @param {number} payload.dataPoints - Number of historical data points
   * @param {string} payload.predictionType - Type of prediction requested
   * @returns {Promise<Object>} Predictions with confidence intervals
   */
  async getCalibratedPredictions(payload) {
    return await apiCall('/predictions/calibrated', 'POST', payload);
  },
};

// What-If Scenario Endpoints
export const whatIfApi = {
  /**
   * Simulate counterfactual scenarios (what if I changed X?)
   * @param {Object} payload - Scenario parameters
   * @param {string} payload.userId - User ID
   * @param {Array} payload.baselineData - Current/historical data
   * @param {Object} payload.scenarios - Scenarios to simulate
   * @param {Object} payload.scenarios.sleep - Sleep variations (e.g., {6: true, 7: true, 8: true})
   * @param {Object} payload.scenarios.caffeine - Caffeine variations
   * @param {Object} payload.scenarios.timing - Work timing variations
   * @returns {Promise<Object>} Simulated outcomes for each scenario
   */
  async simulateScenarios(payload) {
    return await apiCall('/what-if/simulate', 'POST', payload);
  },

  /**
   * Compare two specific scenarios side-by-side
   * @param {Object} payload - Comparison parameters
   * @param {string} payload.userId - User ID
   * @param {Object} payload.scenarioA - First scenario parameters
   * @param {Object} payload.scenarioB - Second scenario parameters
   * @param {Array} payload.historicalData - Historical data for context
   * @returns {Promise<Object>} Detailed comparison results
   */
  async compareScenarios(payload) {
    return await apiCall('/what-if/compare', 'POST', payload);
  },

  /**
   * Get impact analysis for a specific behavior change
   * @param {Object} payload - Behavior change parameters
   * @param {string} payload.userId - User ID
   * @param {string} payload.behaviorType - Type of behavior ('sleep', 'caffeine', 'exercise', etc.)
   * @param {Object} payload.change - Proposed change details
   * @param {number} payload.change.from - Current value
   * @param {number} payload.change.to - Target value
   * @returns {Promise<Object>} Predicted impact of the change
   */
  async analyzeBehaviorImpact(payload) {
    return await apiCall('/what-if/behavior-impact', 'POST', payload);
  },

  /**
   * Get optimization suggestions based on what-if analysis
   * @param {Object} payload - Optimization request
   * @param {string} payload.userId - User ID
   * @param {Array} payload.currentHabits - Current habit data
   * @param {string} payload.optimizationGoal - Goal to optimize for ('productivity', 'consistency', 'balance')
   * @returns {Promise<Object>} Optimization recommendations
   */
  async getOptimizationSuggestions(payload) {
    return await apiCall('/what-if/optimize', 'POST', payload);
  },
};

// Trend Forecasting Endpoints
export const trendApi = {
  /**
   * Forecast productivity trends for upcoming period
   * @param {Object} payload - Forecasting parameters
   * @param {string} payload.userId - User ID
   * @param {Array} payload.historicalData - Historical productivity data
   * @param {string} payload.forecastPeriod - Period to forecast ('week', 'month', 'quarter')
   * @param {Array} payload.externalFactors - Known external factors (exams, deadlines, etc.)
   * @returns {Promise<Object>} Trend forecast with confidence intervals
   */
  async forecastProductivityTrend(payload) {
    return await apiCall('/trends/forecast', 'POST', payload);
  },

  /**
   * Detect anomalies and pattern changes in user data
   * @param {Object} payload - Anomaly detection parameters
   * @param {string} payload.userId - User ID
   * @param {Array} payload.timeSeriesData - Time series data to analyze
   * @param {number} payload.sensitivity - Detection sensitivity (0-1)
   * @returns {Promise<Object>} Detected anomalies and pattern shifts
   */
  async detectAnomalies(payload) {
    return await apiCall('/trends/anomalies', 'POST', payload);
  },

  /**
   * Identify long-term patterns and cycles
   * @param {Object} payload - Pattern analysis parameters
   * @param {string} payload.userId - User ID
   * @param {Array} payload.longTermData - Extended historical data (30+ days)
   * @param {Array} payload.metrics - Metrics to analyze for patterns
   * @returns {Promise<Object>} Identified patterns and cycles
   */
  async identifyPatterns(payload) {
    return await apiCall('/trends/patterns', 'POST', payload);
  },

  /**
   * Get seasonal and cyclical trend analysis
   * @param {Object} payload - Seasonal analysis parameters
   * @param {string} payload.userId - User ID
   * @param {Array} payload.yearlyData - Data spanning multiple months/seasons
   * @param {string} payload.granularity - Analysis granularity ('daily', 'weekly', 'monthly')
   * @returns {Promise<Object>} Seasonal trends and recommendations
   */
  async analyzeSeasonalTrends(payload) {
    return await apiCall('/trends/seasonal', 'POST', payload);
  },

  /**
   * Get trend-based early warnings for potential issues
   * @param {Object} payload - Warning system parameters
   * @param {string} payload.userId - User ID
   * @param {Array} payload.recentData - Recent data points
   * @param {Object} payload.thresholds - Warning thresholds
   * @returns {Promise<Object>} Early warning signals and recommendations
   */
  async getEarlyWarnings(payload) {
    return await apiCall('/trends/warnings', 'POST', payload);
  },
};

// Model Training & Feedback Endpoints
export const modelApi = {
  /**
   * Submit user feedback on prediction accuracy
   * @param {Object} payload - Feedback data
   * @param {string} payload.userId - User ID
   * @param {string} payload.predictionId - ID of the prediction
   * @param {boolean} payload.accurate - Whether prediction was accurate
   * @param {number} payload.actualOutcome - Actual outcome value
   * @param {string} payload.comments - Optional user comments
   * @returns {Promise<Object>} Feedback submission confirmation
   */
  async submitPredictionFeedback(payload) {
    return await apiCall('/model/feedback', 'POST', payload);
  },

  /**
   * Request model retraining with latest user data
   * @param {Object} payload - Retraining request
   * @param {string} payload.userId - User ID
   * @param {Array} payload.newData - New data points for training
   * @returns {Promise<Object>} Retraining status
   */
  async requestModelRetrain(payload) {
    return await apiCall('/model/retrain', 'POST', payload);
  },

  /**
   * Get model performance metrics for user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Model accuracy and performance stats
   */
  async getModelPerformance(userId) {
    return await apiCall(`/model/performance/${userId}`, 'GET');
  },
};

// Health Check
export const healthApi = {
  /**
   * Check if ML backend is available
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    return await apiCall('/health', 'GET');
  },

  /**
   * Get API version and capabilities
   * @returns {Promise<Object>} API version info
   */
  async getApiInfo() {
    return await apiCall('/info', 'GET');
  },
};

// Main Prediction Endpoint (FastAPI Backend)
export const mlBackendApi = {
  /**
   * POST /predict - Main prediction endpoint for FastAPI backend
   * @param {Object} payload - Prediction request
   * @param {number} payload.sleep_hours - Hours of sleep
   * @param {number} payload.caffeine_mg - Caffeine intake in milligrams
   * @param {number} payload.energy_level - Energy level (1-10 scale)
   * @param {Array<Object>} payload.work_sessions - Array of work session objects
   * @param {string} payload.work_sessions[].time_of_day - Time of day for session (e.g., "morning", "afternoon", "evening")
   * @param {number} payload.work_sessions[].duration - Duration in minutes
   * @returns {Promise<Object>} Prediction results with predicted_score, confidence, and suggested_focus_windows
   */
  async predict(payload) {
    return await apiCall('/predict', 'POST', payload);
  },
};

// Export all APIs as a single object
export default {
  prediction: predictionApi,
  whatIf: whatIfApi,
  trend: trendApi,
  model: modelApi,
  health: healthApi,
  mlBackend: mlBackendApi,
};
