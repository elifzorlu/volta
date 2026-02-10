import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProductivityChart = ({ data, timeframe }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-md px-3 md:px-4 lg:px-5 py-2 md:py-2.5 lg:py-3">
          <p className="text-xs md:text-sm lg:text-base text-foreground font-medium mb-1">
            {payload?.[0]?.payload?.date}
          </p>
          <p className="text-sm md:text-base lg:text-lg text-accent font-semibold">
            {payload?.[0]?.value}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatXAxis = (value) => {
    if (timeframe === 'week') {
      return value?.split(' ')?.[0];
    }
    return value;
  };

  return (
    <div className="w-full h-64 md:h-80 lg:h-96 mb-8 md:mb-10 lg:mb-12">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255, 255, 255, 0.06)" 
            vertical={false}
          />
          <XAxis 
            dataKey="date" 
            stroke="rgba(237, 237, 237, 0.6)"
            tick={{ fill: 'rgba(237, 237, 237, 0.6)', fontSize: 12 }}
            tickFormatter={formatXAxis}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.06)' }}
          />
          <YAxis 
            stroke="rgba(237, 237, 237, 0.6)"
            tick={{ fill: 'rgba(237, 237, 237, 0.6)', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.06)' }}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="var(--color-accent)" 
            strokeWidth={2}
            dot={{ fill: 'var(--color-accent)', r: 4 }}
            activeDot={{ r: 6, fill: 'var(--color-accent)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductivityChart;