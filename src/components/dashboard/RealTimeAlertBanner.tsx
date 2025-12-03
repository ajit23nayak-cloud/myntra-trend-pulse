import { useAlerts, useUpdateAlertStatus } from '@/hooks/useDashboardData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, AlertCircle, Info, X, Check, Bell, 
  TrendingUp, DollarSign, MessageSquare 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const severityConfig = {
  critical: { 
    icon: AlertTriangle, 
    className: 'border-destructive bg-destructive/10 text-destructive',
    iconColor: 'text-destructive'
  },
  high: { 
    icon: AlertCircle, 
    className: 'border-orange bg-orange/10 text-orange',
    iconColor: 'text-orange'
  },
  medium: { 
    icon: Info, 
    className: 'border-yellow bg-yellow/10 text-yellow',
    iconColor: 'text-yellow'
  },
  low: { 
    icon: Bell, 
    className: 'border-border bg-muted',
    iconColor: 'text-muted-foreground'
  }
};

const typeIcons: Record<string, typeof TrendingUp> = {
  trend: TrendingUp,
  price: DollarSign,
  sentiment: MessageSquare,
  deal: AlertCircle
};

export function RealTimeAlertBanner() {
  const { data: alerts, isLoading } = useAlerts('active');
  const updateStatus = useUpdateAlertStatus();

  if (isLoading || !alerts?.length) {
    return null;
  }

  // Show only critical/high severity alerts in banner
  const urgentAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high').slice(0, 3);

  if (urgentAlerts.length === 0) {
    return null;
  }

  const handleAcknowledge = async (alertId: string) => {
    try {
      await updateStatus.mutateAsync({ alertId, status: 'acknowledged' });
      toast({
        title: "Alert acknowledged",
        description: "The alert has been marked as acknowledged."
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to acknowledge alert.",
        variant: "destructive"
      });
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await updateStatus.mutateAsync({ alertId, status: 'resolved' });
      toast({
        title: "Alert resolved",
        description: "The alert has been marked as resolved."
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to resolve alert.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-2 mb-6">
      {urgentAlerts.map((alert) => {
        const config = severityConfig[alert.severity];
        const SeverityIcon = config.icon;
        const TypeIcon = typeIcons[alert.type] || Bell;

        return (
          <Alert key={alert.id} className={cn("flex items-center gap-3", config.className)}>
            <div className="flex items-center gap-2 flex-shrink-0">
              <SeverityIcon className={cn("w-5 h-5", config.iconColor)} />
              <TypeIcon className={cn("w-4 h-4", config.iconColor)} />
            </div>
            
            <div className="flex-1 min-w-0">
              <AlertTitle className="text-sm font-semibold">{alert.title}</AlertTitle>
              <AlertDescription className="text-xs mt-0.5 line-clamp-1">
                {alert.message}
              </AlertDescription>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2"
                onClick={() => handleAcknowledge(alert.id)}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2"
                onClick={() => handleResolve(alert.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Alert>
        );
      })}
    </div>
  );
}
