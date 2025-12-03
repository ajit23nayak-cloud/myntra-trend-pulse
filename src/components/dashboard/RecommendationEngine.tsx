import { useInsights } from '@/hooks/useDashboardData';
import { useFashionTrends } from '@/hooks/useDashboardData';
import { useCompetitorDeals } from '@/hooks/useDashboardData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, TrendingUp, TrendingDown, DollarSign, 
  Megaphone, Package, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

type RecommendationType = 'buy_more' | 'buy_less' | 'marketing_focus' | 'price_adjust';

interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  impact: string;
  confidence: number;
  category?: string;
}

const typeConfig: Record<RecommendationType, { icon: typeof ShoppingCart; color: string; label: string }> = {
  buy_more: { icon: TrendingUp, color: 'text-teal', label: 'Increase Stock' },
  buy_less: { icon: TrendingDown, color: 'text-orange', label: 'Reduce Stock' },
  marketing_focus: { icon: Megaphone, color: 'text-purple', label: 'Marketing' },
  price_adjust: { icon: DollarSign, color: 'text-coral', label: 'Pricing' }
};

export function RecommendationEngine() {
  const { data: trends } = useFashionTrends();
  const { data: deals } = useCompetitorDeals(true);

  // Generate recommendations based on data
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    // Trend-based recommendations
    trends?.filter(t => t.status === 'emerging').slice(0, 2).forEach((trend) => {
      recommendations.push({
        id: `trend-${trend.id}`,
        type: 'buy_more',
        title: `Stock up on ${trend.trend_name}`,
        description: `Rising trend with ${trend.growth_rate?.toFixed(1)}% growth. Predicted to peak in ${trend.predicted_lifespan_weeks || 8} weeks.`,
        impact: 'High revenue potential',
        confidence: 0.85,
        category: trend.trend_name
      });
    });

    trends?.filter(t => t.status === 'cooling').slice(0, 1).forEach((trend) => {
      recommendations.push({
        id: `cool-${trend.id}`,
        type: 'buy_less',
        title: `Reduce ${trend.trend_name} inventory`,
        description: `Trend is cooling down. Consider running clearance promotions.`,
        impact: 'Prevent overstock',
        confidence: 0.78,
        category: trend.trend_name
      });
    });

    // Deal-based recommendations
    deals?.filter(d => d.impact_level === 'critical' || d.impact_level === 'high').slice(0, 1).forEach((deal) => {
      recommendations.push({
        id: `deal-${deal.id}`,
        type: 'price_adjust',
        title: `Match AJIO's ${deal.category || 'category'} pricing`,
        description: `Competitor running ${deal.discount_value} discount. Consider competitive response.`,
        impact: 'Protect market share',
        confidence: 0.72,
        category: deal.category
      });
    });

    // Marketing recommendations
    if (trends?.some(t => t.status === 'peaking')) {
      const peakingTrend = trends.find(t => t.status === 'peaking');
      recommendations.push({
        id: 'marketing-peak',
        type: 'marketing_focus',
        title: `Capitalize on ${peakingTrend?.trend_name}`,
        description: `Trend is at peak popularity. Run targeted campaigns to maximize conversions.`,
        impact: 'High engagement potential',
        confidence: 0.82,
        category: peakingTrend?.trend_name
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Analyzing data for recommendations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec) => {
        const config = typeConfig[rec.type];
        const Icon = config.icon;

        return (
          <Card key={rec.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg bg-muted", config.color)}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {config.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(rec.confidence * 100)}% confidence
                  </span>
                </div>
                
                <h4 className="font-semibold mb-1">{rec.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-teal flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {rec.impact}
                  </span>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Take Action
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
