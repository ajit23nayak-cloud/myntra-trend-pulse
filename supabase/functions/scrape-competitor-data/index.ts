import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    console.log('Starting AJIO competitor data scraping via search API...');

    // Use Firecrawl search API to find AJIO deals (bypasses anti-bot)
    const searchQueries = [
      'site:ajio.com sale offers discount 2024',
      'site:ajio.com flash sale deals today',
      'AJIO current promotions discounts India fashion',
      'AJIO clearance sale offers clothing',
    ];

    const deals: any[] = [];
    const products: any[] = [];
    let successfulSearches = 0;

    // Search for deals using Firecrawl search API
    for (const query of searchQueries) {
      try {
        console.log(`Searching: ${query}`);
        const response = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query,
            limit: 10,
            country: 'in',
            scrapeOptions: {
              formats: ['markdown'],
            },
          }),
        });

        if (response.ok) {
          const searchResult = await response.json();
          const results = searchResult.data || searchResult || [];
          
          if (Array.isArray(results) && results.length > 0) {
            successfulSearches++;
            console.log(`✓ Found ${results.length} results for: ${query}`);
            
            for (const result of results) {
              const parsedDeals = parseDealsFromSearchResult(result);
              deals.push(...parsedDeals);
              
              if (result.markdown) {
                const parsedProducts = parseProductsFromContent(result.markdown, result.url || '');
                products.push(...parsedProducts);
              }
            }
          } else {
            console.log(`✗ No results array for: ${query}`);
          }
        } else {
          const errorText = await response.text();
          console.error(`✗ Search failed for "${query}": ${response.status} - ${errorText}`);
        }
      } catch (err) {
        console.error(`✗ Search error for "${query}":`, err);
      }
    }

    // Search for specific product categories
    const categorySearches = [
      { query: 'AJIO women tops price discount sale', category: 'Women Tops' },
      { query: 'AJIO men shirts price discount offer', category: 'Men Shirts' },
      { query: 'AJIO women dresses price discount', category: 'Women Dresses' },
      { query: 'AJIO sneakers shoes price discount', category: 'Sneakers' },
      { query: 'AJIO ethnic wear kurta price discount', category: 'Ethnic Wear' },
    ];

    for (const { query, category } of categorySearches) {
      try {
        console.log(`Searching category: ${category}`);
        const response = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query,
            limit: 5,
            country: 'in',
            tbs: 'qdr:w',
            scrapeOptions: {
              formats: ['markdown'],
            },
          }),
        });

        if (response.ok) {
          const searchResult = await response.json();
          const results = searchResult.data || searchResult || [];
          
          if (Array.isArray(results)) {
            for (const result of results) {
              if (result.markdown) {
                const categoryProducts = parseProductsFromContent(result.markdown, result.url || '', category);
                products.push(...categoryProducts);
              }
            }
          }
        }
      } catch (err) {
        console.error(`✗ Category search error for "${category}":`, err);
      }
    }

    // Deduplicate deals and products
    const uniqueDeals = deduplicateByKey(deals, 'name');
    const uniqueProducts = deduplicateByKey(products, 'name');

    console.log(`Total unique deals: ${uniqueDeals.length}`);
    console.log(`Total unique products: ${uniqueProducts.length}`);

    // Store deals in database
    let dealsStored = 0;
    for (const deal of uniqueDeals.slice(0, 30)) {
      const { error: dealError } = await supabase
        .from('competitor_deals')
        .upsert({
          competitor: 'AJIO',
          deal_name: deal.name.substring(0, 255),
          discount_value: deal.discount,
          category: deal.category,
          deal_type: deal.type,
          impact_level: deal.impact,
          is_flash_sale: deal.isFlashSale,
          start_date: new Date().toISOString().split('T')[0],
          end_date: deal.endDate,
          estimated_conversion_impact: deal.conversionImpact,
        }, { 
          onConflict: 'competitor,deal_name,category',
          ignoreDuplicates: false 
        });

      if (!dealError) {
        dealsStored++;
      } else {
        console.error('Error storing deal:', dealError.message);
      }
    }

    // Store products in database
    let productsStored = 0;
    for (const product of uniqueProducts.slice(0, 50)) {
      const { error: productError } = await supabase
        .from('competitor_products')
        .upsert({
          competitor: 'AJIO',
          product_name: product.name.substring(0, 255),
          category: product.category,
          current_price: product.price,
          original_price: product.originalPrice,
          discount_percentage: product.discount,
          brand: product.brand,
          in_stock: true,
          // Myntra is never scraped, so there is nothing to compare against. This
          // used to hold AJIO's price multiplied by a per-category constant and a
          // random factor, which made Myntra look dearer by construction and drove
          // a "price competitiveness" figure that measured nothing.
          myntra_equivalent_price: null,
          price_difference: null,
          product_url: product.url,
        }, { 
          onConflict: 'competitor,product_name,category',
          ignoreDuplicates: false 
        });

      if (!productError) {
        productsStored++;
      } else {
        console.error('Error storing product:', productError.message);
      }
    }

    // Create alerts for high-impact deals
    const highImpactDeals = uniqueDeals.filter(d => d.impact === 'high' || d.impact === 'critical');
    if (highImpactDeals.length > 0) {
      await supabase.from('alerts').insert({
        title: `⚠️ AJIO High-Impact Deals Detected`,
        message: `${highImpactDeals.length} high-impact deals found on AJIO. Categories: ${[...new Set(highImpactDeals.map(d => d.category))].join(', ')}. Review competitive pricing strategy immediately.`,
        type: 'competitor_alert',
        severity: highImpactDeals.some(d => d.impact === 'critical') ? 'critical' : 'high',
        source: 'scrape-competitor-data',
        metadata: { 
          deals: highImpactDeals.slice(0, 10).map(d => ({ name: d.name, discount: d.discount, category: d.category })),
          total_deals: uniqueDeals.length,
          scrape_method: 'search_api'
        },
      });
    }

    // No price-gap insight is generated any more. It compared AJIO's price against
    // estimateMyntraPrice(), whose category multipliers were all above 1.0, so the
    // gap was positive by arithmetic and the insight always fired with a hardcoded
    // 0.82 confidence. Restoring it requires actually scraping Myntra.

    // Log the run honestly. A run that stored nothing is a failed run, not a
    // completed one; marking it completed is what let the dashboard report fresh
    // data after every source had been blocked.
    const storedAnything = dealsStored + productsStored > 0;
    await supabase.from('scrape_logs').insert({
      source: 'AJIO Competitor (Search API)',
      scrape_type: 'competitor_data',
      status: storedAnything ? 'completed' : 'failed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      records_processed: dealsStored + productsStored,
      errors: storedAnything && successfulSearches === searchQueries.length ? null : {
        failed_searches: searchQueries.length - successfulSearches,
        products_extracted: uniqueProducts.length,
        products_stored: productsStored,
        deals_stored: dealsStored,
        note: storedAnything
          ? 'Some searches failed.'
          : 'No product or deal survived validation. AJIO most likely served an anti-bot page.',
      },
    });

    return new Response(JSON.stringify({
      success: true,
      method: 'firecrawl_search_api',
      successful_searches: successfulSearches,
      deals_extracted: uniqueDeals.length,
      deals_stored: dealsStored,
      products_extracted: uniqueProducts.length,
      products_stored: productsStored,
      high_impact_deals: highImpactDeals.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scrape-competitor-data:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function parseDealsFromSearchResult(result: any): any[] {
  const deals: any[] = [];
  
  const title = result.title || '';
  const description = result.description || '';
  const url = result.url || '';
  const content = result.markdown || '';
  
  const fullText = `${title} ${description} ${content}`;
  
  // Extract discount percentages
  const discountPatterns = [
    /(\d+)%\s*(?:off|discount|sale)/gi,
    /(?:up\s*to|upto|flat)\s*(\d+)%/gi,
    /(?:min|minimum)\s*(\d+)%/gi,
  ];
  
  const foundDiscounts: number[] = [];
  for (const pattern of discountPatterns) {
    let match;
    while ((match = pattern.exec(fullText)) !== null) {
      const discount = parseInt(match[1] || match[2]);
      if (discount >= 10 && discount <= 90) {
        foundDiscounts.push(discount);
      }
    }
  }
  
  // An anti-bot or error page is not a deal. AJIO serves Akamai error pages to
  // scrapers, and their titles ("Reference #18.8df6d517...") were being stored as
  // deal names with the leading 18 read as an 18% discount. Those rows then fed
  // the "high-impact deals detected" alert.
  const looksLikeErrorPage = /reference\s*#|errors\.edgesuite|access denied|forbidden|not found|captcha|are you a robot/i
    .test(`${title} ${url} ${description}`);
  if (looksLikeErrorPage) {
    return deals;
  }

  // A deal needs an actual discount figure. The word "sale" alone used to be
  // enough, and the discount was then invented as a flat 30%.
  if (foundDiscounts.length === 0) {
    return deals;
  }

  const category = detectCategory(url, fullText);
  const maxDiscount = Math.max(...foundDiscounts);
  const isFlashSale = /flash|limited|hour|today|ending|hurry/i.test(fullText);
  const dealType = maxDiscount >= 60 ? 'mega_sale' : maxDiscount >= 40 ? 'seasonal_sale' : 'regular_discount';
  const impact = maxDiscount >= 60 ? 'critical' : maxDiscount >= 40 ? 'high' : 'medium';

  const dealName = title.length > 10 ? title.substring(0, 150) : `AJIO ${maxDiscount}% ${category} Sale`;

  deals.push({
    name: dealName,
    discount: foundDiscounts.length > 1 ? `${Math.min(...foundDiscounts)}-${maxDiscount}% Off` : `${maxDiscount}% Off`,
    category: category,
    type: dealType,
    impact: impact,
    isFlashSale: isFlashSale,
    endDate: null,
    // Was maxDiscount * 0.3 or * 0.2 — a conversion lift nobody measured, stored
    // as though it had been.
    conversionImpact: null,
    sourceUrl: url,
  });

  return deals;
}

/** Page furniture that appears in search-result markdown but is never a product. */
const MARKUP_LINE = /^(!\[|\||•|[-*#>]\s|\(|https?:|Reference\s*#)/i;

/** Promotional and legal copy that carries a price but describes no product. */
const PROMO_COPY = /(coupon|cart value|t&c|terms and conditions|offer icon|reward|voucher|minimum|additional\s|extra\s|use\s+code|apply\s+code|net order value|edgesuite|access denied|reference\s*#|participating in|capped at|purchase over|flat\s+\d*%)/i;

/**
 * Pull products out of scraped page markdown.
 *
 * This used to treat any line containing a rupee figure between 200 and 30000
 * as a product, which is how banner captions, coupon terms and two Akamai error
 * pages ended up in competitor_products with prices attached. It also built the
 * name with `line.replace(/[₹Rs.\d,\s]+/g, ' ')` — a character class, so it
 * deleted every R, s and digit anywhere in the text and stored "Customer" as
 * "Cu tomer".
 *
 * A line now has to name a brand we recognise before it counts. That is the only
 * reliable product signal in search-result markdown, and requiring it means we
 * return nothing rather than guessing.
 */
function parseProductsFromContent(content: string, url: string, defaultCategory?: string): any[] {
  const products: any[] = [];
  const lines = content.split('\n');

  const pricePattern = /(?:₹|Rs\.?|INR)\s*([\d,]+)/gi;

  const knownBrands = [
    'Puma', 'Nike', 'Adidas', 'Levis', 'Wrangler', 'Allen Solly', 'Van Heusen',
    'Peter England', 'Louis Philippe', 'Jack & Jones', 'Vero Moda',
    'BIBA', 'Aurelia', 'Global Desi', 'Reebok', 'Asics', 'Skechers'
  ];

  const category = defaultCategory || detectCategory(url, content);
  const sourceUrl = /^https?:\/\//i.test(url) ? url : null;

  for (const raw of lines) {
    const line = raw.trim();
    if (line.length < 8 || line.length > 300) continue;
    if (MARKUP_LINE.test(line) || PROMO_COPY.test(line)) continue;

    const priceMatches = [...line.matchAll(pricePattern)];
    if (priceMatches.length === 0) continue;

    const prices = priceMatches
      .map((m) => parseInt(m[1].replace(/,/g, ''), 10))
      .filter((p) => p > 200 && p < 30000);
    if (prices.length === 0) continue;

    const brand = knownBrands.find((b) =>
      new RegExp(`\\b${b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(line)
    );
    if (!brand) continue;

    // Remove only the matched price substrings, leaving the rest of the words intact.
    let name = line;
    for (const m of priceMatches) name = name.replace(m[0], ' ');
    name = name.replace(/[*_`[\]()]/g, ' ').replace(/\s{2,}/g, ' ').trim();

    const words = name.split(/\s+/).filter((w) => /[a-z]{2,}/i.test(w));
    if (words.length < 2 || name.length < 8) continue;

    const sorted = [...prices].sort((a, b) => a - b);
    const currentPrice = sorted[0];
    // Only a genuine second price on the line is an original price. The old code
    // invented one as currentPrice * 1.35, manufacturing a discount nobody observed.
    const originalPrice = sorted.length > 1 ? sorted[sorted.length - 1] : null;
    const discount = originalPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : null;

    products.push({
      name: name.slice(0, 120),
      category,
      price: currentPrice,
      originalPrice,
      discount,
      brand,
      url: sourceUrl,
    });
  }

  return products.slice(0, 10);
}

function detectCategory(url: string, text: string): string {
  const categoryMap: Record<string, string> = {
    'women': 'Women',
    'men': 'Men',
    'kid': 'Kids',
    'shoe': 'Footwear',
    'sneaker': 'Sneakers',
    'dress': 'Dresses',
    'top': 'Tops',
    'shirt': 'Shirts',
    'jean': 'Jeans',
    'kurta': 'Ethnic Wear',
    'ethnic': 'Ethnic Wear',
    'saree': 'Ethnic Wear',
    'sport': 'Sportswear',
    'winter': 'Winterwear',
    'jacket': 'Winterwear',
    'bag': 'Accessories',
    'watch': 'Accessories',
  };
  
  const combined = `${url} ${text}`.toLowerCase();
  
  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (combined.includes(keyword)) {
      return category;
    }
  }
  
  return 'Fashion';
}

function deduplicateByKey(items: any[], key: string): any[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const value = String(item[key] || '').toLowerCase().substring(0, 50);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

// estimateMyntraPrice() deleted. It returned ajioPrice * categoryMultiplier *
// (0.96 + Math.random() * 0.08) and was presented as Myntra's real price.

