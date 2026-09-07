-- Clear the rows and columns that were manufactured rather than observed.
--
-- Run once, by hand, in Lovable's Cloud → SQL editor. Not a migration: it deletes
-- data, so it should never run automatically.
--
-- Everything here was produced by code that has now been fixed. Re-running the
-- scrapers after this will repopulate the tables with rows that are either real
-- or absent.

BEGIN;

-- 1. competitor_products: none of the 195 rows are products. The parser accepted
--    any line containing a rupee figure, so the table holds banner captions,
--    coupon terms, reward-table rows and two Akamai error pages, each with a
--    price and a fabricated "Myntra equivalent" attached.
DELETE FROM public.competitor_products;

-- 2. competitor_deals: same source. Deal names are error-page references like
--    "Reference #18.8df6d517.1764756034.b64c3ccd", and the leading 18 was read as
--    an 18% discount. These rows fed the "high-impact deals detected" alerts.
DELETE FROM public.competitor_deals;

-- 3. Alerts and insights derived from those rows.
DELETE FROM public.alerts
 WHERE source = 'scrape-competitor-data';

DELETE FROM public.insights
 WHERE data_source = 'competitor-scraper-search';

-- 4. price_history and competitive_metrics were computed from the fabricated
--    Myntra prices, so nothing in them is a real comparison.
DELETE FROM public.price_history;
DELETE FROM public.competitive_metrics;

-- 5. myntra_inventory_match was Math.floor(Math.random() * 50) + 30 on every row.
UPDATE public.fashion_trends
   SET myntra_inventory_match = NULL;

-- 6. trend_forecasts.confidence_score was 0.7 + Math.random() * 0.2, which is why
--    every value sits between 0.70 and 0.90.
UPDATE public.trend_forecasts
   SET confidence_score = NULL;

-- 7. Reviews: the text may well be genuine, but the metadata around it is not.
--    The extraction prompt asked the model to "generate 30-40 reviews" with dates
--    "spread across August to December 2025", and the storage layer then filled
--    any gaps with a random date and defaults of 'millennial' and 'metro'. Every
--    review in the table is dated inside that hardcoded window, and none carries a
--    source_url, so no row can be traced back to anything.
--
--    The text is kept. The invented attributes are cleared.
UPDATE public.sentiment_reviews
   SET review_date     = NULL,
       customer_cohort = NULL,
       region          = NULL;

-- 8. sentiment_trends and key_phrase_trends were aggregated from those dates and
--    cohorts, so the periods they describe never existed.
DELETE FROM public.sentiment_trends;
DELETE FROM public.key_phrase_trends;

COMMIT;

-- After running this, trigger a scrape from the Refresh All panel and check
-- scrape_logs. A run that finds nothing now records status 'failed' with a reason,
-- instead of 'completed' with invented rows.
--
--   select source, status, records_processed, errors, created_at
--   from scrape_logs order by created_at desc limit 10;
