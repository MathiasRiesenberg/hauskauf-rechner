import type { Immobilie } from "../types";
import type { KreditErgebnis } from "./kredit";
import { summeLaufendeKostenMonat } from "./laufendeKosten";

// Vermögensvergleich: Käufer steckt sein Eigenkapital ins Haus, der Mieter legt
// dieselbe Summe am Kapitalmarkt an. Die jeweilige monatliche Ersparnis
// (Differenz zwischen Kauf- und Mietausgaben) wird ebenfalls angelegt. Verglichen
// wird das Nettovermögen (Hauswert − Restschuld + Depot) beider Szenarien.

export interface MietenKaufenJahrPunkt {
  jahr: number;
  vermoegenKaeufer: number;
  vermoegenMieter: number;
}

export interface MietenKaufenErgebnis {
  verlauf: MietenKaufenJahrPunkt[];
  breakEvenJahr: number | null;
}

const HORIZONT_JAHRE = 30;

export function vergleicheMietenKaufen(
  immobilie: Immobilie,
  kredit: KreditErgebnis,
  kaufnebenkostenGesamt: number,
): MietenKaufenErgebnis {
  const horizontMonate = HORIZONT_JAHRE * 12;
  const monatlicherAnlagezins = immobilie.anlagerenditeAlternativPct / 100 / 12;

  const laufendeKostenMonatBasis = summeLaufendeKostenMonat(immobilie.laufendeKosten);

  const benoetigtesEigenkapital = Math.max(0, immobilie.kaufpreis + kaufnebenkostenGesamt - kredit.kreditsumme);
  // Eigenkapital, das über den reinen Kapitalbedarf hinausgeht, könnte der Käufer
  // ebenfalls anlegen statt es einzubringen – vereinfachend nehmen wir an, dass
  // genau der Bedarf eingebracht wird und der Rest (falls vorhanden) ebenfalls investiert wird.
  let kaeuferDepot = Math.max(0, immobilie.eigenkapital - benoetigtesEigenkapital);
  let mieterDepot = immobilie.eigenkapital;

  const verlauf: MietenKaufenJahrPunkt[] = [
    { jahr: 0, vermoegenKaeufer: immobilie.kaufpreis - kredit.kreditsumme + kaeuferDepot, vermoegenMieter: mieterDepot },
  ];

  for (let monat = 1; monat <= horizontMonate; monat++) {
    const jahrIndex = Math.floor((monat - 1) / 12);
    const mieteFaktor = Math.pow(1 + immobilie.mietsteigerungProJahrPct / 100, jahrIndex);
    const kostenFaktor = Math.pow(1 + immobilie.laufendeKostenSteigerungPct / 100, jahrIndex);

    const miete = (immobilie.aktuelleKaltmiete + immobilie.aktuelleMietNebenkosten) * mieteFaktor;
    const laufendeKosten = laufendeKostenMonatBasis * kostenFaktor;

    const planZeile = monat <= kredit.plan.length ? kredit.plan[monat - 1] : null;
    const rate = planZeile ? planZeile.zinsanteil + planZeile.tilgungsanteil + planZeile.sondertilgung : 0;
    const restschuld = planZeile ? planZeile.restschuldEnde : 0;

    const kaufenAusgabe = rate + laufendeKosten;
    const differenz = kaufenAusgabe - miete;

    kaeuferDepot = kaeuferDepot * (1 + monatlicherAnlagezins) + Math.max(0, -differenz);
    mieterDepot = mieterDepot * (1 + monatlicherAnlagezins) + Math.max(0, differenz);

    if (monat % 12 === 0) {
      const hauswert = immobilie.kaufpreis * Math.pow(1 + immobilie.wertsteigerungProJahrPct / 100, monat / 12);
      verlauf.push({
        jahr: monat / 12,
        vermoegenKaeufer: hauswert - restschuld + kaeuferDepot,
        vermoegenMieter: mieterDepot,
      });
    }
  }

  let breakEvenJahr: number | null = null;
  for (let i = 0; i < verlauf.length; i++) {
    const restImmerGroesser = verlauf
      .slice(i)
      .every((p) => p.vermoegenKaeufer >= p.vermoegenMieter);
    if (restImmerGroesser) {
      breakEvenJahr = verlauf[i].jahr;
      break;
    }
  }

  return { verlauf, breakEvenJahr };
}
