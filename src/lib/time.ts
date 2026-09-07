/**
 * Relative time helpers.
 *
 * The dashboard used to print fixed strings like "2 minutes ago" and "5 min ago"
 * straight into the markup, so every timestamp on screen was a lie. Everything
 * that shows an age now runs through here, against a real database column.
 */

/** "just now", "23 min ago", "6 days ago". Returns null when there is no date. */
export function timeAgo(iso: string | null | undefined): string | null {
  if (!iso) return null;

  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;

  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`;

  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

/** Whole hours since `iso`, or null when there is no date. */
export function hoursSince(iso: string | null | undefined): number | null {
  if (!iso) return null;

  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;

  return Math.floor((Date.now() - then) / 3_600_000);
}
