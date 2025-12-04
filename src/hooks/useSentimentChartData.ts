import { useMemo } from 'react';
import { startOfWeek, format } from 'date-fns';

interface Review {
  review_date: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface ChartDataPoint {
  week: string;
  positive: number;
  negative: number;
  neutral: number;
}

export function useSentimentChartData(reviews: Review[] | undefined): ChartDataPoint[] {
  return useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return [];
    }
    
    // Filter reviews to only include up to Dec 5th, 2025
    const cutoffDate = new Date('2025-12-05T23:59:59');
    const filteredReviews = reviews.filter(review => {
      const reviewDate = new Date(review.review_date);
      return reviewDate <= cutoffDate;
    });
    
    if (filteredReviews.length === 0) {
      return [];
    }
    
    // Group reviews by week with timestamp for sorting
    const weeklyData: Record<string, { 
      positive: number; 
      negative: number; 
      neutral: number; 
      total: number; 
      timestamp: number 
    }> = {};
    
    filteredReviews.forEach(review => {
      const reviewDate = new Date(review.review_date);
      const weekStart = startOfWeek(reviewDate, { weekStartsOn: 0 }); // Sunday as start
      const weekKey = format(weekStart, 'MMM d');
      const timestamp = weekStart.getTime();
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { positive: 0, negative: 0, neutral: 0, total: 0, timestamp };
      }
      
      weeklyData[weekKey][review.sentiment]++;
      weeklyData[weekKey].total++;
    });
    
    // Convert to array, sort chronologically by timestamp, then take last 8 weeks
    const sortedWeeks = Object.entries(weeklyData)
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      .map(([week, data]) => ({
        week,
        positive: data.total > 0 ? Math.round((data.positive / data.total) * 100) : 0,
        negative: data.total > 0 ? Math.round((data.negative / data.total) * 100) : 0,
        neutral: data.total > 0 ? Math.round((data.neutral / data.total) * 100) : 0,
      }))
      .slice(-8);
    
    return sortedWeeks;
  }, [reviews]);
}
