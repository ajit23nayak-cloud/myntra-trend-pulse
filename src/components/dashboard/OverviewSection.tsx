import { dashboardStats, sentimentOverTime, fashionTrends, competitorDeals } from '@/data/mockData';
import { StatCard } from './StatCard';
import { 
  MessageSquareText, 
  TrendingUp, 
  Target, 
  Bell,
  ArrowRight,
  Sparkles,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OverviewSectionProps {
  onNavigate: (section: string) => void;
}

export function OverviewSection({ onNavigate }: OverviewSectionProps) {
  const topTrends = fashionTrends.filter(t => t.status === 'Emerging' || t.status === 'Peaking').slice(0, 3);
  const criticalDeals = competitorDeals.filter(d => d.impact === 'high');
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground">Real-time insights at a glance</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: <span className="text-foreground font-medium">2 minutes ago</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Sentiment"
          value={`${dashboardStats.overallSentiment}%`}
          change={dashboardStats.sentimentChange}
          changeLabel="vs last week"
          icon={MessageSquareText}
          iconColor="text-teal"
          delay={0}
        />
        <StatCard
          title="Active Trends"
          value={dashboardStats.activeTrends}
          change={dashboardStats.trendingUp}
          changeLabel="trending up"
          icon={TrendingUp}
          iconColor="text-coral"
          delay={100}
        />
        <StatCard
          title="Price Competitiveness"
          value={`${dashboardStats.priceCompetitiveness}%`}
          change={dashboardStats.priceGap}
          changeLabel="avg price gap"
          icon={Target}
          iconColor="text-blue"
          delay={200}
        />
        <StatCard
          title="Alerts Today"
          value={dashboardStats.alertsToday}
          change={dashboardStats.criticalAlerts}
          changeLabel="critical alerts"
          icon={Bell}
          iconColor="text-yellow"
          delay={300}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Mini Chart */}
        <div className="lg:col-span-2 glass-card p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Sentiment Trend</h3>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('sentiment')} className="gap-1 text-primary">
              View Details
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sentimentOverTime}>
                <defs>
                  <linearGradient id="overviewGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0}/>
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
                  fill="url(#overviewGradient)" 
                  strokeWidth={2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hot Trends */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Hot Trends</h3>
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
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      trend.status === 'Emerging' ? "trend-emerging" : "trend-peaking"
                    )}
                  >
                    +{trend.growth}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitor Alerts */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Competitor Activity</h3>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('competitor')} className="gap-1 text-primary">
              Full Analysis
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {criticalDeals.map((deal, idx) => (
              <div 
                key={deal.id}
                className="p-4 rounded-lg bg-coral/5 border border-coral/20 animate-slide-in-right"
                style={{ animationDelay: `${400 + idx * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-coral shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{deal.deal}</p>
                    <p className="text-xs text-muted-foreground mt-1">Ends: {deal.endDate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => onNavigate('insights')}
            >
              <div className="w-10 h-10 rounded-lg bg-teal/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-teal" />
              </div>
              <span className="text-sm">View Insights</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => onNavigate('alerts')}
            >
              <div className="w-10 h-10 rounded-lg bg-coral/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-coral" />
              </div>
              <span className="text-sm">Check Alerts</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => onNavigate('trends')}
            >
              <div className="w-10 h-10 rounded-lg bg-purple/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple" />
              </div>
              <span className="text-sm">Explore Trends</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => onNavigate('competitor')}
            >
              <div className="w-10 h-10 rounded-lg bg-blue/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue" />
              </div>
              <span className="text-sm">Competitor Intel</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
