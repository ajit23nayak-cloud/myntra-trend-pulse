import { Card } from '@/components/ui/card';
import { useSentimentTrends, useSentimentReviews } from '@/hooks/useDashboardData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Line } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, TrendingUp, TrendingDown, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SentimentVelocityChart() {
  const { data: trends, isLoading: loadingTrends } = useSentimentTrends();
  const { data: recentReviews, isLoading: loadingReviews } = useSentimentReviews({ limit: 50 });

  if (loadingTrends || loadingReviews) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  // Process trends for velocity chart
  const velocityData = trends?.slice().reverse().map(t => ({
    period: new Date(t.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    total: t.positive_count + t.negative_count + t.neutral_count,
    positive: t.positive_count,
    negative: t.negative_count,
    neutral: t.neutral_count,
    velocity: t.review_velocity || 0,
    avgScore: t.avg_sentiment_score ? t.avg_sentiment_score * 100 : 50,
  })) || [];

  // Calculate velocity changes
  const latestVelocity = velocityData[velocityData.length - 1]?.velocity || 0;
  const previousVelocity = velocityData[velocityData.length - 2]?.velocity || 0;
  const velocityChange = latestVelocity - previousVelocity;
  const velocityTrend = velocityChange > 5 ? 'spike' : velocityChange < -5 ? 'drop' : 'stable';

  // Calculate sentiment distribution from recent reviews
  const sentimentCounts = recentReviews?.reduce((acc, r) => {
    acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const totalRecent = Object.values(sentimentCounts).reduce((a, b) => a + b, 0);
  const positiveRatio = totalRecent > 0 ? ((sentimentCounts.positive || 0) / totalRecent) * 100 : 0;
  const negativeRatio = totalRecent > 0 ? ((sentimentCounts.negative || 0) / totalRecent) * 100 : 0;

  // Detect spikes in negative reviews
  const hasNegativeSpike = negativeRatio > 30;

  return (
    <div className="space-y-6">
      {/* Alert Banner for Spikes */}
      {hasNegativeSpike && (
        <Card className="p-4 border-coral/50 bg-coral/5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-coral" />
            <div>
              <p className="font-medium text-coral">High Negative Sentiment Detected</p>
              <p className="text-sm text-muted-foreground">
                {negativeRatio.toFixed(0)}% of recent reviews are negative. Investigate potential issues.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Review Velocity</p>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <span className="text-2xl font-bold">{latestVelocity.toFixed(0)}</span>
            <span className="text-xs text-muted-foreground">/day</span>
          </div>
          <div className={cn(
            "text-xs flex items-center gap-1 mt-1",
            velocityTrend === 'spike' ? "text-coral" : velocityTrend === 'drop' ? "text-teal" : "text-muted-foreground"
          )}>
            {velocityTrend === 'spike' ? (
              <TrendingUp className="w-3 h-3" />
            ) : velocityTrend === 'drop' ? (
              <TrendingDown className="w-3 h-3" />
            ) : null}
            {velocityChange > 0 ? '+' : ''}{velocityChange.toFixed(0)} vs last period
          </div>
        </Card>
        
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Recent Reviews</p>
          <span className="text-2xl font-bold">{totalRecent}</span>
          <p className="text-xs text-muted-foreground mt-1">last 50 analyzed</p>
        </Card>
        
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" /> Positive
          </p>
          <span className="text-2xl font-bold text-teal">{positiveRatio.toFixed(0)}%</span>
          <p className="text-xs text-muted-foreground mt-1">{sentimentCounts.positive || 0} reviews</p>
        </Card>
        
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <ThumbsDown className="w-3 h-3" /> Negative
          </p>
          <span className={cn("text-2xl font-bold", hasNegativeSpike ? "text-coral" : "")}>
            {negativeRatio.toFixed(0)}%
          </span>
          <p className="text-xs text-muted-foreground mt-1">{sentimentCounts.negative || 0} reviews</p>
        </Card>
      </div>

      {/* Velocity Timeline */}
      <Card className="p-4">
        <h4 className="font-medium mb-4">Review Volume & Velocity</h4>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar yAxisId="left" dataKey="positive" stackId="a" fill="hsl(var(--teal))" />
              <Bar yAxisId="left" dataKey="neutral" stackId="a" fill="hsl(var(--muted))" />
              <Bar yAxisId="left" dataKey="negative" stackId="a" fill="hsl(var(--coral))" />
              <Line yAxisId="right" type="monotone" dataKey="velocity" stroke="hsl(var(--blue))" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-teal" />
            Positive
          </span>
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-muted" />
            Neutral
          </span>
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-coral" />
            Negative
          </span>
          <span className="flex items-center gap-2">
            <div className="w-3 h-1 bg-blue" />
            Velocity
          </span>
        </div>
      </Card>

      {/* Sentiment Score Trend */}
      <Card className="p-4">
        <h4 className="font-medium mb-4">Average Sentiment Score</h4>
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${value.toFixed(0)}%`, 'Sentiment Score']}
              />
              <Area 
                type="monotone" 
                dataKey="avgScore" 
                stroke="hsl(var(--teal))" 
                fill="hsl(var(--teal))"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
