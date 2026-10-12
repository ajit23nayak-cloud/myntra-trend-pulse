import { useState } from 'react';
import { ShieldCheck, Link2, MinusCircle, Clock, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLastScrape } from '@/hooks/useDashboardData';
import { timeAgo } from '@/lib/time';

/**
 * How to read the dashboard.
 *
 * Several tiles legitimately show a dash, because the figure behind them is not
 * measured. Without context that reads as broken rather than deliberate, which
 * is the opposite of the point. This says what is counted, what is not, and how
 * a viewer can check any row for themselves.
 */
export function DataProvenance() {
  const [open, setOpen] = useState(false);
  const { data: lastScrape } = useLastScrape();
  const age = timeAgo(lastScrape?.created_at);

  const points = [
    {
      icon: ShieldCheck,
      color: 'text-teal',
      title: 'Measured, not generated',
      body: 'Every figure is read from the database. Nothing is produced to fill an empty space.',
    },
    {
      icon: Link2,
      color: 'text-blue',
      title: 'Traceable to the source',
      body: 'Each competitor product carries the AJIO page it was read from. Open one and check the price yourself.',
    },
    {
      icon: MinusCircle,
      color: 'text-coral',
      title: 'A dash means unknown',
      body: 'Where something has not been measured you will see a dash and the reason, rather than a confident number.',
    },
    {
      icon: Clock,
      color: 'text-purple',
      title: 'Collected on a schedule',
      body: age
        ? `Scrapers run twice a day. The newest completed run was ${age}.`
        : 'Scrapers run twice a day, and a run that finds nothing is recorded as a failure rather than hidden.',
    },
  ];

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-muted/20 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-teal/15 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4.5 h-4.5 text-teal" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground text-sm">Where these numbers come from</p>
            <p className="text-xs text-muted-foreground truncate">
              Everything on this page is traceable to a source, and gaps are shown as gaps.
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn('w-4 h-4 text-muted-foreground shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 pb-4 pt-1 animate-fade-in">
          {points.map((point) => {
            const Icon = point.icon;
            return (
              <div key={point.title} className="flex gap-2.5">
                <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', point.color)} />
                <div>
                  <p className="text-xs font-medium text-foreground mb-0.5">{point.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{point.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
