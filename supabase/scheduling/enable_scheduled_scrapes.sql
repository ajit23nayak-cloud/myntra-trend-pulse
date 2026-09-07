-- OPTIONAL. Not a migration, and deliberately not in supabase/migrations/ so it
-- is never applied automatically. Scheduled scraping is OFF by default; the
-- owner refreshes on demand from the Refresh All panel. Run this by hand in the
-- Supabase SQL editor to turn the schedule on, and run
-- scheduling/disable_scheduled_scrapes.sql to turn it back off.
--
-- Run the scrapers on a schedule instead of only when someone clicks Refresh All.
--
-- The README described scheduled scraping, but nothing scheduled anything: the
-- data only moved when a human opened the dashboard and pressed the button. The
-- tables sat six days stale.
--
-- pg_cron runs the schedule inside Postgres and pg_net makes the outbound call.
-- The five functions are declared `verify_jwt = false` in supabase/config.toml,
-- so these calls need no key. That also means anyone can trigger them and spend
-- Firecrawl credits. Closing that off properly means putting a login in front of
-- the dashboard, because the Refresh All button calls the same endpoints from
-- the browser and cannot hold a secret. Left as is deliberately, not overlooked.
--
-- Times are UTC. The scrapers are staggered so they do not contend for the same
-- Firecrawl rate limit, and generate-insights runs last, once the tables it
-- reads have been refreshed.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Re-running this migration should replace the jobs, not stack duplicates.
-- cron.unschedule throws when the job is absent, so check the catalog first.
DO $$
DECLARE
  job text;
BEGIN
  FOREACH job IN ARRAY ARRAY[
    'trendpulse-scrape-competitor-data',
    'trendpulse-scrape-reviews',
    'trendpulse-scrape-trends',
    'trendpulse-generate-insights'
  ]
  LOOP
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = job) THEN
      PERFORM cron.unschedule(job);
    END IF;
  END LOOP;
END;
$$;

-- Competitor pricing moves fastest, so it runs most often: every 6 hours.
SELECT cron.schedule(
  'trendpulse-scrape-competitor-data',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url     := 'https://ymqvtwjubhbxsmgylabc.supabase.co/functions/v1/scrape-competitor-data',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := '{}'::jsonb
  );
  $$
);

-- Reviews every 6 hours, offset 20 minutes to stagger the Firecrawl calls.
SELECT cron.schedule(
  'trendpulse-scrape-reviews',
  '20 */6 * * *',
  $$
  SELECT net.http_post(
    url     := 'https://ymqvtwjubhbxsmgylabc.supabase.co/functions/v1/scrape-reviews',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := '{}'::jsonb
  );
  $$
);

-- Fashion trends move more slowly than prices; twice a day is enough.
SELECT cron.schedule(
  'trendpulse-scrape-trends',
  '40 */12 * * *',
  $$
  SELECT net.http_post(
    url     := 'https://ymqvtwjubhbxsmgylabc.supabase.co/functions/v1/scrape-trends',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := '{}'::jsonb
  );
  $$
);

-- Insights read the tables the three scrapers just filled, so this runs last.
SELECT cron.schedule(
  'trendpulse-generate-insights',
  '0 1,7,13,19 * * *',
  $$
  SELECT net.http_post(
    url     := 'https://ymqvtwjubhbxsmgylabc.supabase.co/functions/v1/generate-insights',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := '{}'::jsonb
  );
  $$
);

COMMIT;

-- To confirm the jobs registered:
--   select jobname, schedule, active from cron.job where jobname like 'trendpulse-%';
--
-- To see recent runs and any failures:
--   select j.jobname, r.status, r.return_message, r.start_time
--   from cron.job_run_details r
--   join cron.job j on j.jobid = r.jobid
--   where j.jobname like 'trendpulse-%'
--   order by r.start_time desc
--   limit 20;
