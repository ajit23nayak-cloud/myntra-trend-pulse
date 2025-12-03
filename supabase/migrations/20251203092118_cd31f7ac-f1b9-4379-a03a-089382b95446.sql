-- Add unique constraints to fix upsert errors
ALTER TABLE competitor_deals ADD CONSTRAINT competitor_deals_unique_deal UNIQUE (competitor, deal_name, category);
ALTER TABLE competitor_products ADD CONSTRAINT competitor_products_unique_product UNIQUE (competitor, product_name, category);