import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { InventoryMatchIndicator } from './InventoryMatchIndicator';
import { RegionalTrendMap } from './RegionalTrendMap';
import { TrendLifecycleForecast } from './TrendLifecycleForecast';
import { TrendMismatchAlert } from './TrendMismatchAlert';
import { TrendImageGallery } from './TrendImageGallery';
import { useFashionTrends } from '@/hooks/useDashboardData';
import { Badge } from '@/components/ui/badge';
import { Zap, Target, TrendingUp, TrendingDown, MapPin, Package, LineChart, AlertTriangle, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fashionTrends } from '@/data/mockData';

const statusConfig = {
  emerging: { icon: Zap, color: 'bg-teal/20 text-teal border-teal/30' },
  established: { icon: Target, color: 'bg-blue/20 text-blue border-blue/30' },
  peaking: { icon: TrendingUp, color: 'bg-coral/20 text-coral border-coral/30' },
  cooling: { icon: TrendingDown, color: 'bg-muted text-muted-foreground border-border' }
};

export function EnhancedTrendsSection() {
  const { data: trends } = useFashionTrends();
  const displayTrends = trends?.length ? trends : fashionTrends;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Fashion Trend Detection</h2>
        <p className="text-muted-foreground">GenZ trend forecasting with velocity tracking</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All Trends</TabsTrigger>
          <TabsTrigger value="gallery">Style Gallery</TabsTrigger>
          <TabsTrigger value="forecast">Lifecycle Forecast</TabsTrigger>
          <TabsTrigger value="mismatch">Mismatch Alerts</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Match</TabsTrigger>
          <TabsTrigger value="regional">Regional Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="gallery">
          <Card className="p-6">
            <TrendImageGallery />
          </Card>
        </TabsContent>


        <TabsContent value="forecast">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <LineChart className="w-4 h-4 text-coral" />
              Trend Lifecycle Forecast
            </h3>
            <TrendLifecycleForecast />
          </Card>
        </TabsContent>

        <TabsContent value="mismatch">
          <TrendMismatchAlert />
        </TabsContent>

        <TabsContent value="inventory">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-coral" />
              Myntra Inventory Alignment
            </h3>
            <InventoryMatchIndicator />
          </Card>
        </TabsContent>

        <TabsContent value="regional">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-coral" />
              Regional Trend Popularity
            </h3>
            <RegionalTrendMap />
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <div className="grid gap-4">
            {displayTrends.map((trend: any, i: number) => {
              const status = trend.status || 'emerging';
              const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.emerging;
              const Icon = config.icon;

              return (
                <Card key={i} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{trend.trend_name || trend.name}</h4>
                        <Badge variant="outline" className={cn("text-xs", config.color)}>
                          <Icon className="w-3 h-3 mr-1" />
                          {status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{trend.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {(trend.platforms || []).map((p: string, j: number) => (
                          <Badge key={j} variant="secondary" className="text-xs">{p}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-teal">+{trend.growth_rate || trend.growth}%</p>
                      <p className="text-xs text-muted-foreground">growth rate</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
