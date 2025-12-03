import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, BarChart3, Target } from 'lucide-react';
import { useInsights, useMarkInsightActioned } from '@/hooks/useDashboardData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type OutcomeStatus = 'pending' | 'successful' | 'partial' | 'unsuccessful';

interface InsightOutcome {
  insightId: string;
  outcome: OutcomeStatus;
  revenueImpact?: number;
  notes?: string;
  recordedAt: string;
}

const outcomeConfig = {
  pending: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Pending Review' },
  successful: { icon: CheckCircle, color: 'text-teal', bg: 'bg-teal/10', label: 'Successful' },
  partial: { icon: TrendingUp, color: 'text-orange', bg: 'bg-orange/10', label: 'Partial Success' },
  unsuccessful: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Unsuccessful' }
};

export function InsightOutcomeTracker() {
  const { data: insights, isLoading } = useInsights();
  const [outcomes, setOutcomes] = useState<Record<string, InsightOutcome>>({});
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [outcomeForm, setOutcomeForm] = useState<{
    outcome: OutcomeStatus;
    revenueImpact: string;
    notes: string;
  }>({ outcome: 'successful', revenueImpact: '', notes: '' });

  const actionedInsights = insights?.filter(i => i.is_actioned) || [];

  const recordOutcome = async (insightId: string) => {
    const newOutcome: InsightOutcome = {
      insightId,
      outcome: outcomeForm.outcome,
      revenueImpact: outcomeForm.revenueImpact ? parseFloat(outcomeForm.revenueImpact) : undefined,
      notes: outcomeForm.notes,
      recordedAt: new Date().toISOString()
    };

    setOutcomes(prev => ({ ...prev, [insightId]: newOutcome }));
    
    // Store in local state (could be extended to store in DB)
    toast({
      title: 'Outcome Recorded',
      description: `Decision outcome tracked for continuous learning.`
    });
    
    setSelectedInsight(null);
    setOutcomeForm({ outcome: 'successful', revenueImpact: '', notes: '' });
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  // Calculate summary stats
  const totalActioned = actionedInsights.length;
  const withOutcomes = Object.keys(outcomes).length;
  const successfulOutcomes = Object.values(outcomes).filter(o => o.outcome === 'successful' || o.outcome === 'partial').length;
  const totalRevenue = Object.values(outcomes).reduce((sum, o) => sum + (o.revenueImpact || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple" />
            <span className="text-sm text-muted-foreground">Actions Taken</span>
          </div>
          <div className="text-2xl font-bold">{totalActioned}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-teal" />
            <span className="text-sm text-muted-foreground">Outcomes Tracked</span>
          </div>
          <div className="text-2xl font-bold">{withOutcomes}/{totalActioned}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-teal" />
            <span className="text-sm text-muted-foreground">Success Rate</span>
          </div>
          <div className="text-2xl font-bold">
            {withOutcomes > 0 ? Math.round((successfulOutcomes / withOutcomes) * 100) : 0}%
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-teal" />
            <span className="text-sm text-muted-foreground">Est. Revenue Impact</span>
          </div>
          <div className="text-2xl font-bold">₹{(totalRevenue / 100000).toFixed(1)}L</div>
        </Card>
      </div>

      {/* Actioned Insights List */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Decision Outcome Tracking</h3>
        
        {actionedInsights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No actioned insights yet. Take action on insights to track outcomes.
          </div>
        ) : (
          <div className="space-y-3">
            {actionedInsights.map((insight) => {
              const outcome = outcomes[insight.id];
              const config = outcome ? outcomeConfig[outcome.outcome] : outcomeConfig.pending;
              const StatusIcon = config.icon;

              return (
                <div 
                  key={insight.id}
                  className={cn("p-4 rounded-lg border", outcome ? config.bg : 'bg-muted/50')}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusIcon className={cn("w-4 h-4", config.color)} />
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {insight.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      
                      {outcome ? (
                        <div className="flex items-center gap-4 text-sm">
                          <Badge className={config.bg + ' ' + config.color}>
                            {config.label}
                          </Badge>
                          {outcome.revenueImpact && (
                            <span className="text-muted-foreground">
                              Revenue: ₹{(outcome.revenueImpact / 1000).toFixed(0)}K
                            </span>
                          )}
                          {outcome.notes && (
                            <span className="text-muted-foreground truncate max-w-[200px]">
                              {outcome.notes}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Awaiting outcome
                        </Badge>
                      )}
                    </div>

                    <Dialog open={selectedInsight === insight.id} onOpenChange={(open) => setSelectedInsight(open ? insight.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          {outcome ? 'Update' : 'Record'} Outcome
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Record Decision Outcome</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Outcome</label>
                            <Select 
                              value={outcomeForm.outcome} 
                              onValueChange={(v) => setOutcomeForm(prev => ({ ...prev, outcome: v as OutcomeStatus }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="successful">Successful - Met goals</SelectItem>
                                <SelectItem value="partial">Partial Success - Some impact</SelectItem>
                                <SelectItem value="unsuccessful">Unsuccessful - No impact</SelectItem>
                                <SelectItem value="pending">Pending - Still monitoring</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Estimated Revenue Impact (₹)</label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 rounded-md border bg-background"
                              placeholder="e.g., 500000"
                              value={outcomeForm.revenueImpact}
                              onChange={(e) => setOutcomeForm(prev => ({ ...prev, revenueImpact: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Notes</label>
                            <Textarea
                              placeholder="What was the actual result? Any learnings?"
                              value={outcomeForm.notes}
                              onChange={(e) => setOutcomeForm(prev => ({ ...prev, notes: e.target.value }))}
                            />
                          </div>
                          <Button className="w-full" onClick={() => recordOutcome(insight.id)}>
                            Save Outcome
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
