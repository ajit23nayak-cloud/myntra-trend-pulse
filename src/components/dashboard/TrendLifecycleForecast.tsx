import { Card } from '@/components/ui/card';
import { useTrendForecasts, useFashionTrends } from '@/hooks/useDashboardData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Target, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors = {
  emerging: 'hsl(var(--teal))',
  established: 'hsl(var(--blue))',
  peaking: 'hsl(var(--coral))',
  cooling: 'hsl(var(--muted-foreground))'
};

export function TrendLifecycleForecast() {
  const { data: forecasts, isLoading: loadingForecasts } = useTrendForecasts();
  const { data: trends, isLoading: loadingTrends } = useFashionTrends();

  if (loadingForecasts || loadingTrends) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  // Generate lifecycle data for visualization
  const generateLifecycleData = () => {
    if (!trends?.length) return [];
    
    const today = new Date();
    const data = [];
    
    for (let i = -4; i <= 12; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i * 7);
      
      const weekData: Record<string, any> = {
        week: i === 0 ? 'Now' : i > 0 ? `+${i}w` : `${i}w`,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      };
      
      trends.slice(0, 5).forEach((trend) => {
        const baseGrowth = trend.growth_rate || 50;
        const velocity = trend.velocity_score || 50;
        const lifespan = trend.predicted_lifespan_weeks || 12;
        
        // Calculate predicted growth based on lifecycle stage
        let predictedGrowth = baseGrowth;
        const weekInCycle = i + 4; // Normalize to start from 0
        
        if (trend.status === 'emerging') {
          predictedGrowth = baseGrowth * (1 + (weekInCycle / lifespan) * 0.5);
        } else if (trend.status === 'peaking') {
          const peakWeek = lifespan / 2;
          const distanceFromPeak = Math.abs(weekInCycle - peakWeek);
          predictedGrowth = baseGrowth * (1 - distanceFromPeak / lifespan * 0.3);
        } else if (trend.status === 'cooling') {
          predictedGrowth = baseGrowth * (1 - weekInCycle / lifespan * 0.4);
        }
        
        // Add some variance
        predictedGrowth = Math.max(0, predictedGrowth + (Math.random() - 0.5) * 10);
        weekData[trend.trend_name] = Math.round(predictedGrowth);
      });
      
      data.push(weekData);
    }
    
    return data;
  };

  const lifecycleData = generateLifecycleData();
  const topTrends = trends?.slice(0, 5) || [];

  return (
    <div className="space-y-4">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={lifecycleData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              label={{ value: 'Growth %', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <ReferenceLine x="Now" stroke="hsl(var(--coral))" strokeDasharray="5 5" label="Today" />
            {topTrends.map((trend, idx) => (
              <Line
                key={trend.id}
                type="monotone"
                dataKey={trend.trend_name}
                stroke={statusColors[trend.status as keyof typeof statusColors] || statusColors.emerging}
                strokeWidth={2}
                dot={false}
                strokeDasharray={idx > 2 ? "5 5" : undefined}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {topTrends.map((trend) => {
          const forecast = forecasts?.find(f => f.trend_id === trend.id);
          const isPeaking = trend.status === 'peaking';
          const isCooling = trend.status === 'cooling';
          
          return (
            <Card key={trend.id} className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{trend.trend_name}</p>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs mt-1",
                      trend.status === 'emerging' && "border-teal text-teal",
                      trend.status === 'established' && "border-blue text-blue",
                      trend.status === 'peaking' && "border-coral text-coral",
                      trend.status === 'cooling' && "border-muted-foreground text-muted-foreground"
                    )}
                  >
                    {trend.status}
                  </Badge>
                </div>
                {isPeaking ? (
                  <TrendingUp className="w-4 h-4 text-coral" />
                ) : isCooling ? (
                  <TrendingDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Target className="w-4 h-4 text-teal" />
                )}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {trend.predicted_lifespan_weeks || 12}w lifespan
                </span>
                <span className={cn(
                  "font-medium",
                  (trend.growth_rate || 0) > 50 ? "text-teal" : "text-muted-foreground"
                )}>
                  +{trend.growth_rate || 0}%
                </span>
              </div>
              
              {forecast && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {forecast.recommendation || `Predicted to ${forecast.predicted_status} by ${forecast.forecast_date}`}
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
