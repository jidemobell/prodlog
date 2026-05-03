import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Building2,
  Settings,
  Search,
  Bell,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDisplayName } from "@/lib/profile";
import logo from "@/assets/prodlog-logo.png";

const mainNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/tenants", label: "Tenants", icon: Building2 },
];

const systemNav = [{ to: "/settings", label: "Settings", icon: Settings }];

export default function AppLayout() {
  const loc = useLocation();
  const displayName = useDisplayName();
  const initials = displayName
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "P";
  const title = (() => {
    if (loc.pathname.startsWith("/dashboard")) return "Dashboard";
    if (loc.pathname.startsWith("/products")) return "Products";
    if (loc.pathname.startsWith("/tenants")) return "Tenants";
    if (loc.pathname.startsWith("/settings")) return "Settings";
    return "Prodlog";
  })();

  return (
    <div className="flex h-screen">
      <aside className="w-64 shrink-0 bg-white border-r border-[var(--color-border)] flex flex-col">
        <div className="h-20 px-5 flex items-center gap-3 border-b border-[var(--color-border)]">
          <img
            src={logo}
            alt="Prodlog"
            className="w-10 h-10 rounded-xl object-cover shadow-md"
          />
          <div>
            <div className="font-semibold leading-tight tracking-tight">Prodlog</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          <NavGroup label="Workspace" items={mainNav} />
          <NavGroup label="System" items={systemNav} />
        </nav>

        <div className="m-3 p-3 rounded-xl bg-[var(--color-bg)] flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, #c280d2, #ef4f6e)" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{displayName}</div>
            <div className="text-xs text-[var(--color-muted)] truncate">Local-only</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-20 px-8 flex items-center justify-between bg-white border-b border-[var(--color-border)]">
          <div>
            <div className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-0.5">
              Workspace
            </div>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <input
                placeholder="Search products, vendors…"
                className="pl-9 pr-3 py-2 w-72 rounded-lg bg-[var(--color-bg)] border border-transparent focus:border-[var(--color-border)] focus:bg-white text-sm outline-none transition"
              />
            </div>
            <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--color-bg)] hover:bg-[var(--color-border)] transition relative">
              <Bell className="w-4 h-4 text-[var(--color-text)]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-rose)] rounded-full"></span>
            </button>
            <NavLink to="/products" className="btn-primary">
              <Plus className="w-4 h-4" />
              New
            </NavLink>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavGroup({
  label,
  items,
}: {
  label: string;
  items: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] px-3 mb-2 font-semibold">
        {label}
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative",
                  isActive
                    ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                    : "text-[var(--color-text)] hover:bg-[var(--color-bg)]",
                )
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
