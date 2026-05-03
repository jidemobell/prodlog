import { Database, KeyRound, HardDrive, Info } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          How Prodlog stores your data, by design.
        </p>
      </div>

      <Section icon={Database} tone="primary" title="Database">
        Your data lives in a single SQLite file inside the app's support directory:
        <pre className="mt-3 p-3 rounded-lg bg-[var(--color-bg)] text-xs font-mono overflow-x-auto">
          ~/Library/Application Support/com.atensai.prodlog/prodlog.db
        </pre>
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          Back it up with Time Machine, or copy that file anywhere you trust.
        </p>
      </Section>

      <Section icon={KeyRound} tone="amber" title="Secrets philosophy">
        Prodlog stores <strong>references</strong> to your secrets — never the secrets themselves.
        Use a URI-style pointer that fits your tooling:
        <ul className="mt-3 space-y-1 text-xs font-mono">
          <li className="text-[var(--color-muted)]">op://Atensai/Stripe/api_key  <span className="text-[var(--color-text)]">(1Password)</span></li>
          <li className="text-[var(--color-muted)]">bw://item-id  <span className="text-[var(--color-text)]">(Bitwarden)</span></li>
          <li className="text-[var(--color-muted)]">keychain://service/account  <span className="text-[var(--color-text)]">(macOS Keychain)</span></li>
        </ul>
      </Section>

      <Section icon={HardDrive} tone="mint" title="Backup & sync">
        Want sync across machines? Drop the support directory inside an iCloud / Dropbox /
        Syncthing folder and symlink it back. Or just commit a periodic export to a private repo —
        the schema is small and human-readable.
      </Section>

      <Section icon={Info} tone="rose" title="About">
        <div className="text-sm">
          <strong>Prodlog</strong> · personal product portfolio tracker
          <div className="text-xs text-[var(--color-muted)] mt-1">
            Built for Atensai · local-first · zero cloud
          </div>
        </div>
      </Section>
    </div>
  );
}

const TONES = {
  primary: { grad: "linear-gradient(135deg, #5c61f2, #7c80ff)", soft: "var(--color-primary-soft)" },
  mint: { grad: "linear-gradient(135deg, #54ba4a, #7ed074)", soft: "var(--color-mint-soft)" },
  amber: { grad: "linear-gradient(135deg, #f0a52e, #ffc163)", soft: "var(--color-amber-soft)" },
  rose: { grad: "linear-gradient(135deg, #ef4f6e, #ff7a93)", soft: "var(--color-rose-soft)" },
};

function Section({
  icon: Icon,
  tone,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof TONES;
  title: string;
  children: React.ReactNode;
}) {
  const t = TONES[tone];
  return (
    <section className="card p-6">
      <div className="flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
          style={{ background: t.grad }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 text-sm leading-relaxed">
          <h3 className="font-semibold mb-2">{title}</h3>
          {children}
        </div>
      </div>
    </section>
  );
}
