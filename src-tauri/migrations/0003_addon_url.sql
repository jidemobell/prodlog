-- Add a URL field for add-ons that aren't deployments but still have a project URL
-- (e.g. Supabase project, OpenAI org dashboard, Stripe account, etc.)
ALTER TABLE addons ADD COLUMN url TEXT;
