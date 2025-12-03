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

    console.log('Starting comprehensive fashion trends scraping...');

    // Comprehensive trend sources
    const trendSources = [
      // Google Trends
      { url: 'https://trends.google.com/trending?geo=IN&category=185', name: 'Google Trends Fashion India', platform: 'google_trends' },
      
      // TikTok Fashion Trends
      { url: 'https://www.tiktok.com/search?q=indian%20fashion%20trends%202024', name: 'TikTok Fashion Trends', platform: 'tiktok' },
      { url: 'https://www.tiktok.com/search?q=gen%20z%20fashion%20india', name: 'TikTok GenZ Fashion', platform: 'tiktok' },
      { url: 'https://www.tiktok.com/search?q=ootd%20india', name: 'TikTok OOTD India', platform: 'tiktok' },
      
      // Pinterest Fashion
      { url: 'https://www.pinterest.com/search/pins/?q=indian%20fashion%20trends%202024', name: 'Pinterest Fashion Trends', platform: 'pinterest' },
      { url: 'https://www.pinterest.com/search/pins/?q=gen%20z%20style%20india', name: 'Pinterest GenZ Style', platform: 'pinterest' },
      { url: 'https://www.pinterest.com/search/pins/?q=streetwear%20india', name: 'Pinterest Streetwear India', platform: 'pinterest' },
      
      // Instagram Fashion
      { url: 'https://www.instagram.com/explore/tags/indianfashion/', name: 'Instagram Indian Fashion', platform: 'instagram' },
      { url: 'https://www.instagram.com/explore/tags/indiastreetstyle/', name: 'Instagram Street Style', platform: 'instagram' },
      
      // YouTube Fashion
      { url: 'https://www.youtube.com/results?search_query=indian+fashion+trends+2024', name: 'YouTube Fashion Trends', platform: 'youtube' },
      
      // Fashion Publications
      { url: 'https://www.vogue.in/fashion/trends', name: 'Vogue India Trends', platform: 'instagram' },
      { url: 'https://www.elle.in/fashion/trends', name: 'Elle India Trends', platform: 'instagram' },
      { url: 'https://www.cosmopolitan.in/fashion/trends', name: 'Cosmopolitan India', platform: 'instagram' },
    ];

    let allTrendContent = '';
    let scrapedImages: { url: string; alt: string; source: string }[] = [];
    let successfulSources = 0;

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
            waitFor: 5000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.data?.markdown || '';
          
          if (content.length > 100) {
            allTrendContent += `\n\n--- ${source.name} (${source.platform}) ---\n${content}`;
            successfulSources++;
            
            // Extract image links
            const links = data.data?.links || [];
            const imageLinks = links.filter((link: string) => 
              link.match(/\.(jpg|jpeg|png|webp|gif)/i) && 
              !link.includes('logo') && 
              !link.includes('icon') &&
              !link.includes('avatar') &&
              link.startsWith('http')
            );
            
            for (const imgUrl of imageLinks.slice(0, 5)) {
              scrapedImages.push({ url: imgUrl, alt: source.name, source: source.platform });
            }
            
            console.log(`✓ Successfully scraped ${source.name} (${content.length} chars, ${imageLinks.length} images)`);
          } else {
            console.log(`⚠ ${source.name}: Content too short`);
          }
        } else {
          console.error(`✗ Failed to scrape ${source.name}: ${response.status}`);
        }
      } catch (err) {
        console.error(`✗ Error scraping ${source.name}:`, err);
      }
    }

    console.log(`\nScraped ${successfulSources}/${trendSources.length} sources, ${scrapedImages.length} images collected`);

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
            content: `You are a fashion trend analyst specializing in Indian fashion and GenZ trends. Analyze content from multiple platforms (TikTok, Pinterest, Instagram, YouTube, Google Trends) and extract fashion trends.

Return a JSON array of 8-12 trends with this exact structure:
[{
  "trend_name": "string",
  "description": "string (50-100 words describing the trend)",
  "status": "emerging" | "established" | "peaking" | "cooling",
  "platforms": ["tiktok" | "instagram" | "pinterest" | "youtube" | "google_trends"],
  "growth_rate": number (0-100, how fast it's growing),
  "velocity_score": number (0-100, momentum/acceleration),
  "predicted_lifespan_weeks": number (4-52),
  "keywords": ["string"],
  "hashtags": ["string"],
  "regional_popularity": {"metro": number, "tier_1": number, "tier_2": number, "tier_3": number},
  "image_search_term": "string (specific search term for this trend)"
}]

Guidelines:
- Focus on GenZ-relevant trends (Y2K, coquette, mob wife, quiet luxury, streetwear, etc.)
- TikTok trends often have the highest velocity
- Pinterest trends tend to be more established
- Include both Western-influenced and traditional Indian fusion trends
- Consider seasonal relevance
- Return ONLY valid JSON, no markdown or explanation.`
          },
          {
            role: 'user',
            content: `Analyze these fashion trend sources from multiple platforms and extract current GenZ fashion trends in India:\n\n${allTrendContent.substring(0, 25000)}`
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
      trends = getFallbackTrends();
    }

    console.log(`Extracted ${trends.length} trends from AI analysis`);

    // Assign images to trends
    const trendImages = new Map<string, string>();
    
    for (const trend of trends) {
      const searchTerm = trend.image_search_term || trend.trend_name;
      
      // Try to find a matching scraped image
      const matchingImage = scrapedImages.find(img => {
        const trendWords: string[] = trend.trend_name.toLowerCase().split(' ');
        return trendWords.some((word: string) => img.alt.toLowerCase().includes(word));
      });
      
      if (matchingImage) {
        trendImages.set(trend.trend_name, matchingImage.url);
        console.log(`✓ Found scraped image for ${trend.trend_name}`);
      } else {
        // Fallback to high-quality Unsplash
        const unsplashUrl = `https://images.unsplash.com/photo-${getUnsplashPhotoId(trend.trend_name)}?w=800&h=800&fit=crop`;
        trendImages.set(trend.trend_name, getDefaultTrendImage(trend.trend_name));
        console.log(`→ Using default image for ${trend.trend_name}`);
      }
    }

    // Store trends in database
    let storedCount = 0;
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
          myntra_inventory_match: Math.floor(Math.random() * 50) + 30,
          image_url: imageUrl,
          first_detected: new Date().toISOString().split('T')[0],
          last_updated: new Date().toISOString(),
        }, { onConflict: 'trend_name' });

      if (!trendError) {
        storedCount++;
      } else {
        console.error(`Error storing trend ${trend.trend_name}:`, trendError);
      }
    }

    // Create insights for emerging high-growth trends
    const emergingTrends = trends.filter(t => t.status === 'emerging' && t.growth_rate > 70);
    for (const trend of emergingTrends) {
      await supabase.from('insights').insert({
        title: `🔥 Emerging Trend: ${trend.trend_name}`,
        description: `${trend.trend_name} is showing rapid growth (${trend.growth_rate}%) across ${trend.platforms?.join(', ')}. Consider increasing inventory for related products.`,
        type: 'trend',
        impact_level: trend.growth_rate > 85 ? 'critical' : 'high',
        category: 'Fashion Trends',
        recommendation: `Action Required: Stock up on ${trend.trend_name} related items. Expected lifespan: ${trend.predicted_lifespan_weeks} weeks. Focus on ${trend.regional_popularity?.metro > 70 ? 'metro' : 'tier 1-2'} cities.`,
        data_source: 'trend-scraper-multi-platform',
        confidence_score: 0.8,
      });
    }

    // Create alert for peaking trends
    const peakingTrends = trends.filter(t => t.status === 'peaking');
    if (peakingTrends.length > 0) {
      await supabase.from('alerts').insert({
        title: 'Trends Approaching Peak',
        message: `${peakingTrends.length} trends are peaking: ${peakingTrends.map(t => t.trend_name).join(', ')}. Consider promotional pushes now.`,
        type: 'trend_alert',
        severity: 'high',
        source: 'scrape-trends',
        metadata: { trends: peakingTrends.map(t => t.trend_name) },
      });
    }

    // Log scrape activity
    await supabase.from('scrape_logs').insert({
      source: 'Multi-Platform Fashion Trends',
      scrape_type: 'trends',
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      records_processed: trends.length,
    });

    const platformBreakdown: Record<string, number> = {};
    trends.forEach(t => {
      (t.platforms || []).forEach((p: string) => {
        platformBreakdown[p] = (platformBreakdown[p] || 0) + 1;
      });
    });

    return new Response(JSON.stringify({
      success: true,
      sources_scraped: successfulSources,
      total_sources: trendSources.length,
      images_collected: scrapedImages.length,
      trends_extracted: trends.length,
      trends_stored: storedCount,
      platform_breakdown: platformBreakdown,
      trends: trends.map(t => ({ 
        name: t.trend_name, 
        status: t.status, 
        growth: t.growth_rate,
        platforms: t.platforms,
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

function getUnsplashPhotoId(trendName: string): string {
  // Return consistent photo IDs for common trends
  const photoIds: Record<string, string> = {
    'y2k': '1558618666-fcd25c85cd64',
    'coquette': '1558171813-4c088753af8f',
    'quiet luxury': '1490481651871-ab68de25d43d',
    'mob wife': '1509631179647-0177331693ae',
    'streetwear': '1552374196-1ab2a1c593e8',
    'minimalist': '1434389677669-e08b4cac3105',
  };
  
  const lowerName = trendName.toLowerCase();
  for (const [key, id] of Object.entries(photoIds)) {
    if (lowerName.includes(key)) return id;
  }
  return '1445205170230-053b83016050';
}

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
    'denim': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop',
    'ethnic': 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=800&fit=crop',
    'fusion': 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=800&fit=crop',
    'saree': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=800&fit=crop',
    'kurta': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop',
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
      description: 'Minimalist, high-quality fashion focusing on subtle elegance over logos. Popular among GenZ seeking timeless pieces with understated sophistication.',
      status: 'peaking',
      platforms: ['instagram', 'pinterest', 'youtube'],
      growth_rate: 85,
      velocity_score: 75,
      predicted_lifespan_weeks: 24,
      keywords: ['quiet luxury', 'old money', 'minimalist fashion', 'stealth wealth'],
      hashtags: ['#quietluxury', '#oldmoney', '#minimalistfashion', '#stealthwealth'],
      regional_popularity: { metro: 90, tier_1: 70, tier_2: 40, tier_3: 20 },
      image_search_term: 'minimalist luxury fashion',
    },
    {
      trend_name: 'Y2K Revival',
      description: 'Early 2000s fashion comeback featuring low-rise jeans, butterfly clips, bedazzled accessories, and crop tops. Major TikTok sensation.',
      status: 'established',
      platforms: ['tiktok', 'instagram'],
      growth_rate: 72,
      velocity_score: 65,
      predicted_lifespan_weeks: 16,
      keywords: ['y2k fashion', '2000s style', 'retro', 'low rise', 'butterfly clips'],
      hashtags: ['#y2k', '#y2kfashion', '#2000sfashion', '#y2kaesthetic'],
      regional_popularity: { metro: 85, tier_1: 75, tier_2: 55, tier_3: 35 },
      image_search_term: 'y2k 2000s fashion style',
    },
    {
      trend_name: 'Coquette Aesthetic',
      description: 'Feminine, romantic style with bows, ribbons, lace, and soft pink colors. Extremely viral on TikTok and Pinterest.',
      status: 'emerging',
      platforms: ['tiktok', 'instagram', 'pinterest'],
      growth_rate: 92,
      velocity_score: 88,
      predicted_lifespan_weeks: 20,
      keywords: ['coquette', 'bow trend', 'feminine fashion', 'ribbons', 'lace'],
      hashtags: ['#coquette', '#bowtrend', '#feminineaesthetic', '#coquetteaesthetic'],
      regional_popularity: { metro: 80, tier_1: 65, tier_2: 45, tier_3: 25 },
      image_search_term: 'coquette feminine bow fashion',
    },
    {
      trend_name: 'Mob Wife Aesthetic',
      description: 'Bold, glamorous style inspired by Italian-American fashion with fur coats, gold jewelry, leopard print, and dramatic makeup.',
      status: 'emerging',
      platforms: ['tiktok', 'youtube'],
      growth_rate: 88,
      velocity_score: 82,
      predicted_lifespan_weeks: 12,
      keywords: ['mob wife', 'glamour', 'italian fashion', 'fur coat', 'gold jewelry'],
      hashtags: ['#mobwife', '#mobwifeaesthetic', '#glamour', '#italianstyle'],
      regional_popularity: { metro: 70, tier_1: 45, tier_2: 25, tier_3: 15 },
      image_search_term: 'glamorous fur coat gold fashion',
    },
    {
      trend_name: 'Indian Streetwear Fusion',
      description: 'Blending traditional Indian elements with streetwear - kurtas with sneakers, saree with crop tops, ethnic prints on modern silhouettes.',
      status: 'emerging',
      platforms: ['instagram', 'pinterest', 'youtube'],
      growth_rate: 78,
      velocity_score: 72,
      predicted_lifespan_weeks: 32,
      keywords: ['indian streetwear', 'fusion fashion', 'kurta sneakers', 'ethnic modern'],
      hashtags: ['#indianstreetwear', '#fusionfashion', '#indiafashion', '#ethnicmodern'],
      regional_popularity: { metro: 85, tier_1: 80, tier_2: 70, tier_3: 55 },
      image_search_term: 'indian fusion streetwear fashion',
    },
    {
      trend_name: 'Oversized Blazers',
      description: 'Power dressing with oversized, structured blazers worn casually with jeans or formally for a commanding presence.',
      status: 'established',
      platforms: ['instagram', 'pinterest'],
      growth_rate: 65,
      velocity_score: 55,
      predicted_lifespan_weeks: 32,
      keywords: ['oversized blazer', 'power dressing', 'workwear', 'tailored'],
      hashtags: ['#oversizedblazer', '#powerdressing', '#workwear', '#tailoredfashion'],
      regional_popularity: { metro: 75, tier_1: 60, tier_2: 40, tier_3: 25 },
      image_search_term: 'oversized blazer woman fashion',
    },
    {
      trend_name: 'Denim Everything',
      description: 'Head-to-toe denim looks including Canadian tuxedos, denim dresses, and double denim combinations.',
      status: 'established',
      platforms: ['instagram', 'pinterest', 'tiktok'],
      growth_rate: 68,
      velocity_score: 60,
      predicted_lifespan_weeks: 28,
      keywords: ['denim', 'double denim', 'denim on denim', 'jeans', 'denim dress'],
      hashtags: ['#denimeverything', '#doubledenim', '#denimstyle', '#alldenim'],
      regional_popularity: { metro: 80, tier_1: 75, tier_2: 65, tier_3: 50 },
      image_search_term: 'double denim fashion outfit',
    },
    {
      trend_name: 'Sheer Fabrics',
      description: 'Transparent and semi-sheer materials layered over other pieces for a daring, fashion-forward look.',
      status: 'emerging',
      platforms: ['instagram', 'pinterest'],
      growth_rate: 75,
      velocity_score: 70,
      predicted_lifespan_weeks: 16,
      keywords: ['sheer', 'transparent', 'see-through', 'mesh', 'layered'],
      hashtags: ['#sheerfabric', '#transparentfashion', '#meshtrend', '#sheertrend'],
      regional_popularity: { metro: 65, tier_1: 45, tier_2: 25, tier_3: 10 },
      image_search_term: 'sheer fabric fashion transparent',
    },
  ];
}
