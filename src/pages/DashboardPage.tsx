import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  ArrowUpRight,
  Calendar,
  Activity,
} from "lucide-react";
import { listProducts, listAllAddons, listTenants } from "@/lib/repo";
import type { Product, Addon, Tenant } from "@/lib/db";
import { formatMoney, formatDate, cn } from "@/lib/utils";

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    (async () => {
      setProducts(await listProducts());
      setAddons(await listAllAddons());
      setTenants(await listTenants());
    })();
  }, []);

  const live = products.filter((p) => p.status === "live").length;
  const monthly = addons.reduce((sum, a) => {
    if (a.cost_period === "monthly" && a.cost_amount) return sum + a.cost_amount;
    if (a.cost_period === "annual" && a.cost_amount) return sum + a.cost_amount / 12;
    return sum;
  }, 0);

  const upcoming = addons
    .filter((a) => a.renews_on)
    .filter((a) => {
      const d = new Date(a.renews_on!);
      const now = new Date();
      const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 60;
    })
    .sort((a, b) => (a.renews_on! < b.renews_on! ? -1 : 1));

  const statusBreakdown = (["idea", "poc", "live", "migrated", "retired"] as const).map(
    (s) => ({
      status: s,
      count: products.filter((p) => p.status === s).length,
    }),
  );
  const total = products.length || 1;

  const recent = [...products]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Welcome back, Jide</h2>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Here's what's happening across your portfolio.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[var(--color-border)]">
          <Calendar className="w-4 h-4 text-[var(--color-muted)]" />
          <span className="text-sm text-[var(--color-text)]">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="Total products"
          value={products.length}
          delta={`${tenants.length} tenants`}
          icon={Package}
          tone="primary"
        />
        <KpiCard
          label="Live"
          value={live}
          delta={`${Math.round((live / total) * 100)}% of portfolio`}
          icon={CheckCircle2}
          tone="mint"
        />
        <KpiCard
          label="Monthly cost"
          value={formatMoney(monthly)}
          delta={`${addons.length} add-ons`}
          icon={TrendingUp}
          tone="amber"
          isText
        />
        <KpiCard
          label="Renewals · 60d"
          value={upcoming.length}
          delta={upcoming.length ? "review soon" : "all clear"}
          icon={AlertCircle}
          tone="rose"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Status breakdown */}
        <section className="card p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold">Lifecycle</h3>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                Products by status
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[var(--color-primary-soft)] flex items-center justify-center">
              <Activity className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
          </div>
          <div className="space-y-4">
            {statusBreakdown.map((s) => {
              const pct = (s.count / total) * 100;
              return (
                <div key={s.status}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="capitalize font-medium">{s.status}</span>
                    <span className="text-[var(--color-muted)] tabular-nums">
                      {s.count}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-bg)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: STATUS_BAR[s.status],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Upcoming renewals */}
        <section className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold">Upcoming renewals</h3>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                Next 60 days
              </p>
            </div>
            <Link
              to="/products"
              className="text-xs text-[var(--color-primary)] flex items-center gap-1 font-medium"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-[var(--color-mint-soft)] mx-auto mb-3 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[var(--color-mint)]" />
              </div>
              <p className="text-sm font-medium">All clear</p>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Nothing renewing in the next 60 days.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {upcoming.map((a) => {
                const days = Math.ceil(
                  (new Date(a.renews_on!).getTime() - Date.now()) / 86400000,
                );
                const urgency =
                  days <= 7 ? "rose" : days <= 30 ? "amber" : "teal";
                return (
                  <li key={a.id} className="py-3 flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{
                        background:
                          urgency === "rose"
                            ? "var(--color-rose-soft)"
                            : urgency === "amber"
                              ? "var(--color-amber-soft)"
                              : "var(--color-teal-soft)",
                      }}
                    >
                      <Calendar
                        className="w-4 h-4"
                        style={{
                          color:
                            urgency === "rose"
                              ? "var(--color-rose)"
                              : urgency === "amber"
                                ? "var(--color-amber)"
                                : "var(--color-teal)",
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {a.vendor}
                      </div>
                      <div className="text-xs text-[var(--color-muted)]">
                        {formatDate(a.renews_on)} · in {days} day
                        {days === 1 ? "" : "s"}
                      </div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">
                      {formatMoney(a.cost_amount, a.cost_currency ?? "EUR")}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Recent products */}
      <section className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold">Recently added</h3>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              Latest 5 products in your portfolio
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs text-[var(--color-primary)] flex items-center gap-1 font-medium"
          >
            All products <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)] py-6 text-center">
            No products yet — head over to{" "}
            <Link to="/products" className="text-[var(--color-primary)]">
              Products
            </Link>{" "}
            to add your first.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recent.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="group p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-md transition-all bg-white"
              >
                <div className="flex items-start justify-between mb-2">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                    style={{
                      background: gradientFor(p.id),
                    }}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <StatusPill status={p.status} />
                </div>
                <div className="font-semibold text-sm group-hover:text-[var(--color-primary)] transition">
                  {p.name}
                </div>
                <div className="text-xs text-[var(--color-muted)] mt-0.5 truncate">
                  {p.slug}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const KPI_TONES = {
  primary: {
    grad: "linear-gradient(135deg, #5c61f2 0%, #7c80ff 100%)",
    soft: "var(--color-primary-soft)",
    color: "var(--color-primary)",
  },
  mint: {
    grad: "linear-gradient(135deg, #54ba4a 0%, #7ed074 100%)",
    soft: "var(--color-mint-soft)",
    color: "var(--color-mint)",
  },
  amber: {
    grad: "linear-gradient(135deg, #f0a52e 0%, #ffc163 100%)",
    soft: "var(--color-amber-soft)",
    color: "var(--color-amber)",
  },
  rose: {
    grad: "linear-gradient(135deg, #ef4f6e 0%, #ff7a93 100%)",
    soft: "var(--color-rose-soft)",
    color: "var(--color-rose)",
  },
};

function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  tone,
  isText = false,
}: {
  label: string;
  value: number | string;
  delta: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof KPI_TONES;
  isText?: boolean;
}) {
  const t = KPI_TONES[tone];
  return (
    <div className="card p-5 relative overflow-hidden">
      <div
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-50"
        style={{ background: t.soft }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ background: t.grad }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <ArrowUpRight
            className="w-4 h-4 text-[var(--color-muted)]"
            strokeWidth={2.5}
          />
        </div>
        <div className="text-xs uppercase tracking-wider text-[var(--color-muted)] font-semibold">
          {label}
        </div>
        <div
          className={cn(
            "font-semibold mt-1 tracking-tight tabular-nums",
            isText ? "text-2xl" : "text-3xl",
          )}
        >
          {value}
        </div>
        <div className="text-xs text-[var(--color-muted)] mt-1.5">{delta}</div>
      </div>
    </div>
  );
}

const STATUS_BAR: Record<string, string> = {
  idea: "linear-gradient(90deg, #c1c4d4, #a9adc1)",
  poc: "linear-gradient(90deg, #5c61f2, #7c80ff)",
  live: "linear-gradient(90deg, #54ba4a, #7ed074)",
  migrated: "linear-gradient(90deg, #f0a52e, #ffc163)",
  retired: "linear-gradient(90deg, #ef4f6e, #ff7a93)",
};

const STATUS_PILL: Record<string, { bg: string; color: string; label: string }> = {
  idea: { bg: "#eef0f6", color: "#54596d", label: "Idea" },
  poc: { bg: "var(--color-primary-soft)", color: "var(--color-primary)", label: "POC" },
  live: { bg: "var(--color-mint-soft)", color: "var(--color-mint)", label: "Live" },
  migrated: { bg: "var(--color-amber-soft)", color: "var(--color-amber)", label: "Migrated" },
  retired: { bg: "var(--color-rose-soft)", color: "var(--color-rose)", label: "Retired" },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_PILL[status] ?? STATUS_PILL.idea;
  return (
    <span className="badge" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

const GRADIENTS = [
  "linear-gradient(135deg, #5c61f2, #43b9b2)",
  "linear-gradient(135deg, #c280d2, #ef4f6e)",
  "linear-gradient(135deg, #f0a52e, #ef4f6e)",
  "linear-gradient(135deg, #43b9b2, #54ba4a)",
  "linear-gradient(135deg, #5c61f2, #c280d2)",
  "linear-gradient(135deg, #f0a52e, #c280d2)",
];

function gradientFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return GRADIENTS[h % GRADIENTS.length];
}
