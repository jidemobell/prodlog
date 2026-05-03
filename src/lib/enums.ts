// Curated suggestion lists. Stored as plain TEXT in DB so users can add their own.

export const ADDON_CATEGORIES = [
  "hosting",
  "database",
  "auth",
  "payments",
  "email",
  "monitoring",
  "analytics",
  "storage",
  "ai",
  "dns",
  "cdn",
  "ci",
  "vcs",
  "secrets",
  "comms",
  "support",
  "domain",
  "other",
] as const;

export const DEPLOY_PROVIDERS = [
  "fly",
  "vercel",
  "railway",
  "render",
  "aws",
  "gcp",
  "azure",
  "self",
  "other",
] as const;

export const COST_PERIODS = ["monthly", "annual", "once", "free"] as const;
export const CURRENCIES = ["EUR", "USD", "GBP", "NGN"] as const;
