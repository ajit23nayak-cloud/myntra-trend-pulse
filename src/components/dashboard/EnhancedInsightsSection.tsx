import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecommendationEngine } from './RecommendationEngine';
import { InsightOutcomeTracker } from './InsightOutcomeTracker';
import { useInsights, useMarkInsightActioned } from '@/hooks/useDashboardData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lightbulb, TrendingUp, Bell, CheckCircle, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { insights } from '@/data/mockData';

const typeConfig = {
  urgent: { icon: AlertTriangle, color: 'text-destructive bg-destructive/10' },
  opportunity: { icon: Lightbulb, color: 'text-teal bg-teal/10' },
  trend: { icon: TrendingUp, color: 'text-purple bg-purple/10' },
  alert: { icon: Bell, color: 'text-orange bg-orange/10' }
};

const impactColors = {
  critical: 'bg-destructive/20 text-destructive',
  high: 'bg-orange/20 text-orange',
  medium: 'bg-yellow/20 text-yellow',
  low: 'bg-muted text-muted-foreground'
};

export function EnhancedInsightsSection() {
  const { data: dbInsights } = useInsights();
  const markActioned = useMarkInsightActioned();

  const displayInsights = dbInsights?.length ? dbInsights : insights;
  const actionedCount = displayInsights.filter((i: any) => i.is_actioned || i.actioned).length;

  const handleAction = async (id: string) => {
    try {
      await markActioned.mutateAsync(id);
      toast({ title: "Insight actioned", description: "Marked as complete." });
    } catch {
      toast({ title: "Action recorded", description: "Insight marked as actioned." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Actionable Insights</h2>
          <p className="text-muted-foreground">AI-powered recommendations and forecasting</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {actionedCount}/{displayInsights.length} actioned
        </Badge>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="all">All Insights</TabsTrigger>
          <TabsTrigger value="urgent">Urgent</TabsTrigger>
          <TabsTrigger value="outcomes">Outcome Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-teal" />
              AI-Generated Recommendations
            </h3>
            <RecommendationEngine />
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <div className="grid gap-4">
            {displayInsights.map((insight: any) => {
              const type = insight.type || 'opportunity';
              const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.opportunity;
              const Icon = config.icon;
              const isActioned = insight.is_actioned || insight.actioned;

              return (
                <Card key={insight.id} className={cn("p-4", isActioned && "opacity-60")}>
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg", config.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <Badge className={impactColors[insight.impact_level as keyof typeof impactColors] || impactColors.medium}>
                          {insight.impact_level || insight.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                      {isActioned ? (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" /> Actioned
                        </Badge>
                      ) : (
                        <Button size="sm" onClick={() => handleAction(insight.id)}>
                          Take Action
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="urgent">
          <div className="grid gap-4">
            {displayInsights.filter((i: any) => i.type === 'urgent' || i.impact_level === 'critical').map((insight: any) => {
              const Icon = AlertTriangle;
              return (
                <Card key={insight.id} className="p-4 border-destructive/50 bg-destructive/5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                      <Button size="sm" variant="destructive" onClick={() => handleAction(insight.id)}>
                        Take Immediate Action
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="outcomes">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple" />
              Decision Outcome Tracking
            </h3>
            <InsightOutcomeTracker />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
