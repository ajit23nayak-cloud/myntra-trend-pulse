import { dashboardStats, sentimentOverTime, fashionTrends } from '@/data/mockData';
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
  const topTrends = fashionTrends.filter(t => t.status === 'Emerging' || t.status === 'Peaking').slice(0, 3);
  
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <StatCard
            title="Overall Sentiment"
            value={`${dashboardStats.overallSentiment}%`}
            change={dashboardStats.sentimentChange}
            changeLabel="vs last week"
            changeLabelTooltip={changeLabelTooltips.vsLastWeek}
            icon={MessageSquareText}
            iconColor="text-teal"
            delay={0}
          />
          <div className="absolute top-3 right-3">
            <InfoTooltip description={statDescriptions.sentiment} />
          </div>
        </div>
        <div className="relative">
          <StatCard
            title="Active Trends"
            value={dashboardStats.activeTrends}
            change={dashboardStats.trendingUp}
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
            value={`${dashboardStats.priceCompetitiveness}%`}
            change={dashboardStats.priceGap}
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
            value={dashboardStats.alertsToday}
            change={dashboardStats.criticalAlerts}
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
        {/* Sentiment Mini Chart */}
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
              <span className="text-muted-foreground">Positive</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-coral" />
              <span className="text-muted-foreground">Negative</span>
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
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(222, 47%, 8%)', 
                    border: '1px solid hsl(217, 33%, 20%)',
                    borderRadius: '8px',
                    color: 'hsl(210, 40%, 98%)'
                  }} 
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
            {topTrends.map((trend, idx) => (
              <div 
                key={trend.id}
                className="p-3 rounded-lg bg-secondary/30 border border-border/50 animate-slide-in-right"
                style={{ animationDelay: `${300 + idx * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {trend.status === 'Emerging' ? (
                      <Sparkles className="w-4 h-4 text-teal" />
                    ) : (
                      <Flame className="w-4 h-4 text-coral" />
                    )}
                    <span className="font-medium text-foreground text-sm">{trend.trend}</span>
                  </div>
                  <TooltipProvider>
                    <TooltipUI>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs cursor-help",
                            trend.status === 'Emerging' ? "trend-emerging" : "trend-peaking"
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
