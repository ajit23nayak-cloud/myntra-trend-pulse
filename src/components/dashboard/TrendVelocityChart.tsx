import { useFashionTrends } from '@/hooks/useDashboardData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Zap, Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statusConfig = {
  emerging: { icon: Zap, color: 'bg-teal/20 text-teal border-teal/30', label: 'Emerging' },
  established: { icon: Target, color: 'bg-blue/20 text-blue border-blue/30', label: 'Established' },
  peaking: { icon: TrendingUp, color: 'bg-coral/20 text-coral border-coral/30', label: 'Peaking' },
  cooling: { icon: TrendingDown, color: 'bg-muted text-muted-foreground border-border', label: 'Cooling' }
};

export function TrendVelocityChart() {
  const { data: trends, isLoading } = useFashionTrends();

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  // Generate velocity data for visualization
  const velocityData = trends?.slice(0, 8).map((trend, index) => ({
    name: trend.trend_name.split(' ').slice(0, 2).join(' '),
    velocity: trend.velocity_score || Math.random() * 100,
    growth: trend.growth_rate || Math.random() * 50,
    lifespan: trend.predicted_lifespan_weeks || Math.floor(Math.random() * 12) + 4
  })) || [];

  return (
    <div className="space-y-4">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={velocityData}>
            <defs>
              <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--coral))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--coral))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="velocity" 
              stroke="hsl(var(--coral))" 
              fill="url(#velocityGradient)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {trends?.slice(0, 4).map((trend) => {
          const config = statusConfig[trend.status];
          const Icon = config.icon;
          
          return (
            <Card key={trend.id} className="p-3 bg-card/50">
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className={cn("text-xs", config.color)}>
                  <Icon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
              <p className="font-medium text-sm truncate mb-1">{trend.trend_name}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {trend.growth_rate?.toFixed(1) || '—'}%
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {trend.predicted_lifespan_weeks || '—'}w
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
