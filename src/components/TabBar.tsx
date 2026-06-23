import type { TabKey } from "../types";

export const TABS: { key: TabKey; label: string }[] = [
  { key: "uebersicht", label: "Übersicht" },
  { key: "kredit", label: "Kredit" },
  { key: "nebenkosten", label: "Kaufnebenkosten" },
  { key: "renovierung", label: "Renovierung" },
  { key: "laufende", label: "Laufende Kosten" },
  { key: "mietenkaufen", label: "Mieten vs. Kaufen" },
  { key: "verkauf", label: "Verkauf" },
  { key: "modernisierung", label: "Modernisierungsrisiko" },
  { key: "foerderung", label: "Förderungen" },
  { key: "hausakte", label: "Hausakte" },
];

interface TabBarProps {
  tab: TabKey;
  setTab: (tab: TabKey) => void;
}

export function TabBar({ tab, setTab }: TabBarProps) {
  return (
    <nav className="tab-bar">
      {TABS.map((t) => (
        <button
          key={t.key}
          className={`tab-btn ${tab === t.key ? "active" : ""}`}
          onClick={() => setTab(t.key)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
