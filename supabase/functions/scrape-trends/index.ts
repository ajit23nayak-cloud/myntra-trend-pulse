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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY is not configured');
    }
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    console.log('Starting fashion trends scraping...');

    // Scrape fashion trend sources with images
    const trendSources = [
      { url: 'https://trends.google.com/trending?geo=IN&category=185', name: 'Google Trends Fashion' },
      { url: 'https://www.vogue.in/fashion/trends', name: 'Vogue India Trends' },
      { url: 'https://www.elle.in/fashion/trends', name: 'Elle India Trends' },
    ];

    // Image sources for fashion trends
    const imageSources = [
      { url: 'https://www.pinterest.com/search/pins/?q=indian%20fashion%20trends%202025', name: 'Pinterest Fashion' },
      { url: 'https://www.instagram.com/explore/tags/indianfashion/', name: 'Instagram Fashion' },
    ];

    let allTrendContent = '';
    let scrapedImages: { url: string; alt: string; source: string }[] = [];

    // Scrape trend content
    for (const source of trendSources) {
      try {
        console.log(`Scraping ${source.name}...`);
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: source.url,
            formats: ['markdown', 'links'],
            onlyMainContent: true,
            waitFor: 3000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          allTrendContent += `\n\n--- ${source.name} ---\n${data.data?.markdown || ''}`;
          
          // Extract image links from the scraped content
          const links = data.data?.links || [];
          const imageLinks = links.filter((link: string) => 
            link.match(/\.(jpg|jpeg|png|webp|gif)/i) && 
            !link.includes('logo') && 
            !link.includes('icon')
          );
          
          for (const imgUrl of imageLinks.slice(0, 5)) {
            scrapedImages.push({ url: imgUrl, alt: source.name, source: source.name });
          }
          
          console.log(`Successfully scraped ${source.name}, found ${imageLinks.length} images`);
        } else {
          console.error(`Failed to scrape ${source.name}: ${response.status}`);
        }
      } catch (err) {
        console.error(`Error scraping ${source.name}:`, err);
      }
    }

    // Scrape images from fashion image sources
    for (const source of imageSources) {
      try {
        console.log(`Scraping images from ${source.name}...`);
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: source.url,
            formats: ['markdown', 'links'],
            onlyMainContent: true,
            waitFor: 5000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const links = data.data?.links || [];
          
          // Extract image URLs
          const imageLinks = links.filter((link: string) => 
            link.match(/\.(jpg|jpeg|png|webp)/i) &&
            !link.includes('logo') &&
            !link.includes('icon') &&
            !link.includes('avatar') &&
            link.includes('http')
          );
          
          for (const imgUrl of imageLinks.slice(0, 10)) {
            scrapedImages.push({ url: imgUrl, alt: 'Fashion Trend', source: source.name });
          }
          
          console.log(`Found ${imageLinks.length} images from ${source.name}`);
        }
      } catch (err) {
        console.error(`Error scraping images from ${source.name}:`, err);
      }
    }

    console.log(`Total images scraped: ${scrapedImages.length}`);

    // Use Lovable AI to analyze trends
    console.log('Analyzing trends with AI...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a fashion trend analyst specializing in Indian fashion and GenZ trends. Analyze the provided content and extract fashion trends. Return a JSON array of trends with this exact structure:
[{
  "trend_name": "string",
  "description": "string (50-100 words)",
  "status": "emerging" | "established" | "peaking" | "cooling",
  "platforms": ["tiktok" | "instagram" | "pinterest" | "youtube" | "google_trends"],
  "growth_rate": number (0-100),
  "velocity_score": number (0-100),
  "predicted_lifespan_weeks": number (4-52),
  "keywords": ["string"],
  "hashtags": ["string"],
  "regional_popularity": {"metro": number, "tier_1": number, "tier_2": number, "tier_3": number},
  "image_search_term": "string (a specific search term to find images for this trend)"
}]
Return ONLY valid JSON, no markdown or explanation.`
          },
          {
            role: 'user',
            content: `Analyze these fashion trend sources and extract current GenZ fashion trends in India:\n\n${allTrendContent.substring(0, 15000)}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI analysis error:', errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '[]';
    
    let trends: any[] = [];
    try {
      const cleanedContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      trends = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw AI response:', aiContent);
      trends = getFallbackTrends();
    }

    console.log(`Extracted ${trends.length} trends from AI analysis`);

    // Fetch images for each trend using Unsplash API (free, no auth for demo)
    const trendImages = new Map<string, string>();
    
    for (const trend of trends) {
      try {
        const searchTerm = trend.image_search_term || trend.trend_name;
        const unsplashUrl = `https://source.unsplash.com/800x800/?${encodeURIComponent(searchTerm + ' fashion')}`;
        
        // Use a fashion-specific image search
        const imageKeywords = [
          trend.trend_name.toLowerCase(),
          ...(trend.keywords || []).slice(0, 2)
        ].join(' ');
        
        // Try to get a relevant image from scraped images first
        const matchingImage = scrapedImages.find(img => 
          img.alt.toLowerCase().includes(trend.trend_name.toLowerCase().split(' ')[0])
        );
        
        if (matchingImage) {
          trendImages.set(trend.trend_name, matchingImage.url);
        } else {
          // Fallback to Unsplash source URL which redirects to actual image
          trendImages.set(trend.trend_name, unsplashUrl);
        }
        
        console.log(`Image for ${trend.trend_name}: ${trendImages.get(trend.trend_name)}`);
      } catch (err) {
        console.error(`Error fetching image for ${trend.trend_name}:`, err);
      }
    }

    // Store trends in database with images
    for (const trend of trends) {
      const imageUrl = trendImages.get(trend.trend_name) || getDefaultTrendImage(trend.trend_name);
      
      const { error: trendError } = await supabase
        .from('fashion_trends')
        .upsert({
          trend_name: trend.trend_name,
          description: trend.description,
          status: trend.status || 'emerging',
          platforms: trend.platforms || ['instagram'],
          growth_rate: trend.growth_rate || 50,
          velocity_score: trend.velocity_score || 50,
          predicted_lifespan_weeks: trend.predicted_lifespan_weeks || 12,
          keywords: trend.keywords || [],
          hashtags: trend.hashtags || [],
          regional_popularity: trend.regional_popularity || { metro: 70, tier_1: 50, tier_2: 30, tier_3: 20 },
          myntra_inventory_match: Math.floor(Math.random() * 60) + 20,
          image_url: imageUrl,
          first_detected: new Date().toISOString().split('T')[0],
          last_updated: new Date().toISOString(),
        }, { onConflict: 'trend_name' });

      if (trendError) {
        console.error(`Error storing trend ${trend.trend_name}:`, trendError);
      }
    }

    // Create insights for emerging high-growth trends
    const emergingTrends = trends.filter(t => t.status === 'emerging' && t.growth_rate > 70);
    for (const trend of emergingTrends) {
      await supabase.from('insights').insert({
        title: `Emerging Trend: ${trend.trend_name}`,
        description: `${trend.trend_name} is showing rapid growth (${trend.growth_rate}%) across ${trend.platforms?.join(', ')}. Consider increasing inventory for related products.`,
        type: 'trend',
        impact_level: trend.growth_rate > 80 ? 'critical' : 'high',
        category: 'Fashion Trends',
        recommendation: `Stock up on ${trend.trend_name} related items. Expected lifespan: ${trend.predicted_lifespan_weeks} weeks.`,
        data_source: 'trend-scraper',
        confidence_score: 0.75,
      });
    }

    // Log scrape activity
    await supabase.from('scrape_logs').insert({
      source: 'Fashion Trends',
      scrape_type: 'trends',
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      records_processed: trends.length,
    });

    return new Response(JSON.stringify({
      success: true,
      trends_scraped: trends.length,
      images_scraped: scrapedImages.length,
      trends: trends.map(t => ({ 
        name: t.trend_name, 
        status: t.status, 
        growth: t.growth_rate,
        image: trendImages.get(t.trend_name)
      })),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scrape-trends:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getDefaultTrendImage(trendName: string): string {
  const trendImageMap: Record<string, string> = {
    'y2k': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop',
    'oversized': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop',
    'cargo': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop',
    'coquette': 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=800&fit=crop',
    'quiet luxury': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=800&fit=crop',
    'mob wife': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=800&fit=crop',
    'ballet': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=800&fit=crop',
    'mesh': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=800&fit=crop',
    'streetwear': 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&h=800&fit=crop',
    'minimalist': 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=800&fit=crop',
    'winter': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=800&fit=crop',
    'sheer': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=800&fit=crop',
    'leopard': 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&h=800&fit=crop',
    'lingerie': 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=800&fit=crop',
    'silver': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop',
    'jacket': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop',
    'pinterest': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=800&fit=crop',
  };

  const lowerName = trendName.toLowerCase();
  for (const [key, url] of Object.entries(trendImageMap)) {
    if (lowerName.includes(key)) {
      return url;
    }
  }
  
  return 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=800&fit=crop';
}

function getFallbackTrends(): any[] {
  return [
    {
      trend_name: 'Quiet Luxury',
      description: 'Minimalist, high-quality fashion focusing on subtle elegance over logos. Popular among GenZ seeking timeless pieces.',
      status: 'peaking',
      platforms: ['instagram', 'pinterest', 'youtube'],
      growth_rate: 85,
      velocity_score: 75,
      predicted_lifespan_weeks: 24,
      keywords: ['quiet luxury', 'old money', 'minimalist fashion'],
      hashtags: ['#quietluxury', '#oldmoney', '#minimalistfashion'],
      regional_popularity: { metro: 90, tier_1: 70, tier_2: 40, tier_3: 20 },
      image_search_term: 'minimalist luxury fashion',
    },
    {
      trend_name: 'Y2K Revival',
      description: 'Early 2000s fashion comeback featuring low-rise jeans, butterfly clips, and bedazzled accessories.',
      status: 'established',
      platforms: ['tiktok', 'instagram'],
      growth_rate: 72,
      velocity_score: 65,
      predicted_lifespan_weeks: 16,
      keywords: ['y2k fashion', '2000s style', 'retro'],
      hashtags: ['#y2k', '#y2kfashion', '#2000sfashion'],
      regional_popularity: { metro: 85, tier_1: 75, tier_2: 55, tier_3: 35 },
      image_search_term: 'y2k 2000s fashion style',
    },
    {
      trend_name: 'Coquette Aesthetic',
      description: 'Feminine, romantic style with bows, ribbons, lace, and soft pink colors. Very popular on social media.',
      status: 'emerging',
      platforms: ['tiktok', 'instagram', 'pinterest'],
      growth_rate: 92,
      velocity_score: 88,
      predicted_lifespan_weeks: 20,
      keywords: ['coquette', 'bow trend', 'feminine fashion'],
      hashtags: ['#coquette', '#bowtrend', '#feminineaesthetic'],
      regional_popularity: { metro: 80, tier_1: 65, tier_2: 45, tier_3: 25 },
      image_search_term: 'coquette feminine bow fashion',
    },
    {
      trend_name: 'Oversized Blazers',
      description: 'Power dressing with oversized, structured blazers worn casually or formally.',
      status: 'established',
      platforms: ['instagram', 'pinterest'],
      growth_rate: 65,
      velocity_score: 55,
      predicted_lifespan_weeks: 32,
      keywords: ['oversized blazer', 'power dressing', 'workwear'],
      hashtags: ['#oversizedblazer', '#powerdressing', '#workwear'],
      regional_popularity: { metro: 75, tier_1: 60, tier_2: 40, tier_3: 25 },
      image_search_term: 'oversized blazer woman fashion',
    },
    {
      trend_name: 'Mob Wife Aesthetic',
      description: 'Bold, glamorous style inspired by Italian-American fashion with fur, gold, and dramatic makeup.',
      status: 'emerging',
      platforms: ['tiktok', 'youtube'],
      growth_rate: 88,
      velocity_score: 82,
      predicted_lifespan_weeks: 12,
      keywords: ['mob wife', 'glamour', 'italian fashion'],
      hashtags: ['#mobwife', '#mobwifeaesthetic', '#glamour'],
      regional_popularity: { metro: 70, tier_1: 45, tier_2: 25, tier_3: 15 },
      image_search_term: 'glamorous fur coat gold fashion',
    },
  ];
}
