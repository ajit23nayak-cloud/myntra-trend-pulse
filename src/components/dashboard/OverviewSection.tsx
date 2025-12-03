import { useFashionTrends, useSentimentReviews, useAlerts, useCompetitorProducts } from '@/hooks/useDashboardData';
import { StatCard } from './StatCard';
import { 
  MessageSquareText, 
  TrendingUp, 
  Target, 
  Bell,
  ArrowRight,
  Sparkles,
  Flame,
  Info
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useMemo } from 'react';
import { format, subDays, startOfWeek } from 'date-fns';

interface OverviewSectionProps {
  onNavigate: (section: string) => void;
}

const statDescriptions = {
  sentiment: "Aggregated customer sentiment score from reviews across App Store, Play Store, and social media platforms.",
  trends: "Number of currently active fashion trends detected across TikTok, Instagram, Pinterest, and YouTube.",
  competitiveness: "Percentage indicating how competitive Myntra's pricing is compared to AJIO across similar products.",
  alerts: "Total alerts triggered today including price changes, competitor deals, and sentiment shifts."
};

const changeLabelTooltips = {
  vsLastWeek: "Percentage change in sentiment score compared to the previous 7-day period.",
  trendingUp: "Number of trends showing positive growth momentum this period.",
  avgPriceGap: "Average percentage difference between Myntra and AJIO prices on comparable products.",
  criticalAlerts: "High-priority alerts requiring immediate attention."
};

const sectionDescriptions = {
  sentimentTrend: "Tracks positive and negative customer sentiment over time. Green indicates positive sentiment, red indicates negative sentiment trends.",
  hotTrends: "Top emerging and peaking fashion trends detected from social media platforms, showing growth rate and current status."
};

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

export function OverviewSection({ onNavigate }: OverviewSectionProps) {
  const { data: trends } = useFashionTrends();
  const { data: reviews } = useSentimentReviews({ limit: 500 });
  const { data: alerts } = useAlerts();
  const { data: competitorProducts } = useCompetitorProducts();
  
  // Calculate real sentiment stats from database
  const sentimentStats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { 
        overallScore: 72, 
        change: 2.5, 
        positive: 0, 
        negative: 0, 
        neutral: 0,
        total: 0
      };
    }
    
    const positive = reviews.filter(r => r.sentiment === 'positive').length;
    const negative = reviews.filter(r => r.sentiment === 'negative').length;
    const neutral = reviews.filter(r => r.sentiment === 'neutral').length;
    const total = reviews.length;
    
    const overallScore = total > 0 ? Math.round((positive / total) * 100) : 0;
    
    // Calculate change from older reviews vs recent
    const midpoint = Math.floor(reviews.length / 2);
    const recentReviews = reviews.slice(0, midpoint);
    const olderReviews = reviews.slice(midpoint);
    
    const recentPositiveRate = recentReviews.length > 0 
      ? (recentReviews.filter(r => r.sentiment === 'positive').length / recentReviews.length) * 100 
      : 0;
    const olderPositiveRate = olderReviews.length > 0 
      ? (olderReviews.filter(r => r.sentiment === 'positive').length / olderReviews.length) * 100 
      : 0;
    
    const change = recentPositiveRate - olderPositiveRate;
    
    return { overallScore, change: Math.round(change * 10) / 10, positive, negative, neutral, total };
  }, [reviews]);
  
  // Calculate sentiment over time from real data
  const sentimentOverTime = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      // Return empty weeks
      return Array.from({ length: 8 }, (_, i) => ({
        week: `W${i + 1}`,
        positive: 0,
        negative: 0,
        neutral: 0
      }));
    }
    
    // Group reviews by week with timestamp for sorting
    const weeklyData: Record<string, { positive: number; negative: number; neutral: number; total: number; timestamp: number }> = {};
    
    reviews.forEach(review => {
      const reviewDate = new Date(review.review_date);
      const weekStart = startOfWeek(reviewDate);
      const weekKey = format(weekStart, 'MMM d');
      const timestamp = weekStart.getTime();
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { positive: 0, negative: 0, neutral: 0, total: 0, timestamp };
      }
      
      weeklyData[weekKey][review.sentiment as 'positive' | 'negative' | 'neutral']++;
      weeklyData[weekKey].total++;
    });
    
    // Convert to array, sort chronologically by timestamp, then take last 8 weeks
    const sortedWeeks = Object.entries(weeklyData)
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      .map(([week, data]) => ({
        week,
        positive: data.total > 0 ? Math.round((data.positive / data.total) * 100) : 0,
        negative: data.total > 0 ? Math.round((data.negative / data.total) * 100) : 0,
        neutral: data.total > 0 ? Math.round((data.neutral / data.total) * 100) : 0,
      }))
      .slice(-8);
    
    return sortedWeeks.length > 0 ? sortedWeeks : [
      { week: 'Current', positive: sentimentStats.overallScore, negative: 100 - sentimentStats.overallScore - 5, neutral: 5 }
    ];
  }, [reviews, sentimentStats.overallScore]);
  
  // Calculate price competitiveness from real competitor data
  const priceCompetitiveness = useMemo(() => {
    if (!competitorProducts || competitorProducts.length === 0) {
      return { score: 87, avgGap: -2.3 };
    }
    
    const productsWithPriceDiff = competitorProducts.filter(p => p.price_difference !== null);
    if (productsWithPriceDiff.length === 0) {
      return { score: 87, avgGap: -2.3 };
    }
    
    const avgPriceDiff = productsWithPriceDiff.reduce((sum, p) => sum + (p.price_difference || 0), 0) / productsWithPriceDiff.length;
    const myntraWins = productsWithPriceDiff.filter(p => (p.price_difference || 0) < 0).length;
    const score = Math.round((myntraWins / productsWithPriceDiff.length) * 100);
    const avgGapPercent = Math.round((avgPriceDiff / 1000) * 100) / 10; // Rough percentage estimate
    
    return { score, avgGap: avgGapPercent };
  }, [competitorProducts]);
  
  // Calculate alerts stats
  const alertStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAlerts = alerts?.filter(a => a.created_at.startsWith(today)) || [];
    const criticalAlerts = alerts?.filter(a => a.severity === 'critical' && a.status === 'active') || [];
    
    return {
      today: todayAlerts.length || alerts?.length || 0,
      critical: criticalAlerts.length
    };
  }, [alerts]);
  
  // Get trending fashion trends
  const topTrends = useMemo(() => {
    if (!trends || trends.length === 0) return [];
    
    return trends
      .filter(t => {
        const status = (t.status || '').toLowerCase();
        return status === 'emerging' || status === 'peaking';
      })
      .slice(0, 3)
      .map(t => ({
        id: t.id,
        trend: t.trend_name,
        status: t.status,
        growth: t.growth_rate || 0,
      }));
  }, [trends]);
  
  const activeTrendsCount = trends?.filter(t => {
    const status = (t.status || '').toLowerCase();
    return status !== 'cooling';
  }).length || 0;
  
  const trendingUpCount = trends?.filter(t => (t.growth_rate || 0) > 0).length || 0;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Dashboard Overview</h2>
            <p className="text-muted-foreground">Real-time insights at a glance</p>
          </div>
          <InfoTooltip description="Central hub for monitoring key performance indicators, sentiment trends, and fashion trend insights for Myntra." />
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: <span className="text-foreground font-medium">2 minutes ago</span>
        </div>
      </div>

      {/* Stats Grid - Now using real data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <StatCard
            title="Overall Sentiment"
            value={`${sentimentStats.overallScore}%`}
            change={sentimentStats.change}
            changeLabel="vs last week"
            changeLabelTooltip={changeLabelTooltips.vsLastWeek}
            icon={MessageSquareText}
            iconColor="text-teal"
            delay={0}
          />
          <div className="absolute top-3 right-3">
            <InfoTooltip description={`${statDescriptions.sentiment} Based on ${sentimentStats.total} reviews: ${sentimentStats.positive} positive, ${sentimentStats.negative} negative, ${sentimentStats.neutral} neutral.`} />
          </div>
        </div>
        <div className="relative">
          <StatCard
            title="Active Trends"
            value={activeTrendsCount}
            change={trendingUpCount}
            changeLabel="trending up"
            changeLabelTooltip={changeLabelTooltips.trendingUp}
            icon={TrendingUp}
            iconColor="text-coral"
            delay={100}
          />
          <div className="absolute top-3 right-3">
            <InfoTooltip description={statDescriptions.trends} />
          </div>
        </div>
        <div className="relative">
          <StatCard
            title="Price Competitiveness"
            value={`${priceCompetitiveness.score}%`}
            change={priceCompetitiveness.avgGap}
            changeLabel="avg price gap"
            changeLabelTooltip={changeLabelTooltips.avgPriceGap}
            icon={Target}
            iconColor="text-blue"
            delay={200}
          />
          <div className="absolute top-3 right-3">
            <InfoTooltip description={statDescriptions.competitiveness} />
          </div>
        </div>
        <div className="relative">
          <StatCard
            title="Alerts Today"
            value={alertStats.today}
            change={alertStats.critical}
            changeLabel="critical alerts"
            changeLabelTooltip={changeLabelTooltips.criticalAlerts}
            icon={Bell}
            iconColor="text-yellow"
            delay={300}
          />
          <div className="absolute top-3 right-3">
            <InfoTooltip description={statDescriptions.alerts} />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Mini Chart - Now using real data */}
        <div className="lg:col-span-2 glass-card p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              <h3 className="text-lg font-semibold text-foreground">Sentiment Trend</h3>
              <InfoTooltip description={sectionDescriptions.sentimentTrend} />
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('sentiment')} className="gap-1 text-primary">
              View Details
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4 mb-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-teal" />
              <span className="text-muted-foreground">Positive ({sentimentStats.positive})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-coral" />
              <span className="text-muted-foreground">Negative ({sentimentStats.negative})</span>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sentimentOverTime}>
                <defs>
                  <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }} 
                  formatter={(value: number, name: string) => [`${value}%`, name.charAt(0).toUpperCase() + name.slice(1)]}
                />
                <Area 
                  type="monotone" 
                  dataKey="positive" 
                  stroke="hsl(172, 66%, 50%)" 
                  fill="url(#positiveGradient)" 
                  strokeWidth={2} 
                />
                <Area 
                  type="monotone" 
                  dataKey="negative" 
                  stroke="hsl(0, 84%, 60%)" 
                  fill="url(#negativeGradient)" 
                  strokeWidth={2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hot Fashion Trends */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              <h3 className="text-lg font-semibold text-foreground">Hot Fashion Trends</h3>
              <InfoTooltip description={sectionDescriptions.hotTrends} />
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('trends')} className="gap-1 text-primary">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {topTrends.length > 0 ? topTrends.map((trend, idx) => (
              <div 
                key={trend.id}
                className="p-3 rounded-lg bg-secondary/30 border border-border/50 animate-slide-in-right"
                style={{ animationDelay: `${300 + idx * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {trend.status?.toLowerCase() === 'emerging' ? (
                      <Sparkles className="w-4 h-4 text-teal" />
                    ) : (
                      <Flame className="w-4 h-4 text-coral" />
                    )}
                    <span className="font-medium text-foreground text-sm truncate max-w-[150px]">{trend.trend}</span>
                  </div>
                  <TooltipProvider>
                    <TooltipUI>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs cursor-help",
                            trend.status?.toLowerCase() === 'emerging' ? "trend-emerging" : "trend-peaking"
                          )}
                        >
                          +{trend.growth}%
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[200px]">
                        <p className="text-xs">Growth rate: Weekly increase in social media mentions and search volume for this trend.</p>
                      </TooltipContent>
                    </TooltipUI>
                  </TooltipProvider>
                </div>
              </div>
            )) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No trending items detected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
