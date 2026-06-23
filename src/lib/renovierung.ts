import type { RenovierungsKategorie, RenovierungsPosten, Zustand } from "../types";

interface KategorieDefinition {
  label: string;
  einheit: string;
  vollkosten: (wohnflaeche: number) => number;
}

export const RENOVIERUNG_BASIS: Record<RenovierungsKategorie, KategorieDefinition> = {
  elektrik: {
    label: "Elektrik (Neuverkabelung)",
    einheit: "120 €/m²",
    vollkosten: (w) => w * 120,
  },
  heizung: {
    label: "Heizung (neues Heizsystem)",
    einheit: "110 €/m²",
    vollkosten: (w) => w * 110,
  },
  fenster: {
    label: "Fenster (Austausch)",
    einheit: "~700 € pro Fenster",
    vollkosten: (w) => Math.max(1, Math.round(w / 10)) * 700,
  },
  dach: {
    label: "Dach (Neueindeckung)",
    einheit: "140 €/m²",
    vollkosten: (w) => w * 140,
  },
  fassade: {
    label: "Fassade (Dämmung & Anstrich)",
    einheit: "120 €/m² Fassade",
    vollkosten: (w) => w * 0.8 * 120,
  },
  badezimmer: {
    label: "Badezimmer (Sanierung)",
    einheit: "~15.000 € pro Bad",
    vollkosten: (w) => Math.max(1, Math.round(w / 80)) * 15000,
  },
  boeden: {
    label: "Böden (Erneuerung)",
    einheit: "60 €/m²",
    vollkosten: (w) => w * 60,
  },
  tueren: {
    label: "Innentüren (Austausch)",
    einheit: "~750 € pro Tür",
    vollkosten: (w) => Math.max(3, Math.round(w / 15)) * 750,
  },
  kueche: {
    label: "Küche (Einbauküche)",
    einheit: "Pauschale",
    vollkosten: () => 12000,
  },
  malerarbeiten: {
    label: "Malerarbeiten (gesamt)",
    einheit: "20 €/m²",
    vollkosten: (w) => w * 20,
  },
};

export const RENOVIERUNG_REIHENFOLGE: RenovierungsKategorie[] = [
  "elektrik",
  "heizung",
  "fenster",
  "dach",
  "fassade",
  "badezimmer",
  "boeden",
  "tueren",
  "kueche",
  "malerarbeiten",
];

export const ZUSTAND_LABEL: Record<Zustand, string> = {
  neuwertig: "Neuwertig",
  gut: "Gut",
  renovierungsbeduerftig: "Renovierungsbedürftig",
  sanierungsbeduerftig: "Sanierungsbedürftig",
};

export const ZUSTAND_FAKTOR: Record<Zustand, number> = {
  neuwertig: 0.05,
  gut: 0.25,
  renovierungsbeduerftig: 0.65,
  sanierungsbeduerftig: 1.0,
};

export function schaetzeKategorie(kategorie: RenovierungsKategorie, wohnflaeche: number, zustand: Zustand): number {
  const basis = RENOVIERUNG_BASIS[kategorie].vollkosten(Math.max(0, wohnflaeche));
  return Math.round(basis * ZUSTAND_FAKTOR[zustand]);
}

export function erstelleRenovierungsPositionen(wohnflaeche: number, zustand: Zustand): RenovierungsPosten[] {
  return RENOVIERUNG_REIHENFOLGE.map((kategorie) => ({
    kategorie,
    geschaetzt: schaetzeKategorie(kategorie, wohnflaeche, zustand),
    override: null,
    aktiv: true,
  }));
}

export function aktualisiereSchaetzungen(
  positionen: RenovierungsPosten[],
  wohnflaeche: number,
  zustand: Zustand,
): RenovierungsPosten[] {
  return positionen.map((p) => ({
    ...p,
    geschaetzt: schaetzeKategorie(p.kategorie, wohnflaeche, zustand),
  }));
}

export function summeRenovierung(positionen: RenovierungsPosten[]): number {
  return positionen
    .filter((p) => p.aktiv)
    .reduce((sum, p) => sum + (p.override ?? p.geschaetzt), 0);
}
