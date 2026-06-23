import type { RenovierungsKategorie } from "../types";
import { RENOVIERUNG_BASIS } from "./renovierung";

export interface BaujahrRisikoEintrag {
  von: number;
  bis: number;
  label: string;
  beschreibung: string;
  kategorien: RenovierungsKategorie[];
}

// Richtwerte basierend auf typischen Lebenszyklen von Bauteilen (Heizung ~20-25
// Jahre, Fenster/Dämmung ~30 Jahre, Elektrik ~40 Jahre, Dach ~30-40 Jahre).
export const MODERNISIERUNGS_RISIKO: BaujahrRisikoEintrag[] = [
  {
    von: 0,
    bis: 1969,
    label: "vor 1970",
    beschreibung: "Altbau – in mehreren Gewerken ist eine Kernsanierung wahrscheinlich.",
    kategorien: ["elektrik", "heizung", "fenster", "dach", "fassade"],
  },
  {
    von: 1970,
    bis: 1989,
    label: "1970–1989",
    beschreibung: "Heizung und Dämmstandard sind in diesem Baujahr meist veraltet.",
    kategorien: ["heizung", "fenster", "badezimmer", "fassade"],
  },
  {
    von: 1990,
    bis: 2005,
    label: "1990–2005",
    beschreibung: "Erste Modernisierungswelle steht typischerweise an (Fenster, Dämmung, Heizung).",
    kategorien: ["fenster", "fassade", "heizung"],
  },
  {
    von: 2006,
    bis: 9999,
    label: "nach 2005",
    beschreibung: "Geringes Risiko – meist reichen Schönheitsreparaturen.",
    kategorien: ["malerarbeiten"],
  },
];

export function findeRisiko(baujahr: number): BaujahrRisikoEintrag {
  return (
    MODERNISIERUNGS_RISIKO.find((r) => baujahr >= r.von && baujahr <= r.bis) ??
    MODERNISIERUNGS_RISIKO[MODERNISIERUNGS_RISIKO.length - 1]
  );
}

export interface ModernisierungsErgebnis {
  eintrag: BaujahrRisikoEintrag;
  gesamtkosten: number;
  positionen: { kategorie: RenovierungsKategorie; label: string; kosten: number }[];
}

export function berechneModernisierungsrisiko(baujahr: number, wohnflaeche: number): ModernisierungsErgebnis {
  const eintrag = findeRisiko(baujahr);
  const positionen = eintrag.kategorien.map((kategorie) => ({
    kategorie,
    label: RENOVIERUNG_BASIS[kategorie].label,
    kosten: Math.round(RENOVIERUNG_BASIS[kategorie].vollkosten(Math.max(0, wohnflaeche))),
  }));
  const gesamtkosten = positionen.reduce((sum, p) => sum + p.kosten, 0);
  return { eintrag, gesamtkosten, positionen };
}
