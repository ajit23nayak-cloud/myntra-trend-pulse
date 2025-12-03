import { useCompetitorDeals } from '@/hooks/useDashboardData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInHours, parseISO } from 'date-fns';

const impactColors = {
  critical: 'bg-destructive/20 text-destructive border-destructive/30',
  high: 'bg-orange/20 text-orange border-orange/30',
  medium: 'bg-yellow/20 text-yellow border-yellow/30',
  low: 'bg-muted text-muted-foreground border-border'
};

export function FlashSaleTracker() {
  const { data: deals, isLoading } = useCompetitorDeals(true);

  const flashSales = deals?.filter(d => d.is_flash_sale) || [];

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />;
  }

  if (flashSales.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No active flash sales detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {flashSales.map((sale) => {
        const endDate = sale.end_date ? parseISO(sale.end_date) : null;
        const hoursLeft = endDate ? differenceInHours(endDate, new Date()) : null;
        const isUrgent = hoursLeft !== null && hoursLeft < 24;

        return (
          <Card 
            key={sale.id} 
            className={cn(
              "p-4 border-l-4",
              isUrgent ? "border-l-destructive bg-destructive/5" : "border-l-orange"
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className={cn("w-4 h-4", isUrgent ? "text-destructive" : "text-orange")} />
                <span className="font-semibold">{sale.deal_name}</span>
              </div>
              <Badge variant="outline" className={impactColors[sale.impact_level]}>
                {sale.impact_level}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
              <div>
                <span className="text-muted-foreground">Category:</span>
                <p className="font-medium">{sale.category || 'Multiple'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Discount:</span>
                <p className="font-medium text-coral">{sale.discount_value}</p>
              </div>
            </div>

            {endDate && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Ends: {format(endDate, 'MMM d, h:mm a')}</span>
                </div>
                {isUrgent && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{hoursLeft}h left</span>
                  </div>
                )}
              </div>
            )}

            {sale.estimated_conversion_impact && (
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>Est. conversion impact: {sale.estimated_conversion_impact}%</span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
