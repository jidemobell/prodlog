import Database from "@tauri-apps/plugin-sql";

let dbPromise: Promise<Database> | null = null;

export function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = Database.load("sqlite:prodlog.db");
  }
  return dbPromise;
}

export type ProductStatus = "idea" | "poc" | "live" | "migrated" | "retired";

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  notes: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  slug: string;
  name: string;
  status: ProductStatus;
  parent_id: string | null;
  description: string | null;
  created_at: string;
  sunset_at: string | null;
  repo_url: string | null;
  deploy_provider: string | null;
  deploy_app_name: string | null;
  deploy_url: string | null;
}

export interface Addon {
  id: string;
  product_id: string;
  vendor: string;
  category: string | null;
  status: string;
  cost_amount: number | null;
  cost_currency: string | null;
  cost_period: string | null;
  renews_on: string | null;
  secret_ref: string | null;
  notes: string | null;
  created_at: string;
}
