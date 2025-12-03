import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompetitiveHeatmap } from './CompetitiveHeatmap';
import { FlashSaleTracker } from './FlashSaleTracker';
import { PriceGapTimeline } from './PriceGapTimeline';
import { PromotionDepthTracker } from './PromotionDepthTracker';
import { useCompetitorProducts, useCompetitorDeals } from '@/hooks/useDashboardData';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Zap, TrendingDown, TrendingUp, BarChart3, LineChart, Package, CheckCircle2, XCircle, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { competitorPricing, competitorDeals } from '@/data/mockData';

const impactColors = {
  critical: 'bg-destructive/20 text-destructive',
  high: 'bg-orange/20 text-orange',
  medium: 'bg-yellow/20 text-yellow',
  low: 'bg-muted text-muted-foreground'
};

export function EnhancedCompetitorSection() {
  const { data: products } = useCompetitorProducts();
  const { data: deals } = useCompetitorDeals(true);

  const displayProducts = products?.length ? products : competitorPricing;
  const displayDeals = deals?.length ? deals : competitorDeals;

  // Calculate SKU matching stats
  const totalProducts = displayProducts.length;
  const matchedSKUs = displayProducts.filter((p: any) => p.myntra_equivalent_price !== null && p.myntra_equivalent_price !== undefined).length;
  const matchRate = totalProducts > 0 ? Math.round((matchedSKUs / totalProducts) * 100) : 0;

  // Category-wise aggregation with product counts
  const categoryStats = displayProducts.reduce((acc: any, product: any) => {
    const cat = product.category;
    if (!acc[cat]) {
      acc[cat] = {
        category: cat,
        productCount: 0,
        totalMyntraPrice: 0,
        totalAjioPrice: 0,
        totalDiff: 0,
        myntraWins: 0,
        ajioWins: 0,
        avgMyntraDiscount: 0,
        avgAjioDiscount: 0
      };
    }
    acc[cat].productCount++;
    acc[cat].totalMyntraPrice += product.myntra_equivalent_price || 0;
    acc[cat].totalAjioPrice += product.current_price || 0;
    acc[cat].totalDiff += product.price_difference || 0;
    if ((product.price_difference || 0) < 0) acc[cat].myntraWins++;
    else if ((product.price_difference || 0) > 0) acc[cat].ajioWins++;
    acc[cat].avgAjioDiscount += product.discount_percentage || 0;
    return acc;
  }, {});

  const categoryData = Object.values(categoryStats).map((cat: any) => ({
    ...cat,
    avgMyntraPrice: cat.productCount > 0 ? Math.round(cat.totalMyntraPrice / cat.productCount) : 0,
    avgAjioPrice: cat.productCount > 0 ? Math.round(cat.totalAjioPrice / cat.productCount) : 0,
    avgDiff: cat.productCount > 0 ? Math.round(cat.totalDiff / cat.productCount) : 0,
    avgDiscount: cat.productCount > 0 ? Math.round(cat.avgAjioDiscount / cat.productCount) : 0
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Competitive Intelligence</h2>
          <p className="text-muted-foreground">Real-time AJIO pricing and promotion tracking</p>
        </div>
        
        {/* SKU Match Summary */}
        <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border border-border">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{totalProducts} SKUs</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total products being tracked across both platforms</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="w-px h-6 bg-border" />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal" />
                  <span className="text-sm font-medium">{matchRate}% matched</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{matchedSKUs} of {totalProducts} products have verified Myntra equivalents</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Tabs defaultValue="heatmap" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="heatmap">Price Heatmap</TabsTrigger>
          <TabsTrigger value="timeline">Price Timeline</TabsTrigger>
          <TabsTrigger value="promotion-depth">Promotion Depth</TabsTrigger>
          <TabsTrigger value="flash">Flash Sales</TabsTrigger>
          <TabsTrigger value="pricing">SKU Comparison</TabsTrigger>
          <TabsTrigger value="deals">Active Deals</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-coral" />
              Competitive Price Heatmap
            </h3>
            <CompetitiveHeatmap />
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <LineChart className="w-4 h-4 text-coral" />
              Price Gap Timeline
            </h3>
            <PriceGapTimeline />
          </Card>
        </TabsContent>

        <TabsContent value="promotion-depth">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Percent className="w-4 h-4 text-coral" />
              Promotion Depth Analysis
            </h3>
            <PromotionDepthTracker />
          </Card>
        </TabsContent>

        <TabsContent value="flash">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange" />
              Flash Sale Tracker
            </h3>
            <FlashSaleTracker />
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-coral" />
                SKU-Based Price Comparison
              </h3>
              <Badge variant="outline" className="text-xs">
                {matchedSKUs} matched products
              </Badge>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Products</TableHead>
                  <TableHead className="text-right">Avg Myntra</TableHead>
                  <TableHead className="text-right">Avg AJIO</TableHead>
                  <TableHead className="text-right">Avg Diff</TableHead>
                  <TableHead className="text-center">Winner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryData.map((cat: any, i: number) => {
                  const isPositive = cat.avgDiff > 0;
                  const winner = cat.myntraWins > cat.ajioWins ? 'Myntra' : cat.ajioWins > cat.myntraWins ? 'AJIO' : 'Tie';
                  
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{cat.category}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="text-xs">
                          {cat.productCount} SKUs
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">₹{cat.avgMyntraPrice}</TableCell>
                      <TableCell className="text-right">₹{cat.avgAjioPrice}</TableCell>
                      <TableCell className={cn("text-right font-medium", isPositive ? "text-destructive" : "text-teal")}>
                        {isPositive ? <TrendingUp className="inline w-3 h-3 mr-1" /> : <TrendingDown className="inline w-3 h-3 mr-1" />}
                        {isPositive ? '+' : ''}₹{Math.abs(cat.avgDiff)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            winner === 'Myntra' ? "bg-teal/20 text-teal" : 
                            winner === 'AJIO' ? "bg-coral/20 text-coral" : ""
                          )}
                        >
                          {winner} ({winner === 'Myntra' ? cat.myntraWins : winner === 'AJIO' ? cat.ajioWins : '-'})
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            <div className="mt-4 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
              <strong>Methodology:</strong> Prices compared on matched SKUs where both Myntra and AJIO listings exist. 
              Avg Diff shows price gap (negative = Myntra cheaper). Winner column shows which platform has lower prices more often.
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="deals">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Active AJIO Promotions</h3>
              <Badge variant="outline">{displayDeals.length} active</Badge>
            </div>
            <div className="space-y-3">
              {displayDeals.map((deal: any, i: number) => (
                <div key={i} className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{deal.deal_name || deal.deal}</span>
                    <Badge className={impactColors[deal.impact_level as keyof typeof impactColors] || impactColors.medium}>
                      {deal.impact_level || deal.impact}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{deal.category}</span>
                    <span>Ends: {deal.end_date || deal.endDate}</span>
                  </div>
                  {deal.discount_value && (
                    <div className="mt-2 text-sm font-medium text-coral">
                      {deal.discount_value}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
