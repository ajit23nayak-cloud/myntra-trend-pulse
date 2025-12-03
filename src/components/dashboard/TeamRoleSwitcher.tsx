import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ShoppingBag, Megaphone, Truck, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useDashboardStats, useFashionTrends, useSentimentTrends, useCompetitiveMetrics, useAlerts } from '@/hooks/useDashboardData';

export type TeamRole = 'merchandiser' | 'marketer' | 'operations';

interface TeamRoleSwitcherProps {
  role: TeamRole;
  onRoleChange: (role: TeamRole) => void;
}

const roleConfig = {
  merchandiser: {
    label: 'Merchandiser',
    icon: ShoppingBag,
    description: 'Fashion trends & inventory alignment',
    color: 'text-purple'
  },
  marketer: {
    label: 'Marketer',
    icon: Megaphone,
    description: 'Sentiment shifts & competitive pricing',
    color: 'text-teal'
  },
  operations: {
    label: 'Operations',
    icon: Truck,
    description: 'Delivery sentiment & deal effectiveness',
    color: 'text-orange'
  }
};

export function TeamRoleSwitcher({ role, onRoleChange }: TeamRoleSwitcherProps) {
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-muted ${config.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <Select value={role} onValueChange={(v) => onRoleChange(v as TeamRole)}>
        <SelectTrigger className="w-[180px] bg-card border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(roleConfig).map(([key, cfg]) => {
            const RoleIcon = cfg.icon;
            return (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <RoleIcon className={`w-4 h-4 ${cfg.color}`} />
                  <span>{cfg.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

export function RoleSpecificKPIs({ role }: { role: TeamRole }) {
  const { data: stats } = useDashboardStats();
  const { data: trends } = useFashionTrends();
  const { data: sentiment } = useSentimentTrends();
  const { data: metrics } = useCompetitiveMetrics();
  const { data: alerts } = useAlerts('active');

  const emergingTrends = trends?.filter(t => t.status === 'emerging').length || 0;
  const peakingTrends = trends?.filter(t => t.status === 'peaking').length || 0;
  const lowInventoryMatch = trends?.filter(t => (t.myntra_inventory_match || 0) < 50).length || 0;

  const latestMetric = metrics?.[0];
  const deliveryAlerts = alerts?.filter(a => a.type === 'delivery' || a.message?.toLowerCase().includes('delivery')).length || 0;

  const kpis = {
    merchandiser: [
      { label: 'Emerging Trends', value: emergingTrends, icon: TrendingUp, color: 'text-teal', change: '+3 this week' },
      { label: 'Peaking Trends', value: peakingTrends, icon: TrendingUp, color: 'text-purple', change: 'Action needed' },
      { label: 'Low Inventory Match', value: lowInventoryMatch, icon: AlertTriangle, color: 'text-destructive', change: 'Stock gaps' },
      { label: 'Avg Growth Rate', value: `${Math.round(trends?.reduce((sum, t) => sum + (t.growth_rate || 0), 0) / (trends?.length || 1))}%`, icon: TrendingUp, color: 'text-teal' }
    ],
    marketer: [
      { label: 'Sentiment Score', value: `${stats?.overallSentiment || 76}%`, icon: TrendingUp, color: 'text-teal', change: `+${stats?.sentimentChange || 2.3}%` },
      { label: 'Price Gap vs AJIO', value: `${latestMetric?.avg_price_gap?.toFixed(1) || '-5.2'}%`, icon: latestMetric?.avg_price_gap && latestMetric.avg_price_gap < 0 ? TrendingDown : TrendingUp, color: latestMetric?.avg_price_gap && latestMetric.avg_price_gap < 0 ? 'text-destructive' : 'text-teal' },
      { label: 'Active Competitor Deals', value: alerts?.filter(a => a.type === 'price').length || 0, icon: AlertTriangle, color: 'text-orange', change: 'Monitor closely' },
      { label: 'Trending Keywords', value: sentiment?.length || 0, icon: TrendingUp, color: 'text-purple' }
    ],
    operations: [
      { label: 'Delivery Sentiment', value: '65%', icon: sentiment?.[0]?.avg_sentiment_score && sentiment[0].avg_sentiment_score > 0.6 ? TrendingUp : TrendingDown, color: 'text-orange', change: 'Needs attention' },
      { label: 'Returns Alerts', value: deliveryAlerts, icon: AlertTriangle, color: 'text-destructive' },
      { label: 'Deal Effectiveness', value: `${latestMetric?.deal_intensity_score?.toFixed(0) || 72}%`, icon: TrendingUp, color: 'text-teal' },
      { label: 'Active Issues', value: alerts?.filter(a => a.severity === 'critical' || a.severity === 'high').length || 0, icon: AlertTriangle, color: 'text-destructive', change: 'Requires action' }
    ]
  };

  const roleKPIs = kpis[role];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {roleKPIs.map((kpi, index) => {
        const KPIIcon = kpi.icon;
        return (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{kpi.label}</span>
              <KPIIcon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className="text-2xl font-bold">{kpi.value}</div>
            {kpi.change && (
              <Badge variant="outline" className="mt-2 text-xs">
                {kpi.change}
              </Badge>
            )}
          </Card>
        );
      })}
    </div>
  );
}
