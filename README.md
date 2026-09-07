# Myntra TrendPulse

A fashion intelligence dashboard for a category team. It scrapes competitor pricing, app-store reviews and trend signals, stores them in Postgres, and turns them into recommendations that carry an expected outcome and a place to mark whether it worked.

Every number on screen comes from the database. Where a table is empty, the page says so rather than showing a stand-in.

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
| `scrape-competitor-data` | Competitor pricing and deals, 456 lines |
| `scrape-reviews` | Customer reviews across seven sources, 326 lines |
| `scrape-trends` | Trend signals across nine sources, 472 lines |
| `generate-insights` | Turns the stored signals into ranked recommendations |
| `dashboard-chat` | Answers questions against the dashboard's own data |

### Sources it reads

| Signal | Where it comes from |
|---|---|
| App reviews | Apple App Store, Google Play |
| Review sites | Trustpilot, MouthShut |
| Social | Twitter, Pinterest, TikTok, Instagram hashtags (`#indianfashion`, `#indiastreetstyle`), YouTube |
| Search interest | Google Trends |
| Fashion press | Vogue India, Elle India, Cosmopolitan India |
| Competitor pricing | Firecrawl search, resolved at run time |

Every fetch goes through Firecrawl. Each run writes a row to `scrape_logs`, so you can see when a source last returned anything.

### When they run

On demand. Scheduled scraping is off by default, so the scrapers run only when the owner opens the Refresh All panel and asks for it.

The Overview header shows how old the newest completed run is and turns amber past 24 hours, so stale data announces itself rather than passing as current.

To hand the job to a schedule instead, run `supabase/scheduling/enable_scheduled_scrapes.sql` by hand in the Supabase SQL editor. It registers four staggered `pg_cron` jobs — competitor data and reviews every 6 hours, trends every 12, insights after them — and `disable_scheduled_scrapes.sql` removes them again. Neither file lives in `migrations/`, so neither is ever applied automatically.

```sql
-- what is scheduled, if anything
select jobname, schedule, active from cron.job where jobname like 'trendpulse-%';

-- recent runs and failures
select j.jobname, r.status, r.return_message, r.start_time
from cron.job_run_details r join cron.job j on j.jobid = r.jobid
where j.jobname like 'trendpulse-%' order by r.start_time desc limit 20;
```

### Triggering a refresh

Two different buttons, doing two different things.

| Control | What it does | Who sees it |
|---|---|---|
| Refresh icon, top right | Re-reads the tables already in Postgres | Everyone |
| Refresh All panel, Overview | Runs the scrapers, fetching new data from the web | Owner only |

The panel is hidden unless the browser has been to `?admin=1` once, which it remembers; `?admin=0` forgets it. That keeps a visitor from casually spending Firecrawl credits. It is a curtain, not a lock — see below.

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

## Who can write what

Reads are public: this is a read-only dashboard over public retail data and it has no sign-in.

Writes are not. The scrapers connect with the service-role key, which bypasses row level security. Anonymous visitors can update exactly two things, restricted by column grant rather than by policy alone:

| Table | Columns a visitor may change |
|---|---|
| `alerts` | `status`, `acknowledged_at`, `resolved_at` |
| `insights` | `is_actioned`, `actioned_at` |

Everything else — inserts, deletes, and every other column — is service-role only.

One gap remains by choice. The edge functions run with `verify_jwt = false`, so anyone who finds the repository can call a scrape endpoint directly and spend Firecrawl credits. Hiding the Refresh All panel behind `?admin=1` stops casual clicks, but it is a curtain over the button, not a lock on the endpoint. Closing it properly means putting real auth in front of the dashboard and having the functions reject anyone who is not the owner.

## A note on the data

Figures on screen depend on when the scrapers last ran. Treat anything you see as a snapshot of that moment. It is not live market data.
