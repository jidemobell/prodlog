import { useEffect, useState } from "react";
import { listTenants, createTenant, deleteTenant, listProducts } from "@/lib/repo";
import type { Tenant, Product } from "@/lib/db";
import { Plus, Trash2, Building2 } from "lucide-react";

const GRADIENTS = [
  "linear-gradient(135deg, #5c61f2, #43b9b2)",
  "linear-gradient(135deg, #c280d2, #ef4f6e)",
  "linear-gradient(135deg, #f0a52e, #ef4f6e)",
  "linear-gradient(135deg, #43b9b2, #54ba4a)",
];
function gradientFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return GRADIENTS[h % GRADIENTS.length];
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  async function refresh() {
    setTenants(await listTenants());
    setProducts(await listProducts());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !slug) return;
    await createTenant({ slug, name });
    setName("");
    setSlug("");
    refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          Tenants
          <span className="badge" style={{ background: "var(--color-bg)", color: "var(--color-muted)" }}>
            {tenants.length}
          </span>
        </h2>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          The companies and brands under which products live.
        </p>
      </div>

      <form onSubmit={add} className="card p-5 flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1.5">
            Name
          </label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Atensai" />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1.5">
            Slug
          </label>
          <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="atensai" />
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" /> Add tenant
        </button>
      </form>

      {tenants.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-soft)] mx-auto mb-4 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-[var(--color-primary)]" />
          </div>
          <p className="font-medium">No tenants yet</p>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Start by adding Atensai (or any brand you ship under).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((t) => {
            const count = products.filter((p) => p.tenant_id === t.id).length;
            return (
              <div key={t.id} className="card p-5 flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold shrink-0"
                  style={{ background: gradientFor(t.id) }}
                >
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{t.name}</div>
                  <div className="text-xs text-[var(--color-muted)] font-mono truncate">{t.slug}</div>
                  <div className="text-xs text-[var(--color-muted)] mt-2">
                    {count} product{count === 1 ? "" : "s"}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!confirm("Delete tenant and all its products?")) return;
                    await deleteTenant(t.id);
                    refresh();
                  }}
                  className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-rose)] hover:bg-[var(--color-rose-soft)] transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
