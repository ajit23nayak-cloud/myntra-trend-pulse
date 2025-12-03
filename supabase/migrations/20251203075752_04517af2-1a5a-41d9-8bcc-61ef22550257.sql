-- Add unique constraint on trend_name for upsert operations
ALTER TABLE public.fashion_trends ADD CONSTRAINT fashion_trends_trend_name_key UNIQUE (trend_name);