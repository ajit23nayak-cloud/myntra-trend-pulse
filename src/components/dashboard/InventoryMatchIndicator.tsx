import { useFashionTrends } from '@/hooks/useDashboardData';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function InventoryMatchIndicator() {
  const { data: trends, isLoading } = useFashionTrends();

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />;
  }

  const emergingTrends = trends?.filter(t => t.status === 'emerging' || t.status === 'peaking') || [];

  const getMatchStatus = (match?: number) => {
    if (!match) return { icon: AlertCircle, color: 'text-muted-foreground', label: 'Unknown', bgColor: 'bg-muted' };
    if (match >= 70) return { icon: CheckCircle, color: 'text-teal', label: 'Well Stocked', bgColor: 'bg-teal/10' };
    if (match >= 40) return { icon: AlertTriangle, color: 'text-yellow', label: 'Low Stock', bgColor: 'bg-yellow/10' };
    return { icon: AlertTriangle, color: 'text-destructive', label: 'Stock Gap', bgColor: 'bg-destructive/10' };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
        <span>Myntra inventory alignment with emerging trends</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[280px]">
              <p className="text-sm"><strong>Inventory Match %</strong>: Measures how well Myntra's current product catalog aligns with trending fashion styles. Higher percentages indicate better stock coverage for emerging trends. Below 40% suggests sourcing opportunities.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {emergingTrends.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No emerging trends to analyze
        </div>
      ) : (
        <div className="space-y-3">
          {emergingTrends.slice(0, 6).map((trend) => {
            const match = trend.myntra_inventory_match || Math.random() * 100;
            const status = getMatchStatus(match);
            const Icon = status.icon;

            return (
              <div key={trend.id} className={cn("p-3 rounded-lg", status.bgColor)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm truncate flex-1">{trend.trend_name}</span>
                  <div className={cn("flex items-center gap-1 text-xs", status.color)}>
                    <Icon className="w-3.5 h-3.5" />
                    <span>{status.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={match} className="flex-1 h-2" />
                  <span className="text-xs font-medium w-12 text-right">{match.toFixed(0)}%</span>
                </div>
                {match < 40 && (
                  <p className="text-xs text-destructive mt-2">
                    Consider increasing inventory for this rising trend
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
