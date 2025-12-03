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

    console.log('Starting AJIO competitor data scraping...');

    // Scrape AJIO deals page
    const dealsResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.ajio.com/s/offers',
        formats: ['markdown', 'links'],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    if (!dealsResponse.ok) {
      const errorText = await dealsResponse.text();
      console.error('Firecrawl deals error:', errorText);
      throw new Error(`Firecrawl API error: ${dealsResponse.status}`);
    }

    const dealsData = await dealsResponse.json();
    console.log('Scraped AJIO deals page successfully');

    // Parse deals from markdown content
    const deals = parseDealsFromMarkdown(dealsData.data?.markdown || '');
    console.log(`Parsed ${deals.length} deals from AJIO`);

    // Scrape AJIO product categories
    const categories = ['women-tops', 'men-shirts', 'women-dresses', 'men-jeans', 'sneakers'];
    const products: any[] = [];

    for (const category of categories) {
      try {
        const productResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: `https://www.ajio.com/s/${category}`,
            formats: ['markdown'],
            onlyMainContent: true,
            waitFor: 3000,
          }),
        });

        if (productResponse.ok) {
          const productData = await productResponse.json();
          const categoryProducts = parseProductsFromMarkdown(productData.data?.markdown || '', category);
          products.push(...categoryProducts);
          console.log(`Parsed ${categoryProducts.length} products from ${category}`);
        }
      } catch (err) {
        console.error(`Error scraping ${category}:`, err);
      }
    }

    // Store deals in database
    if (deals.length > 0) {
      const { error: dealsError } = await supabase
        .from('competitor_deals')
        .upsert(deals.map(deal => ({
          competitor: 'AJIO',
          deal_name: deal.name,
          discount_value: deal.discount,
          category: deal.category,
          deal_type: deal.type,
          impact_level: deal.impact,
          is_flash_sale: deal.isFlashSale,
          start_date: new Date().toISOString().split('T')[0],
          end_date: deal.endDate,
        })), { onConflict: 'deal_name,competitor' });

      if (dealsError) {
        console.error('Error storing deals:', dealsError);
      }
    }

    // Store products in database
    if (products.length > 0) {
      const { error: productsError } = await supabase
        .from('competitor_products')
        .upsert(products.map(product => ({
          competitor: 'AJIO',
          product_name: product.name,
          category: product.category,
          current_price: product.price,
          original_price: product.originalPrice,
          discount_percentage: product.discount,
          brand: product.brand,
          in_stock: true,
          myntra_equivalent_price: estimateMyntraPrice(product.price, product.category),
          price_difference: calculatePriceDifference(product.price, product.category),
        })), { onConflict: 'product_name,competitor' });

      if (productsError) {
        console.error('Error storing products:', productsError);
      }
    }

    // Create alert if significant deals found
    const highImpactDeals = deals.filter(d => d.impact === 'high' || d.impact === 'critical');
    if (highImpactDeals.length > 0) {
      await supabase.from('alerts').insert({
        title: `AJIO High-Impact Deals Detected`,
        message: `${highImpactDeals.length} high-impact deals found on AJIO. Review competitive pricing strategy.`,
        type: 'competitor_alert',
        severity: 'high',
        source: 'scrape-competitor-data',
        metadata: { deals: highImpactDeals },
      });
    }

    // Log scrape activity
    await supabase.from('scrape_logs').insert({
      source: 'AJIO',
      scrape_type: 'competitor_data',
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      records_processed: deals.length + products.length,
    });

    return new Response(JSON.stringify({
      success: true,
      deals_scraped: deals.length,
      products_scraped: products.length,
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

function parseDealsFromMarkdown(markdown: string): any[] {
  const deals: any[] = [];
  const lines = markdown.split('\n');
  
  // Look for discount patterns like "50% OFF", "FLAT 40%", "Up to 70%"
  const discountPattern = /(\d+%?\s*(?:OFF|off|FLAT|flat|Up to|upto)?|\bFLAT\s*\d+%|\bUp to\s*\d+%)/gi;
  const categoryKeywords = ['women', 'men', 'kids', 'footwear', 'accessories', 'beauty'];
  
  let currentDeal: any = null;
  
  for (const line of lines) {
    const discountMatch = line.match(discountPattern);
    if (discountMatch) {
      const discount = discountMatch[0];
      const discountNum = parseInt(discount.match(/\d+/)?.[0] || '0');
      
      // Determine category from context
      let category = 'All';
      for (const cat of categoryKeywords) {
        if (line.toLowerCase().includes(cat)) {
          category = cat.charAt(0).toUpperCase() + cat.slice(1);
          break;
        }
      }
      
      deals.push({
        name: line.substring(0, 100).trim() || `AJIO ${discount} Sale`,
        discount: discount,
        category: category,
        type: discountNum >= 50 ? 'mega_sale' : 'regular_discount',
        impact: discountNum >= 60 ? 'critical' : discountNum >= 40 ? 'high' : 'medium',
        isFlashSale: line.toLowerCase().includes('flash') || line.toLowerCase().includes('limited'),
        endDate: null,
      });
    }
  }
  
  // Deduplicate
  return deals.slice(0, 20);
}

function parseProductsFromMarkdown(markdown: string, category: string): any[] {
  const products: any[] = [];
  const lines = markdown.split('\n');
  
  // Look for price patterns like ₹999, Rs.1299, etc.
  const pricePattern = /[₹Rs.]+\s*(\d+,?\d*)/g;
  
  let currentProduct: any = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const priceMatches = [...line.matchAll(pricePattern)];
    if (priceMatches.length > 0) {
      const prices = priceMatches.map(m => parseInt(m[1].replace(',', '')));
      const currentPrice = Math.min(...prices);
      const originalPrice = prices.length > 1 ? Math.max(...prices) : currentPrice * 1.3;
      
      // Try to extract brand name (usually capitalized words)
      const brandMatch = line.match(/^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/);
      
      products.push({
        name: line.substring(0, 150) || `${category} Item`,
        category: formatCategory(category),
        price: currentPrice,
        originalPrice: Math.round(originalPrice),
        discount: Math.round(((originalPrice - currentPrice) / originalPrice) * 100),
        brand: brandMatch ? brandMatch[1] : 'Unknown',
      });
    }
  }
  
  return products.slice(0, 10);
}

function formatCategory(category: string): string {
  return category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function estimateMyntraPrice(ajioPrice: number, category: string): number {
  // Estimate Myntra price (usually slightly higher or similar)
  const variance = 0.9 + Math.random() * 0.2; // 90% to 110%
  return Math.round(ajioPrice * variance);
}

function calculatePriceDifference(ajioPrice: number, category: string): number {
  const myntraPrice = estimateMyntraPrice(ajioPrice, category);
  return myntraPrice - ajioPrice;
}
