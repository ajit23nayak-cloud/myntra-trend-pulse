-- Stop anonymous visitors writing to the dashboard's tables.
--
-- The original policies were named "Allow service role insert on <table>" but
-- were written as `FOR INSERT WITH CHECK (true)` with no role clause, so they
-- applied to every role including `anon`. The publishable key is in the client
-- bundle and in this public repository, so anyone could insert fabricated
-- trends, reviews, competitor prices, insights and alerts and have the
-- dashboard present them as scraped findings.
--
-- The five edge functions connect with SUPABASE_SERVICE_ROLE_KEY, and the
-- service role bypasses row level security altogether, so dropping these
-- policies does not affect the scrapers. It only removes the anonymous path.
--
-- Public SELECT is deliberately left in place: this is a read-only dashboard
-- over public retail data and it has no sign-in.

BEGIN;

-- 1. Remove the misnamed insert policies. Nothing replaces them; with RLS on
--    and no INSERT policy, only the service role can insert.
DROP POLICY IF EXISTS "Allow service role insert on sentiment_reviews"     ON public.sentiment_reviews;
DROP POLICY IF EXISTS "Allow service role insert on sentiment_trends"      ON public.sentiment_trends;
DROP POLICY IF EXISTS "Allow service role insert on key_phrase_trends"     ON public.key_phrase_trends;
DROP POLICY IF EXISTS "Allow service role insert on fashion_trends"        ON public.fashion_trends;
DROP POLICY IF EXISTS "Allow service role insert on trend_metrics"         ON public.trend_metrics;
DROP POLICY IF EXISTS "Allow service role insert on trend_forecasts"       ON public.trend_forecasts;
DROP POLICY IF EXISTS "Allow service role insert on competitor_products"   ON public.competitor_products;
DROP POLICY IF EXISTS "Allow service role insert on competitor_deals"      ON public.competitor_deals;
DROP POLICY IF EXISTS "Allow service role insert on price_history"         ON public.price_history;
DROP POLICY IF EXISTS "Allow service role insert on competitive_metrics"   ON public.competitive_metrics;
DROP POLICY IF EXISTS "Allow service role insert on insights"              ON public.insights;
DROP POLICY IF EXISTS "Allow service role insert on alerts"                ON public.alerts;
DROP POLICY IF EXISTS "Allow service role insert on scrape_logs"           ON public.scrape_logs;
DROP POLICY IF EXISTS "Allow service role insert on dashboard_preferences" ON public.dashboard_preferences;

-- 2. dashboard_preferences is not read or written by the client at all, so it
--    needs no anonymous update path.
DROP POLICY IF EXISTS "Allow public update on dashboard_preferences" ON public.dashboard_preferences;

-- 3. The dashboard does need two anonymous updates: acknowledging or resolving
--    an alert, and marking an insight actioned. Both stay, but row level
--    security cannot limit *which columns* an update touches, and an
--    unrestricted UPDATE would let anyone rewrite an alert's title and message
--    into arbitrary text shown on the dashboard.
--
--    Column level grants do that part. Revoke the blanket table grant, then
--    grant back only the workflow columns.
REVOKE UPDATE ON public.alerts   FROM anon, authenticated;
REVOKE UPDATE ON public.insights FROM anon, authenticated;

GRANT UPDATE (status, acknowledged_at, resolved_at)
  ON public.alerts TO anon, authenticated;

GRANT UPDATE (is_actioned, actioned_at)
  ON public.insights TO anon, authenticated;

-- 4. No DELETE policy exists on any table, so with RLS enabled deletes are
--    already denied for anon. Revoke the grant too, so the denial does not
--    depend on a policy staying absent.
REVOKE DELETE ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE INSERT ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

COMMIT;
