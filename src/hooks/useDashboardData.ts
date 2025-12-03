import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { 
  SentimentReview, SentimentTrend, KeyPhraseTrend, 
  FashionTrend, TrendMetric, TrendForecast,
  CompetitorProduct, CompetitorDeal, CompetitiveMetric,
  Insight, Alert, DashboardStats, TimeframeOption,
  SentimentTheme, CustomerCohort, RegionType, TrendStatus, InsightType, AlertStatus
} from '@/types/database';

// Sentiment Data Hooks
export function useSentimentReviews(filters?: {
  theme?: SentimentTheme;
  cohort?: CustomerCohort;
  region?: RegionType;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['sentiment-reviews', filters],
    queryFn: async () => {
      let query = supabase
        .from('sentiment_reviews')
        .select('*')
        .order('review_date', { ascending: false });
      
      if (filters?.theme) query = query.eq('theme', filters.theme);
      if (filters?.cohort) query = query.eq('customer_cohort', filters.cohort);
      if (filters?.region) query = query.eq('region', filters.region);
      if (filters?.limit) query = query.limit(filters.limit);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SentimentReview[];
    }
  });
}

export function useSentimentTrends(timeframe?: TimeframeOption) {
  return useQuery({
    queryKey: ['sentiment-trends', timeframe],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sentiment_trends')
        .select('*')
        .order('period_start', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as SentimentTrend[];
    }
  });
}

export function useKeyPhraseTrends(painPointsOnly?: boolean) {
  return useQuery({
    queryKey: ['key-phrase-trends', painPointsOnly],
    queryFn: async () => {
      let query = supabase
        .from('key_phrase_trends')
        .select('*')
        .order('occurrence_count', { ascending: false });
      
      if (painPointsOnly) query = query.eq('is_pain_point', true);
      
      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data as KeyPhraseTrend[];
    }
  });
}

// Fashion Trend Hooks
export function useFashionTrends(status?: TrendStatus) {
  return useQuery({
    queryKey: ['fashion-trends', status],
    queryFn: async () => {
      let query = supabase
        .from('fashion_trends')
        .select('*')
        .order('growth_rate', { ascending: false });
      
      if (status) query = query.eq('status', status);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as FashionTrend[];
    }
  });
}

export function useTrendMetrics(trendId: string) {
  return useQuery({
    queryKey: ['trend-metrics', trendId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trend_metrics')
        .select('*')
        .eq('trend_id', trendId)
        .order('metric_date', { ascending: true });
      
      if (error) throw error;
      return data as TrendMetric[];
    },
    enabled: !!trendId
  });
}

export function useTrendForecasts() {
  return useQuery({
    queryKey: ['trend-forecasts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trend_forecasts')
        .select('*, fashion_trends(*)')
        .order('forecast_date', { ascending: true });
      
      if (error) throw error;
      return data as (TrendForecast & { fashion_trends: FashionTrend })[];
    }
  });
}

// Competitor Intelligence Hooks
export function useCompetitorProducts(category?: string) {
  return useQuery({
    queryKey: ['competitor-products', category],
    queryFn: async () => {
      let query = supabase
        .from('competitor_products')
        .select('*')
        .order('price_difference', { ascending: true });
      
      if (category) query = query.eq('category', category);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CompetitorProduct[];
    }
  });
}

export function useCompetitorDeals(activeOnly?: boolean) {
  return useQuery({
    queryKey: ['competitor-deals', activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('competitor_deals')
        .select('*')
        .order('end_date', { ascending: true });
      
      if (activeOnly) {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('end_date', today);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CompetitorDeal[];
    }
  });
}

export function useCompetitiveMetrics() {
  return useQuery({
    queryKey: ['competitive-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitive_metrics')
        .select('*')
        .order('metric_date', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data as CompetitiveMetric[];
    }
  });
}

// Insights Hooks
export function useInsights(type?: InsightType) {
  return useQuery({
    queryKey: ['insights', type],
    queryFn: async () => {
      let query = supabase
        .from('insights')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (type) query = query.eq('type', type);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Insight[];
    }
  });
}

export function useMarkInsightActioned() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('insights')
        .update({ is_actioned: true, actioned_at: new Date().toISOString() })
        .eq('id', insightId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    }
  });
}

// Alerts Hooks
export function useAlerts(status?: AlertStatus) {
  return useQuery({
    queryKey: ['alerts', status],
    queryFn: async () => {
      let query = supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (status) query = query.eq('status', status);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Alert[];
    }
  });
}

export function useUpdateAlertStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ alertId, status }: { alertId: string; status: AlertStatus }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'acknowledged') updates.acknowledged_at = new Date().toISOString();
      if (status === 'resolved') updates.resolved_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('alerts')
        .update(updates)
        .eq('id', alertId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    }
  });
}

// Dashboard Stats Hook
export function useDashboardStats(): { data: DashboardStats | undefined; isLoading: boolean } {
  const { data: sentimentTrends, isLoading: loadingSentiment } = useSentimentTrends();
  const { data: fashionTrends, isLoading: loadingTrends } = useFashionTrends();
  const { data: competitiveMetrics, isLoading: loadingMetrics } = useCompetitiveMetrics();
  const { data: alerts, isLoading: loadingAlerts } = useAlerts('active');

  const isLoading = loadingSentiment || loadingTrends || loadingMetrics || loadingAlerts;

  if (isLoading) {
    return { data: undefined, isLoading: true };
  }

  // Calculate stats from real data or return defaults
  const latestSentiment = sentimentTrends?.[0];
  const totalReviews = latestSentiment 
    ? latestSentiment.positive_count + latestSentiment.negative_count + latestSentiment.neutral_count 
    : 0;
  const positiveRatio = totalReviews > 0 
    ? (latestSentiment!.positive_count / totalReviews) * 100 
    : 72;

  const latestMetric = competitiveMetrics?.[0];
  
  return {
    data: {
      overallSentiment: Math.round(positiveRatio),
      sentimentChange: 2.3,
      activeTrends: fashionTrends?.filter(t => t.status === 'emerging' || t.status === 'peaking').length || 0,
      trendsChange: 5,
      priceCompetitiveness: latestMetric?.price_competitiveness_score || 78,
      priceChange: -1.2,
      activeAlerts: alerts?.length || 0,
      alertsChange: 3
    },
    isLoading: false
  };
}

// Realtime subscriptions
export function useRealtimeAlerts(callback: (alert: Alert) => void) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['realtime-alerts-subscription'],
    queryFn: async () => {
      const channel = supabase
        .channel('alerts-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'alerts' },
          (payload) => {
            callback(payload.new as Alert);
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
          }
        )
        .subscribe();

      return channel;
    },
    staleTime: Infinity
  });
}
