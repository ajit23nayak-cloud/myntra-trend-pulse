import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSentimentReviews } from '@/hooks/useDashboardData';
import { useSentimentChartData } from '@/hooks/useSentimentChartData';
import { TimeframeSelector } from './TimeframeSelector';
import { GlobalFilters } from './GlobalFilters';
import { KeyPhraseCloud } from './KeyPhraseCloud';
import { SentimentVelocityChart } from './SentimentVelocityChart';
import { SentimentBySource } from './SentimentBySource';
import { ReviewDrillDown } from './ReviewDrillDown';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageSquare, TrendingUp, AlertTriangle, Activity, ExternalLink, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { TimeframeOption, CustomerCohort, RegionType, SentimentTheme } from '@/types/database';
import { sentimentThemes, recentFeedback } from '@/data/mockData';

const sourceIcons: Record<string, string> = {
  'Twitter': '𝕏',
  'App Store': '📱',
  'Play Store': '▶️',
  'Trustpilot': '⭐'
};

const themeMap: Record<string, SentimentTheme> = {
  'Product Quality': 'product_quality',
  'Pricing': 'pricing',
  'Delivery': 'delivery',
  'Returns': 'returns',
  'Customer Service': 'customer_service',
  'App Usability': 'app_usability'
};

export function EnhancedSentimentSection() {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('weekly');
  const [cohort, setCohort] = useState<CustomerCohort | undefined>();
  const [region, setRegion] = useState<RegionType | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<{ theme: SentimentTheme | null; label: string }>({ theme: null, label: '' });

  // Fetch reviews with filters - increased limit to capture historical data
  const { data: reviews, isLoading: reviewsLoading } = useSentimentReviews({ 
    cohort, 
    region, 
    limit: 500 
  });
  
  // Use shared hook for sentiment chart data (same as Overview page)
  const chartData = useSentimentChartData(reviews as any);
  
  // Filter reviews by category locally (since product_category is in the data)
  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    if (!category) return reviews;
    return reviews.filter(r => r.product_category?.toLowerCase().includes(category.toLowerCase()));
  }, [reviews, category]);

  const feedbackData = filteredReviews?.length ? filteredReviews.slice(0, 10) : recentFeedback;

  const handleThemeClick = (themeLabel: string) => {
    const theme = themeMap[themeLabel] || null;
    setSelectedTheme({ theme, label: themeLabel });
    setDrillDownOpen(true);
  };

  const clearFilters = () => {
    setCohort(undefined);
    setRegion(undefined);
    setCategory(undefined);
  };

  const hasActiveFilters = cohort || region || category;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Sentiment Analysis</h2>
          <p className="text-muted-foreground">Customer feedback insights with cohort segmentation</p>
        </div>
        <div className="flex items-center gap-2">
          <TimeframeSelector value={timeframe} onChange={setTimeframe} />
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              {[cohort, region, category].filter(Boolean).length} filters active
            </Badge>
          )}
        </div>
      </div>

      {/* Global Filters */}
      <GlobalFilters
        category={category}
        cohort={cohort}
        region={region}
        onCategoryChange={setCategory}
        onBrandChange={() => {}}
        onCohortChange={setCohort}
        onRegionChange={setRegion}
        onClearAll={clearFilters}
        showBrand={false}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-source">By Source</TabsTrigger>
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
              {(cohort || region) && (
                <Badge variant="outline" className="ml-2 text-xs">Filtered</Badge>
              )}
            </h3>
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
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="sentimentPositiveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="sentimentNegativeGradient" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#sentimentPositiveGradient)" 
                    strokeWidth={2} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="negative" 
                    stroke="hsl(0, 84%, 60%)" 
                    fill="url(#sentimentNegativeGradient)" 
                    strokeWidth={2} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="by-source">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-coral" />
              Sentiment Analysis by Source
            </h3>
            <SentimentBySource cohort={cohort} region={region} />
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Sentiment by Theme</h3>
              <Badge variant="outline" className="text-xs">
                <ExternalLink className="w-3 h-3 mr-1" />
                Click bar to drill down
              </Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentThemes} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis 
                    dataKey="theme" 
                    type="category" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, cursor: 'pointer' }} 
                    width={100}
                    onClick={(data) => handleThemeClick(data.value as string)}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                  />
                  <Bar 
                    dataKey="positive" 
                    fill="hsl(var(--teal))" 
                    radius={[0, 4, 4, 0]} 
                    cursor="pointer"
                    onClick={(data) => handleThemeClick(data.theme)}
                  />
                  <Bar 
                    dataKey="negative" 
                    fill="hsl(var(--coral))" 
                    radius={[0, 4, 4, 0]}
                    cursor="pointer"
                    onClick={(data) => handleThemeClick(data.theme)}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Click on any theme bar to see sample reviews
            </p>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-coral" />
                Recent Feedback Stream
              </h3>
              <Badge variant="outline" className="text-xs">
                {filteredReviews.length} reviews
              </Badge>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {feedbackData.map((item: any, i: number) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{sourceIcons[item.source] || '📝'}</span>
                      <span className="text-xs text-muted-foreground">{item.source}</span>
                    </div>
                    <Badge variant={item.sentiment === 'positive' ? 'default' : item.sentiment === 'negative' ? 'destructive' : 'secondary'}>
                      {item.sentiment}
                    </Badge>
                  </div>
                  <p className="text-sm">{item.text || item.review_text}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">{item.date || new Date(item.review_date).toLocaleDateString()}</p>
                    {item.product_category && (
                      <Badge variant="outline" className="text-xs">{item.product_category}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Drill-down Dialog */}
      <ReviewDrillDown
        open={drillDownOpen}
        onOpenChange={setDrillDownOpen}
        theme={selectedTheme.theme}
        themeLabel={selectedTheme.label}
        cohort={cohort}
        region={region}
      />
    </div>
  );
}
