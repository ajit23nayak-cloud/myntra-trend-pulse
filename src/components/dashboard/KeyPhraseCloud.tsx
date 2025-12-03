import { useKeyPhraseTrends } from '@/hooks/useDashboardData';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyPhraseCloudProps {
  painPointsOnly?: boolean;
}

export function KeyPhraseCloud({ painPointsOnly = false }: KeyPhraseCloudProps) {
  const { data: phrases, isLoading } = useKeyPhraseTrends(painPointsOnly);

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-muted rounded-lg" />;
  }

  if (!phrases?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No key phrases detected yet
      </div>
    );
  }

  const maxCount = Math.max(...phrases.map(p => p.occurrence_count));

  const getSize = (count: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return 'text-lg font-semibold';
    if (ratio > 0.4) return 'text-base font-medium';
    return 'text-sm';
  };

  const getTrendIcon = (direction?: string) => {
    switch (direction) {
      case 'rising': return <TrendingUp className="w-3 h-3 text-destructive" />;
      case 'falling': return <TrendingDown className="w-3 h-3 text-teal" />;
      default: return <Minus className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {phrases.map((phrase) => (
        <Badge
          key={phrase.id}
          variant="outline"
          className={cn(
            "flex items-center gap-1.5 py-1.5 px-3 transition-all hover:scale-105",
            getSize(phrase.occurrence_count),
            phrase.is_pain_point && "border-destructive/50 bg-destructive/5"
          )}
        >
          {phrase.is_pain_point && <AlertTriangle className="w-3 h-3 text-destructive" />}
          <span>{phrase.phrase}</span>
          {getTrendIcon(phrase.trend_direction)}
          <span className="text-xs text-muted-foreground">({phrase.occurrence_count})</span>
        </Badge>
      ))}
    </div>
  );
}
