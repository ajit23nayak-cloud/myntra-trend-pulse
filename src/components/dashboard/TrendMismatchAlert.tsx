import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Search, ExternalLink } from 'lucide-react';
import { useFashionTrends, useTrendForecasts } from '@/hooks/useDashboardData';
import { cn } from '@/lib/utils';

interface TrendMismatch {
  trendName: string;
  socialScore: number;
  myntraSearchScore: number;
  mismatchSeverity: 'high' | 'medium' | 'low';
  platforms: string[];
  recommendation: string;
}

export function TrendMismatchAlert() {
  const { data: trends, isLoading } = useFashionTrends();
  const { data: forecasts } = useTrendForecasts();

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />;
  }

  // Identify mismatches: high social velocity but low inventory match suggests low Myntra search
  const mismatches: TrendMismatch[] = (trends || [])
    .filter(trend => {
      const hasHighSocialSignal = (trend.velocity_score || 0) > 50 || (trend.growth_rate || 0) > 30;
      const hasLowMyntraMatch = (trend.myntra_inventory_match || 0) < 60;
      return hasHighSocialSignal && hasLowMyntraMatch && trend.status !== 'cooling';
    })
    .map(trend => {
      const socialScore = Math.min(100, (trend.velocity_score || 0) + (trend.growth_rate || 0) / 2);
      const myntraScore = trend.myntra_inventory_match || 30;
      const gap = socialScore - myntraScore;
      const severity: 'high' | 'medium' | 'low' = gap > 50 ? 'high' : gap > 30 ? 'medium' : 'low';
      
      return {
        trendName: trend.trend_name,
        socialScore: Math.round(socialScore),
        myntraSearchScore: Math.round(myntraScore),
        mismatchSeverity: severity,
        platforms: trend.platforms || [],
        recommendation: gap > 50 
          ? 'Urgent: High demand potential not met. Consider immediate inventory expansion.'
          : gap > 30
          ? 'Opportunity: Growing trend with stock gaps. Plan inventory increase.'
          : 'Monitor: Moderate mismatch. Track for 1-2 weeks.'
      };
    })
    .sort((a, b) => b.socialScore - b.myntraSearchScore - (a.socialScore - a.myntraSearchScore))
    .slice(0, 5);

  if (mismatches.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-teal/10 text-teal">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Cross-Platform Trend Alignment</h3>
            <p className="text-sm text-muted-foreground">Social trends vs Myntra catalog match</p>
          </div>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>All trending items are well-matched with Myntra's catalog!</p>
        </div>
      </Card>
    );
  }

  const severityColors = {
    high: 'border-destructive/50 bg-destructive/5',
    medium: 'border-orange/50 bg-orange/5',
    low: 'border-yellow/50 bg-yellow/5'
  };

  const severityBadge = {
    high: 'bg-destructive/20 text-destructive',
    medium: 'bg-orange/20 text-orange',
    low: 'bg-yellow/20 text-yellow-foreground'
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange/10 text-orange">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Trend Mismatch Alerts</h3>
            <p className="text-sm text-muted-foreground">Hot on social media but underserved on Myntra</p>
          </div>
        </div>
        <Badge variant="destructive">{mismatches.length} mismatches</Badge>
      </div>

      <div className="space-y-3">
        {mismatches.map((mismatch, index) => (
          <div 
            key={index} 
            className={cn("p-4 rounded-lg border", severityColors[mismatch.mismatchSeverity])}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{mismatch.trendName}</h4>
                <Badge className={severityBadge[mismatch.mismatchSeverity]}>
                  {mismatch.mismatchSeverity} priority
                </Badge>
              </div>
              <div className="flex gap-1">
                {mismatch.platforms.slice(0, 3).map(platform => (
                  <Badge key={platform} variant="outline" className="text-xs">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Social Signal</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-teal rounded-full"
                      style={{ width: `${mismatch.socialScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-teal">{mismatch.socialScore}%</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Myntra Catalog Match</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange rounded-full"
                      style={{ width: `${mismatch.myntraSearchScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-orange">{mismatch.myntraSearchScore}%</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{mismatch.recommendation}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
