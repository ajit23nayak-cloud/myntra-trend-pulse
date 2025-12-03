-- Create enums for various statuses and types
CREATE TYPE public.sentiment_type AS ENUM ('positive', 'negative', 'neutral');
CREATE TYPE public.sentiment_theme AS ENUM ('product_quality', 'pricing', 'delivery', 'returns', 'customer_service', 'app_usability');
CREATE TYPE public.trend_status AS ENUM ('emerging', 'established', 'peaking', 'cooling');
CREATE TYPE public.trend_platform AS ENUM ('tiktok', 'instagram', 'pinterest', 'youtube', 'google_trends');
CREATE TYPE public.impact_level AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE public.insight_type AS ENUM ('urgent', 'opportunity', 'trend', 'alert');
CREATE TYPE public.customer_cohort AS ENUM ('gen_z', 'millennial', 'gen_x', 'new_user', 'returning_user', 'loyal_user');
CREATE TYPE public.region_type AS ENUM ('metro', 'tier_1', 'tier_2', 'tier_3');
CREATE TYPE public.alert_status AS ENUM ('active', 'acknowledged', 'resolved');

-- Sentiment Analysis Tables
CREATE TABLE public.sentiment_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  source_url TEXT,
  review_text TEXT NOT NULL,
  sentiment sentiment_type NOT NULL,
  sentiment_score DECIMAL(3,2) NOT NULL CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  theme sentiment_theme,
  key_phrases TEXT[],
  customer_cohort customer_cohort,
  region region_type,
  product_category TEXT,
  product_id TEXT,
  review_date TIMESTAMPTZ NOT NULL,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.sentiment_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  theme sentiment_theme,
  product_category TEXT,
  cohort customer_cohort,
  region region_type,
  positive_count INTEGER NOT NULL DEFAULT 0,
  negative_count INTEGER NOT NULL DEFAULT 0,
  neutral_count INTEGER NOT NULL DEFAULT 0,
  avg_sentiment_score DECIMAL(3,2),
  review_velocity DECIMAL(10,2),
  top_key_phrases JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.key_phrase_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phrase TEXT NOT NULL,
  theme sentiment_theme,
  occurrence_count INTEGER NOT NULL DEFAULT 0,
  sentiment_avg DECIMAL(3,2),
  first_seen DATE NOT NULL,
  last_seen DATE NOT NULL,
  trend_direction TEXT CHECK (trend_direction IN ('rising', 'falling', 'stable')),
  is_pain_point BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fashion Trend Detection Tables
CREATE TABLE public.fashion_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_name TEXT NOT NULL,
  description TEXT,
  status trend_status NOT NULL DEFAULT 'emerging',
  platforms trend_platform[] NOT NULL,
  hashtags TEXT[],
  keywords TEXT[],
  growth_rate DECIMAL(5,2),
  velocity_score DECIMAL(5,2),
  predicted_lifespan_weeks INTEGER,
  peak_prediction_date DATE,
  myntra_inventory_match DECIMAL(5,2),
  regional_popularity JSONB,
  first_detected DATE NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.trend_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id UUID REFERENCES public.fashion_trends(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  social_mentions INTEGER NOT NULL DEFAULT 0,
  myntra_searches INTEGER NOT NULL DEFAULT 0,
  platform_breakdown JSONB,
  regional_breakdown JSONB,
  acceleration_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trend_id, metric_date)
);

CREATE TABLE public.trend_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id UUID REFERENCES public.fashion_trends(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL,
  predicted_status trend_status,
  confidence_score DECIMAL(3,2),
  predicted_growth DECIMAL(5,2),
  recommendation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Competitive Intelligence Tables
CREATE TABLE public.competitor_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor TEXT NOT NULL DEFAULT 'AJIO',
  product_name TEXT NOT NULL,
  product_url TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  brand TEXT,
  current_price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  discount_percentage DECIMAL(5,2),
  myntra_equivalent_price DECIMAL(10,2),
  price_difference DECIMAL(10,2),
  in_stock BOOLEAN DEFAULT true,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.competitor_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor TEXT NOT NULL DEFAULT 'AJIO',
  deal_name TEXT NOT NULL,
  deal_type TEXT,
  category TEXT,
  discount_value TEXT,
  start_date DATE,
  end_date DATE,
  impact_level impact_level NOT NULL DEFAULT 'medium',
  estimated_conversion_impact DECIMAL(5,2),
  is_flash_sale BOOLEAN DEFAULT false,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.competitor_products(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.competitive_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  category TEXT,
  avg_price_gap DECIMAL(10,2),
  myntra_cheaper_count INTEGER DEFAULT 0,
  ajio_cheaper_count INTEGER DEFAULT 0,
  price_competitiveness_score DECIMAL(5,2),
  deal_intensity_score DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Actionable Insights Tables
CREATE TABLE public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type insight_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  impact_level impact_level NOT NULL,
  estimated_revenue_impact DECIMAL(12,2),
  recommendation TEXT,
  action_items JSONB,
  data_source TEXT,
  confidence_score DECIMAL(3,2),
  is_actioned BOOLEAN DEFAULT false,
  actioned_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  severity impact_level NOT NULL,
  status alert_status NOT NULL DEFAULT 'active',
  source TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  metadata JSONB,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dashboard Configuration Tables
CREATE TABLE public.dashboard_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  team_type TEXT CHECK (team_type IN ('merchandising', 'marketing', 'operations', 'product')),
  visible_widgets JSONB,
  default_timeframe TEXT DEFAULT 'weekly',
  default_region region_type,
  notification_preferences JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Data Quality Tables
CREATE TABLE public.scrape_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  scrape_type TEXT NOT NULL,
  status TEXT NOT NULL,
  records_processed INTEGER DEFAULT 0,
  errors JSONB,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sentiment_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_phrase_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fashion_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitive_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrape_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read for dashboard data, authenticated write)
CREATE POLICY "Allow public read on sentiment_reviews" ON public.sentiment_reviews FOR SELECT USING (true);
CREATE POLICY "Allow public read on sentiment_trends" ON public.sentiment_trends FOR SELECT USING (true);
CREATE POLICY "Allow public read on key_phrase_trends" ON public.key_phrase_trends FOR SELECT USING (true);
CREATE POLICY "Allow public read on fashion_trends" ON public.fashion_trends FOR SELECT USING (true);
CREATE POLICY "Allow public read on trend_metrics" ON public.trend_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public read on trend_forecasts" ON public.trend_forecasts FOR SELECT USING (true);
CREATE POLICY "Allow public read on competitor_products" ON public.competitor_products FOR SELECT USING (true);
CREATE POLICY "Allow public read on competitor_deals" ON public.competitor_deals FOR SELECT USING (true);
CREATE POLICY "Allow public read on price_history" ON public.price_history FOR SELECT USING (true);
CREATE POLICY "Allow public read on competitive_metrics" ON public.competitive_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public read on insights" ON public.insights FOR SELECT USING (true);
CREATE POLICY "Allow public read on alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Allow public read on scrape_logs" ON public.scrape_logs FOR SELECT USING (true);
CREATE POLICY "Allow public read on dashboard_preferences" ON public.dashboard_preferences FOR SELECT USING (true);

-- Service role policies for edge functions to write data
CREATE POLICY "Allow service role insert on sentiment_reviews" ON public.sentiment_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role insert on sentiment_trends" ON public.sentiment_trends FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role insert on key_phrase_trends" ON public.key_phrase_trends FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role insert on fashion_trends" ON public.fashion_trends FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role insert on trend_metrics" ON public.trend_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role insert on trend_forecasts" ON public.trend_forecasts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role insert on competitor_products" ON public.competitor_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role insert on competitor_deals" ON public.competitor_deals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role insert on price_history" ON public.price_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role insert on competitive_metrics" ON public.competitive_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role insert on insights" ON public.insights FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role insert on alerts" ON public.alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role insert on scrape_logs" ON public.scrape_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role insert on dashboard_preferences" ON public.dashboard_preferences FOR INSERT WITH CHECK (true);

-- Update policies for insights and alerts (allow public to mark as actioned/resolved)
CREATE POLICY "Allow public update on insights" ON public.insights FOR UPDATE USING (true);
CREATE POLICY "Allow public update on alerts" ON public.alerts FOR UPDATE USING (true);
CREATE POLICY "Allow public update on dashboard_preferences" ON public.dashboard_preferences FOR UPDATE USING (true);

-- Create indexes for performance
CREATE INDEX idx_sentiment_reviews_date ON public.sentiment_reviews(review_date);
CREATE INDEX idx_sentiment_reviews_theme ON public.sentiment_reviews(theme);
CREATE INDEX idx_sentiment_reviews_cohort ON public.sentiment_reviews(customer_cohort);
CREATE INDEX idx_sentiment_trends_period ON public.sentiment_trends(period_start, period_end);
CREATE INDEX idx_fashion_trends_status ON public.fashion_trends(status);
CREATE INDEX idx_trend_metrics_date ON public.trend_metrics(metric_date);
CREATE INDEX idx_competitor_products_category ON public.competitor_products(category);
CREATE INDEX idx_competitor_deals_dates ON public.competitor_deals(start_date, end_date);
CREATE INDEX idx_insights_type ON public.insights(type);
CREATE INDEX idx_alerts_status ON public.alerts(status);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.insights;