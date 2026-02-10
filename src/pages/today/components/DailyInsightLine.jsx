import { useState, useEffect } from 'react';
import { recognitionEngineService } from '../../../services/voltaService';
import { useAuth } from '../../../contexts/AuthContext';

const DailyInsightLine = () => {
  const { user, isDemoMode } = useAuth();
  const [insightLine, setInsightLine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDailyInsightLine();
  }, [user, isDemoMode]);

  const loadDailyInsightLine = async () => {
    try {
      setLoading(true);
      const insight = await recognitionEngineService?.generateDailyInsightLine(user?.id || null);
      setInsightLine(insight);
    } catch (err) {
      console.error('Load daily insight line error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-16 md:mb-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="h-8 w-3/4 bg-muted animate-pulse rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!insightLine) return null;

  return (
    <div className="mb-16 md:mb-20 lg:mb-24 opacity-0 animate-fadeIn">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xl md:text-2xl lg:text-3xl text-foreground leading-relaxed font-normal tracking-tight">
          {insightLine}
        </p>
      </div>
    </div>
  );
};

export default DailyInsightLine;