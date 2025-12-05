import { Card } from '@/components/ui/card';
import { useSentimentReviews } from '@/hooks/useDashboardData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Line } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, TrendingUp, TrendingDown, MessageSquare, ThumbsUp, ThumbsDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { format, startOfWeek, differenceInDays, subDays } from 'date-fns';
import {
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function InfoTooltip({ description }: { description: string }) {
  return (
    <TooltipProvider>
      <TooltipUI>
        <TooltipTrigger asChild>
          <Info className="w-4 h-4 text-muted-foreground cursor-help ml-1" />
        </TooltipTrigger>
        <TooltipContent className="max-w-[250px]">
          <p className="text-sm">{description}</p>
        </TooltipContent>
      </TooltipUI>
    </TooltipProvider>
  );
}

export function SentimentVelocityChart() {
  const { data: recentReviews, isLoading: loadingReviews } = useSentimentReviews({ limit: 500 });

  // Calculate velocity data from reviews grouped by week
  const { velocityData, latestVelocity, velocityChange, velocityTrend } = useMemo(() => {
    if (!recentReviews || recentReviews.length === 0) {
      return { velocityData: [], latestVelocity: 0, velocityChange: 0, velocityTrend: 'stable' as const };
    }

    // Group reviews by week and track unique days
    const weeklyData: Record<string, { 
      positive: number; 
      negative: number; 
      neutral: number; 
      total: number; 
      timestamp: number;
      avgScore: number;
      scoreSum: number;
      uniqueDays: Set<string>;
    }> = {};

    // Filter to only include reviews up to current date
    const cutoffDate = new Date('2025-12-05T23:59:59');
    
    recentReviews.forEach(review => {
      const reviewDate = new Date(review.review_date);
      if (reviewDate > cutoffDate) return; // Skip future reviews
      
      const weekStart = startOfWeek(reviewDate);
      const weekKey = format(weekStart, 'MMM d');
      const timestamp = weekStart.getTime();
      const dayKey = format(reviewDate, 'yyyy-MM-dd');

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { positive: 0, negative: 0, neutral: 0, total: 0, timestamp, avgScore: 0, scoreSum: 0, uniqueDays: new Set() };
      }

      weeklyData[weekKey][review.sentiment as 'positive' | 'negative' | 'neutral']++;
      weeklyData[weekKey].total++;
      weeklyData[weekKey].scoreSum += review.sentiment_score || 0;
      weeklyData[weekKey].uniqueDays.add(dayKey);
    });

    // Convert to array sorted by timestamp
    const sortedWeeks = Object.entries(weeklyData)
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      .map(([period, data]) => {
        // Use actual number of days with reviews (min 1 to avoid division by zero)
        const daysWithReviews = Math.max(data.uniqueDays.size, 1);
        return {
          period,
          total: data.total,
          positive: data.positive,
          negative: data.negative,
          neutral: data.neutral,
          velocity: Math.round(data.total / daysWithReviews * 10) / 10, // reviews per actual day
          avgScore: data.total > 0 ? Math.round((data.scoreSum / data.total) * 100) : 50,
        };
      })
      .slice(-8);

    const latestVelocity = sortedWeeks[sortedWeeks.length - 1]?.velocity || 0;
    const previousVelocity = sortedWeeks[sortedWeeks.length - 2]?.velocity || 0;
    const velocityChange = latestVelocity - previousVelocity;
    const velocityTrend = velocityChange > 0.5 ? 'spike' : velocityChange < -0.5 ? 'drop' : 'stable';

    return { velocityData: sortedWeeks, latestVelocity, velocityChange, velocityTrend };
  }, [recentReviews]);

  // Calculate overall review velocity (reviews per day over the entire period)
  const overallVelocity = useMemo(() => {
    if (!recentReviews || recentReviews.length === 0) return 0;
    
    const dates = recentReviews.map(r => new Date(r.review_date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const daySpan = Math.max(differenceInDays(maxDate, minDate), 1);
    
    return Math.round((recentReviews.length / daySpan) * 10) / 10;
  }, [recentReviews]);

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

  if (loadingReviews) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  // Show message if no data
  if (velocityData.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Review Data Available</h3>
        <p className="text-muted-foreground">Run the review scraper to populate sentiment data.</p>
      </Card>
    );
  }

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
          <div className="flex items-center gap-1 mb-1">
            <p className="text-xs text-muted-foreground">Review Velocity</p>
            <InfoTooltip description="Average number of reviews received per day, calculated across the entire review period. Higher values indicate more active customer feedback." />
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <span className="text-2xl font-bold">{overallVelocity.toFixed(1)}</span>
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
            {velocityChange > 0 ? '+' : ''}{velocityChange.toFixed(1)} vs last week
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-1 mb-1">
            <p className="text-xs text-muted-foreground">Total Reviews</p>
            <InfoTooltip description="Total number of customer reviews analyzed in the current dataset, covering all sentiment categories." />
          </div>
          <span className="text-2xl font-bold">{totalRecent}</span>
          <p className="text-xs text-muted-foreground mt-1">all time analyzed</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-1 mb-1">
            <ThumbsUp className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Positive</p>
            <InfoTooltip description="Percentage of reviews classified as positive sentiment. Higher is better for customer satisfaction." />
          </div>
          <span className="text-2xl font-bold text-teal">{positiveRatio.toFixed(0)}%</span>
          <p className="text-xs text-muted-foreground mt-1">{sentimentCounts.positive || 0} reviews</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-1 mb-1">
            <ThumbsDown className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Negative</p>
            <InfoTooltip description="Percentage of reviews classified as negative sentiment. Spikes above 30% trigger alerts for investigation." />
          </div>
          <span className={cn("text-2xl font-bold", hasNegativeSpike ? "text-coral" : "")}>
            {negativeRatio.toFixed(0)}%
          </span>
          <p className="text-xs text-muted-foreground mt-1">{sentimentCounts.negative || 0} reviews</p>
        </Card>
      </div>

      {/* Velocity Timeline */}
      <Card className="p-4">
        <div className="flex items-center gap-1 mb-4">
          <h4 className="font-medium">Review Volume & Velocity</h4>
          <InfoTooltip description="Stacked bar chart showing weekly review volume by sentiment type. The blue line represents daily review velocity (reviews/day) for each week." />
        </div>
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
              <Bar yAxisId="left" dataKey="positive" stackId="a" fill="hsl(var(--teal))" name="Positive" />
              <Bar yAxisId="left" dataKey="neutral" stackId="a" fill="hsl(var(--muted))" name="Neutral" />
              <Bar yAxisId="left" dataKey="negative" stackId="a" fill="hsl(var(--coral))" name="Negative" />
              <Line yAxisId="right" type="monotone" dataKey="velocity" stroke="hsl(var(--blue))" strokeWidth={2} dot={false} name="Velocity/day" />
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
        <div className="flex items-center gap-1 mb-4">
          <h4 className="font-medium">Average Sentiment Score</h4>
          <InfoTooltip description="Weekly average sentiment score (0-100). Higher scores indicate more positive customer sentiment. Tracks sentiment health over time." />
        </div>
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
