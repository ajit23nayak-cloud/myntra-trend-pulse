-- Allow service role to update fashion_trends for upsert operations
CREATE POLICY "Allow service role update on fashion_trends" 
ON public.fashion_trends 
FOR UPDATE 
USING (true);

-- Also add update policies for other tables that need upsert
CREATE POLICY "Allow service role update on competitor_products" 
ON public.competitor_products 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow service role update on competitor_deals" 
ON public.competitor_deals 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow service role update on sentiment_reviews" 
ON public.sentiment_reviews 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow service role update on key_phrase_trends" 
ON public.key_phrase_trends 
FOR UPDATE 
USING (true);

-- Add unique constraints for other tables that need upsert
ALTER TABLE public.key_phrase_trends ADD CONSTRAINT key_phrase_trends_phrase_key UNIQUE (phrase);