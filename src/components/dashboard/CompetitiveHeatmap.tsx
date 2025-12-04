import { useCompetitorProducts } from '@/hooks/useDashboardData';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const timeframes = ['This Week', 'Last Week', '2 Weeks Ago', '3 Weeks Ago'];

export function CompetitiveHeatmap() {
  const { data: products, isLoading } = useCompetitorProducts();

  // Group products by category and calculate real stats
  const categoryData = products?.reduce((acc: any, product: any) => {
    const cat = product.category;
    if (!acc[cat]) {
      acc[cat] = { 
        category: cat, 
        products: [], 
        totalDiff: 0, 
        count: 0,
        myntraWins: 0,
        ajioWins: 0
      };
    }
    acc[cat].products.push(product);
    acc[cat].totalDiff += product.price_difference || 0;
    acc[cat].count++;
    if ((product.price_difference || 0) < 0) acc[cat].myntraWins++;
    else if ((product.price_difference || 0) > 0) acc[cat].ajioWins++;
    return acc;
  }, {}) || {};

  const categories = Object.keys(categoryData);

  // Generate heatmap data with simulated time variation
  const heatmapData = categories.map((category) => {
    const catData = categoryData[category];
    const baseAvgDiff = catData.count > 0 ? catData.totalDiff / catData.count : 0;
    
    // Simulate historical variation (would come from price_history in production)
    return {
      category,
      productCount: catData.count,
      myntraWins: catData.myntraWins,
      ajioWins: catData.ajioWins,
      values: timeframes.map((_, i) => {
        // Add some variation based on index (simulating time-based changes)
        const variation = (Math.random() - 0.5) * 15;
        return Math.min(Math.max(baseAvgDiff + variation * (i + 1) * 0.3, -500), 500);
      })
    };
  });

  const getHeatmapColor = (value: number) => {
    if (value > 200) return 'bg-destructive/90 text-destructive-foreground';
    if (value > 100) return 'bg-destructive/60 text-foreground';
    if (value > 50) return 'bg-destructive/30 text-foreground';
    if (value > -50) return 'bg-muted text-muted-foreground';
    if (value > -100) return 'bg-teal/30 text-foreground';
    if (value > -200) return 'bg-teal/60 text-foreground';
    return 'bg-teal/90 text-white';
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No product data available for heatmap</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Price gap vs AJIO in ₹ (negative = Myntra cheaper)</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help text-muted-foreground">ⓘ</span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[280px]">
                <p className="text-sm"><strong>Price Competitiveness</strong>: Compares Myntra's prices against AJIO on matched SKUs. Green cells = Myntra offers better prices. Red cells = AJIO offers better prices. Used to identify pricing opportunities.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Badge variant="outline" className="text-xs">
          {products?.length || 0} SKUs tracked
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-muted-foreground p-2">Category</th>
              <th className="text-center text-xs font-medium text-muted-foreground p-2">SKUs</th>
              {timeframes.map((tf) => (
                <th key={tf} className="text-center text-xs font-medium text-muted-foreground p-2">
                  {tf}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.map((row) => (
              <tr key={row.category}>
                <td className="text-sm font-medium p-2 border-t border-border">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">{row.category}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Myntra cheaper: {row.myntraWins} | AJIO cheaper: {row.ajioWins}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="text-center text-xs p-2 border-t border-border">
                  <Badge variant="secondary" className="text-xs">
                    {row.productCount}
                  </Badge>
                </td>
                {row.values.map((value, i) => (
                  <td key={i} className="p-1 border-t border-border">
                    <div 
                      className={cn(
                        "text-center text-xs font-medium py-2 px-3 rounded transition-colors",
                        getHeatmapColor(value)
                      )}
                    >
                      {value > 0 ? '+' : ''}₹{Math.round(value)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-teal/90" />
          <span>Myntra Much Cheaper</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-teal/30" />
          <span>Myntra Cheaper</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-muted" />
          <span>Similar (±₹50)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-destructive/30" />
          <span>AJIO Cheaper</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-destructive/90" />
          <span>AJIO Much Cheaper</span>
        </div>
      </div>

      <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
        <strong>Note:</strong> Values show average price difference in ₹ based on matched SKUs. 
        Historical data simulated for demo; production would track actual price_history records.
      </div>
    </div>
  );
}
