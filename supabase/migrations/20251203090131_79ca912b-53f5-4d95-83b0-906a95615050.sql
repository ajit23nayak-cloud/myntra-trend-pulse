-- Add image_url column to fashion_trends table
ALTER TABLE public.fashion_trends 
ADD COLUMN IF NOT EXISTS image_url TEXT;