import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Bell, AlertTriangle, TrendingUp, Target, X, Check, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Alert {
  id: number;
  type: 'price' | 'sentiment' | 'trend' | 'competitor';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

const initialAlerts: Alert[] = [
  {
    id: 1,
    type: 'competitor',
    severity: 'critical',
    title: 'AJIO Flash Sale Detected',
    description: 'AJIO launched 60% off flash sale on summer collection. Current discount gap is significant.',
    timestamp: '5 min ago',
    read: false,
  },
  {
    id: 2,
    type: 'sentiment',
    severity: 'warning',
    title: 'Delivery Sentiment Dropping',
    description: 'Negative mentions about delivery increased by 15% in the last 24 hours.',
    timestamp: '23 min ago',
    read: false,
  },
  {
    id: 3,
    type: 'trend',
    severity: 'info',
    title: 'New Trend Alert: Cherry Red',
    description: 'Cherry red color trending up 180% on TikTok fashion hashtags.',
    timestamp: '1 hour ago',
    read: false,
  },
  {
    id: 4,
    type: 'price',
    severity: 'warning',
    title: 'Price Undercut on Sneakers',
    description: 'AJIO reduced sneaker prices by average 12%. Consider price adjustment.',
    timestamp: '2 hours ago',
    read: true,
  },
  {
    id: 5,
    type: 'sentiment',
    severity: 'info',
    title: 'Positive App Review Spike',
    description: 'App store positive reviews up 25% after latest update.',
    timestamp: '3 hours ago',
    read: true,
  },
  {
    id: 6,
    type: 'trend',
    severity: 'warning',
    title: 'Coquette Style Peak Warning',
    description: 'Coquette aesthetic showing signs of market saturation. Consider inventory adjustment.',
    timestamp: '4 hours ago',
    read: true,
  },
];

const typeConfig = {
  price: { icon: Target, color: 'text-blue', label: 'Pricing' },
  sentiment: { icon: Bell, color: 'text-purple', label: 'Sentiment' },
  trend: { icon: TrendingUp, color: 'text-teal', label: 'Trend' },
  competitor: { icon: AlertTriangle, color: 'text-coral', label: 'Competitor' },
};

const severityConfig = {
  critical: { bg: 'bg-destructive/20', border: 'border-destructive/30', text: 'text-destructive', dot: 'bg-destructive' },
  warning: { bg: 'bg-yellow/20', border: 'border-yellow/30', text: 'text-yellow', dot: 'bg-yellow' },
  info: { bg: 'bg-blue/20', border: 'border-blue/30', text: 'text-blue', dot: 'bg-blue' },
};

export function AlertsSection() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState<string>('all');
  
  const unreadCount = alerts.filter(a => !a.read).length;
  
  const filteredAlerts = filter === 'all' 
    ? alerts 
    : filter === 'unread' 
      ? alerts.filter(a => !a.read)
      : alerts.filter(a => a.type === filter);
  
  const markAsRead = (id: number) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
  };
  
  const dismissAlert = (id: number) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };
  
  const markAllAsRead = () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Real-Time Alerts</h2>
            <p className="text-muted-foreground">Monitor critical events and notifications</p>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-destructive text-destructive-foreground">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
          <Check className="w-4 h-4 mr-2" />
          Mark all read
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'unread', 'competitor', 'sentiment', 'trend', 'price'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className={cn(filter === f && "bg-primary")}
          >
            {f === 'all' && <Filter className="w-4 h-4 mr-1" />}
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin">
        {filteredAlerts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No alerts to display</p>
          </div>
        ) : (
          filteredAlerts.map((alert, idx) => {
            const TypeIcon = typeConfig[alert.type].icon;
            const severity = severityConfig[alert.severity];
            
            return (
              <div 
                key={alert.id}
                className={cn(
                  "glass-card p-4 border-l-4 animate-fade-in transition-all duration-200",
                  severity.border,
                  !alert.read && "bg-card/80"
                )}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Unread indicator */}
                  {!alert.read && (
                    <div className={cn("w-2 h-2 rounded-full mt-2 pulse-dot", severity.dot)} />
                  )}
                  
                  {/* Type Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    severity.bg
                  )}>
                    <TypeIcon className={cn("w-5 h-5", typeConfig[alert.type].color)} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={cn(
                        "font-semibold",
                        alert.read ? "text-muted-foreground" : "text-foreground"
                      )}>
                        {alert.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {typeConfig[alert.type].label}
                      </Badge>
                      <Badge className={cn("text-xs capitalize", severity.bg, severity.text)}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                      <Clock className="w-3 h-3" />
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {!alert.read && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => markAsRead(alert.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display font-bold text-coral">{alerts.filter(a => a.severity === 'critical').length}</p>
          <p className="text-xs text-muted-foreground">Critical</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display font-bold text-yellow">{alerts.filter(a => a.severity === 'warning').length}</p>
          <p className="text-xs text-muted-foreground">Warnings</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display font-bold text-blue">{alerts.filter(a => a.severity === 'info').length}</p>
          <p className="text-xs text-muted-foreground">Info</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display font-bold text-teal">{alerts.filter(a => a.type === 'trend').length}</p>
          <p className="text-xs text-muted-foreground">Trend Alerts</p>
        </div>
      </div>
    </div>
  );
}
