-- Let the tables say "not known".
--
-- The scrapers used to guarantee a value for these columns by inventing one: a
-- random date inside a hardcoded window, defaults of 'millennial' and 'metro',
-- Math.random() for the inventory match, and 0.7 + random() * 0.2 for forecast
-- confidence. Because a value was always supplied, NOT NULL was never a problem.
--
-- Now that the scrapers write null when they do not know, the constraints have to
-- allow it, or every honest insert fails. review_date is the one that actually
-- bites: most store-front reviews carry no date at all.
--
-- DROP NOT NULL on an already-nullable column is a no-op, so this is safe to
-- re-run.

BEGIN;

ALTER TABLE public.sentiment_reviews ALTER COLUMN review_date     DROP NOT NULL;
ALTER TABLE public.sentiment_reviews ALTER COLUMN customer_cohort DROP NOT NULL;
ALTER TABLE public.sentiment_reviews ALTER COLUMN region          DROP NOT NULL;
ALTER TABLE public.sentiment_reviews ALTER COLUMN theme           DROP NOT NULL;
ALTER TABLE public.sentiment_reviews ALTER COLUMN source          DROP NOT NULL;

ALTER TABLE public.fashion_trends ALTER COLUMN myntra_inventory_match DROP NOT NULL;
ALTER TABLE public.fashion_trends ALTER COLUMN regional_popularity    DROP NOT NULL;

ALTER TABLE public.trend_forecasts ALTER COLUMN confidence_score DROP NOT NULL;

ALTER TABLE public.competitor_products ALTER COLUMN myntra_equivalent_price DROP NOT NULL;
ALTER TABLE public.competitor_products ALTER COLUMN price_difference        DROP NOT NULL;
ALTER TABLE public.competitor_products ALTER COLUMN original_price          DROP NOT NULL;
ALTER TABLE public.competitor_products ALTER COLUMN discount_percentage     DROP NOT NULL;

ALTER TABLE public.competitor_deals ALTER COLUMN estimated_conversion_impact DROP NOT NULL;

COMMIT;
