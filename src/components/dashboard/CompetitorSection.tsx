import { competitorPricing, competitorDeals } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertTriangle, Tag, Clock, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const impactColors = {
  high: 'bg-coral/20 text-coral border-coral/30',
  medium: 'bg-yellow/20 text-yellow border-yellow/30',
  low: 'bg-teal/20 text-teal border-teal/30',
  critical: 'bg-destructive/20 text-destructive border-destructive/30',
};

export function CompetitorSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Competitive Intelligence</h2>
          <p className="text-muted-foreground">AJIO pricing and promotion tracking</p>
        </div>
        <Button variant="outline" className="gap-2">
          <ArrowUpRight className="w-4 h-4" />
          Full Analysis
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Comparison Table */}
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">Price Comparison by Category</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-sm font-medium text-muted-foreground pb-3">Category</th>
                  <th className="text-center text-sm font-medium text-coral pb-3">Myntra</th>
                  <th className="text-center text-sm font-medium text-blue pb-3">AJIO</th>
                  <th className="text-right text-sm font-medium text-muted-foreground pb-3">Gap</th>
                </tr>
              </thead>
              <tbody>
                {competitorPricing.map((item, idx) => (
                  <tr 
                    key={item.category} 
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors animate-slide-in-right"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td className="py-4 text-sm font-medium text-foreground">{item.category}</td>
                    <td className="py-4 text-center text-sm">
                      <span className="font-semibold text-coral">₹{item.myntra}</span>
                    </td>
                    <td className="py-4 text-center text-sm">
                      <span className="font-semibold text-blue">₹{item.ajio}</span>
                    </td>
                    <td className="py-4 text-right">
                      <div className={cn(
                        "inline-flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg",
                        item.difference > 0 ? "bg-teal/20 text-teal" : "bg-coral/20 text-coral"
                      )}>
                        {item.trend === 'up' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {item.difference > 0 ? '+' : ''}{item.difference}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-4 rounded-lg bg-coral/10 border border-coral/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-coral shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Price Gap Alert</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Myntra is priced 5.3% higher on average across comparable categories. Consider strategic discounting on Casual Tops and Denim Jeans.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Competitor Deals */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Active AJIO Promotions</h3>
          <div className="space-y-3">
            {competitorDeals.map((deal, idx) => (
              <div 
                key={deal.id}
                className="p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all duration-200 animate-slide-in-right"
                style={{ animationDelay: `${100 + idx * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-blue" />
                      <span className="text-sm font-semibold text-foreground">{deal.deal}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {deal.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Ends: {deal.endDate}</span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs capitalize", impactColors[deal.impact as keyof typeof impactColors])}
                  >
                    {deal.impact} impact
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div className="mt-4 p-4 rounded-lg bg-teal/10 border border-teal/20">
            <p className="text-sm font-semibold text-foreground mb-2">💡 Recommended Action</p>
            <p className="text-xs text-muted-foreground">
              AJIO's 50% summer sale ends in 2 days. Launch a "Summer Flash Sale" with 40-45% off to capture deal-seekers without matching their deep discount.
            </p>
          </div>
        </div>
      </div>

      {/* Market Position Summary */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h3 className="text-lg font-semibold text-foreground mb-4">Market Position Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-secondary/30 text-center">
            <p className="text-3xl font-display font-bold text-coral">72%</p>
            <p className="text-sm text-muted-foreground mt-1">Price Competitiveness Score</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">vs AJIO across all categories</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/30 text-center">
            <p className="text-3xl font-display font-bold text-teal">4</p>
            <p className="text-sm text-muted-foreground mt-1">Categories Winning</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">Better priced than competitor</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/30 text-center">
            <p className="text-3xl font-display font-bold text-yellow">2</p>
            <p className="text-sm text-muted-foreground mt-1">Categories at Risk</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">Significant price gap</p>
          </div>
        </div>
      </div>
    </div>
  );
}
