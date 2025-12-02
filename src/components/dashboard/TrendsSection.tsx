import { fashionTrends, trendHeatmapData } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Sparkles, Flame, Snowflake, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  Emerging: { icon: Sparkles, className: 'trend-emerging', color: 'text-teal' },
  Established: { icon: CheckCircle, className: 'trend-established', color: 'text-blue' },
  Peaking: { icon: Flame, className: 'trend-peaking', color: 'text-coral' },
  Cooling: { icon: Snowflake, className: 'trend-cooling', color: 'text-muted-foreground' },
};

const platformColors: Record<string, string> = {
  TikTok: 'bg-coral/20 text-coral',
  Instagram: 'bg-purple/20 text-purple',
  Pinterest: 'bg-coral/20 text-coral',
  YouTube: 'bg-coral/20 text-coral',
  'Google Trends': 'bg-blue/20 text-blue',
};

function getHeatmapColor(value: number) {
  if (value >= 90) return 'bg-coral';
  if (value >= 80) return 'bg-coral/80';
  if (value >= 70) return 'bg-orange/70';
  if (value >= 60) return 'bg-yellow/60';
  if (value >= 50) return 'bg-teal/50';
  return 'bg-blue/40';
}

export function TrendsSection() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Fashion Trend Detection</h2>
        <p className="text-muted-foreground">GenZ trend signals from social platforms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending Now */}
        <div className="lg:col-span-2 glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">Trending Now</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
            {fashionTrends.map((trend, index) => {
              const StatusIcon = statusConfig[trend.status as keyof typeof statusConfig]?.icon || Sparkles;
              const statusClass = statusConfig[trend.status as keyof typeof statusConfig]?.className || '';
              const statusColor = statusConfig[trend.status as keyof typeof statusConfig]?.color || '';
              
              return (
                <div 
                  key={trend.id}
                  className="p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all duration-200 animate-slide-in-right"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-foreground">{trend.trend}</h4>
                        <Badge variant="outline" className={cn("text-xs", statusClass)}>
                          <StatusIcon className={cn("w-3 h-3 mr-1", statusColor)} />
                          {trend.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {trend.platforms.map((platform) => (
                          <span 
                            key={platform} 
                            className={cn("text-xs px-2 py-1 rounded-md", platformColors[platform] || 'bg-muted')}
                          >
                            {platform}
                          </span>
                        ))}
                        <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                          {trend.category}
                        </span>
                      </div>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 text-sm font-bold",
                      trend.growth > 0 ? "text-teal" : "text-coral"
                    )}>
                      {trend.growth > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>{trend.growth > 0 ? '+' : ''}{trend.growth}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trend Status Legend */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Trend Lifecycle</h3>
          <div className="space-y-4">
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon;
              return (
                <div key={status} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.className)}>
                    <Icon className={cn("w-5 h-5", config.color)} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{status}</p>
                    <p className="text-xs text-muted-foreground">
                      {status === 'Emerging' && 'New trend gaining traction'}
                      {status === 'Established' && 'Stable mainstream trend'}
                      {status === 'Peaking' && 'At maximum popularity'}
                      {status === 'Cooling' && 'Declining interest'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3">Quick Stats</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-teal/10">
                <p className="text-2xl font-bold text-teal">3</p>
                <p className="text-xs text-muted-foreground">Emerging</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-coral/10">
                <p className="text-2xl font-bold text-coral">3</p>
                <p className="text-xs text-muted-foreground">Peaking</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Heatmap */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h3 className="text-lg font-semibold text-foreground mb-4">Category Demand Heatmap</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-sm font-medium text-muted-foreground pb-3 pr-4">Category</th>
                {months.map((month) => (
                  <th key={month} className="text-center text-sm font-medium text-muted-foreground pb-3 px-2">
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trendHeatmapData.map((row, idx) => (
                <tr key={row.category}>
                  <td className="text-sm font-medium text-foreground py-2 pr-4">{row.category}</td>
                  {['jan', 'feb', 'mar', 'apr', 'may', 'jun'].map((month) => {
                    const value = row[month as keyof typeof row] as number;
                    return (
                      <td key={month} className="px-2 py-2">
                        <div 
                          className={cn(
                            "w-full h-10 rounded-md flex items-center justify-center text-xs font-semibold transition-all duration-200 hover:scale-105",
                            getHeatmapColor(value),
                            value >= 80 ? "text-foreground" : "text-foreground/80"
                          )}
                        >
                          {value}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end gap-4 mt-4 text-xs">
          <span className="text-muted-foreground">Low Demand</span>
          <div className="flex gap-1">
            <div className="w-6 h-4 rounded bg-blue/40"></div>
            <div className="w-6 h-4 rounded bg-teal/50"></div>
            <div className="w-6 h-4 rounded bg-yellow/60"></div>
            <div className="w-6 h-4 rounded bg-orange/70"></div>
            <div className="w-6 h-4 rounded bg-coral/80"></div>
            <div className="w-6 h-4 rounded bg-coral"></div>
          </div>
          <span className="text-muted-foreground">High Demand</span>
        </div>
      </div>
    </div>
  );
}
