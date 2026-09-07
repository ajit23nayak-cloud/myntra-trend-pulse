import { useState } from 'react';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/time';
import { useAlerts, useUpdateAlertStatus } from '@/hooks/useDashboardData';
import type { Alert, AlertStatus } from '@/types/database';
import {
  Bell, AlertTriangle, AlertCircle, TrendingUp, Lightbulb,
  MessageSquareText, X, Check, Clock, Filter, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

/** Alert types the scrapers and generate-insights actually write. */
const typeConfig: Record<string, { icon: typeof Bell; color: string; label: string }> = {
  competitor_alert: { icon: AlertTriangle, color: 'text-coral', label: 'Competitor' },
  sentiment_alert: { icon: MessageSquareText, color: 'text-purple', label: 'Sentiment' },
  trend_alert: { icon: TrendingUp, color: 'text-teal', label: 'Trend' },
  insight_alert: { icon: Lightbulb, color: 'text-blue', label: 'Insight' },
};

const fallbackType = { icon: Bell, color: 'text-muted-foreground', label: 'Alert' };

/** Severities match the ImpactLevel column, not the invented critical/warning/info. */
const severityConfig: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  critical: { bg: 'bg-destructive/20', border: 'border-destructive/30', text: 'text-destructive', dot: 'bg-destructive' },
  high: { bg: 'bg-orange/20', border: 'border-orange/30', text: 'text-orange', dot: 'bg-orange' },
  medium: { bg: 'bg-yellow/20', border: 'border-yellow/30', text: 'text-yellow', dot: 'bg-yellow' },
  low: { bg: 'bg-blue/20', border: 'border-blue/30', text: 'text-blue', dot: 'bg-blue' },
};

const fallbackSeverity = severityConfig.low;

const statusFilters = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'acknowledged', label: 'Acknowledged' },
  { id: 'resolved', label: 'Resolved' },
];

const typeFilters = [
  { id: 'competitor_alert', label: 'Competitor' },
  { id: 'sentiment_alert', label: 'Sentiment' },
  { id: 'trend_alert', label: 'Trend' },
  { id: 'insight_alert', label: 'Insight' },
];

export function AlertsSection() {
  const { data: alerts, isLoading, isError, refetch } = useAlerts();
  const updateStatus = useUpdateAlertStatus();
  const [filter, setFilter] = useState('all');

  const all = alerts ?? [];
  const activeAlerts = all.filter((a) => a.status === 'active');

  const isStatusFilter = statusFilters.some((f) => f.id === filter);
  const filteredAlerts = isStatusFilter
    ? filter === 'all'
      ? all
      : all.filter((a) => a.status === filter)
    : all.filter((a) => a.type === filter);

  const setAlertStatus = async (alertId: string, status: AlertStatus, verb: string) => {
    try {
      await updateStatus.mutateAsync({ alertId, status });
      toast({ title: `Alert ${verb}` });
    } catch {
      toast({
        title: 'Could not update this alert',
        description: 'The change was not saved. Check your connection and try again.',
        variant: 'destructive',
      });
    }
  };

  const acknowledgeAll = async () => {
    const results = await Promise.allSettled(
      activeAlerts.map((a) => updateStatus.mutateAsync({ alertId: a.id, status: 'acknowledged' })),
    );
    const failed = results.filter((r) => r.status === 'rejected').length;

    if (failed === 0) {
      toast({ title: `${results.length} alerts acknowledged` });
    } else {
      toast({
        title: `${results.length - failed} of ${results.length} acknowledged`,
        description: `${failed} could not be saved.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Real-Time Alerts</h2>
            <p className="text-muted-foreground">Monitor critical events and notifications</p>
          </div>
          {activeAlerts.length > 0 && (
            <Badge className="bg-destructive text-destructive-foreground">
              {activeAlerts.length} active
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={acknowledgeAll}
          disabled={activeAlerts.length === 0 || updateStatus.isPending}
        >
          {updateStatus.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          Acknowledge all
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[...statusFilters, ...typeFilters].map((f) => (
          <Button
            key={f.id}
            variant={filter === f.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.id)}
            className={cn(filter === f.id && 'bg-primary')}
          >
            {f.id === 'all' && <Filter className="w-4 h-4 mr-1" />}
            {f.label}
          </Button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="glass-card p-12 text-center">
            <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading alerts</p>
          </div>
        ) : isError ? (
          <div className="glass-card p-12 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">Could not load alerts</p>
            <p className="text-sm text-muted-foreground mb-4">
              The dashboard could not reach the database.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">
              {all.length === 0 ? 'No alerts yet' : 'Nothing matches this filter'}
            </p>
            <p className="text-sm text-muted-foreground">
              {all.length === 0
                ? 'Alerts appear here once the scrapers and insight generator have run.'
                : 'Try a different filter.'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert: Alert, idx) => {
            const type = typeConfig[alert.type] ?? fallbackType;
            const TypeIcon = type.icon;
            const severity = severityConfig[alert.severity] ?? fallbackSeverity;
            const isActive = alert.status === 'active';
            const age = timeAgo(alert.created_at);

            return (
              <div
                key={alert.id}
                className={cn(
                  'glass-card p-4 border-l-4 animate-fade-in transition-all duration-200',
                  severity.border,
                  isActive && 'bg-card/80',
                  alert.status === 'resolved' && 'opacity-60',
                )}
                style={{ animationDelay: `${Math.min(idx, 10) * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  {isActive && (
                    <div className={cn('w-2 h-2 rounded-full mt-2 pulse-dot shrink-0', severity.dot)} />
                  )}

                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', severity.bg)}>
                    <TypeIcon className={cn('w-5 h-5', type.color)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className={cn('font-semibold', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                        {alert.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">{type.label}</Badge>
                      <Badge className={cn('text-xs capitalize', severity.bg, severity.text)}>
                        {alert.severity}
                      </Badge>
                      {!isActive && (
                        <Badge variant="outline" className="text-xs capitalize text-muted-foreground">
                          {alert.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground/70 flex-wrap">
                      {age && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {age}
                        </span>
                      )}
                      {alert.source && <span>via {alert.source}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isActive && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Acknowledge"
                        disabled={updateStatus.isPending}
                        onClick={() => setAlertStatus(alert.id, 'acknowledged', 'acknowledged')}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    {alert.status !== 'resolved' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Resolve"
                        disabled={updateStatus.isPending}
                        onClick={() => setAlertStatus(alert.id, 'resolved', 'resolved')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Critical', value: all.filter((a) => a.severity === 'critical').length, color: 'text-coral' },
          { label: 'High', value: all.filter((a) => a.severity === 'high').length, color: 'text-orange' },
          { label: 'Active', value: activeAlerts.length, color: 'text-yellow' },
          { label: 'Resolved', value: all.filter((a) => a.status === 'resolved').length, color: 'text-teal' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <p className={cn('text-2xl font-display font-bold', stat.color)}>
              {isLoading ? '—' : stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
