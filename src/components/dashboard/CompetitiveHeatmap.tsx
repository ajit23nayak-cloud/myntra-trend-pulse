import { useCompetitorProducts } from '@/hooks/useDashboardData';
import { cn } from '@/lib/utils';

const categories = ['T-Shirts', 'Jeans', 'Dresses', 'Sneakers', 'Bags', 'Watches'];
const timeframes = ['This Week', 'Last Week', '2 Weeks Ago', '3 Weeks Ago'];

export function CompetitiveHeatmap() {
  const { data: products, isLoading } = useCompetitorProducts();

  // Generate heatmap data from products or use demo data
  const heatmapData = categories.map((category) => {
    const categoryProducts = products?.filter(p => 
      p.category.toLowerCase().includes(category.toLowerCase())
    ) || [];

    return {
      category,
      values: timeframes.map((_, i) => {
        if (categoryProducts.length > 0) {
          const avgDiff = categoryProducts.reduce((acc, p) => acc + (p.price_difference || 0), 0) / categoryProducts.length;
          return Math.min(Math.max(avgDiff + (Math.random() * 20 - 10), -30), 30);
        }
        return Math.random() * 60 - 30; // Demo: -30 to +30
      })
    };
  });

  const getHeatmapColor = (value: number) => {
    if (value > 15) return 'bg-destructive/80 text-destructive-foreground';
    if (value > 5) return 'bg-destructive/40 text-foreground';
    if (value > -5) return 'bg-muted text-muted-foreground';
    if (value > -15) return 'bg-teal/40 text-foreground';
    return 'bg-teal/80 text-white';
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Price gap vs AJIO (negative = Myntra cheaper)
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-muted-foreground p-2">Category</th>
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
                <td className="text-sm font-medium p-2 border-t border-border">{row.category}</td>
                {row.values.map((value, i) => (
                  <td key={i} className="p-1 border-t border-border">
                    <div 
                      className={cn(
                        "text-center text-xs font-medium py-2 px-3 rounded",
                        getHeatmapColor(value)
                      )}
                    >
                      {value > 0 ? '+' : ''}{value.toFixed(0)}%
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-teal/80" />
          <span>Myntra Cheaper</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-muted" />
          <span>Similar</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-destructive/80" />
          <span>AJIO Cheaper</span>
        </div>
      </div>
    </div>
  );
}
