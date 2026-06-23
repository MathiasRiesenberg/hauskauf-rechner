export function formatEUR(n: number): string {
  if (!Number.isFinite(n)) return "–";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatEURFein(n: number): string {
  if (!Number.isFinite(n)) return "–";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatPct(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "–";
  return `${n.toLocaleString("de-DE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} %`;
}

export function formatZahl(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return "–";
  return n.toLocaleString("de-DE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatJahreMonate(monate: number): string {
  if (!Number.isFinite(monate)) return "–";
  const jahre = Math.floor(monate / 12);
  const restMonate = Math.round(monate % 12);
  if (jahre <= 0) return `${restMonate} Monate`;
  if (restMonate === 0) return `${jahre} ${jahre === 1 ? "Jahr" : "Jahre"}`;
  return `${jahre} ${jahre === 1 ? "Jahr" : "Jahre"}, ${restMonate} Mon.`;
}

export function formatDatum(iso: string): string {
  if (!iso) return "–";
  try {
    return new Date(iso).toLocaleDateString("de-DE");
  } catch {
    return iso;
  }
}
