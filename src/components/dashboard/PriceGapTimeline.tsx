import { Card } from '@/components/ui/card';
import { useCompetitiveMetrics, useCompetitorProducts } from '@/hooks/useDashboardData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PriceGapTimeline() {
  const { data: metrics, isLoading: loadingMetrics } = useCompetitiveMetrics();
  const { data: products, isLoading: loadingProducts } = useCompetitorProducts();

  if (loadingMetrics || loadingProducts) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  // Process metrics for timeline chart
  const timelineData = metrics?.slice().reverse().map(m => ({
    date: new Date(m.metric_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    avgGap: m.avg_price_gap || 0,
    competitiveness: m.price_competitiveness_score || 50,
    myntraCheaper: m.myntra_cheaper_count || 0,
    ajioCheaper: m.ajio_cheaper_count || 0,
  })) || [];

  // Calculate category-wise price gaps
  const categoryGaps = products?.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = { category, totalGap: 0, count: 0, myntraWins: 0, ajioWins: 0 };
    }
    acc[category].totalGap += product.price_difference || 0;
    acc[category].count += 1;
    if ((product.price_difference || 0) < 0) {
      acc[category].myntraWins += 1;
    } else {
      acc[category].ajioWins += 1;
    }
    return acc;
  }, {} as Record<string, { category: string; totalGap: number; count: number; myntraWins: number; ajioWins: number }>) || {};

  const categoryData = Object.values(categoryGaps).map(c => ({
    ...c,
    avgGap: c.count > 0 ? Math.round(c.totalGap / c.count) : 0,
  })).sort((a, b) => a.avgGap - b.avgGap);

  const latestMetric = metrics?.[0];
  const previousMetric = metrics?.[1];
  const gapChange = latestMetric && previousMetric 
    ? (latestMetric.avg_price_gap || 0) - (previousMetric.avg_price_gap || 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Avg Price Gap</p>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-muted-foreground" />
            <span className="text-2xl font-bold">{latestMetric?.avg_price_gap || 0}</span>
          </div>
          <div className={cn(
            "text-xs flex items-center gap-1 mt-1",
            gapChange < 0 ? "text-teal" : gapChange > 0 ? "text-coral" : "text-muted-foreground"
          )}>
            {gapChange < 0 ? <TrendingDown className="w-3 h-3" /> : gapChange > 0 ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {Math.abs(gapChange).toFixed(0)} vs last period
          </div>
        </Card>
        
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Competitiveness</p>
          <span className="text-2xl font-bold">{latestMetric?.price_competitiveness_score || 0}%</span>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div 
              className="bg-teal h-2 rounded-full transition-all"
              style={{ width: `${latestMetric?.price_competitiveness_score || 0}%` }}
            />
          </div>
        </Card>
        
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Myntra Cheaper</p>
          <span className="text-2xl font-bold text-teal">{latestMetric?.myntra_cheaper_count || 0}</span>
          <p className="text-xs text-muted-foreground mt-1">products</p>
        </Card>
        
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">AJIO Cheaper</p>
          <span className="text-2xl font-bold text-coral">{latestMetric?.ajio_cheaper_count || 0}</span>
          <p className="text-xs text-muted-foreground mt-1">products</p>
        </Card>
      </div>

      {/* Price Gap Timeline */}
      <Card className="p-4">
        <h4 className="font-medium mb-4">Price Gap Over Time</h4>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`₹${value}`, 'Avg Gap']}
              />
              <Area 
                type="monotone" 
                dataKey="avgGap" 
                stroke="hsl(var(--coral))" 
                fill="hsl(var(--coral))"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Category Price Gaps */}
      <Card className="p-4">
        <h4 className="font-medium mb-4">Price Gap by Category</h4>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`₹${value}`, 'Avg Gap']}
              />
              <Bar dataKey="avgGap" radius={[0, 4, 4, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.avgGap < 0 ? 'hsl(var(--teal))' : 'hsl(var(--coral))'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-teal" />
            Myntra Cheaper
          </span>
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-coral" />
            AJIO Cheaper
          </span>
        </div>
      </Card>
    </div>
  );
}
