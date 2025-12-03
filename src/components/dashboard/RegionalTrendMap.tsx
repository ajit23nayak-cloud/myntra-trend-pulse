import { useFashionTrends } from '@/hooks/useDashboardData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const regions = [
  { id: 'metro', name: 'Metro Cities', description: 'Mumbai, Delhi, Bangalore' },
  { id: 'tier_1', name: 'Tier 1', description: 'Pune, Hyderabad, Chennai' },
  { id: 'tier_2', name: 'Tier 2', description: 'Jaipur, Lucknow, Kochi' },
  { id: 'tier_3', name: 'Tier 3', description: 'Smaller cities & towns' }
];

export function RegionalTrendMap() {
  const { data: trends, isLoading } = useFashionTrends();

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  // Get regional popularity for top trends
  const getRegionalData = () => {
    return regions.map((region) => {
      const trendingItems = trends?.slice(0, 5).map((trend) => {
        const popularity = trend.regional_popularity?.[region.id] || Math.random() * 100;
        return {
          name: trend.trend_name,
          popularity,
          status: trend.status
        };
      }).sort((a, b) => b.popularity - a.popularity).slice(0, 3) || [];

      return {
        ...region,
        topTrends: trendingItems,
        avgGrowth: trendingItems.reduce((acc, t) => acc + t.popularity, 0) / trendingItems.length || 0
      };
    });
  };

  const regionalData = getRegionalData();

  const getGrowthColor = (growth: number) => {
    if (growth >= 70) return 'text-teal';
    if (growth >= 40) return 'text-yellow';
    return 'text-muted-foreground';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {regionalData.map((region) => (
        <Card key={region.id} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-coral" />
              <div>
                <h4 className="font-semibold text-sm">{region.name}</h4>
                <p className="text-xs text-muted-foreground">{region.description}</p>
              </div>
            </div>
            <div className={cn("flex items-center gap-1 text-sm font-medium", getGrowthColor(region.avgGrowth))}>
              <TrendingUp className="w-4 h-4" />
              {region.avgGrowth.toFixed(0)}%
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              Top trending in this region:
            </p>
            {region.topTrends.map((trend, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="truncate flex-1">{trend.name}</span>
                <Badge variant="outline" className="text-xs ml-2">
                  {trend.popularity.toFixed(0)}%
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
