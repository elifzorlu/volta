// Advanced ML Prediction Service
// Provides decision-focused predictions, counterfactual what-if analysis, and uncertainty calibration



// Decision-Focused Prediction Engine
export const decisionFocusedPredictions = {
  // Generate specific outcome predictions: "If you do X at Y time, expect Z outcome"
  generateActionableInsights(recentLogs, workSessions, timeframe = 'overall') {
    if (!recentLogs || recentLogs?.length < 3) {
      return {
        predictions: [],
        message: 'Need at least 3 days of data to generate predictions.'
      };
    }

    const predictions = [];

    // 1. Creative work timing prediction
    const creativeOutcome = this.predictCreativeWorkOutcome(recentLogs, workSessions);
    if (creativeOutcome) predictions?.push(creativeOutcome);

    // 2. Caffeine timing impact
    const caffeineOutcome = this.predictCaffeineImpact(recentLogs);
    if (caffeineOutcome) predictions?.push(caffeineOutcome);

    // 3. Sleep impact on next day
    const sleepOutcome = this.predictSleepImpact(recentLogs);
    if (sleepOutcome) predictions?.push(sleepOutcome);

    // 4. Work duration optimization
    const durationOutcome = this.predictOptimalDuration(recentLogs, workSessions);
    if (durationOutcome) predictions?.push(durationOutcome);

    return { predictions, message: null };
  },

  predictCreativeWorkOutcome(recentLogs, workSessions) {
    // Find best performing creative sessions
    const creativeSessions = workSessions?.filter(s => s?.category === 'creative');
    if (creativeSessions?.length < 3) return null;

    // Group by time bins
    const morningBin = { sessions: [], scores: [] };
    const afternoonBin = { sessions: [], scores: [] };

    creativeSessions?.forEach(session => {
      const hour = parseInt(session?.startTime?.split(':')?.[0]);
      const efficiency = session?.efficiency || 0;
      const log = recentLogs?.find(l => l?.logDate === session?.sessionDate);
      const dayScore = log?.productivityScores?.[0]?.score || 0;

      if (hour >= 6 && hour < 12) {
        morningBin?.sessions?.push(session);
        morningBin?.scores?.push(dayScore);
      } else if (hour >= 12 && hour < 18) {
        afternoonBin?.sessions?.push(session);
        afternoonBin?.scores?.push(dayScore);
      }
    });

    // Calculate average outcomes
    const morningAvg = morningBin?.scores?.length > 0
      ? Math.round(morningBin?.scores?.reduce((a, b) => a + b, 0) / morningBin?.scores?.length)
      : 0;
    const afternoonAvg = afternoonBin?.scores?.length > 0
      ? Math.round(afternoonBin?.scores?.reduce((a, b) => a + b, 0) / afternoonBin?.scores?.length)
      : 0;

    if (morningAvg === 0 && afternoonAvg === 0) return null;

    const bestBin = morningAvg > afternoonAvg ? 'morning' : 'afternoon';
    let bestScore = Math.max(morningAvg, afternoonAvg);
    const worstScore = Math.min(morningAvg, afternoonAvg);
    const delta = bestScore - worstScore;
    const bestTime = bestBin === 'morning' ? '9:10 AM' : '2:15 PM';
    let sampleSize = bestBin === 'morning' ? morningBin?.sessions?.length : afternoonBin?.sessions?.length;

    return {
      type: 'creative_timing',
      action: `Do 20 min creative work at ${bestTime}`,
      outcome: `your day score is +${delta} on average`,
      confidence: this.calculateConfidence(sampleSize, delta),
      sampleSize,
      explanation: `Based on ${sampleSize} similar ${bestBin} sessions, your productivity score averages ${bestScore} vs ${worstScore} at other times.`
    };
  },

  predictCaffeineImpact(recentLogs) {
    // Analyze caffeine timing and next-day impact
    const logsWithCaffeine = recentLogs?.filter(l => l?.caffeineTotal > 0);
    if (logsWithCaffeine?.length < 3) return null;

    // Check for late caffeine (after 2pm = 14:00)
    // We'll use a heuristic: if caffeine > 200mg, assume some was consumed late
    const lateCaffeineDays = [];
    const normalCaffeineDays = [];

    recentLogs?.forEach((log, idx) => {
      if (idx === recentLogs?.length - 1) return; // Skip last day (no next day)

      const nextDay = recentLogs?.[idx - 1]; // Logs are sorted descending
      if (!nextDay) return;

      const nextDayScore = nextDay?.productivityScores?.[0]?.score || 0;

      if (log?.caffeineTotal > 250) {
        lateCaffeineDays?.push(nextDayScore);
      } else if (log?.caffeineTotal > 0) {
        normalCaffeineDays?.push(nextDayScore);
      }
    });

    if (lateCaffeineDays?.length < 2 || normalCaffeineDays?.length < 2) return null;

    const lateAvg = Math.round(lateCaffeineDays?.reduce((a, b) => a + b, 0) / lateCaffeineDays?.length);
    const normalAvg = Math.round(normalCaffeineDays?.reduce((a, b) => a + b, 0) / normalCaffeineDays?.length);
    const delta = normalAvg - lateAvg;

    if (delta < 5) return null; // Not significant enough

    return {
      type: 'caffeine_timing',
      action: 'Avoid caffeine after 2pm',
      outcome: `tomorrow\'s score is -${delta} with late caffeine`,
      confidence: this.calculateConfidence(lateCaffeineDays?.length, delta),
      sampleSize: lateCaffeineDays?.length,
      explanation: `Based on ${lateCaffeineDays?.length} days with high/late caffeine, next-day scores average ${lateAvg} vs ${normalAvg} with normal timing.`
    };
  },

  predictSleepImpact(recentLogs) {
    // Analyze sleep hours and same-day productivity
    const sleepGroups = {
      low: { hours: [], scores: [] },
      optimal: { hours: [], scores: [] }
    };

    recentLogs?.forEach(log => {
      const sleep = log?.sleepHours || 0;
      const score = log?.productivityScores?.[0]?.score || 0;

      if (sleep < 7) {
        sleepGroups?.low?.hours?.push(sleep);
        sleepGroups?.low?.scores?.push(score);
      } else if (sleep >= 7 && sleep <= 9) {
        sleepGroups?.optimal?.hours?.push(sleep);
        sleepGroups?.optimal?.scores?.push(score);
      }
    });

    if (sleepGroups?.low?.scores?.length < 2 || sleepGroups?.optimal?.scores?.length < 2) return null;

    const lowAvg = Math.round(sleepGroups?.low?.scores?.reduce((a, b) => a + b, 0) / sleepGroups?.low?.scores?.length);
    const optimalAvg = Math.round(sleepGroups?.optimal?.scores?.reduce((a, b) => a + b, 0) / sleepGroups?.optimal?.scores?.length);
    const delta = optimalAvg - lowAvg;

    if (delta < 5) return null;

    return {
      type: 'sleep_optimization',
      action: 'Sleep 7-8 hours instead of <7',
      outcome: `your score improves by +${delta} on average`,
      confidence: this.calculateConfidence(sleepGroups?.optimal?.scores?.length, delta),
      sampleSize: sleepGroups?.optimal?.scores?.length,
      explanation: `Based on ${sleepGroups?.optimal?.scores?.length} days with 7-8h sleep, scores average ${optimalAvg} vs ${lowAvg} with less sleep.`
    };
  },

  predictOptimalDuration(recentLogs, workSessions) {
    // Analyze work session duration and efficiency
    const durationGroups = {
      short: { sessions: [], efficiency: [] },
      medium: { sessions: [], efficiency: [] },
      long: { sessions: [], efficiency: [] }
    };

    workSessions?.forEach(session => {
      const start = this.timeToMinutes(session?.startTime);
      const end = this.timeToMinutes(session?.endTime);
      const duration = end - start;
      const efficiency = session?.efficiency || 0;

      if (duration <= 60) {
        durationGroups?.short?.sessions?.push(session);
        durationGroups?.short?.efficiency?.push(efficiency);
      } else if (duration <= 120) {
        durationGroups?.medium?.sessions?.push(session);
        durationGroups?.medium?.efficiency?.push(efficiency);
      } else {
        durationGroups?.long?.sessions?.push(session);
        durationGroups?.long?.efficiency?.push(efficiency);
      }
    });

    // Find best performing duration
    const shortAvg = durationGroups?.short?.efficiency?.length > 0
      ? durationGroups?.short?.efficiency?.reduce((a, b) => a + b, 0) / durationGroups?.short?.efficiency?.length
      : 0;
    const mediumAvg = durationGroups?.medium?.efficiency?.length > 0
      ? durationGroups?.medium?.efficiency?.reduce((a, b) => a + b, 0) / durationGroups?.medium?.efficiency?.length
      : 0;
    const longAvg = durationGroups?.long?.efficiency?.length > 0
      ? durationGroups?.long?.efficiency?.reduce((a, b) => a + b, 0) / durationGroups?.long?.efficiency?.length
      : 0;

    const bestAvg = Math.max(shortAvg, mediumAvg, longAvg);
    let bestDuration = 'medium';
    let sampleSize = durationGroups?.medium?.sessions?.length;

    if (bestAvg === shortAvg && shortAvg > 0) {
      bestDuration = 'short';
      sampleSize = durationGroups?.short?.sessions?.length;
    } else if (bestAvg === longAvg && longAvg > 0) {
      bestDuration = 'long';
      sampleSize = durationGroups?.long?.sessions?.length;
    }

    if (sampleSize < 3) return null;

    const durationText = bestDuration === 'short' ? '45-60 min' : bestDuration === 'medium' ? '90-120 min' : '2+ hours';
    const efficiencyScore = bestAvg?.toFixed(1);

    return {
      type: 'duration_optimization',
      action: `Work in ${durationText} blocks`,
      outcome: `efficiency averages ${efficiencyScore}/5`,
      confidence: this.calculateConfidence(sampleSize, bestAvg),
      sampleSize,
      explanation: `Based on ${sampleSize} sessions, ${durationText} blocks show best efficiency (${efficiencyScore}/5 avg).`
    };
  },

  calculateConfidence(sampleSize, delta) {
    // Confidence based on sample size and effect size
    if (sampleSize >= 10 && delta >= 10) return 'high';
    if (sampleSize >= 5 && delta >= 5) return 'medium';
    return 'low';
  },

  timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr?.split(':')?.map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }
};

// Counterfactual What-If Simulator
export const counterfactualSimulator = {
  // Simulate different scenarios and compare outcomes
  simulateScenarios(recentLogs, workSessions) {
    if (!recentLogs || recentLogs?.length < 5) {
      return {
        scenarios: [],
        message: 'Need at least 5 days of data for what-if analysis.'
      };
    }

    const scenarios = [];

    // 1. Sleep scenarios
    const sleepScenario = this.simulateSleepScenarios(recentLogs);
    if (sleepScenario) scenarios?.push(sleepScenario);

    // 2. Caffeine scenarios
    const caffeineScenario = this.simulateCaffeineScenarios(recentLogs);
    if (caffeineScenario) scenarios?.push(caffeineScenario);

    // 3. Work timing scenarios
    const timingScenario = this.simulateWorkTimingScenarios(recentLogs, workSessions);
    if (timingScenario) scenarios?.push(timingScenario);

    return { scenarios, message: null };
  },

  simulateSleepScenarios(recentLogs) {
    // Group logs by sleep ranges
    const sleepGroups = {
      '6h': [],
      '7h': [],
      '8h': []
    };

    recentLogs?.forEach(log => {
      const sleep = log?.sleepHours || 0;
      const score = log?.productivityScores?.[0]?.score || 0;

      if (sleep >= 5.5 && sleep < 6.5) sleepGroups?.['6h']?.push(score);
      else if (sleep >= 6.5 && sleep < 7.5) sleepGroups?.['7h']?.push(score);
      else if (sleep >= 7.5 && sleep < 8.5) sleepGroups?.['8h']?.push(score);
    });

    // Calculate averages
    const results = {};
    Object.keys(sleepGroups)?.forEach(key => {
      if (sleepGroups?.[key]?.length > 0) {
        results[key] = {
          avgScore: Math.round(sleepGroups?.[key]?.reduce((a, b) => a + b, 0) / sleepGroups?.[key]?.length),
          sampleSize: sleepGroups?.[key]?.length
        };
      }
    });

    if (Object.keys(results)?.length < 2) return null;

    return {
      type: 'sleep',
      title: 'What if you sleep 6h vs 7h vs 8h?',
      options: results,
      recommendation: this.findBestOption(results),
      confidence: this.calculateScenarioConfidence(results)
    };
  },

  simulateCaffeineScenarios(recentLogs) {
    // Group logs by caffeine ranges
    const caffeineGroups = {
      '0mg': [],
      '150mg': [],
      '300mg': []
    };

    recentLogs?.forEach(log => {
      const caffeine = log?.caffeineTotal || 0;
      const score = log?.productivityScores?.[0]?.score || 0;

      if (caffeine === 0) caffeineGroups?.['0mg']?.push(score);
      else if (caffeine > 0 && caffeine <= 200) caffeineGroups?.['150mg']?.push(score);
      else if (caffeine > 200) caffeineGroups?.['300mg']?.push(score);
    });

    // Calculate averages
    const results = {};
    Object.keys(caffeineGroups)?.forEach(key => {
      if (caffeineGroups?.[key]?.length > 0) {
        results[key] = {
          avgScore: Math.round(caffeineGroups?.[key]?.reduce((a, b) => a + b, 0) / caffeineGroups?.[key]?.length),
          sampleSize: caffeineGroups?.[key]?.length
        };
      }
    });

    if (Object.keys(results)?.length < 2) return null;

    return {
      type: 'caffeine',
      title: 'What if caffeine is 0mg / 150mg / 300mg?',
      options: results,
      recommendation: this.findBestOption(results),
      confidence: this.calculateScenarioConfidence(results)
    };
  },

  simulateWorkTimingScenarios(recentLogs, workSessions) {
    // Group sessions by time of day
    const timingGroups = {
      'morning': [],
      'afternoon': [],
      'evening': []
    };

    workSessions?.forEach(session => {
      const hour = parseInt(session?.startTime?.split(':')?.[0]);
      const log = recentLogs?.find(l => l?.logDate === session?.sessionDate);
      const score = log?.productivityScores?.[0]?.score || 0;

      if (hour >= 6 && hour < 12) timingGroups?.['morning']?.push(score);
      else if (hour >= 12 && hour < 18) timingGroups?.['afternoon']?.push(score);
      else if (hour >= 18 && hour < 24) timingGroups?.['evening']?.push(score);
    });

    // Calculate averages
    const results = {};
    Object.keys(timingGroups)?.forEach(key => {
      if (timingGroups?.[key]?.length > 0) {
        results[key] = {
          avgScore: Math.round(timingGroups?.[key]?.reduce((a, b) => a + b, 0) / timingGroups?.[key]?.length),
          sampleSize: timingGroups?.[key]?.length
        };
      }
    });

    if (Object.keys(results)?.length < 2) return null;

    return {
      type: 'timing',
      title: 'What if you study in the morning vs afternoon vs evening?',
      options: results,
      recommendation: this.findBestOption(results),
      confidence: this.calculateScenarioConfidence(results)
    };
  },

  findBestOption(results) {
    let bestOption = null;
    let bestScore = 0;

    Object.entries(results)?.forEach(([key, value]) => {
      if (value?.avgScore > bestScore) {
        bestScore = value?.avgScore;
        bestOption = key;
      }
    });

    return bestOption;
  },

  calculateScenarioConfidence(results) {
    const totalSamples = Object.values(results)?.reduce((sum, r) => sum + r?.sampleSize, 0);
    const minSamples = Math.min(...Object.values(results)?.map(r => r?.sampleSize));

    if (totalSamples >= 15 && minSamples >= 3) return 'high';
    if (totalSamples >= 10 && minSamples >= 2) return 'medium';
    return 'low';
  }
};

// Uncertainty Calibration System
export const uncertaintyCalibration = {
  // Add confidence intervals and sample size context to predictions
  calibratePrediction(prediction, sampleSize, variance = 0) {
    const confidence = this.calculateConfidenceLevel(sampleSize, variance);
    const message = this.generateConfidenceMessage(sampleSize, confidence);

    return {
      ...prediction,
      calibration: {
        confidence,
        sampleSize,
        message,
        reliable: confidence !== 'insufficient'
      }
    };
  },

  calculateConfidenceLevel(sampleSize, variance) {
    if (sampleSize < 3) return 'insufficient';
    if (sampleSize >= 18 && variance < 15) return 'high';
    if (sampleSize >= 10 && variance < 25) return 'medium';
    if (sampleSize >= 5) return 'low';
    return 'insufficient';
  },

  generateConfidenceMessage(sampleSize, confidence) {
    if (confidence === 'insufficient') {
      return 'Not enough data yet. Keep logging to improve predictions.';
    }
    if (confidence === 'high') {
      return `Based on ${sampleSize} similar days`;
    }
    if (confidence === 'medium') {
      return `Based on ${sampleSize} similar days (moderate confidence)`;
    }
    return `Based on ${sampleSize} days (early pattern)`;
  },

  // Analyze data sufficiency for different prediction types
  assessDataSufficiency(recentLogs, workSessions) {
    const assessment = {
      overall: 'insufficient',
      byFeature: {},
      recommendations: []
    };

    const logCount = recentLogs?.length || 0;
    const sessionCount = workSessions?.length || 0;

    // Overall assessment
    if (logCount >= 14 && sessionCount >= 20) {
      assessment.overall = 'excellent';
    } else if (logCount >= 7 && sessionCount >= 10) {
      assessment.overall = 'good';
    } else if (logCount >= 3 && sessionCount >= 5) {
      assessment.overall = 'fair';
    }

    // Feature-specific assessment
    assessment.byFeature.sleep = logCount >= 7 ? 'sufficient' : 'insufficient';
    assessment.byFeature.caffeine = logCount >= 5 ? 'sufficient' : 'insufficient';
    assessment.byFeature.timing = sessionCount >= 10 ? 'sufficient' : 'insufficient';
    assessment.byFeature.duration = sessionCount >= 8 ? 'sufficient' : 'insufficient';

    // Generate recommendations
    if (logCount < 7) {
      assessment?.recommendations?.push(`Log ${7 - logCount} more days for reliable sleep predictions`);
    }
    if (sessionCount < 10) {
      assessment?.recommendations?.push(`Log ${10 - sessionCount} more work sessions for timing insights`);
    }

    return assessment;
  }
};

// Demo data for ML predictions
export const demoMLPredictions = {
  decisionFocused: [
    {
      type: 'creative_timing',
      action: 'Do 20 min creative work at 9:10 AM',
      outcome: 'your day score is +7 on average',
      confidence: 'high',
      sampleSize: 18,
      explanation: 'Based on 18 similar morning sessions, your productivity score averages 86 vs 79 at other times.'
    },
    {
      type: 'caffeine_timing',
      action: 'Avoid caffeine after 2pm',
      outcome: 'tomorrow\'s score is -12 with late caffeine',
      confidence: 'medium',
      sampleSize: 12,
      explanation: 'Based on 12 days with high/late caffeine, next-day scores average 68 vs 80 with normal timing.'
    },
    {
      type: 'sleep_optimization',
      action: 'Sleep 7-8 hours instead of <7',
      outcome: 'your score improves by +15 on average',
      confidence: 'high',
      sampleSize: 22,
      explanation: 'Based on 22 days with 7-8h sleep, scores average 84 vs 69 with less sleep.'
    }
  ],
  counterfactual: [
    {
      type: 'sleep',
      title: 'What if you sleep 6h vs 7h vs 8h?',
      options: {
        '6h': { avgScore: 68, sampleSize: 8 },
        '7h': { avgScore: 79, sampleSize: 12 },
        '8h': { avgScore: 86, sampleSize: 15 }
      },
      recommendation: '8h',
      confidence: 'high'
    },
    {
      type: 'caffeine',
      title: 'What if caffeine is 0mg / 150mg / 300mg?',
      options: {
        '0mg': { avgScore: 72, sampleSize: 6 },
        '150mg': { avgScore: 82, sampleSize: 14 },
        '300mg': { avgScore: 75, sampleSize: 9 }
      },
      recommendation: '150mg',
      confidence: 'high'
    },
    {
      type: 'timing',
      title: 'What if you study in the morning vs afternoon vs evening?',
      options: {
        'morning': { avgScore: 85, sampleSize: 16 },
        'afternoon': { avgScore: 78, sampleSize: 11 },
        'evening': { avgScore: 71, sampleSize: 8 }
      },
      recommendation: 'morning',
      confidence: 'medium'
    }
  ]
};
