import type { Immobilie } from "../types";
import { erzeugeId } from "./id";
import { grunderwerbsteuerFuer } from "./bundeslaender";
import { erstelleRenovierungsPositionen } from "./renovierung";

export function erstelleNeueImmobilie(name = "Neues Objekt"): Immobilie {
  const jetzt = new Date().toISOString();
  const bundesland = "Nordrhein-Westfalen" as const;
  const wohnflaeche = 120;
  const zustand = "gut" as const;

  return {
    id: erzeugeId(),
    erstelltAm: jetzt,
    aktualisiertAm: jetzt,

    name,
    adresse: "",
    bundesland,
    kaufpreis: 400000,
    wohnflaeche,
    baujahr: 1995,
    zustand,
    regionalerQmPreis: null,

    eigenkapital: 80000,
    kredit: {
      zinssatz: 3.8,
      tilgungssatz: 2.0,
      zinsbindungJahre: 10,
      sondertilgungProJahr: 0,
      sondertilgungMonat: 12,
    },

    nebenkostenSaetze: {
      grunderwerbsteuerPct: grunderwerbsteuerFuer(bundesland),
      notarPct: 1.0,
      grundbuchPct: 0.5,
      maklerPct: 3.57,
    },

    renovierung: erstelleRenovierungsPositionen(wohnflaeche, zustand),

    laufendeKosten: {
      grundsteuerJahr: 400,
      gebaeudeversicherungJahr: 350,
      stromMonat: 120,
      wasserMonat: 40,
      muellMonat: 25,
      heizungMonat: 150,
      internetMonat: 40,
      ruecklageMonat: 120,
    },
    laufendeKostenSteigerungPct: 2.5,

    wertsteigerungProJahrPct: 2.0,
    mietsteigerungProJahrPct: 2.5,
    anlagerenditeAlternativPct: 4.0,

    aktuelleKaltmiete: 1100,
    aktuelleMietNebenkosten: 250,

    haltedauerJahreGeplant: 10,
    verkaufsmaklerPct: 3.57,

    foerderung: {
      anzahlKinder: 0,
      haushaltseinkommenJahr: 60000,
      neubau: false,
      energetischeSanierungGeplant: false,
      selbstnutzung: true,
    },

    energieausweisWert: null,
    fotos: [],
    dokumente: [],
    besichtigungen: [],
    notizen: "",
  };
}
