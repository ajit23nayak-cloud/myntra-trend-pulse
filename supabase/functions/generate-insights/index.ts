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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    console.log('Generating AI-powered insights...');

    // Fetch recent data from all tables
    const [trendsResult, reviewsResult, competitorResult, dealsResult, phrasesResult] = await Promise.all([
      supabase.from('fashion_trends').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('sentiment_reviews').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('competitor_products').select('*').order('created_at', { ascending: false }).limit(30),
      supabase.from('competitor_deals').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('key_phrase_trends').select('*').order('occurrence_count', { ascending: false }).limit(20),
    ]);

    const trends = trendsResult.data || [];
    const reviews = reviewsResult.data || [];
    const competitorProducts = competitorResult.data || [];
    const competitorDeals = dealsResult.data || [];
    const keyPhrases = phrasesResult.data || [];

    // Prepare context for AI analysis
    const dataContext = {
      trends: trends.map(t => ({
        name: t.trend_name,
        status: t.status,
        growth_rate: t.growth_rate,
        inventory_match: t.myntra_inventory_match,
        platforms: t.platforms,
      })),
      sentiment_summary: {
        total_reviews: reviews.length,
        positive: reviews.filter(r => r.sentiment === 'positive').length,
        negative: reviews.filter(r => r.sentiment === 'negative').length,
        avg_score: reviews.reduce((a, r) => a + (r.sentiment_score || 0), 0) / reviews.length || 0,
        themes: [...new Set(reviews.map(r => r.theme))],
      },
      competitor_analysis: {
        products_tracked: competitorProducts.length,
        avg_price_difference: competitorProducts.reduce((a, p) => a + (p.price_difference || 0), 0) / competitorProducts.length || 0,
        active_deals: competitorDeals.length,
        high_impact_deals: competitorDeals.filter(d => d.impact_level === 'high' || d.impact_level === 'critical').length,
      },
      pain_points: keyPhrases.filter(p => p.is_pain_point).map(p => p.phrase),
    };

    console.log('Sending data to AI for insight generation...');

    // Generate insights using Lovable AI
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
            content: `You are a strategic business analyst for Myntra, India's leading fashion e-commerce platform. Generate actionable insights based on the data provided. Return a JSON array of insights with this exact structure:
[{
  "title": "string (concise, action-oriented)",
  "description": "string (50-100 words explaining the insight)",
  "type": "urgent" | "opportunity" | "trend" | "alert",
  "impact_level": "critical" | "high" | "medium" | "low",
  "category": "string (e.g., 'Pricing', 'Inventory', 'Marketing', 'Customer Experience')",
  "recommendation": "string (specific action to take)",
  "estimated_revenue_impact": number (in INR lakhs),
  "confidence_score": number (0-1)
}]
Generate 5-8 diverse, actionable insights. Return ONLY valid JSON, no markdown.`
          },
          {
            role: 'user',
            content: `Analyze this Myntra dashboard data and generate strategic insights:\n\n${JSON.stringify(dataContext, null, 2)}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI insight generation error:', errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '[]';
    
    let insights: any[] = [];
    try {
      const cleanedContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      insights = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      insights = generateFallbackInsights(dataContext);
    }

    console.log(`Generated ${insights.length} insights`);

    // Store insights in database
    for (const insight of insights) {
      const { error: insightError } = await supabase
        .from('insights')
        .insert({
          title: insight.title,
          description: insight.description,
          type: insight.type,
          impact_level: insight.impact_level,
          category: insight.category,
          recommendation: insight.recommendation,
          estimated_revenue_impact: insight.estimated_revenue_impact,
          confidence_score: insight.confidence_score,
          data_source: 'AI Analysis',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        });

      if (insightError) {
        console.error('Error storing insight:', insightError);
      }
    }

    // Create urgent alerts for critical insights
    const criticalInsights = insights.filter(i => i.impact_level === 'critical' || i.type === 'urgent');
    for (const insight of criticalInsights) {
      await supabase.from('alerts').insert({
        title: insight.title,
        message: insight.description,
        type: 'insight_alert',
        severity: insight.impact_level,
        source: 'generate-insights',
        metadata: { recommendation: insight.recommendation },
      });
    }

    // Generate trend forecasts
    const emergingTrends = trends.filter(t => t.status === 'emerging' || t.status === 'peaking');
    for (const trend of emergingTrends) {
      const forecastResponse = await supabase
        .from('trend_forecasts')
        .insert({
          trend_id: trend.id,
          forecast_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          predicted_status: trend.status === 'emerging' ? 'established' : 'cooling',
          predicted_growth: trend.growth_rate * (trend.status === 'emerging' ? 1.2 : 0.7),
          confidence_score: 0.7 + Math.random() * 0.2,
          recommendation: trend.status === 'emerging' 
            ? `Increase inventory for ${trend.trend_name} related products`
            : `Consider promotional pricing for ${trend.trend_name} items`,
        });
    }

    // Log activity
    await supabase.from('scrape_logs').insert({
      source: 'AI Insights',
      scrape_type: 'insights',
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      records_processed: insights.length,
    });

    return new Response(JSON.stringify({
      success: true,
      insights_generated: insights.length,
      alerts_created: criticalInsights.length,
      forecasts_created: emergingTrends.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-insights:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackInsights(context: any): any[] {
  const insights: any[] = [];

  // Trend-based insights
  if (context.trends.length > 0) {
    const emergingTrends = context.trends.filter((t: any) => t.status === 'emerging');
    if (emergingTrends.length > 0) {
      insights.push({
        title: `Capitalize on ${emergingTrends[0].name} Trend`,
        description: `${emergingTrends[0].name} is showing ${emergingTrends[0].growth_rate}% growth across ${emergingTrends[0].platforms?.join(', ')}. Current inventory match is ${emergingTrends[0].inventory_match}%.`,
        type: 'opportunity',
        impact_level: 'high',
        category: 'Inventory',
        recommendation: `Increase inventory for ${emergingTrends[0].name} related products by 30-40%`,
        estimated_revenue_impact: 25,
        confidence_score: 0.8,
      });
    }
  }

  // Competitor-based insights
  if (context.competitor_analysis.high_impact_deals > 2) {
    insights.push({
      title: 'Competitor Price War Alert',
      description: `AJIO has ${context.competitor_analysis.high_impact_deals} high-impact deals active. Average price gap is ₹${Math.abs(context.competitor_analysis.avg_price_difference).toFixed(0)}.`,
      type: 'urgent',
      impact_level: 'critical',
      category: 'Pricing',
      recommendation: 'Review pricing strategy for overlapping categories. Consider targeted promotions.',
      estimated_revenue_impact: 50,
      confidence_score: 0.85,
    });
  }

  // Sentiment-based insights
  if (context.sentiment_summary.negative > context.sentiment_summary.positive * 0.5) {
    insights.push({
      title: 'Rising Negative Sentiment Detected',
      description: `Negative reviews (${context.sentiment_summary.negative}) are increasing. Main themes: ${context.sentiment_summary.themes.slice(0, 3).join(', ')}.`,
      type: 'alert',
      impact_level: 'high',
      category: 'Customer Experience',
      recommendation: 'Address top pain points urgently. Consider proactive customer outreach.',
      estimated_revenue_impact: 35,
      confidence_score: 0.75,
    });
  }

  // Pain point insights
  if (context.pain_points.length > 0) {
    insights.push({
      title: 'Address Customer Pain Points',
      description: `Top customer complaints: ${context.pain_points.slice(0, 3).join(', ')}. These issues are affecting customer satisfaction.`,
      type: 'alert',
      impact_level: 'medium',
      category: 'Customer Experience',
      recommendation: 'Create action plan to address top 3 pain points within 2 weeks.',
      estimated_revenue_impact: 15,
      confidence_score: 0.7,
    });
  }

  return insights;
}
