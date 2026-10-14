import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Retailers to read, including our own.
 *
 * Myntra is scraped exactly like the others. Without it there is no left-hand
 * side to any comparison, which is why price gap, SKU comparison and inventory
 * match were all dead: the table held AJIO only and the Myntra column was null.
 *
 * `productUrl` captures the slug and the id from a product link. The slug is the
 * product name, which is far cleaner than the surrounding markdown.
 */
const RETAILERS = [
  {
    name: 'Myntra',
    site: 'myntra.com',
    isOwnBrand: true,
    productUrl: /https?:\/\/(?:www\.)?myntra\.com\/[^\s)]*?\/([a-z0-9-]{8,})\/(\d{4,})\/buy/i,
    buildUrl: (slug: string, id: string) => `https://www.myntra.com/${slug}/${id}/buy`,
  },
  {
    name: 'AJIO',
    site: 'ajio.com',
    isOwnBrand: false,
    productUrl: /https?:\/\/(?:www\.)?ajio\.com\/([a-z0-9-]{8,})\/p\/(\d+)/i,
    buildUrl: (slug: string, id: string) => `https://www.ajio.com/${slug}/p/${id}`,
  },
  {
    name: 'Nykaa Fashion',
    site: 'nykaafashion.com',
    isOwnBrand: false,
    productUrl: /https?:\/\/(?:www\.)?nykaafashion\.com\/([a-z0-9-]{8,})\/p\/(\d+)/i,
    buildUrl: (slug: string, id: string) => `https://www.nykaafashion.com/${slug}/p/${id}`,
  },
  {
    name: 'Tata CLiQ',
    site: 'tatacliq.com',
    isOwnBrand: false,
    productUrl: /https?:\/\/(?:www\.)?tatacliq\.com\/([a-z0-9-]{8,})\/p-([a-z0-9]+)/i,
    buildUrl: (slug: string, id: string) => `https://www.tatacliq.com/${slug}/p-${id}`,
  },
];

/**
 * Brands every one of these retailers carries, and the sampling frame.
 *
 * Coverage was category-led first ("women tops", "men shirts"). That returned
 * real products but no comparable ones, because Myntra's own search surfaces its
 * private labels — Moda Rapido, Baesd, Ed A Mamma are Myntra-owned and are not
 * sold on AJIO at all, so they can never pair up.
 *
 * Tracking third-party brands that all four retailers stock is what makes a
 * like-for-like comparison possible, and it is a sampling frame you can state
 * plainly: these brands, these retailers, refreshed twice a day.
 */
const TRACKED_BRANDS = [
  { query: 'Nike shoes price', category: 'Footwear' },
  { query: 'Puma shoes price', category: 'Footwear' },
  { query: 'Adidas shoes price', category: 'Footwear' },
  { query: 'Levis jeans price', category: 'Jeans' },
  { query: 'Jack Jones shirt price', category: 'Men Shirts' },
];

/**
 * Words that cannot be part of a brand name, used to find where the brand ends.
 *
 * Indian fashion listings put the brand first and then describe the garment:
 * "Baesd Girls Floral Printed Ruffles Cotton Top". So the brand is the leading
 * words up to the first gender, colour or garment word.
 *
 * A fixed list of known brands was tried first and failed badly — it carried
 * about 25 big names, while real catalogues run to thousands, so 153 of 161
 * scraped products came back with no brand and therefore no match key at all.
 */
const DESCRIPTOR_STOP = new Set(`men women girls boys kids unisex boy girl
black white red green blue cream yellow navy maroon purple pink indigo grey gray beige olive brown orange teal
crop cowl ribbed regular slim sleeveless floral printed print half full short long solid striped
round square neck collar pack cotton polyester linen denim silk wool blend
fit oversized relaxed casual formal trendy pleated ruffle ruffles flutter lace net peplum boho
top tops tshirt shirt blouse dress kurta jeans trousers pants shorts skirt sneakers shoes sandals
sleeves sleeve typographic leaf polka dots zip hem detail piping wrapped`.split(/\s+/));

/** Leading words of a title, up to the first descriptor, capped at three. */
function extractBrand(title: string): string | null {
  const brand: string[] = [];
  for (const word of title.trim().split(/\s+/)) {
    if (DESCRIPTOR_STOP.has(word.toLowerCase().replace(/[^a-z]/g, ''))) break;
    brand.push(word);
    if (brand.length === 3) break;
  }
  return brand.length ? brand.join(' ') : null;
}


/** Words too common to identify a product. */
const STOPWORDS = new Set(['the', 'and', 'for', 'with', 'from', 'your', 'our']);

/**
 * Cross-retailer product identity.
 *
 * Brand plus the three longest meaningful words of the title, lowercased and
 * sorted, so "Nike Men Court Vision Low Lace Up Sneakers" and "Nike Court Vision
 * Low Sneakers For Men" produce the same key.
 *
 * A heuristic, and an honest one: it will miss pairs that word things very
 * differently, and can occasionally join two colourways of the same style. The
 * normalised title is stored next to it so a bad match can be seen rather than
 * guessed at. Returns null when there is not enough to go on, and a null key
 * simply never matches.
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    // Apparel spelling variants that otherwise split the same product in two:
    // "T Shirt" / "T-Shirt" / "Tshirt", and the possessive forms of men/women.
    .replace(/\bt[\s-]?shirts?\b/g, 'tshirt')
    .replace(/\bmen'?s\b/g, 'men')
    .replace(/\bwomen'?s\b/g, 'women')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** "sneakers" and "sneaker" are the same product; "dress" must not become "dres". */
function singular(token: string): string {
  return token.length > 4 && token.endsWith('s') && !token.endsWith('ss')
    ? token.slice(0, -1)
    : token;
}

function buildMatchKey(brand: string | null, title: string): string | null {
  if (!brand) return null;

  const all = normalizeTitle(title).split(/\s+/);

  // Model numbers distinguish products and must not be dropped. The first live
  // run paired "Nike Men Revolution 6 Running Shoes" with "Nike Men Revolution 8
  // Running Shoes" — different shoes — because digits were filtered out and the
  // remaining words were identical.
  const numbers = [...new Set(all.filter((t) => /^\d{1,4}$/.test(t)))].sort();

  const tokens = all
    .filter((t) => t.length > 2 && !STOPWORDS.has(t) && !/^\d+$/.test(t))
    .map(singular);

  const brandTokens = new Set(normalizeTitle(brand).split(/\s+/).map(singular));
  const distinctive = [...new Set(tokens)]
    .filter((t) => !brandTokens.has(t))
    .sort((a, b) => b.length - a.length)
    .slice(0, 3)
    .sort();

  if (distinctive.length < 2) return null;

  const suffix = numbers.length ? `#${numbers.join('.')}` : '';
  return `${brand.toLowerCase()}|${distinctive.join('-')}${suffix}`;
}

function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Page furniture that appears in search-result markdown but is never a product. */
const MARKUP_LINE = /^(!\[|\||•|[-*#>]\s|\(|https?:|Reference\s*#)/i;

/** Promotional and legal copy that carries a price but describes no product. */
const PROMO_COPY = /(coupon|cart value|t&c|terms and conditions|offer icon|reward|voucher|minimum|additional\s|extra\s|use\s+code|apply\s+code|net order value|edgesuite|access denied|reference\s*#|participating in|capped at|purchase over|flat\s+\d*%)/i;

/**
 * Pull products out of one retailer's scraped page markdown.
 *
 * A line counts only when it carries a rupee price AND either links to a product
 * on that retailer's own domain or names a brand we recognise. The earlier
 * version accepted any line with a rupee figure, which is how banner captions,
 * coupon terms and two Akamai error pages became priced "products".
 */
function parseProducts(
  content: string,
  retailer: typeof RETAILERS[number],
  sourceUrl: string,
  category: string,
): any[] {
  const products: any[] = [];
  const pricePattern = /(?:₹|Rs\.?|INR)\s*([\d,]+)/gi;

  for (const raw of content.split('\n')) {
    const line = raw.trim();
    if (line.length < 8 || line.length > 400) continue;
    if (PROMO_COPY.test(line)) continue;

    const priceMatches = [...line.matchAll(pricePattern)];
    if (priceMatches.length === 0) continue;

    const prices = priceMatches
      .map((m) => parseInt(m[1].replace(/,/g, ''), 10))
      .filter((p) => p > 99 && p < 60000);
    if (prices.length === 0) continue;

    const link = line.match(retailer.productUrl);

    // Without a product link the line still has to look like prose, not markup.
    if (!link && MARKUP_LINE.test(line)) continue;

    let title: string;
    let productUrl: string | null;

    if (link) {
      title = titleFromSlug(link[1]);
      productUrl = retailer.buildUrl(link[1], link[2]);
    } else {
      title = line;
      for (const m of priceMatches) title = title.replace(m[0], ' ');
      title = title
        .replace(/https?:\/\/\S+/g, ' ')
        .replace(/[*_`[\]()]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
      productUrl = /^https?:\/\//i.test(sourceUrl) ? sourceUrl : null;
    }

    const words = title.split(/\s+/).filter((w) => /[a-z]{2,}/i.test(w));
    if (words.length < 2 || title.length < 8) continue;

    const resolvedBrand = extractBrand(title);
    // No brand and no product link means nothing to match on later, and a row
    // that can never be compared is not worth storing.
    if (!resolvedBrand && !link) continue;

    const sorted = [...prices].sort((a, b) => a - b);
    const currentPrice = sorted[0];
    // Only a genuine second price is an original price; inventing one would
    // manufacture a discount nobody observed.
    const originalPrice = sorted.length > 1 ? sorted[sorted.length - 1] : null;

    products.push({
      name: title.slice(0, 160),
      category,
      price: currentPrice,
      originalPrice,
      discount: originalPrice
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        : null,
      brand: resolvedBrand,
      url: productUrl,
      matchKey: buildMatchKey(resolvedBrand, title),
      normalizedTitle: normalizeTitle(title),
    });
  }

  return products;
}

function parseDeals(result: any, retailerName: string): any[] {
  const title = result.title || '';
  const description = result.description || '';
  const url = result.url || '';
  const fullText = `${title} ${description} ${result.markdown || ''}`;

  // Anti-bot and error pages are not deals. AJIO serves Akamai error pages to
  // scrapers whose titles ("Reference #18.8df6d517...") were being stored as
  // deal names, with the leading 18 read as an 18% discount.
  if (/reference\s*#|errors\.edgesuite|access denied|forbidden|not found|captcha/i.test(`${title} ${url} ${description}`)) {
    return [];
  }

  const discounts: number[] = [];
  for (const pattern of [/(\d+)%\s*(?:off|discount|sale)/gi, /(?:up\s*to|upto|flat)\s*(\d+)%/gi]) {
    let m;
    while ((m = pattern.exec(fullText)) !== null) {
      const d = parseInt(m[1], 10);
      if (d >= 10 && d <= 90) discounts.push(d);
    }
  }
  // A deal needs a real discount figure. "sale" alone used to be enough, and the
  // number was then invented as a flat 30%.
  if (discounts.length === 0 || title.length <= 10) return [];

  const maxDiscount = Math.max(...discounts);
  return [{
    name: title.substring(0, 150),
    discount: discounts.length > 1 ? `${Math.min(...discounts)}-${maxDiscount}% Off` : `${maxDiscount}% Off`,
    category: detectCategory(url, fullText),
    type: maxDiscount >= 60 ? 'mega_sale' : maxDiscount >= 40 ? 'seasonal_sale' : 'regular_discount',
    impact: maxDiscount >= 60 ? 'critical' : maxDiscount >= 40 ? 'high' : 'medium',
    isFlashSale: /flash|limited|hour|today|ending|hurry/i.test(fullText),
    retailer: retailerName,
  }];
}

function detectCategory(url: string, text: string): string {
  const categoryMap: Record<string, string> = {
    'sneaker': 'Sneakers', 'shoe': 'Footwear', 'dress': 'Dresses', 'top': 'Tops',
    'shirt': 'Shirts', 'jean': 'Jeans', 'kurta': 'Ethnic Wear', 'ethnic': 'Ethnic Wear',
    'saree': 'Ethnic Wear', 'sport': 'Sportswear', 'winter': 'Winterwear',
    'bag': 'Accessories', 'watch': 'Accessories', 'women': 'Women', 'men': 'Men',
  };
  const combined = `${url} ${text}`.toLowerCase();
  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (combined.includes(keyword)) return category;
  }
  return 'Fashion';
}

async function firecrawlSearch(apiKey: string, query: string): Promise<any[]> {
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit: 6, country: 'in', scrapeOptions: { formats: ['markdown'] } }),
    });
    if (!response.ok) {
      console.error(`search failed (${response.status}): ${query}`);
      return [];
    }
    const json = await response.json();
    const results = json.data ?? json ?? [];
    return Array.isArray(results) ? results : [];
  } catch (err) {
    console.error(`search error: ${query}`, err);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!FIRECRAWL_API_KEY) throw new Error('FIRECRAWL_API_KEY is not configured');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const own = RETAILERS.find((r) => r.isOwnBrand)!;
    const rivals = RETAILERS.filter((r) => !r.isOwnBrand);

    // Every retailer is asked for the same brands, so both sides of a
    // comparison are drawn from the same frame. Searches run concurrently:
    // sequentially this grid exceeds the platform's 150s response limit.
    const gridResults = await Promise.all(
      RETAILERS.flatMap((retailer) =>
        TRACKED_BRANDS.map(async (brand) => {
          const results = await firecrawlSearch(
            FIRECRAWL_API_KEY,
            `site:${retailer.site} ${brand.query}`,
          );
          const found = results.flatMap((r: any) =>
            r.markdown ? parseProducts(r.markdown, retailer, r.url || '', brand.category) : []
          );
          return { retailer, category: brand.category, found };
        })
      )
    );

    const byRetailer = new Map<string, Map<string, any>>();
    const coverage: Record<string, Record<string, number>> = {};

    const addProduct = (retailer: typeof RETAILERS[number], category: string, p: any) => {
      coverage[retailer.name] ??= {};
      coverage[retailer.name][category] = (coverage[retailer.name][category] ?? 0) + 1;
      const bucket = byRetailer.get(retailer.name) ?? new Map();
      const key = (p.url ?? p.name).toLowerCase();
      const existing = bucket.get(key);
      if (!existing || p.price < existing.price) bucket.set(key, { ...p, retailer });
      byRetailer.set(retailer.name, bucket);
    };

    for (const { retailer, category, found } of gridResults) {
      for (const p of found) addProduct(retailer, category, p);
    }

    // Deals, one search per competitor.
    const dealResults = await Promise.all(
      rivals.map(async (retailer) => {
        const results = await firecrawlSearch(
          FIRECRAWL_API_KEY,
          `site:${retailer.site} sale offers discount`,
        );
        return results.flatMap((r: any) => parseDeals(r, retailer.name));
      })
    );


    let productsStored = 0;
    let historyRows = 0;
    const storedByRetailer: Record<string, number> = {};

    for (const [retailerName, bucket] of byRetailer) {
      for (const product of [...bucket.values()].slice(0, 40)) {
        const { data: saved, error } = await supabase
          .from('competitor_products')
          .upsert({
            competitor: retailerName,
            is_own_brand: product.retailer.isOwnBrand,
            product_name: product.name.substring(0, 255),
            category: product.category,
            current_price: product.price,
            original_price: product.originalPrice,
            discount_percentage: product.discount,
            brand: product.brand,
            in_stock: true,
            // Comparison is done by joining on match_key in the
            // product_price_comparison view, not by writing a guessed price here.
            myntra_equivalent_price: null,
            price_difference: null,
            product_url: product.url,
            match_key: product.matchKey,
            normalized_title: product.normalizedTitle,
            scraped_at: new Date().toISOString(),
          }, { onConflict: 'competitor,product_name,category' })
          .select('id')
          .maybeSingle();

        if (error) {
          console.error(`store failed (${retailerName}): ${error.message}`);
          continue;
        }

        productsStored++;
        storedByRetailer[retailerName] = (storedByRetailer[retailerName] ?? 0) + 1;

        // One row per sighting. price_history existed from the start and was
        // never written to, which is why every price was a snapshot with no
        // before and the price timeline had nothing to draw.
        if (saved?.id) {
          const { error: histError } = await supabase.from('price_history').insert({
            product_id: saved.id,
            price: product.price,
            discount_percentage: product.discount,
          });
          if (!histError) historyRows++;
        }
      }
    }

    let dealsStored = 0;
    for (const deal of dealResults.flat().slice(0, 40)) {
      const { error } = await supabase
        .from('competitor_deals')
        .upsert({
          competitor: deal.retailer,
          deal_name: deal.name.substring(0, 255),
          discount_value: deal.discount,
          category: deal.category,
          deal_type: deal.type,
          impact_level: deal.impact,
          is_flash_sale: deal.isFlashSale,
          start_date: new Date().toISOString().split('T')[0],
          end_date: null,
          estimated_conversion_impact: null,
        }, { onConflict: 'competitor,deal_name,category' });
      if (!error) dealsStored++;
    }

    // How many products now have a counterpart on another retailer.
    const { count: matchedPairs } = await supabase
      .from('product_price_comparison')
      .select('*', { count: 'exact', head: true });

    const storedAnything = productsStored + dealsStored > 0;
    const retailersWithData = Object.keys(storedByRetailer);

    await supabase.from('scrape_logs').insert({
      source: `Retail prices (${retailersWithData.join(', ') || 'none'})`,
      scrape_type: 'competitor_data',
      status: storedAnything ? 'completed' : 'failed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      records_processed: productsStored + dealsStored,
      errors: storedAnything && retailersWithData.length === RETAILERS.length ? null : {
        retailers_attempted: RETAILERS.map((r) => r.name),
        retailers_with_data: retailersWithData,
        coverage,
        note: storedAnything
          ? 'Some retailers returned nothing; they most likely served an anti-bot page.'
          : 'No product or deal survived validation across any retailer.',
      },
    });

    if (!storedAnything) {
      await supabase.from('alerts').insert({
        title: 'Price collection returned nothing',
        message: `No retailer returned a usable product. Attempted: ${RETAILERS.map((r) => r.name).join(', ')}.`,
        type: 'competitor_alert',
        severity: 'high',
        source: 'scrape-competitor-data',
      });
    }

    return new Response(JSON.stringify({
      success: storedAnything,
      retailers: RETAILERS.map((r) => r.name),
      products_stored: productsStored,
      stored_by_retailer: storedByRetailer,
      price_history_rows: historyRows,
      deals_stored: dealsStored,
      matched_pairs: matchedPairs ?? 0,
      coverage,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error in scrape-competitor-data:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
