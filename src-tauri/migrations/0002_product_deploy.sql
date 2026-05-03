-- Add deployment metadata to products
ALTER TABLE products ADD COLUMN repo_url        TEXT;
ALTER TABLE products ADD COLUMN deploy_provider TEXT;  -- fly | vercel | railway | aws | render | self | other
ALTER TABLE products ADD COLUMN deploy_app_name TEXT;
ALTER TABLE products ADD COLUMN deploy_url      TEXT;
