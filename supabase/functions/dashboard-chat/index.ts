import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client to fetch dashboard context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch recent dashboard data for context
    const [sentimentData, trendsData, competitorData, insightsData, alertsData] = await Promise.all([
      supabase.from("sentiment_reviews").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("fashion_trends").select("*").order("last_updated", { ascending: false }).limit(10),
      supabase.from("competitor_products").select("*").order("scraped_at", { ascending: false }).limit(10),
      supabase.from("insights").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("alerts").select("*").eq("status", "active").limit(5),
    ]);

    // Build context from dashboard data
    const dashboardContext = `
## Current Dashboard Data Summary

### Sentiment Analysis
- Recent reviews: ${sentimentData.data?.length || 0} reviews analyzed
- Sentiment breakdown: ${JSON.stringify(sentimentData.data?.reduce((acc: any, r: any) => {
  acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
  return acc;
}, {}) || {})}
- Key themes: ${[...new Set(sentimentData.data?.map((r: any) => r.theme).filter(Boolean))].join(", ") || "None"}

### Fashion Trends
- Active trends: ${trendsData.data?.map((t: any) => `${t.trend_name} (${t.status})`).join(", ") || "None"}
- Trend statuses: ${JSON.stringify(trendsData.data?.reduce((acc: any, t: any) => {
  acc[t.status] = (acc[t.status] || 0) + 1;
  return acc;
}, {}) || {})}

### Competitive Intelligence (AJIO)
- Products tracked: ${competitorData.data?.length || 0}
- Categories: ${[...new Set(competitorData.data?.map((p: any) => p.category))].join(", ") || "None"}
- Average price gap: ${competitorData.data?.length ? (competitorData.data.reduce((sum: number, p: any) => sum + (p.price_difference || 0), 0) / competitorData.data.length).toFixed(2) : "N/A"}

### Recent Insights
${insightsData.data?.map((i: any) => `- ${i.title}: ${i.description}`).join("\n") || "No recent insights"}

### Active Alerts
${alertsData.data?.map((a: any) => `- [${a.severity}] ${a.title}`).join("\n") || "No active alerts"}
`;

    const systemPrompt = `You are TrendPulse AI, an intelligent assistant for the Myntra TrendPulse dashboard. You help users understand and analyze:

1. **Sentiment Analysis**: Customer reviews, sentiment trends, pain points, and feedback themes (product quality, pricing, delivery, returns, customer service, app usability)
2. **Fashion Trends**: Emerging styles, trend status (emerging/established/peaking/cooling), trend velocity, and platform sources (TikTok, Instagram, Pinterest, YouTube)
3. **Competitive Intelligence**: AJIO pricing comparisons, deals, promotions, and price gaps
4. **Actionable Insights**: Recommendations for merchandising, marketing, and operations

${dashboardContext}

Guidelines:
- Be concise and direct - users want quick answers
- Reference specific data when available
- Provide actionable recommendations when appropriate
- If asked about data not available, suggest what metrics to look at
- Speak naturally as this response will be read aloud`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I couldn't generate a response.";

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Dashboard chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
