import { getDb, type Tenant, type Product, type Addon } from "./db";
import { uid } from "./utils";

// ---------- Tenants ----------
export async function listTenants(): Promise<Tenant[]> {
  const db = await getDb();
  return db.select<Tenant[]>("SELECT * FROM tenants ORDER BY name");
}

export async function createTenant(input: { slug: string; name: string; notes?: string }) {
  const db = await getDb();
  const id = uid();
  await db.execute(
    "INSERT INTO tenants (id, slug, name, notes) VALUES (?, ?, ?, ?)",
    [id, input.slug, input.name, input.notes ?? null],
  );
  return id;
}

export async function deleteTenant(id: string) {
  const db = await getDb();
  await db.execute("DELETE FROM tenants WHERE id = ?", [id]);
}

// ---------- Products ----------
export async function listProducts(tenantId?: string): Promise<Product[]> {
  const db = await getDb();
  if (tenantId) {
    return db.select<Product[]>(
      "SELECT * FROM products WHERE tenant_id = ? ORDER BY name",
      [tenantId],
    );
  }
  return db.select<Product[]>("SELECT * FROM products ORDER BY name");
}

export async function getProduct(id: string): Promise<Product | null> {
  const db = await getDb();
  const rows = await db.select<Product[]>("SELECT * FROM products WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function createProduct(input: {
  tenant_id: string;
  slug: string;
  name: string;
  status?: string;
  description?: string;
}) {
  const db = await getDb();
  const id = uid();
  await db.execute(
    `INSERT INTO products (id, tenant_id, slug, name, status, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.tenant_id,
      input.slug,
      input.name,
      input.status ?? "idea",
      input.description ?? null,
    ],
  );
  await db.execute(
    "INSERT INTO events (id, product_id, type, note) VALUES (?, ?, 'created', ?)",
    [uid(), id, "Product created"],
  );
  return id;
}

export async function updateProduct(
  id: string,
  patch: Partial<
    Pick<
      Product,
      | "name"
      | "status"
      | "description"
      | "sunset_at"
      | "repo_url"
      | "deploy_provider"
      | "deploy_app_name"
      | "deploy_url"
    >
  >,
) {
  const db = await getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  for (const [k, v] of Object.entries(patch)) {
    fields.push(`${k} = ?`);
    values.push(v);
  }
  if (!fields.length) return;
  values.push(id);
  await db.execute(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`, values);
}

export async function deleteProduct(id: string) {
  const db = await getDb();
  await db.execute("DELETE FROM products WHERE id = ?", [id]);
}

// ---------- Addons ----------
export async function listAddons(productId: string): Promise<Addon[]> {
  const db = await getDb();
  return db.select<Addon[]>(
    "SELECT * FROM addons WHERE product_id = ? ORDER BY vendor",
    [productId],
  );
}

export async function listAllAddons(): Promise<Addon[]> {
  const db = await getDb();
  return db.select<Addon[]>("SELECT * FROM addons");
}

export async function createAddon(input: {
  product_id: string;
  vendor: string;
  category?: string;
  cost_amount?: number;
  cost_currency?: string;
  cost_period?: string;
  renews_on?: string;
  secret_ref?: string;
  notes?: string;
}) {
  const db = await getDb();
  const id = uid();
  await db.execute(
    `INSERT INTO addons
     (id, product_id, vendor, category, cost_amount, cost_currency, cost_period, renews_on, secret_ref, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.product_id,
      input.vendor,
      input.category ?? null,
      input.cost_amount ?? null,
      input.cost_currency ?? "EUR",
      input.cost_period ?? "monthly",
      input.renews_on ?? null,
      input.secret_ref ?? null,
      input.notes ?? null,
    ],
  );
  return id;
}

export async function deleteAddon(id: string) {
  const db = await getDb();
  await db.execute("DELETE FROM addons WHERE id = ?", [id]);
}

export async function updateAddon(
  id: string,
  patch: Partial<
    Pick<
      Addon,
      | "vendor"
      | "category"
      | "status"
      | "cost_amount"
      | "cost_currency"
      | "cost_period"
      | "renews_on"
      | "secret_ref"
      | "notes"
    >
  >,
) {
  const db = await getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  for (const [k, v] of Object.entries(patch)) {
    fields.push(`${k} = ?`);
    values.push(v ?? null);
  }
  if (!fields.length) return;
  values.push(id);
  await db.execute(`UPDATE addons SET ${fields.join(", ")} WHERE id = ?`, values);
}
