import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import TimeframeSelector from './components/TimeframeSelector';
import ProductivityChart from './components/ProductivityChart';
import SummaryStats from './components/SummaryStats';
import TrendInsight from './components/TrendInsight';
import DemoModeBanner from '../../components/DemoModeBanner';
import { useAuth } from '../../contexts/AuthContext';
import { productivityScoresService } from '../../services/voltaService';

const History = () => {
  const { user, isDemoMode } = useAuth();
  const [activeTimeframe, setActiveTimeframe] = useState('week');
  const [chartData, setChartData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({});
  const [trendInsight, setTrendInsight] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistoryData();
  }, [user, isDemoMode, activeTimeframe]);

  const getDateRange = (timeframe) => {
    const today = new Date();
    let startDate;

    switch (timeframe) {
      case 'week':
        startDate = new Date(today);
        startDate?.setDate(today?.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(today);
        startDate?.setDate(today?.getDate() - 30);
        break;
      case 'quarter':
        startDate = new Date(today);
        startDate?.setDate(today?.getDate() - 90);
        break;
      default:
        startDate = new Date(today);
        startDate?.setDate(today?.getDate() - 7);
    }

    return {
      startDate: startDate?.toISOString()?.split('T')?.[0],
      endDate: today?.toISOString()?.split('T')?.[0]
    };
  };

  const calculateStats = (scores) => {
    if (!scores || scores?.length === 0) {
      return {
        average: 0,
        highest: 0,
        lowest: 0,
        totalDays: 0
      };
    }

    const scoreValues = scores?.map(s => s?.score);
    const sum = scoreValues?.reduce((acc, val) => acc + val, 0);
    
    return {
      average: Math.round(sum / scores?.length),
      highest: Math.max(...scoreValues),
      lowest: Math.min(...scoreValues),
      totalDays: scores?.length
    };
  };

  const calculateTrend = (scores, timeframe) => {
    if (!scores || scores?.length < 2) {
      return {
        direction: 'neutral',
        title: 'Insufficient Data',
        description: 'Log more days to see your productivity trends and insights.'
      };
    }

    const firstHalf = scores?.slice(0, Math.floor(scores?.length / 2));
    const secondHalf = scores?.slice(Math.floor(scores?.length / 2));
    
    const firstAvg = firstHalf?.reduce((acc, s) => acc + s?.score, 0) / firstHalf?.length;
    const secondAvg = secondHalf?.reduce((acc, s) => acc + s?.score, 0) / secondHalf?.length;
    
    const percentChange = Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
    const direction = percentChange > 5 ? 'up' : percentChange < -5 ? 'down' : 'neutral';

    const timeframeLabels = {
      week: 'Weekly',
      month: 'Monthly',
      quarter: 'Quarterly'
    };

    let title, description;
    if (direction === 'up') {
      title = `Positive ${timeframeLabels?.[timeframe]} Trend`;
      description = `Your productivity has increased by ${Math.abs(percentChange)}% in this period. Keep up the great work!`;
    } else if (direction === 'down') {
      title = `${timeframeLabels?.[timeframe]} Decline`;
      description = `Your productivity has decreased by ${Math.abs(percentChange)}% in this period. Consider reviewing your daily context patterns.`;
    } else {
      title = `Steady ${timeframeLabels?.[timeframe]} Performance`;
      description = `Your productivity has remained consistent in this period. Look for opportunities to optimize your peak performance times.`;
    }

    return { direction, title, description };
  };

  const loadHistoryData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange(activeTimeframe);
      
      const { data: scores, error: scoresError } = await productivityScoresService?.getByDateRange(
        user?.id || null,
        startDate,
        endDate
      );

      if (scoresError) {
        console.error('Error loading scores:', scoresError);
        setError('Failed to load productivity history');
        return;
      }

      if (scores && scores?.length > 0) {
        // Format chart data
        const formattedData = scores?.map(s => {
          const date = new Date(s.scoreDate);
          let dateLabel;
          
          if (activeTimeframe === 'week') {
            dateLabel = date?.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit' });
          } else if (activeTimeframe === 'month') {
            dateLabel = date?.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
          } else {
            dateLabel = date?.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
          }

          return {
            date: dateLabel,
            score: s?.score
          };
        })?.reverse();

        setChartData(formattedData);
        setSummaryStats(calculateStats(scores));
        setTrendInsight(calculateTrend(scores, activeTimeframe));
      } else {
        setChartData([]);
        setSummaryStats({ average: 0, highest: 0, lowest: 0, totalDays: 0 });
        setTrendInsight({
          direction: 'neutral',
          title: 'No Data Available',
          description: 'Start logging your daily productivity to see trends and insights here.'
        });
      }
    } catch (err) {
      console.error('Load history data error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeframeChange = (timeframe) => {
    setActiveTimeframe(timeframe);
  };

  return (
    <>
      <Helmet>
        <title>History - Volta</title>
        <meta name="description" content="Explore your productivity trends and historical insights with minimal data visualization" />
      </Helmet>

      <DemoModeBanner />
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8 md:mb-10 lg:mb-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 md:mb-3 lg:mb-4">
            History
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground">
            Your productivity patterns over time
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <TimeframeSelector 
          activeTimeframe={activeTimeframe}
          onTimeframeChange={handleTimeframeChange}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        ) : (
          <>
            <TrendInsight trend={trendInsight} />

            <ProductivityChart 
              data={chartData}
              timeframe={activeTimeframe}
            />

            <SummaryStats stats={summaryStats} />
          </>
        )}
      </div>
    </>
  );
};

export default History;