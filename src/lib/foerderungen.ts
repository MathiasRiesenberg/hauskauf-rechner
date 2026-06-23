import type { Immobilie } from "../types";

export interface Foerderprogramm {
  id: string;
  name: string;
  traeger: string;
  kategorie: "KfW" | "Land" | "Familie";
  beschreibung: string;
  pruefe: (immobilie: Immobilie) => boolean;
  hinweis?: string;
}

// Hinweis: Förderprogramme und ihre Konditionen ändern sich häufig. Diese Liste
// ist eine Orientierung auf Basis öffentlich bekannter Programme, keine
// Rechts- oder Förderberatung. Vor Antragstellung immer aktuelle Konditionen
// bei KfW / Landesförderbank / Steuerberater prüfen.
export const FOERDERPROGRAMME: Foerderprogramm[] = [
  {
    id: "kfw-124",
    name: "KfW 124 – Wohneigentumsprogramm",
    traeger: "KfW",
    kategorie: "KfW",
    beschreibung:
      "Zinsgünstiger Allzweck-Baukredit für Kauf, Neubau oder Umbau von selbstgenutztem Wohneigentum.",
    pruefe: (i) => i.foerderung.selbstnutzung,
  },
  {
    id: "kfw-261",
    name: "KfW 261 – Wohngebäude Kredit (energetische Sanierung)",
    traeger: "KfW",
    kategorie: "KfW",
    beschreibung: "Förderkredit für energetische Sanierungsmaßnahmen am Bestandsgebäude.",
    pruefe: (i) => i.foerderung.energetischeSanierungGeplant && !i.foerderung.neubau,
  },
  {
    id: "kfw-300",
    name: "KfW 300 – Wohneigentum für Familien",
    traeger: "KfW",
    kategorie: "Familie",
    beschreibung:
      "Zinsverbilligter Kredit für Familien mit Kindern und begrenztem Haushaltseinkommen beim Neubau.",
    pruefe: (i) =>
      i.foerderung.neubau && i.foerderung.anzahlKinder > 0 && i.foerderung.haushaltseinkommenJahr <= 90000,
    hinweis: "Einkommensgrenzen und Konditionen ändern sich regelmäßig – aktuellen Stand bei der KfW prüfen.",
  },
  {
    id: "kfw-159",
    name: "KfW 159 – Altersgerecht Umbauen",
    traeger: "KfW",
    kategorie: "KfW",
    beschreibung: "Kredit für barrierearmen bzw. altersgerechten Umbau der Immobilie.",
    pruefe: () => true,
    hinweis: "Nur relevant, falls Barrierefreiheit bzw. altersgerechter Umbau geplant ist.",
  },
  {
    id: "wohn-riester",
    name: "Wohn-Riester",
    traeger: "Bund",
    kategorie: "Familie",
    beschreibung:
      "Riester-Förderung (Zulagen + Steuervorteile) kann zur Tilgung selbstgenutzten Wohneigentums genutzt werden.",
    pruefe: (i) => i.foerderung.selbstnutzung,
  },
  {
    id: "landesfoerderung",
    name: "Landesförderprogramme",
    traeger: "Bundesland",
    kategorie: "Land",
    beschreibung:
      "Viele Bundesländer fördern Wohneigentum zusätzlich (z. B. NRW.BANK, IBB Berlin, BayernLabo, L-Bank BW, WI-Bank Hessen).",
    pruefe: () => true,
    hinweis: "Programm, Höhe und Voraussetzungen sind je Bundesland unterschiedlich – bei der jeweiligen Landesförderbank erfragen.",
  },
];

export function passendeFoerderungen(immobilie: Immobilie): Foerderprogramm[] {
  return FOERDERPROGRAMME.filter((p) => p.pruefe(immobilie));
}
