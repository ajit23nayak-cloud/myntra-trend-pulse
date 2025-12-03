import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlobalFilters } from './GlobalFilters';
import { InventoryMatchIndicator } from './InventoryMatchIndicator';
import { RegionalTrendMap } from './RegionalTrendMap';
import { TrendLifecycleForecast } from './TrendLifecycleForecast';
import { TrendMismatchAlert } from './TrendMismatchAlert';
import { TrendImageGallery } from './TrendImageGallery';
import { useFashionTrends } from '@/hooks/useDashboardData';
import { Badge } from '@/components/ui/badge';
import { Zap, Target, TrendingUp, TrendingDown, MapPin, Package, LineChart, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fashionTrends } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import type { RegionType, TrendStatus } from '@/types/database';

const statusConfig = {
  emerging: { icon: Zap, color: 'bg-teal/20 text-teal border-teal/30' },
  established: { icon: Target, color: 'bg-blue/20 text-blue border-blue/30' },
  peaking: { icon: TrendingUp, color: 'bg-coral/20 text-coral border-coral/30' },
  cooling: { icon: TrendingDown, color: 'bg-muted text-muted-foreground border-border' }
};

export function EnhancedTrendsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState<RegionType | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<TrendStatus | undefined>();
  
  // Fetch trends - the hook doesn't support all filters, so we filter client-side
  const { data: trends, isLoading } = useFashionTrends(statusFilter);
  const allTrends = trends?.length ? trends : fashionTrends;

  // Apply client-side filters
  const displayTrends = useMemo(() => {
    return allTrends.filter((trend: any) => {
      const trendName = (trend.trend_name || trend.name || '').toLowerCase();
      const trendDesc = (trend.description || '').toLowerCase();
      const trendKeywords = (trend.keywords || []).join(' ').toLowerCase();
      
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        trendName.includes(searchLower) || 
        trendDesc.includes(searchLower) ||
        trendKeywords.includes(searchLower);
      
      // Status filter (if not already filtered by hook)
      const matchesStatus = !statusFilter || trend.status === statusFilter;
      
      // Region filter - check regional_popularity if available
      let matchesRegion = true;
      if (region && trend.regional_popularity) {
        const regionalData = typeof trend.regional_popularity === 'string' 
          ? JSON.parse(trend.regional_popularity) 
          : trend.regional_popularity;
        // Check if region has significant popularity
        matchesRegion = regionalData[region] !== undefined && regionalData[region] > 0;
      }
      
      return matchesSearch && matchesStatus && matchesRegion;
    });
  }, [allTrends, searchQuery, statusFilter, region]);

  const clearFilters = () => {
    setSearchQuery('');
    setRegion(undefined);
    setCategory(undefined);
    setStatusFilter(undefined);
  };

  const hasActiveFilters = searchQuery || region || category || statusFilter;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Fashion Trend Detection</h2>
          <p className="text-muted-foreground">GenZ trend forecasting with velocity tracking</p>
        </div>
        {hasActiveFilters && (
          <Badge variant="secondary" className="text-xs">
            Showing {displayTrends.length} of {allTrends.length} trends
          </Badge>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search trends by name, description, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <GlobalFilters
          category={category}
          region={region}
          onCategoryChange={setCategory}
          onBrandChange={() => {}}
          onCohortChange={() => {}}
          onRegionChange={setRegion}
          onClearAll={clearFilters}
          showBrand={false}
          showCohort={false}
          showCategory={false}
        />
        
        {/* Status filter chips */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={!statusFilter ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setStatusFilter(undefined)}
          >
            All Statuses ({allTrends.length})
          </Badge>
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon;
            const count = allTrends.filter((t: any) => t.status === status).length;
            return (
              <Badge
                key={status}
                variant="outline"
                className={cn(
                  "cursor-pointer transition-colors",
                  statusFilter === status ? config.color : "hover:bg-muted"
                )}
                onClick={() => setStatusFilter(status as TrendStatus)}
              >
                <Icon className="w-3 h-3 mr-1" />
                {status} ({count})
              </Badge>
            );
          })}
        </div>
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
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {displayTrends.length === 0 ? (
                <Card className="p-8 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No trends match your filters</p>
                  <button 
                    onClick={clearFilters}
                    className="mt-2 text-sm text-primary hover:underline"
                  >
                    Clear all filters
                  </button>
                </Card>
              ) : (
                displayTrends.map((trend: any, i: number) => {
                  const status = trend.status || 'emerging';
                  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.emerging;
                  const Icon = config.icon;

                  return (
                    <Card key={i} className="p-4 hover:shadow-md transition-shadow">
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
                            {trend.keywords?.slice(0, 3).map((k: string, j: number) => (
                              <Badge key={`k-${j}`} variant="outline" className="text-xs">{k}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-teal">+{trend.growth_rate || trend.growth}%</p>
                          <p className="text-xs text-muted-foreground">growth rate</p>
                          {trend.velocity_score && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Velocity: {trend.velocity_score.toFixed(0)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
