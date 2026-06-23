export type Bundesland =
  | "Baden-Württemberg"
  | "Bayern"
  | "Berlin"
  | "Brandenburg"
  | "Bremen"
  | "Hamburg"
  | "Hessen"
  | "Mecklenburg-Vorpommern"
  | "Niedersachsen"
  | "Nordrhein-Westfalen"
  | "Rheinland-Pfalz"
  | "Saarland"
  | "Sachsen"
  | "Sachsen-Anhalt"
  | "Schleswig-Holstein"
  | "Thüringen";

export type Zustand =
  | "neuwertig"
  | "gut"
  | "renovierungsbeduerftig"
  | "sanierungsbeduerftig";

export interface Kreditdaten {
  zinssatz: number;
  tilgungssatz: number;
  zinsbindungJahre: number;
  sondertilgungProJahr: number;
  sondertilgungMonat: number;
}

export interface KaufnebenkostenSaetze {
  grunderwerbsteuerPct: number;
  notarPct: number;
  grundbuchPct: number;
  maklerPct: number;
}

export type RenovierungsKategorie =
  | "elektrik"
  | "heizung"
  | "fenster"
  | "dach"
  | "fassade"
  | "badezimmer"
  | "boeden"
  | "tueren"
  | "kueche"
  | "malerarbeiten";

export interface RenovierungsPosten {
  kategorie: RenovierungsKategorie;
  geschaetzt: number;
  override: number | null;
  aktiv: boolean;
}

export interface LaufendeKostenMonatlich {
  grundsteuerJahr: number;
  gebaeudeversicherungJahr: number;
  stromMonat: number;
  wasserMonat: number;
  muellMonat: number;
  heizungMonat: number;
  internetMonat: number;
  ruecklageMonat: number;
}

export interface Foto {
  id: string;
  name: string;
  dataUrl: string;
}

export interface Dokument {
  id: string;
  name: string;
  dataUrl: string;
  typ: string;
}

export interface Besichtigung {
  id: string;
  datum: string;
  notiz: string;
}

export interface FoerderAngaben {
  anzahlKinder: number;
  haushaltseinkommenJahr: number;
  neubau: boolean;
  energetischeSanierungGeplant: boolean;
  selbstnutzung: boolean;
}

export interface Immobilie {
  id: string;
  erstelltAm: string;
  aktualisiertAm: string;

  name: string;
  adresse: string;
  bundesland: Bundesland;
  kaufpreis: number;
  wohnflaeche: number;
  baujahr: number;
  zustand: Zustand;
  regionalerQmPreis: number | null;

  eigenkapital: number;
  kredit: Kreditdaten;

  nebenkostenSaetze: KaufnebenkostenSaetze;

  renovierung: RenovierungsPosten[];

  laufendeKosten: LaufendeKostenMonatlich;
  laufendeKostenSteigerungPct: number;

  wertsteigerungProJahrPct: number;
  mietsteigerungProJahrPct: number;
  anlagerenditeAlternativPct: number;

  aktuelleKaltmiete: number;
  aktuelleMietNebenkosten: number;

  haltedauerJahreGeplant: number;
  verkaufsmaklerPct: number;

  foerderung: FoerderAngaben;

  energieausweisWert: number | null;
  fotos: Foto[];
  dokumente: Dokument[];
  besichtigungen: Besichtigung[];
  notizen: string;
}

export type TabKey =
  | "uebersicht"
  | "kredit"
  | "nebenkosten"
  | "renovierung"
  | "laufende"
  | "mietenkaufen"
  | "verkauf"
  | "modernisierung"
  | "foerderung"
  | "hausakte";
