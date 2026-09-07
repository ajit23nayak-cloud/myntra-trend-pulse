import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StatCardProps {
  title: string;
  value: string | number;
  /** Null means the figure could not be computed; the badge is then hidden. */
  change?: number | null;
  /**
   * Unit for `change`. Defaults to '%'.
   *
   * The suffix used to be hardcoded, so a card passing a plain count rendered it
   * as a percentage: 94 trends trending up showed as "+94%", and 22 critical
   * alerts as "+22%", both reading as period-over-period growth.
   */
  changeUnit?: string;
  changeLabel?: string;
  changeLabelTooltip?: string;
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  change,
  changeUnit = '%',
  changeLabel,
  changeLabelTooltip,
  icon: Icon,
  iconColor = 'text-primary',
  delay = 0
}: StatCardProps) {
  const hasChange = change !== undefined && change !== null;
  const isPositive = hasChange && change > 0;
  const isNegative = hasChange && change < 0;
  
  return (
    <div 
      className="stat-card animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            "bg-secondary/80"
          )}>
            <Icon className={cn("w-6 h-6", iconColor)} />
          </div>
          
          {hasChange && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg",
              isPositive && "bg-teal/20 text-teal",
              isNegative && "bg-destructive/20 text-destructive",
              !isPositive && !isNegative && "bg-muted text-muted-foreground"
            )}>
              {isPositive && <TrendingUp className="w-4 h-4" />}
              {isNegative && <TrendingDown className="w-4 h-4" />}
              {!isPositive && !isNegative && <Minus className="w-4 h-4" />}
              <span>{isPositive && '+'}{change}{changeUnit}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-foreground">
            {value}
          </h3>
          <p className="text-sm text-muted-foreground">{title}</p>
          {changeLabel && (
            <div className="flex items-center gap-1">
              <p className="text-xs text-muted-foreground/70">{changeLabel}</p>
              {changeLabelTooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground/50 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[200px]">
                      <p className="text-xs">{changeLabelTooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
