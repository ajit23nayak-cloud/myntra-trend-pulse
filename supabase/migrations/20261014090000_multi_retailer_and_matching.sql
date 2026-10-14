-- Turn one-sided AJIO monitoring into actual competitive intelligence.
--
-- Until now competitor_products held a single retailer and the Myntra side of
-- every comparison was null, so price gap, SKU comparison and inventory match
-- were all structurally dead. The table already carries a `competitor` column
-- and price_history already exists; neither was used.
--
-- This adds what is missing to compare like with like, and to see movement
-- rather than a single snapshot.

BEGIN;

-- 1. Which rows are ours. Myntra is scraped as one more retailer, so the only
--    thing that distinguishes it is this flag.
ALTER TABLE public.competitor_products
  ADD COLUMN IF NOT EXISTS is_own_brand BOOLEAN NOT NULL DEFAULT false;

-- 2. Cross-retailer product identity.
--
--    Two listings are treated as the same product when their match_key agrees.
--    The key is brand plus the three longest meaningful words of the title,
--    lowercased and sorted, so "Nike Men Court Vision Low Lace Up Sneakers" and
--    "Nike Court Vision Low Sneakers For Men" land on the same key.
--
--    This is a heuristic and it will both miss pairs and occasionally join two
--    different colourways. normalized_title is kept alongside so a mismatch can
--    be seen rather than guessed at.
ALTER TABLE public.competitor_products
  ADD COLUMN IF NOT EXISTS match_key TEXT;

ALTER TABLE public.competitor_products
  ADD COLUMN IF NOT EXISTS normalized_title TEXT;

CREATE INDEX IF NOT EXISTS competitor_products_match_key_idx
  ON public.competitor_products (match_key)
  WHERE match_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS competitor_products_competitor_idx
  ON public.competitor_products (competitor);

-- 3. price_history exists but has never been written to, so every price on the
--    dashboard is a snapshot with no before. An index so "this product over
--    time" is cheap.
CREATE INDEX IF NOT EXISTS price_history_product_recorded_idx
  ON public.price_history (product_id, recorded_at DESC);

-- 4. The comparison itself, as a view so the frontend does not have to
--    reimplement the join. One row per own-brand product per competitor
--    listing that shares its match_key.
--
--    price_gap is positive when the competitor is dearer than us.
CREATE OR REPLACE VIEW public.product_price_comparison AS
SELECT
  own.id                AS own_product_id,
  rival.id              AS competitor_product_id,
  own.match_key,
  own.brand,
  own.category,
  own.product_name      AS own_product_name,
  own.product_url       AS own_product_url,
  own.current_price     AS own_price,
  rival.competitor      AS competitor,
  rival.product_name    AS competitor_product_name,
  rival.product_url     AS competitor_product_url,
  rival.current_price   AS competitor_price,
  rival.current_price - own.current_price AS price_gap,
  ROUND(
    ((rival.current_price - own.current_price) / NULLIF(own.current_price, 0)) * 100,
    1
  )                     AS price_gap_percent,
  GREATEST(own.scraped_at, rival.scraped_at) AS compared_at
FROM public.competitor_products own
JOIN public.competitor_products rival
  ON rival.match_key = own.match_key
 AND rival.is_own_brand = false
WHERE own.is_own_brand = true
  AND own.match_key IS NOT NULL;

-- Views inherit the querying user's permissions on the underlying tables, and
-- competitor_products is already publicly readable, but the grant has to be
-- explicit for PostgREST to expose it.
GRANT SELECT ON public.product_price_comparison TO anon, authenticated;

-- 5. Existing rows predate all of this: they are AJIO-only, have no match key,
--    and carry a myntra_equivalent_price of null. Leave them; the next scrape
--    rewrites them with keys.
COMMIT;
