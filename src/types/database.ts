// Database types for the Myntra Trend Pulse Dashboard

export type SentimentType = 'positive' | 'negative' | 'neutral';
export type SentimentTheme = 'product_quality' | 'pricing' | 'delivery' | 'returns' | 'customer_service' | 'app_usability';
export type TrendStatus = 'emerging' | 'established' | 'peaking' | 'cooling';
export type TrendPlatform = 'tiktok' | 'instagram' | 'pinterest' | 'youtube' | 'google_trends';
export type ImpactLevel = 'critical' | 'high' | 'medium' | 'low';
export type InsightType = 'urgent' | 'opportunity' | 'trend' | 'alert';
export type CustomerCohort = 'gen_z' | 'millennial' | 'gen_x' | 'new_user' | 'returning_user' | 'loyal_user';
export type RegionType = 'metro' | 'tier_1' | 'tier_2' | 'tier_3';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface SentimentReview {
  id: string;
  source: string;
  source_url?: string;
  review_text: string;
  sentiment: SentimentType;
  sentiment_score: number;
  theme?: SentimentTheme;
  key_phrases?: string[];
  customer_cohort?: CustomerCohort;
  region?: RegionType;
  product_category?: string;
  product_id?: string;
  review_date: string;
  scraped_at: string;
  created_at: string;
}

export interface SentimentTrend {
  id: string;
  period_start: string;
  period_end: string;
  theme?: SentimentTheme;
  product_category?: string;
  cohort?: CustomerCohort;
  region?: RegionType;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  avg_sentiment_score?: number;
  review_velocity?: number;
  top_key_phrases?: Record<string, number>;
  created_at: string;
}

export interface KeyPhraseTrend {
  id: string;
  phrase: string;
  theme?: SentimentTheme;
  occurrence_count: number;
  sentiment_avg?: number;
  first_seen: string;
  last_seen: string;
  trend_direction?: 'rising' | 'falling' | 'stable';
  is_pain_point: boolean;
  created_at: string;
}

export interface FashionTrend {
  id: string;
  trend_name: string;
  description?: string;
  status: TrendStatus;
  platforms: TrendPlatform[];
  hashtags?: string[];
  keywords?: string[];
  growth_rate?: number;
  velocity_score?: number;
  predicted_lifespan_weeks?: number;
  peak_prediction_date?: string;
  myntra_inventory_match?: number;
  regional_popularity?: Record<string, number>;
  first_detected: string;
  last_updated: string;
  created_at: string;
}

export interface TrendMetric {
  id: string;
  trend_id: string;
  metric_date: string;
  social_mentions: number;
  myntra_searches: number;
  platform_breakdown?: Record<string, number>;
  regional_breakdown?: Record<string, number>;
  acceleration_rate?: number;
  created_at: string;
}

export interface TrendForecast {
  id: string;
  trend_id: string;
  forecast_date: string;
  predicted_status?: TrendStatus;
  confidence_score?: number;
  predicted_growth?: number;
  recommendation?: string;
  created_at: string;
}

export interface CompetitorProduct {
  id: string;
  competitor: string;
  product_name: string;
  product_url?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  current_price: number;
  original_price?: number;
  discount_percentage?: number;
  myntra_equivalent_price?: number;
  price_difference?: number;
  in_stock: boolean;
  scraped_at: string;
  created_at: string;
}

export interface CompetitorDeal {
  id: string;
  competitor: string;
  deal_name: string;
  deal_type?: string;
  category?: string;
  discount_value?: string;
  start_date?: string;
  end_date?: string;
  impact_level: ImpactLevel;
  estimated_conversion_impact?: number;
  is_flash_sale: boolean;
  scraped_at: string;
  created_at: string;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  price: number;
  discount_percentage?: number;
  recorded_at: string;
}

export interface CompetitiveMetric {
  id: string;
  metric_date: string;
  category?: string;
  avg_price_gap?: number;
  myntra_cheaper_count: number;
  ajio_cheaper_count: number;
  price_competitiveness_score?: number;
  deal_intensity_score?: number;
  created_at: string;
}

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  category?: string;
  impact_level: ImpactLevel;
  estimated_revenue_impact?: number;
  recommendation?: string;
  action_items?: { item: string; priority: string }[];
  data_source?: string;
  confidence_score?: number;
  is_actioned: boolean;
  actioned_at?: string;
  expires_at?: string;
  created_at: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: string;
  severity: ImpactLevel;
  status: AlertStatus;
  source?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  metadata?: Record<string, unknown>;
  acknowledged_at?: string;
  resolved_at?: string;
  created_at: string;
}

export interface DashboardPreference {
  id: string;
  user_id?: string;
  team_type?: 'merchandising' | 'marketing' | 'operations' | 'product';
  visible_widgets?: string[];
  default_timeframe: string;
  default_region?: RegionType;
  notification_preferences?: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface ScrapeLog {
  id: string;
  source: string;
  scrape_type: string;
  status: string;
  records_processed: number;
  errors?: Record<string, unknown>;
  started_at: string;
  completed_at?: string;
  created_at: string;
}

// Dashboard stats computed from database
export interface DashboardStats {
  overallSentiment: number;
  sentimentChange: number;
  activeTrends: number;
  trendsChange: number;
  priceCompetitiveness: number;
  priceChange: number;
  activeAlerts: number;
  alertsChange: number;
}

// Timeframe options for filtering
export type TimeframeOption = 'daily' | 'weekly' | 'monthly' | 'quarterly';
