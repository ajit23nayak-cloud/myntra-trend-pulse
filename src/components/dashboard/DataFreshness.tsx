import { useLastScrape } from '@/hooks/useDashboardData';
import { timeAgo, hoursSince } from '@/lib/time';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock } from 'lucide-react';

/** Past this many hours without a completed scrape, say so instead of staying quiet. */
const STALE_AFTER_HOURS = 24;

/**
 * How old the data on screen actually is.
 *
 * Reads the newest completed run from scrape_logs. If nothing has run in a day
 * it turns amber and says how long it has been, rather than letting a stale
 * dashboard look freshly loaded.
 */
export function DataFreshness({ className }: { className?: string }) {
  const { data: lastScrape, isLoading } = useLastScrape();

  if (isLoading) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        Checking data age
      </div>
    );
  }

  if (!lastScrape) {
    return (
      <div className={cn('flex items-center gap-1.5 text-sm text-yellow', className)}>
        <AlertTriangle className="w-4 h-4" />
        <span>No completed data refresh yet</span>
      </div>
    );
  }

  const age = timeAgo(lastScrape.created_at);
  const hours = hoursSince(lastScrape.created_at);
  const isStale = hours !== null && hours >= STALE_AFTER_HOURS;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-sm',
        isStale ? 'text-yellow' : 'text-muted-foreground',
        className,
      )}
      title={new Date(lastScrape.created_at).toLocaleString()}
    >
      {isStale ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
      <span>
        {isStale ? 'Data is stale, last refreshed' : 'Last updated'}:{' '}
        <span className={cn('font-medium', !isStale && 'text-foreground')}>{age}</span>
      </span>
    </div>
  );
}
