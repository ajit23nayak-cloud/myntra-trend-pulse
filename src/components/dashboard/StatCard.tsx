import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: Icon,
  iconColor = 'text-primary',
  delay = 0 
}: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  
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
          
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg",
              isPositive && "bg-teal/20 text-teal",
              isNegative && "bg-destructive/20 text-destructive",
              !isPositive && !isNegative && "bg-muted text-muted-foreground"
            )}>
              {isPositive && <TrendingUp className="w-4 h-4" />}
              {isNegative && <TrendingDown className="w-4 h-4" />}
              {!isPositive && !isNegative && <Minus className="w-4 h-4" />}
              <span>{isPositive && '+'}{change}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-foreground">
            {value}
          </h3>
          <p className="text-sm text-muted-foreground">{title}</p>
          {changeLabel && (
            <p className="text-xs text-muted-foreground/70">{changeLabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}
