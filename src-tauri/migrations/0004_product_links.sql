-- Generic product links: repos, deployments, docs, dashboards, design files, etc.
CREATE TABLE product_links (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,           -- 'repo' | 'deploy' | 'docs' | 'design' | 'dashboard' | 'other'
  label TEXT NOT NULL,          -- 'Frontend', 'API', 'Mobile', 'Figma', etc.
  url TEXT,                     -- optional (deployments may only have an app name)
  provider TEXT,                -- 'github' | 'gitlab' | 'fly' | 'vercel' | 'figma' | ...
  app_name TEXT,                -- e.g. fly.io app name
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_product_links_product ON product_links(product_id);

-- Backfill existing repo_url / deploy_* fields into the new table
INSERT INTO product_links (id, product_id, kind, label, url, provider, app_name, position)
SELECT
  lower(hex(randomblob(16))),
  id,
  'repo',
  'Repository',
  repo_url,
  'github',
  NULL,
  0
FROM products
WHERE repo_url IS NOT NULL AND repo_url <> '';

INSERT INTO product_links (id, product_id, kind, label, url, provider, app_name, position)
SELECT
  lower(hex(randomblob(16))),
  id,
  'deploy',
  'Deployment',
  deploy_url,
  deploy_provider,
  deploy_app_name,
  1
FROM products
WHERE (deploy_url IS NOT NULL AND deploy_url <> '')
   OR (deploy_app_name IS NOT NULL AND deploy_app_name <> '');
