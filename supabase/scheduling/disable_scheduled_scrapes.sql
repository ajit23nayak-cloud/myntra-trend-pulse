-- Turn scheduled scraping back off.
--
-- Removes the four pg_cron jobs created by enable_scheduled_scrapes.sql and
-- leaves everything else alone. The extensions stay installed; they cost
-- nothing while no job is scheduled. Safe to run when no jobs exist.
--
-- After this, data only refreshes when the owner uses the Refresh All panel.

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
      RAISE NOTICE 'unscheduled %', job;
    END IF;
  END LOOP;
END;
$$;

-- Confirm nothing is left:
--   select jobname, schedule, active from cron.job where jobname like 'trendpulse-%';
