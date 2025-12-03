import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSentimentReviews, useSentimentTrends } from '@/hooks/useDashboardData';
import { TimeframeSelector } from './TimeframeSelector';
import { CohortFilter } from './CohortFilter';
import { KeyPhraseCloud } from './KeyPhraseCloud';
import { SentimentVelocityChart } from './SentimentVelocityChart';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageSquare, TrendingUp, AlertTriangle, Users, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { TimeframeOption, CustomerCohort, RegionType } from '@/types/database';
import { sentimentOverTime, sentimentThemes, recentFeedback } from '@/data/mockData';

const sourceIcons: Record<string, string> = {
  'Twitter': '𝕏',
  'App Store': '📱',
  'Play Store': '▶️',
  'Trustpilot': '⭐'
};

export function EnhancedSentimentSection() {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('weekly');
  const [cohort, setCohort] = useState<CustomerCohort | undefined>();
  const [region, setRegion] = useState<RegionType | undefined>();

  const { data: reviews } = useSentimentReviews({ cohort, region, limit: 10 });
  const { data: trends } = useSentimentTrends(timeframe);

  // Use real data if available, fallback to mock
  const chartData = trends?.length ? trends.map(t => ({
    week: t.period_start,
    positive: t.positive_count,
    negative: t.negative_count
  })) : sentimentOverTime;

  const feedbackData = reviews?.length ? reviews : recentFeedback;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Sentiment Analysis</h2>
          <p className="text-muted-foreground">Customer feedback insights with cohort segmentation</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TimeframeSelector value={timeframe} onChange={setTimeframe} />
          <CohortFilter 
            cohort={cohort} 
            region={region} 
            onCohortChange={setCohort} 
            onRegionChange={setRegion} 
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="velocity">Review Velocity</TabsTrigger>
          <TabsTrigger value="themes">By Theme</TabsTrigger>
          <TabsTrigger value="keyphrases">Key Phrases</TabsTrigger>
          <TabsTrigger value="feedback">Recent Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-coral" />
              Sentiment Trend
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--teal))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--teal))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--coral))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--coral))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Area type="monotone" dataKey="positive" stroke="hsl(var(--teal))" fill="url(#positiveGradient)" />
                  <Area type="monotone" dataKey="negative" stroke="hsl(var(--coral))" fill="url(#negativeGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="velocity">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-coral" />
              Sentiment Velocity Analysis
            </h3>
            <SentimentVelocityChart />
          </Card>
        </TabsContent>

        <TabsContent value="themes">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Sentiment by Theme</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentThemes} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis dataKey="theme" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="positive" fill="hsl(var(--teal))" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="negative" fill="hsl(var(--coral))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="keyphrases">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange" />
                Key Phrase Trends
              </h3>
              <Badge variant="outline">Pain points highlighted</Badge>
            </div>
            <KeyPhraseCloud />
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-coral" />
              Recent Feedback Stream
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {feedbackData.map((item: any, i: number) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{sourceIcons[item.source] || '📝'}</span>
                    <Badge variant={item.sentiment === 'positive' ? 'default' : item.sentiment === 'negative' ? 'destructive' : 'secondary'}>
                      {item.sentiment}
                    </Badge>
                  </div>
                  <p className="text-sm">{item.text || item.review_text}</p>
                  <p className="text-xs text-muted-foreground mt-2">{item.date || item.review_date}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
