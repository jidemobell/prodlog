import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ExternalLink,
  KeyRound,
  Pencil,
  GitBranch,
  Rocket,
  FileText,
  Palette,
  Activity,
  Link as LinkIcon,
  Check,
  X,
} from "lucide-react";
import {
  getProduct,
  listAddons,
  createAddon,
  deleteAddon,
  updateAddon,
  listProductLinks,
  createProductLink,
  updateProductLink,
  deleteProductLink,
} from "@/lib/repo";
import type { Product, Addon, ProductLink, ProductLinkKind } from "@/lib/db";
import { ADDON_CATEGORIES, COST_PERIODS, CURRENCIES } from "@/lib/enums";
import { formatMoney, formatDate } from "@/lib/utils";

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

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [links, setLinks] = useState<ProductLink[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  async function refresh() {
    if (!id) return;
    setProduct(await getProduct(id));
    setAddons(await listAddons(id));
    setLinks(await listProductLinks(id));
  }

  useEffect(() => {
    refresh();
  }, [id]);

  if (!product) {
    return <div className="text-sm text-[var(--color-muted)]">Loading…</div>;
  }

  const s = STATUS_PILL[product.status] ?? STATUS_PILL.idea;
  const monthly = addons.reduce((sum, a) => {
    if (a.cost_period === "monthly" && a.cost_amount) return sum + a.cost_amount;
    if (a.cost_period === "annual" && a.cost_amount) return sum + a.cost_amount / 12;
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      <Link
        to="/products"
        className="text-sm text-[var(--color-muted)] inline-flex items-center gap-1 hover:text-[var(--color-primary)] transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to products
      </Link>

      {/* Hero */}
      <div className="card p-6 flex items-start gap-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-semibold shrink-0 shadow-md"
          style={{ background: gradientFor(product.id) }}
        >
          {product.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-semibold truncate">{product.name}</h2>
            <span className="badge" style={{ background: s.bg, color: s.color }}>
              {s.label}
            </span>
          </div>
          <div className="text-sm text-[var(--color-muted)] font-mono">{product.slug}</div>
          {product.description && (
            <p className="mt-3 text-sm text-[var(--color-text)]">{product.description}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs uppercase tracking-wider text-[var(--color-muted)] font-semibold">
            Monthly
          </div>
          <div className="text-2xl font-semibold tabular-nums mt-1">{formatMoney(monthly)}</div>
          <div className="text-xs text-[var(--color-muted)] mt-1">{addons.length} add-ons</div>
        </div>
      </div>

      {/* Links */}
      <section className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Links</h3>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              Repos, deployments, docs, dashboards — anything you need at hand
            </p>
          </div>
          {!showLinkForm && !editingLinkId && (
            <button onClick={() => setShowLinkForm(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add link
            </button>
          )}
        </div>

        {showLinkForm && (
          <div className="mb-4">
            <ProductLinkForm
              productId={product.id}
              onCancel={() => setShowLinkForm(false)}
              onSaved={() => {
                setShowLinkForm(false);
                refresh();
              }}
            />
          </div>
        )}

        {links.length === 0 && !showLinkForm ? (
          <p className="text-sm text-[var(--color-muted)]">
            No links yet. Add your repo, deployment, design file, dashboard…
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {links.map((l) =>
              editingLinkId === l.id ? (
                <div key={l.id} className="md:col-span-2">
                  <ProductLinkForm
                    productId={product.id}
                    link={l}
                    onCancel={() => setEditingLinkId(null)}
                    onSaved={() => {
                      setEditingLinkId(null);
                      refresh();
                    }}
                  />
                </div>
              ) : (
                <LinkChip
                  key={l.id}
                  link={l}
                  onEdit={() => setEditingLinkId(l.id)}
                  onClear={async () => {
                    await deleteProductLink(l.id);
                    refresh();
                  }}
                />
              ),
            )}
          </div>
        )}
      </section>

      {/* Add-ons */}
      <section className="card overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-[var(--color-border)]">
          <div>
            <h3 className="font-semibold">Add-ons</h3>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              Vendors, costs, renewals & secret references
            </p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setShowCreate(true);
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {showCreate && (
          <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
            <AddonForm
              productId={product.id}
              onCancel={() => setShowCreate(false)}
              onSaved={() => {
                setShowCreate(false);
                refresh();
              }}
            />
          </div>
        )}

        {addons.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-soft)] mx-auto mb-3 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <p className="font-medium">No add-ons yet</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">
              Track every vendor and subscription tied to this product.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-bg)] text-left text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-semibold">
              <tr>
                <th className="px-6 py-3.5">Vendor</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Cost</th>
                <th className="px-6 py-3.5">Renews</th>
                <th className="px-6 py-3.5">URL</th>
                <th className="px-6 py-3.5">Secret</th>
                <th className="px-6 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {addons.map((a) =>
                editingId === a.id ? (
                  <tr key={a.id} className="bg-[var(--color-primary-soft)]/30">
                    <td colSpan={7} className="p-5">
                      <AddonForm
                        productId={product.id}
                        addon={a}
                        onCancel={() => setEditingId(null)}
                        onSaved={() => {
                          setEditingId(null);
                          refresh();
                        }}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={a.id} className="hover:bg-[var(--color-bg)] transition">
                    <td className="px-6 py-4 font-medium">{a.vendor}</td>
                    <td className="px-6 py-4">
                      {a.category ? (
                        <span className="badge" style={{ background: "var(--color-bg)", color: "var(--color-muted)" }}>
                          {a.category}
                        </span>
                      ) : (
                        <span className="text-[var(--color-muted)]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 tabular-nums">
                      {formatMoney(a.cost_amount, a.cost_currency ?? "EUR")}
                      <span className="text-xs text-[var(--color-muted)] ml-1">/{a.cost_period}</span>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-muted)]">{formatDate(a.renews_on)}</td>
                    <td className="px-6 py-4">
                      {a.url ? (
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline font-mono max-w-[220px] truncate"
                          title={a.url}
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{a.url.replace(/^https?:\/\//, "")}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-[var(--color-muted)]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {a.secret_ref ? (
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-mono"
                          title={a.secret_ref}
                        >
                          <KeyRound className="w-3 h-3" />
                          <span className="max-w-[200px] truncate">{a.secret_ref}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--color-muted)]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setShowCreate(false);
                          setEditingId(a.id);
                        }}
                        className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] transition mr-1"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          await deleteAddon(a.id);
                          refresh();
                        }}
                        className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-rose)] hover:bg-[var(--color-rose-soft)] transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

// ---------- LinkChip ----------
const LINK_KIND_META: Record<
  ProductLinkKind,
  { icon: React.ComponentType<{ className?: string }>; grad: string; tone: string }
> = {
  repo: {
    icon: GitBranch,
    grad: "linear-gradient(135deg, #5c61f2, #7c80ff)",
    tone: "Repo",
  },
  deploy: {
    icon: Rocket,
    grad: "linear-gradient(135deg, #54ba4a, #7ed074)",
    tone: "Deploy",
  },
  docs: {
    icon: FileText,
    grad: "linear-gradient(135deg, #43b9b2, #6dd2cc)",
    tone: "Docs",
  },
  design: {
    icon: Palette,
    grad: "linear-gradient(135deg, #c280d2, #e0a4f0)",
    tone: "Design",
  },
  dashboard: {
    icon: Activity,
    grad: "linear-gradient(135deg, #f0a52e, #ffc163)",
    tone: "Dashboard",
  },
  other: {
    icon: LinkIcon,
    grad: "linear-gradient(135deg, #54596d, #7a8094)",
    tone: "Link",
  },
};

const LINK_KINDS: ProductLinkKind[] = ["repo", "deploy", "docs", "design", "dashboard", "other"];

function LinkChip({
  link,
  onEdit,
  onClear,
}: {
  link: ProductLink;
  onEdit?: () => void;
  onClear?: () => void;
}) {
  const meta = LINK_KIND_META[link.kind] ?? LINK_KIND_META.other;
  const Icon = meta.icon;
  const subtitle =
    link.url ||
    [link.provider, link.app_name].filter(Boolean).join(" · ") ||
    "—";
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] transition group">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
        style={{ background: meta.grad }}
      >
        <Icon className="w-4 h-4" />
      </div>
      {link.url ? (
        <a
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="flex-1 min-w-0 flex items-center gap-2"
        >
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wider text-[var(--color-muted)] font-semibold">
              {link.label}
            </div>
            <div className="text-sm font-mono truncate group-hover:text-[var(--color-primary)] transition">
              {subtitle}
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-[var(--color-muted)] shrink-0" />
        </a>
      ) : (
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wider text-[var(--color-muted)] font-semibold">
            {link.label}
          </div>
          <div className="text-sm font-mono truncate">{subtitle}</div>
        </div>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          title="Edit"
          className="p-1.5 rounded-md text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] transition shrink-0"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}
      {onClear && <ConfirmTrash onConfirm={onClear} />}
    </div>
  );
}

function ConfirmTrash({ onConfirm }: { onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      onClick={() => {
        if (!armed) {
          setArmed(true);
          return;
        }
        onConfirm();
        setArmed(false);
      }}
      title={armed ? "Click again to confirm" : "Remove"}
      className={
        "shrink-0 transition rounded-md " +
        (armed
          ? "px-2 py-1 text-xs font-medium bg-[var(--color-rose)] text-white"
          : "p-1.5 text-[var(--color-muted)] hover:text-[var(--color-rose)] hover:bg-[var(--color-rose-soft)]")
      }
    >
      {armed ? "Confirm?" : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  );
}

// ---------- ProductLinkForm ----------
const KIND_DEFAULT_LABEL: Record<ProductLinkKind, string> = {
  repo: "Repository",
  deploy: "Deployment",
  docs: "Docs",
  design: "Design",
  dashboard: "Dashboard",
  other: "Link",
};

function ProductLinkForm({
  productId,
  link,
  onCancel,
  onSaved,
}: {
  productId: string;
  link?: ProductLink;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!link;
  const [kind, setKind] = useState<ProductLinkKind>(link?.kind ?? "repo");
  const [label, setLabel] = useState(link?.label ?? KIND_DEFAULT_LABEL.repo);
  const [url, setUrl] = useState(link?.url ?? "");
  const [provider, setProvider] = useState(link?.provider ?? "");
  const [appName, setAppName] = useState(link?.app_name ?? "");

  function onKindChange(next: ProductLinkKind) {
    setKind(next);
    // auto-update label only if it still matches a default (user hasn't customized)
    const wasDefault = Object.values(KIND_DEFAULT_LABEL).includes(label);
    if (!isEdit || wasDefault) setLabel(KIND_DEFAULT_LABEL[next]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      kind,
      label: label.trim() || KIND_DEFAULT_LABEL[kind],
      url: url.trim() || undefined,
      provider: provider.trim() || undefined,
      app_name: appName.trim() || undefined,
    };
    if (isEdit && link) {
      await updateProductLink(link.id, {
        kind: payload.kind,
        label: payload.label,
        url: payload.url ?? null,
        provider: payload.provider ?? null,
        app_name: payload.app_name ?? null,
      });
    } else {
      await createProductLink({ product_id: productId, ...payload });
    }
    onSaved();
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">{isEdit ? "Edit link" : "New link"}</h4>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {LINK_KINDS.map((k) => {
          const meta = LINK_KIND_META[k];
          const Icon = meta.icon;
          const active = kind === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onKindChange(k)}
              className={
                "flex flex-col items-center gap-1 py-2 rounded-lg border text-xs transition " +
                (active
                  ? "border-[var(--color-primary)] bg-white shadow-sm text-[var(--color-primary)]"
                  : "border-transparent hover:bg-white text-[var(--color-muted)]")
              }
            >
              <Icon className="w-4 h-4" />
              <span className="capitalize">{k}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Label">
          <input
            className="input"
            placeholder={KIND_DEFAULT_LABEL[kind]}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
          />
        </Field>
        <Field label="URL">
          <input
            className="input font-mono"
            placeholder="https://…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </Field>
      </div>

      {kind === "deploy" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Provider">
            <input
              className="input"
              placeholder="fly · vercel · railway…"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            />
          </Field>
          <Field label="App name">
            <input
              className="input"
              placeholder="studycircle-api"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
            />
          </Field>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="btn-ghost">
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
        <button type="submit" className="btn-primary">
          <Check className="w-4 h-4" /> {isEdit ? "Save changes" : "Add link"}
        </button>
      </div>
    </form>
  );
}

// ---------- AddonForm (create + edit) ----------
function AddonForm({
  productId,
  addon,
  onCancel,
  onSaved,
}: {
  productId: string;
  addon?: Addon;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [vendor, setVendor] = useState(addon?.vendor ?? "");
  const [category, setCategory] = useState(addon?.category ?? "");
  const [url, setUrl] = useState(addon?.url ?? "");
  const [costAmount, setCostAmount] = useState(
    addon?.cost_amount != null ? String(addon.cost_amount) : "",
  );
  const [costCurrency, setCostCurrency] = useState(addon?.cost_currency ?? "EUR");
  const [costPeriod, setCostPeriod] = useState(addon?.cost_period ?? "monthly");
  const [renewsOn, setRenewsOn] = useState(addon?.renews_on ?? "");
  const [secretRef, setSecretRef] = useState(addon?.secret_ref ?? "");
  const [notes, setNotes] = useState(addon?.notes ?? "");

  const isEdit = !!addon;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      vendor,
      category: category || undefined,
      url: url || undefined,
      cost_amount: costAmount ? parseFloat(costAmount) : undefined,
      cost_currency: costCurrency,
      cost_period: costPeriod,
      renews_on: renewsOn || undefined,
      secret_ref: secretRef || undefined,
      notes: notes || undefined,
    };
    if (isEdit && addon) {
      await updateAddon(addon.id, {
        vendor: payload.vendor,
        category: payload.category ?? null,
        url: payload.url ?? null,
        cost_amount: payload.cost_amount ?? null,
        cost_currency: payload.cost_currency ?? null,
        cost_period: payload.cost_period ?? null,
        renews_on: payload.renews_on ?? null,
        secret_ref: payload.secret_ref ?? null,
        notes: payload.notes ?? null,
      });
    } else {
      await createAddon({ product_id: productId, ...payload });
    }
    onSaved();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">
          {isEdit ? "Edit add-on" : "New add-on"}
        </h4>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Vendor">
          <input
            className="input"
            placeholder="Stripe"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            required
          />
        </Field>
        <Field label="Category">
          <input
            className="input"
            list="addon-categories"
            placeholder="payments"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <datalist id="addon-categories">
            {ADDON_CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Renews on">
          <input
            className="input"
            type="date"
            value={renewsOn}
            onChange={(e) => setRenewsOn(e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Amount">
          <input
            className="input"
            type="number"
            step="0.01"
            value={costAmount}
            onChange={(e) => setCostAmount(e.target.value)}
          />
        </Field>
        <Field label="Currency">
          <select
            className="input"
            value={costCurrency}
            onChange={(e) => setCostCurrency(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Period">
          <select
            className="input"
            value={costPeriod}
            onChange={(e) => setCostPeriod(e.target.value)}
          >
            {COST_PERIODS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Project URL">
        <input
          className="input font-mono"
          placeholder="https://app.supabase.com/project/abc123"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </Field>
      <Field label="Secret reference">
        <input
          className="input font-mono"
          placeholder="op://Atensai/stripe/api_key"
          value={secretRef}
          onChange={(e) => setSecretRef(e.target.value)}
        />
      </Field>
      <Field label="Notes">
        <textarea
          className="input min-h-[60px]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="btn-ghost">
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
        <button type="submit" className="btn-primary">
          <Check className="w-4 h-4" /> {isEdit ? "Save changes" : "Add"}
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
