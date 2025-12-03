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
      const myntraPrice = estimateMyntraPrice(product.price, product.category);
      const priceDiff = myntraPrice - product.price;

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
          myntra_equivalent_price: myntraPrice,
          price_difference: priceDiff,
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

    // Create insight for price competitiveness
    const underpriced = uniqueProducts.filter(p => {
      const myntraPrice = estimateMyntraPrice(p.price, p.category);
      return myntraPrice - p.price > 200;
    });

    if (underpriced.length > 0) {
      await supabase.from('insights').insert({
        title: `💰 Price Gap Alert: ${underpriced.length} Products Cheaper on AJIO`,
        description: `${underpriced.length} products in categories ${[...new Set(underpriced.map(p => p.category))].join(', ')} are significantly cheaper on AJIO.`,
        type: 'alert',
        impact_level: underpriced.length > 5 ? 'critical' : 'high',
        category: 'Competitive Pricing',
        recommendation: `Consider price matching or promotional discounts for: ${underpriced.slice(0, 3).map(p => p.category).join(', ')}`,
        data_source: 'competitor-scraper-search',
        confidence_score: 0.82,
      });
    }

    // Log scrape activity
    await supabase.from('scrape_logs').insert({
      source: 'AJIO Competitor (Search API)',
      scrape_type: 'competitor_data',
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      records_processed: dealsStored + productsStored,
      errors: successfulSearches < searchQueries.length ? { 
        failed_searches: searchQueries.length - successfulSearches 
      } : null,
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
      price_gaps_found: underpriced.length,
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
  
  if (foundDiscounts.length === 0 && !fullText.toLowerCase().includes('sale')) {
    return deals;
  }
  
  const category = detectCategory(url, fullText);
  const maxDiscount = foundDiscounts.length > 0 ? Math.max(...foundDiscounts) : 30;
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
    conversionImpact: isFlashSale ? maxDiscount * 0.3 : maxDiscount * 0.2,
    sourceUrl: url,
  });
  
  return deals;
}

function parseProductsFromContent(content: string, url: string, defaultCategory?: string): any[] {
  const products: any[] = [];
  const lines = content.split('\n');
  
  const pricePattern = /(?:₹|Rs\.?|INR)\s*([\d,]+)/gi;
  
  const knownBrands = [
    'Puma', 'Nike', 'Adidas', 'Levis', 'Wrangler', 'Allen Solly', 'Van Heusen',
    'Peter England', 'Louis Philippe', 'Jack & Jones', 'Only', 'Vero Moda',
    'BIBA', 'W', 'Aurelia', 'Global Desi', 'AND', 'Reebok', 'Asics', 'Skechers'
  ];
  
  const category = defaultCategory || detectCategory(url, content);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length < 5) continue;
    
    const priceMatches = [...line.matchAll(pricePattern)];
    if (priceMatches.length === 0) continue;
    
    const prices = priceMatches
      .map(m => parseInt(m[1].replace(/,/g, '')))
      .filter(p => p > 200 && p < 30000);
    
    if (prices.length === 0) continue;
    
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const currentPrice = sortedPrices[0];
    const originalPrice = sortedPrices.length > 1 ? sortedPrices[sortedPrices.length - 1] : Math.round(currentPrice * 1.35);
    
    let brand = 'Unknown';
    for (const b of knownBrands) {
      if (line.toLowerCase().includes(b.toLowerCase())) {
        brand = b;
        break;
      }
    }
    
    const productName = line.substring(0, 100).replace(/[₹Rs.\d,\s]+/g, ' ').trim() || `${brand} ${category}`;
    if (productName.length < 5) continue;
    
    const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    
    products.push({
      name: productName,
      category: category,
      price: currentPrice,
      originalPrice: originalPrice,
      discount: Math.min(discount, 85),
      brand: brand,
      url: url,
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

function estimateMyntraPrice(ajioPrice: number, category: string): number {
  const categoryMultipliers: Record<string, number> = {
    'Women': 1.08,
    'Women Tops': 1.08,
    'Dresses': 1.10,
    'Tops': 1.07,
    'Ethnic Wear': 1.05,
    'Jeans': 1.06,
    'Men': 1.06,
    'Men Shirts': 1.06,
    'Shirts': 1.06,
    'Sneakers': 1.04,
    'Footwear': 1.05,
    'Sportswear': 1.03,
    'Winterwear': 1.07,
    'Kids': 1.06,
    'Accessories': 1.08,
    'Fashion': 1.06,
  };
  
  const multiplier = categoryMultipliers[category] || 1.06;
  const variance = 0.96 + Math.random() * 0.08;
  
  return Math.round(ajioPrice * multiplier * variance);
}
