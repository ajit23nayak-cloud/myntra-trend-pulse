import { insights } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { AlertTriangle, TrendingUp, Target, Lightbulb, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const typeConfig = {
  urgent: { icon: AlertTriangle, color: 'text-coral', bg: 'bg-coral/10', border: 'border-coral/30' },
  opportunity: { icon: Lightbulb, color: 'text-yellow', bg: 'bg-yellow/10', border: 'border-yellow/30' },
  competitive: { icon: Target, color: 'text-blue', bg: 'bg-blue/10', border: 'border-blue/30' },
  trend: { icon: TrendingUp, color: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/30' },
};

const impactColors = {
  Critical: 'bg-destructive/20 text-destructive',
  High: 'bg-coral/20 text-coral',
  Medium: 'bg-yellow/20 text-yellow',
  Low: 'bg-teal/20 text-teal',
};

export function InsightsSection() {
  const [actioned, setActioned] = useState<number[]>([]);
  
  const handleAction = (id: number) => {
    if (!actioned.includes(id)) {
      setActioned([...actioned, id]);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Actionable Insights</h2>
          <p className="text-muted-foreground">AI-generated recommendations based on data analysis</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Actioned:</span>
          <span className="font-semibold text-teal">{actioned.length}/{insights.length}</span>
        </div>
      </div>

      {/* Priority Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insights.map((insight, idx) => {
          const config = typeConfig[insight.type as keyof typeof typeConfig];
          const Icon = config?.icon || Lightbulb;
          const isActioned = actioned.includes(insight.id);
          
          return (
            <div 
              key={insight.id}
              className={cn(
                "glass-card-hover p-6 animate-fade-in relative overflow-hidden",
                isActioned && "opacity-60"
              )}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {isActioned && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-6 h-6 text-teal" />
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  config?.bg || 'bg-muted'
                )}>
                  <Icon className={cn("w-6 h-6", config?.color || 'text-muted-foreground')} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{insight.title}</h3>
                    <Badge className={cn("text-xs", impactColors[insight.impact as keyof typeof impactColors])}>
                      {insight.impact}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">{insight.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {insight.category}
                    </Badge>
                    
                    {!isActioned ? (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="gap-1 text-primary hover:text-primary"
                        onClick={() => handleAction(insight.id)}
                      >
                        Take Action
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <span className="text-xs text-teal">Actioned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-coral/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-coral" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">2</p>
              <p className="text-xs text-muted-foreground">Urgent Issues</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Requires immediate attention to prevent customer churn or revenue loss.
          </p>
        </div>

        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-yellow/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-yellow" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">1</p>
              <p className="text-xs text-muted-foreground">Opportunities</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Growth opportunities identified from trend analysis.
          </p>
        </div>

        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-teal/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-teal" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">₹2.3L</p>
              <p className="text-xs text-muted-foreground">Potential Impact</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Estimated revenue impact from acting on all insights.
          </p>
        </div>
      </div>
    </div>
  );
}
