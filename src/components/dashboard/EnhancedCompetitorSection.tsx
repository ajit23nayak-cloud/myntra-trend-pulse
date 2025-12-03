import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompetitiveHeatmap } from './CompetitiveHeatmap';
import { FlashSaleTracker } from './FlashSaleTracker';
import { useCompetitorProducts, useCompetitorDeals } from '@/hooks/useDashboardData';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Zap, TrendingDown, TrendingUp, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Competitive Intelligence</h2>
        <p className="text-muted-foreground">Real-time AJIO pricing and promotion tracking</p>
      </div>

      <Tabs defaultValue="heatmap" className="space-y-4">
        <TabsList>
          <TabsTrigger value="heatmap">Price Heatmap</TabsTrigger>
          <TabsTrigger value="flash">Flash Sales</TabsTrigger>
          <TabsTrigger value="pricing">Price Comparison</TabsTrigger>
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
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-coral" />
              Price Comparison by Category
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Myntra</TableHead>
                  <TableHead className="text-right">AJIO</TableHead>
                  <TableHead className="text-right">Difference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayProducts.slice(0, 8).map((item: any, i: number) => {
                  const diff = item.price_difference || (item.myntra - item.ajio);
                  const isPositive = diff > 0;
                  
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{item.category}</TableCell>
                      <TableCell className="text-right">₹{item.myntra_equivalent_price || item.myntra}</TableCell>
                      <TableCell className="text-right">₹{item.current_price || item.ajio}</TableCell>
                      <TableCell className={cn("text-right font-medium", isPositive ? "text-destructive" : "text-teal")}>
                        {isPositive ? <TrendingUp className="inline w-3 h-3 mr-1" /> : <TrendingDown className="inline w-3 h-3 mr-1" />}
                        {isPositive ? '+' : ''}₹{Math.abs(diff)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="deals">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Active AJIO Promotions</h3>
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
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
