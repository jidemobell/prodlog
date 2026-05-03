import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Search } from "lucide-react";
import {
  createProduct,
  deleteProduct,
  listProducts,
  listTenants,
  createTenant,
} from "@/lib/repo";
import type { Product, Tenant } from "@/lib/db";
import { formatDate } from "@/lib/utils";

const STATUSES = ["all", "idea", "poc", "live", "migrated", "retired"] as const;

const STATUS_PILL: Record<string, { bg: string; color: string; label: string }> = {
  idea: { bg: "#eef0f6", color: "#54596d", label: "Idea" },
  poc: { bg: "var(--color-primary-soft)", color: "var(--color-primary)", label: "POC" },
  live: { bg: "var(--color-mint-soft)", color: "var(--color-mint)", label: "Live" },
  migrated: { bg: "var(--color-amber-soft)", color: "var(--color-amber)", label: "Migrated" },
  retired: { bg: "var(--color-rose-soft)", color: "var(--color-rose)", label: "Retired" },
};

const GRADIENTS = [
  "linear-gradient(135deg, #5c61f2, #43b9b2)",
  "linear-gradient(135deg, #c280d2, #ef4f6e)",
  "linear-gradient(135deg, #f0a52e, #ef4f6e)",
  "linear-gradient(135deg, #43b9b2, #54ba4a)",
  "linear-gradient(135deg, #5c61f2, #c280d2)",
];
function gradientFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return GRADIENTS[h % GRADIENTS.length];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>("all");
  const [query, setQuery] = useState("");

  async function refresh() {
    setProducts(await listProducts());
    setTenants(await listTenants());
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (filter !== "all" && p.status !== filter) return false;
        if (query && !`${p.name} ${p.slug}`.toLowerCase().includes(query.toLowerCase()))
          return false;
        return true;
      }),
    [products, filter, query],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            Products
            <span className="badge" style={{ background: "var(--color-bg)", color: "var(--color-muted)" }}>
              {products.length}
            </span>
          </h2>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Everything you ship, with its stack and lifecycle.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> New product
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            placeholder="Search by name or slug…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-[var(--color-bg)] rounded-lg">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={
                "px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition " +
                (filter === s
                  ? "bg-white text-[var(--color-text)] shadow-sm"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]")
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <ProductForm
          tenants={tenants}
          onCancel={() => setShowForm(false)}
          onCreate={async (input) => {
            await createProduct(input);
            setShowForm(false);
            refresh();
          }}
          onCreateTenant={async (slug, name) => {
            await createTenant({ slug, name });
            setTenants(await listTenants());
          }}
        />
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-soft)] mx-auto mb-4 flex items-center justify-center">
              <Plus className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <p className="font-medium">No products{filter !== "all" ? ` in "${filter}"` : ""}</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">
              {products.length === 0
                ? "Create your first one to get started."
                : "Try a different filter or search."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-bg)] text-left text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-semibold">
              <tr>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5">Slug</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Created</th>
                <th className="px-6 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filtered.map((p) => {
                const s = STATUS_PILL[p.status] ?? STATUS_PILL.idea;
                return (
                  <tr key={p.id} className="hover:bg-[var(--color-bg)] transition">
                    <td className="px-6 py-4">
                      <Link to={`/products/${p.id}`} className="flex items-center gap-3 group">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-semibold shrink-0"
                          style={{ background: gradientFor(p.id) }}
                        >
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium group-hover:text-[var(--color-primary)] transition truncate">
                            {p.name}
                          </div>
                          {p.description && (
                            <div className="text-xs text-[var(--color-muted)] truncate max-w-[300px]">
                              {p.description}
                            </div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-muted)] font-mono text-xs">
                      {p.slug}
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge" style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-muted)]">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={async () => {
                          if (!confirm("Delete this product?")) return;
                          await deleteProduct(p.id);
                          refresh();
                        }}
                        className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-rose)] hover:bg-[var(--color-rose-soft)] transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ProductForm({
  tenants,
  onCancel,
  onCreate,
  onCreateTenant,
}: {
  tenants: Tenant[];
  onCancel: () => void;
  onCreate: (i: {
    tenant_id: string;
    slug: string;
    name: string;
    status: string;
    description: string;
  }) => Promise<void>;
  onCreateTenant: (slug: string, name: string) => Promise<void>;
}) {
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("idea");
  const [description, setDescription] = useState("");
  const [showNewTenant, setShowNewTenant] = useState(tenants.length === 0);
  const [newTenantName, setNewTenantName] = useState("Atensai");
  const [newTenantSlug, setNewTenantSlug] = useState("atensai");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (showNewTenant) {
      await onCreateTenant(newTenantSlug, newTenantName);
      return; // user re-submits with the new tenant selected
    }
    if (!tenantId) return;
    await onCreate({ tenant_id: tenantId, slug, name, status, description });
  }

  return (
    <form onSubmit={submit} className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">New product</h3>
        <button type="button" onClick={onCancel} className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]">
          Cancel
        </button>
      </div>

      {showNewTenant ? (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tenant name">
            <input className="input" value={newTenantName} onChange={(e) => setNewTenantName(e.target.value)} required />
          </Field>
          <Field label="Tenant slug">
            <input className="input" value={newTenantSlug} onChange={(e) => setNewTenantSlug(e.target.value)} required />
          </Field>
        </div>
      ) : (
        <Field label="Tenant">
          <div className="flex gap-2">
            <select className="input flex-1" value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button type="button" onClick={() => setShowNewTenant(true)} className="btn-ghost">
              + New tenant
            </button>
          </div>
        </Field>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Name">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="StudyCircle" />
        </Field>
        <Field label="Slug">
          <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="studycircle" />
        </Field>
      </div>

      <Field label="Status">
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          {Object.entries(STATUS_PILL).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </Field>

      <Field label="Description">
        <textarea className="input min-h-[80px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description (optional)" />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
        <button type="submit" className="btn-primary">
          {showNewTenant ? "Create tenant" : "Create product"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
