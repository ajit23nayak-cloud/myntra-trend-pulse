import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSentimentReviews } from '@/hooks/useDashboardData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Smartphone, MessageCircle, Star, Twitter, Instagram, Globe, Mail, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const sourceIcons: Record<string, React.ReactNode> = {
  'Play Store': <Smartphone className="w-4 h-4" />,
  'app_store': <Smartphone className="w-4 h-4" />,
  'App Store': <Smartphone className="w-4 h-4" />,
  'Twitter': <Twitter className="w-4 h-4" />,
  'twitter': <Twitter className="w-4 h-4" />,
  'Instagram': <Instagram className="w-4 h-4" />,
  'instagram': <Instagram className="w-4 h-4" />,
  'Trustpilot': <Star className="w-4 h-4" />,
  'trustpilot': <Star className="w-4 h-4" />,
  'email': <Mail className="w-4 h-4" />,
  'chat': <MessageCircle className="w-4 h-4" />,
  'live chat transcript': <MessageCircle className="w-4 h-4" />,
  'social media': <Globe className="w-4 h-4" />,
  'website': <Globe className="w-4 h-4" />,
};

const COLORS = [
  'hsl(var(--coral))',
  'hsl(var(--teal))',
  'hsl(var(--purple))',
  'hsl(var(--orange))',
  'hsl(162, 63%, 41%)',
  'hsl(45, 93%, 47%)',
  'hsl(262, 83%, 58%)',
  'hsl(12, 76%, 61%)',
];

interface SentimentBySourceProps {
  cohort?: string;
  region?: string;
}

// Normalize source names for consistency
function normalizeSourceName(source: string): string {
  const normalized = source.toLowerCase().trim();
  
  if (normalized.includes('play store') || normalized === 'playstore') return 'Play Store';
  if (normalized.includes('app store') || normalized === 'app_store' || normalized === 'appstore') return 'App Store';
  if (normalized.includes('twitter') || normalized === 'x') return 'Twitter';
  if (normalized.includes('instagram')) return 'Instagram';
  if (normalized.includes('trustpilot')) return 'Trustpilot';
  if (normalized.includes('facebook')) return 'Facebook';
  if (normalized.includes('youtube')) return 'YouTube';
  if (normalized.includes('email')) return 'Email';
  if (normalized.includes('chat')) return 'Live Chat';
  if (normalized.includes('website') || normalized.includes('e-commerce')) return 'Website';
  if (normalized.includes('social')) return 'Social Media';
  
  // Capitalize first letter
  return source.charAt(0).toUpperCase() + source.slice(1).toLowerCase();
}

export function SentimentBySource({ cohort, region }: SentimentBySourceProps) {
  const { data: reviews, isLoading } = useSentimentReviews({ 
    cohort: cohort as any, 
    region: region as any, 
    limit: 500 
  });

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  // Aggregate by normalized source
  const sourceStats = reviews?.reduce((acc: any, review) => {
    const source = normalizeSourceName(review.source || 'Unknown');
    if (!acc[source]) {
      acc[source] = { 
        source, 
        total: 0, 
        positive: 0, 
        negative: 0, 
        neutral: 0,
        avgScore: 0,
        totalScore: 0
      };
    }
    acc[source].total++;
    acc[source][review.sentiment]++;
    acc[source].totalScore += review.sentiment_score || 0;
    return acc;
  }, {}) || {};

  const sourceData = Object.values(sourceStats)
    .map((s: any) => ({
      ...s,
      avgScore: s.total > 0 ? Math.round((s.totalScore / s.total) * 100) : 0,
      positiveRate: s.total > 0 ? Math.round((s.positive / s.total) * 100) : 0
    }))
    .sort((a: any, b: any) => b.total - a.total);

  // Pie chart data for overall distribution
  const pieData = sourceData.map((s: any, i: number) => ({
    name: s.source,
    value: s.total,
    color: COLORS[i % COLORS.length]
  }));

  if (sourceData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No reviews available to analyze by source</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Source Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h4 className="font-medium mb-4">Review Volume by Source</h4>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, 'Reviews']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-4">Positive Sentiment Rate by Source</h4>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="source" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Positive Rate']}
                />
                <Bar 
                  dataKey="positiveRate" 
                  fill="hsl(var(--teal))" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Source Details Table */}
      <Card className="p-4">
        <h4 className="font-medium mb-4">Detailed Source Breakdown</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border">
                <th className="text-left p-2">Source</th>
                <th className="text-center p-2">Total</th>
                <th className="text-center p-2">Positive</th>
                <th className="text-center p-2">Negative</th>
                <th className="text-center p-2">Neutral</th>
                <th className="text-center p-2">Avg Score</th>
                <th className="text-center p-2">Health</th>
              </tr>
            </thead>
            <tbody>
              {sourceData.map((source: any, i: number) => {
                const health = source.positiveRate >= 70 ? 'good' : source.positiveRate >= 50 ? 'moderate' : 'poor';
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {sourceIcons[source.source] || <Globe className="w-4 h-4" />}
                        </span>
                        <span className="font-medium text-sm">{source.source}</span>
                      </div>
                    </td>
                    <td className="text-center p-2">
                      <Badge variant="secondary" className="text-xs">{source.total}</Badge>
                    </td>
                    <td className="text-center p-2 text-teal font-medium">{source.positive}</td>
                    <td className="text-center p-2 text-coral font-medium">{source.negative}</td>
                    <td className="text-center p-2 text-muted-foreground">{source.neutral}</td>
                    <td className="text-center p-2 font-medium">{source.avgScore}%</td>
                    <td className="text-center p-2">
                      <Badge 
                        variant="outline"
                        className={cn(
                          "text-xs",
                          health === 'good' ? "bg-teal/20 text-teal" :
                          health === 'moderate' ? "bg-orange/20 text-orange" :
                          "bg-destructive/20 text-destructive"
                        )}
                      >
                        {health}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Source Insights */}
      <div className="grid md:grid-cols-3 gap-4">
        {sourceData.slice(0, 3).map((source: any, i: number) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-muted-foreground">
                {sourceIcons[source.source] || <Globe className="w-4 h-4" />}
              </span>
              <h5 className="font-medium">{source.source}</h5>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Reviews</span>
                <span className="font-medium">{source.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Positive Rate</span>
                <span className={cn(
                  "font-medium",
                  source.positiveRate >= 70 ? "text-teal" : 
                  source.positiveRate >= 50 ? "text-orange" : "text-destructive"
                )}>
                  {source.positiveRate}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all",
                    source.positiveRate >= 70 ? "bg-teal" : 
                    source.positiveRate >= 50 ? "bg-orange" : "bg-destructive"
                  )}
                  style={{ width: `${source.positiveRate}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
