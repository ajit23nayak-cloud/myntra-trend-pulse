-- Turn on scheduled scraping.
--
-- OPTIONAL and deliberately NOT in supabase/migrations/, so it is never applied
-- automatically. Run it by hand in Lovable's Cloud → SQL editor.
-- scheduling/disable_scheduled_scrapes.sql switches it back off.
--
-- Why it matters: without this, data only moves when someone opens the dashboard
-- and presses Refresh All. Left alone the tables went five weeks stale, and the
-- Overview header turns amber past 24 hours to say so.
--
-- Cadence is chosen to keep the newest completed run under 24 hours old, so the
-- staleness warning stays off, while making as few Firecrawl calls as possible.
-- Every run spends credits, so this is deliberately lighter than "as often as
-- possible": roughly 40 fetches a day rather than 80.
--
--   competitor data   twice a day   ~9 search calls per run
--   reviews           twice a day   ~7 page fetches per run
--   trends            once a day    ~9 page fetches per run
--   insights          twice a day   no fetches, reads what the others stored
--
-- Times are UTC and staggered so the scrapers never contend for the same rate
-- limit, with generate-insights running after them.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Re-running this should replace the jobs, not stack duplicates.
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

-- 02:00 and 14:00 UTC
SELECT cron.schedule(
  'trendpulse-scrape-competitor-data',
  '0 2,14 * * *',
  $$
  SELECT net.http_post(
    url     := 'https://ymqvtwjubhbxsmgylabc.lovable.cloud/functions/v1/scrape-competitor-data',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := '{}'::jsonb
  );
  $$
);

-- 02:30 and 14:30 UTC
SELECT cron.schedule(
  'trendpulse-scrape-reviews',
  '30 2,14 * * *',
  $$
  SELECT net.http_post(
    url     := 'https://ymqvtwjubhbxsmgylabc.lovable.cloud/functions/v1/scrape-reviews',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := '{}'::jsonb
  );
  $$
);

-- 03:00 UTC daily. Fashion trends move more slowly than prices.
SELECT cron.schedule(
  'trendpulse-scrape-trends',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url     := 'https://ymqvtwjubhbxsmgylabc.lovable.cloud/functions/v1/scrape-trends',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := '{}'::jsonb
  );
  $$
);

-- 04:00 and 15:00 UTC, after the scrapers that fill the tables it reads.
SELECT cron.schedule(
  'trendpulse-generate-insights',
  '0 4,15 * * *',
  $$
  SELECT net.http_post(
    url     := 'https://ymqvtwjubhbxsmgylabc.lovable.cloud/functions/v1/generate-insights',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := '{}'::jsonb
  );
  $$
);

COMMIT;

-- Confirm the jobs registered:
--   select jobname, schedule, active from cron.job where jobname like 'trendpulse-%';
--
-- See recent runs and failures. A scrape that finds nothing now records
-- status 'failed' with a reason rather than claiming success:
--   select source, status, records_processed, errors, created_at
--   from scrape_logs order by created_at desc limit 20;
