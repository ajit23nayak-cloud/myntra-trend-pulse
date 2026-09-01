# Myntra TrendPulse

A fashion intelligence dashboard for a category team. It scrapes competitor pricing, app-store reviews and trend signals on a schedule, stores them in Postgres, and turns them into recommendations that carry an expected outcome and a place to mark whether it worked.

Built on Lovable, running on Supabase.

## What it does

| Section | What it surfaces |
|---|---|
| Overview | Sentiment, trend and price-gap KPIs, weekly sentiment line, hot trends, competitor activity |
| Fashion trends | Trend list with status filter, lifecycle forecast, inventory match, regional view |
| Sentiment analysis | Sentiment by theme and by source, review velocity, positive phrases and pain points |
| Competitor intel | SKU-matched price comparison, price-gap timeline, flash sales, promotion depth |
| Actionable insights | Recommendations with impact, action and expected outcome. Mark actioned or dismissed, then track what happened |
| Real-time alerts | Severity filters, acknowledge, resolve |

There is also a voice bot you can ask questions like "what are the current sentiment trends" and a Refresh All control that triggers the scrapers on demand.

## How the data gets there

Five Supabase edge functions do the work.

| Function | Job |
|---|---|
| `scrape-competitor-data` | Competitor pricing and deals |
| `scrape-reviews` | App Store and Play Store reviews |
| `scrape-trends` | Google Trends, Instagram, Twitter, and Indian fashion press |
| `generate-insights` | Turns the stored signals into ranked recommendations |
| `dashboard-chat` | Answers questions against the dashboard's own data |

Scraping goes through Firecrawl. The AI layer runs through Lovable's gateway. Both keys live in Supabase edge-function secrets and are read at runtime, so neither is in this repository.

Fourteen tables behind it, including `competitor_products`, `price_history`, `sentiment_reviews`, `trend_forecasts`, `insights` and `scrape_logs`. Five migrations, all in `supabase/migrations/`.

## The part worth looking at

The Actionable Insights page. Every recommendation states its expected outcome before you act on it, and can be marked actioned or dismissed with the result recorded afterwards. So the tool keeps score of its own hit rate. Most dashboards produce advice nobody ever checks.

## Stack

React, TypeScript, Vite, Tailwind, shadcn/ui, Recharts. Supabase for Postgres, auth and edge functions. Deno on the function side. Firecrawl for scraping.

## Running it

```bash
npm install
npm run dev
```

`.env` holds only the Supabase project URL, project ID and the publishable anon key. Those are compiled into the browser bundle by design and are safe in the open. Every privileged key sits in Supabase edge-function secrets, set separately.

## A note on the data

Figures on screen depend on when the scrapers last ran. Treat anything you see as a snapshot of that moment. It is not live market data.
