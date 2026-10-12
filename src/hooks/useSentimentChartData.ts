import { useMemo } from 'react';
import { startOfWeek, format } from 'date-fns';

interface Review {
  review_date: string | null;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface ChartDataPoint {
  week: string;
  positive: number;
  negative: number;
  neutral: number;
}

/**
 * Weekly sentiment split, for reviews that carry a date.
 *
 * Two things used to keep this chart stuck in the past. It filtered to
 * `new Date('2025-12-05T23:59:59')`, a cutoff written into the code, so nothing
 * collected after that date could ever appear. And it called
 * `new Date(review.review_date)` without checking: an undated review became
 * `new Date(null)`, which is 1 January 1970, so every one of them piled into a
 * single bucket labelled "Dec 28" — the week containing the epoch.
 *
 * Undated reviews are now skipped. Most store-front reviews carry no date, so an
 * empty result is normal and the caller shows a breakdown by theme instead.
 */
export function useSentimentChartData(reviews: Review[] | undefined): ChartDataPoint[] {
  return useMemo(() => {
    if (!reviews?.length) return [];

    const weeklyData: Record<string, {
      positive: number;
      negative: number;
      neutral: number;
      total: number;
      timestamp: number;
    }> = {};

    for (const review of reviews) {
      if (!review.review_date) continue;

      const reviewDate = new Date(review.review_date);
      if (Number.isNaN(reviewDate.getTime())) continue;

      const weekStart = startOfWeek(reviewDate, { weekStartsOn: 0 });
      const weekKey = format(weekStart, 'MMM d');

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { positive: 0, negative: 0, neutral: 0, total: 0, timestamp: weekStart.getTime() };
      }

      weeklyData[weekKey][review.sentiment]++;
      weeklyData[weekKey].total++;
    }

    return Object.entries(weeklyData)
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      .map(([week, data]) => ({
        week,
        positive: Math.round((data.positive / data.total) * 100),
        negative: Math.round((data.negative / data.total) * 100),
        neutral: Math.round((data.neutral / data.total) * 100),
      }))
      .slice(-8);
  }, [reviews]);
}

interface ThemeDataPoint {
  theme: string;
  positive: number;
  negative: number;
  mentions: number;
}

const THEME_LABELS: Record<string, string> = {
  product_quality: 'Product quality',
  pricing: 'Pricing',
  delivery: 'Delivery',
  returns: 'Returns',
  customer_service: 'Customer service',
  app_usability: 'App usability',
};

/**
 * Sentiment split per theme, as a share of that theme's mentions.
 *
 * This is what the Overview shows when too few reviews carry a date to draw a
 * timeline. Every review is tagged with a theme, so it is always populated, and
 * it answers the more useful question anyway: what are people unhappy about.
 */
export function useSentimentByTheme(
  reviews: { theme?: string | null; sentiment: string }[] | undefined
): ThemeDataPoint[] {
  return useMemo(() => {
    if (!reviews?.length) return [];

    const buckets = new Map<string, ThemeDataPoint>();

    for (const review of reviews) {
      if (!review.theme) continue;
      const label = THEME_LABELS[review.theme] ?? review.theme;

      const bucket = buckets.get(label) ?? { theme: label, positive: 0, negative: 0, mentions: 0 };
      bucket.mentions += 1;
      if (review.sentiment === 'positive') bucket.positive += 1;
      else if (review.sentiment === 'negative') bucket.negative += 1;
      buckets.set(label, bucket);
    }

    return Array.from(buckets.values())
      .map((b) => ({
        ...b,
        positive: Math.round((b.positive / b.mentions) * 100),
        negative: Math.round((b.negative / b.mentions) * 100),
      }))
      .sort((a, b) => b.mentions - a.mentions);
  }, [reviews]);
}
