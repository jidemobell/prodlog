-- Initial schema for prodlog
CREATE TABLE IF NOT EXISTS tenants (
  id          TEXT PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  notes       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  slug            TEXT NOT NULL,
  name            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'idea',  -- idea | poc | live | migrated | retired
  parent_id       TEXT REFERENCES products(id) ON DELETE SET NULL,
  description     TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  sunset_at       TEXT,
  UNIQUE(tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS addons (
  id              TEXT PRIMARY KEY,
  product_id      TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  vendor          TEXT NOT NULL,
  category        TEXT,                          -- hosting | auth | payments | analytics | etc
  status          TEXT NOT NULL DEFAULT 'active',-- active | cancelled | trial
  cost_amount     REAL,
  cost_currency   TEXT DEFAULT 'EUR',
  cost_period     TEXT DEFAULT 'monthly',        -- monthly | annual | once | free
  renews_on       TEXT,
  secret_ref      TEXT,                          -- e.g. op://Atensai/studycircle-stripe
  notes           TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id              TEXT PRIMARY KEY,
  product_id      TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,                 -- created | migrated | sunset | note
  note            TEXT,
  occurred_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_addons_product ON addons(product_id);
CREATE INDEX IF NOT EXISTS idx_events_product ON events(product_id);
