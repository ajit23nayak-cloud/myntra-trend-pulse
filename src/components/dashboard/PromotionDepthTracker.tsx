import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCompetitorDeals, useCompetitorProducts, useCompetitiveMetrics } from '@/hooks/useDashboardData';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

// Myntra's benchmark discounting data (simulated - would come from internal data)
const myntraDiscountBenchmarks = {
  Winterwear: { avgDiscount: 45, deepDiscountThreshold: 60 },
  Footwear: { avgDiscount: 35, deepDiscountThreshold: 50 },
  Dresses: { avgDiscount: 40, deepDiscountThreshold: 55 },
  Ethnic: { avgDiscount: 38, deepDiscountThreshold: 52 },
  Casual: { avgDiscount: 42, deepDiscountThreshold: 58 },
  Sportswear: { avgDiscount: 30, deepDiscountThreshold: 45 },
  Accessories: { avgDiscount: 35, deepDiscountThreshold: 50 },
};

export function PromotionDepthTracker() {
  const { data: deals } = useCompetitorDeals();
  const { data: products } = useCompetitorProducts();
  const { data: metrics } = useCompetitiveMetrics();

  // Calculate category-wise promotion depth
  const categoryPromotion = products?.reduce((acc: any, product: any) => {
    const cat = product.category;
    if (!acc[cat]) {
      acc[cat] = { category: cat, totalDiscount: 0, count: 0, maxDiscount: 0 };
    }
    acc[cat].totalDiscount += product.discount_percentage || 0;
    acc[cat].count++;
    acc[cat].maxDiscount = Math.max(acc[cat].maxDiscount, product.discount_percentage || 0);
    return acc;
  }, {}) || {};

  const promotionData = Object.values(categoryPromotion).map((cat: any) => {
    const avgDiscount = cat.count > 0 ? Math.round(cat.totalDiscount / cat.count) : 0;
    const benchmark = myntraDiscountBenchmarks[cat.category as keyof typeof myntraDiscountBenchmarks] || { avgDiscount: 40, deepDiscountThreshold: 55 };
    const gap = avgDiscount - benchmark.avgDiscount;
    
    return {
      category: cat.category,
      ajioAvgDiscount: avgDiscount,
      ajioMaxDiscount: cat.maxDiscount,
      myntraAvgDiscount: benchmark.avgDiscount,
      deepThreshold: benchmark.deepDiscountThreshold,
      productCount: cat.count,
      gap,
      isAggressive: gap > 10,
      recommendation: gap > 10 ? 'Consider matching' : gap < -5 ? 'Competitive advantage' : 'Monitor'
    };
  });

  // Timeline data from metrics
  const timelineData = metrics?.slice(0, 10).reverse().map(m => ({
    date: new Date(m.metric_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    dealIntensity: m.deal_intensity_score || 0,
    avgGap: m.avg_price_gap || 0
  })) || [];

  // Active promotions by type
  const activeDeals = deals || [];
  const flashSales = activeDeals.filter(d => d.is_flash_sale);
  const regularPromos = activeDeals.filter(d => !d.is_flash_sale);
  
  const criticalDeals = activeDeals.filter(d => d.impact_level === 'critical').length;
  const highImpactDeals = activeDeals.filter(d => d.impact_level === 'high').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Active Promotions</p>
          <span className="text-2xl font-bold">{activeDeals.length}</span>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {flashSales.length} flash
            </Badge>
            <Badge variant="outline" className="text-xs">
              {regularPromos.length} regular
            </Badge>
          </div>
        </Card>
        
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Critical Impact</p>
          <span className="text-2xl font-bold text-destructive">{criticalDeals}</span>
          <p className="text-xs text-muted-foreground mt-1">deals requiring attention</p>
        </Card>
        
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Deal Intensity Score</p>
          <span className="text-2xl font-bold">{timelineData[timelineData.length - 1]?.dealIntensity || 0}%</span>
          <p className="text-xs text-muted-foreground mt-1">market activity level</p>
        </Card>
        
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Aggressive Categories</p>
          <span className="text-2xl font-bold text-orange">{promotionData.filter(p => p.isAggressive).length}</span>
          <p className="text-xs text-muted-foreground mt-1">above Myntra discounts</p>
        </Card>
      </div>

      {/* Promotion Depth by Category */}
      <Card className="p-4">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-coral" />
          Discount Depth: AJIO vs Myntra Benchmark
        </h4>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={promotionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" domain={[0, 80]} tick={{ fontSize: 11 }} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string) => [
                  `${value}%`, 
                  name === 'ajioAvgDiscount' ? 'AJIO Avg' : 'Myntra Avg'
                ]}
              />
              <Legend />
              <Bar dataKey="ajioAvgDiscount" name="AJIO Avg Discount" fill="hsl(var(--coral))" radius={[0, 4, 4, 0]} />
              <Bar dataKey="myntraAvgDiscount" name="Myntra Avg Discount" fill="hsl(var(--teal))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Deal Intensity Timeline */}
      {timelineData.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-4">Promotion Intensity Over Time</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="dealIntensity" 
                  stroke="hsl(var(--coral))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--coral))' }}
                  name="Deal Intensity %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Strategic Recommendations */}
      <Card className="p-4">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange" />
          Strategic Recommendations
        </h4>
        <div className="space-y-3">
          {promotionData
            .filter(p => p.isAggressive)
            .map((cat, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-orange/10 rounded-lg border border-orange/20">
                <div>
                  <span className="font-medium">{cat.category}</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    AJIO discounting {cat.gap}% deeper than Myntra benchmark
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-orange/20 text-orange">
                    +{cat.gap}% gap
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{cat.productCount} products</p>
                </div>
              </div>
            ))}
          
          {promotionData.filter(p => p.isAggressive).length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-teal opacity-50" />
              <p>Myntra is competitively positioned across all categories</p>
            </div>
          )}
        </div>
      </Card>

      {/* Methodology Note */}
      <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
        <strong>Cross-Reference Methodology:</strong> AJIO discount depths are compared against Myntra's historical discounting benchmarks per category. 
        Categories showing 10%+ deeper discounts than Myntra are flagged for strategic review. Deal intensity score measures overall promotional activity level.
      </div>
    </div>
  );
}
