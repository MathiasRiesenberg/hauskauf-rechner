import type { Immobilie } from "../types";
import { berechneKredit, gezahlteZinsenBisMonat, restschuldNachMonaten, type KreditErgebnis } from "./kredit";

export interface VerkaufErgebnis {
  haltedauerJahre: number;
  verkaufspreis: number;
  restschuld: number;
  verkaufsmaklerkosten: number;
  erloes: number;
  eingesetztesKapital: number;
  gezahlteZinsen: number;
  gewinn: number;
  renditeGesamtPct: number;
  renditeProJahrPct: number;
  vorfaelligkeitsentschaedigungGeschaetzt: number;
  zinsbindungUeberschritten: boolean;
}

export function berechneVerkauf(
  immobilie: Immobilie,
  kredit: KreditErgebnis,
  kaufnebenkostenGesamt: number,
  renovierungGesamt: number,
  haltedauerJahre: number,
): VerkaufErgebnis {
  const monate = Math.round(haltedauerJahre * 12);
  const verkaufspreis = immobilie.kaufpreis * Math.pow(1 + immobilie.wertsteigerungProJahrPct / 100, haltedauerJahre);
  const restschuld = restschuldNachMonaten(kredit, monate);
  const verkaufsmaklerkosten = (verkaufspreis * immobilie.verkaufsmaklerPct) / 100;
  const erloes = verkaufspreis - restschuld - verkaufsmaklerkosten;

  const gezahlteZinsen = gezahlteZinsenBisMonat(kredit, monate);
  const eingesetztesKapital = immobilie.eigenkapital + kaufnebenkostenGesamt + renovierungGesamt + gezahlteZinsen;

  const gewinn = erloes - eingesetztesKapital;
  const renditeGesamtPct = eingesetztesKapital > 0 ? (gewinn / eingesetztesKapital) * 100 : 0;
  const renditeProJahrPct =
    eingesetztesKapital > 0 && haltedauerJahre > 0 && gewinn / eingesetztesKapital > -1
      ? (Math.pow(1 + gewinn / eingesetztesKapital, 1 / haltedauerJahre) - 1) * 100
      : 0;

  const zinsbindungUeberschritten = haltedauerJahre < immobilie.kredit.zinsbindungJahre;
  const vorfaelligkeitsentschaedigungGeschaetzt = zinsbindungUeberschritten ? restschuld * 0.015 : 0;

  return {
    haltedauerJahre,
    verkaufspreis,
    restschuld,
    verkaufsmaklerkosten,
    erloes,
    eingesetztesKapital,
    gezahlteZinsen,
    gewinn,
    renditeGesamtPct,
    renditeProJahrPct,
    vorfaelligkeitsentschaedigungGeschaetzt,
    zinsbindungUeberschritten,
  };
}

export interface BreakEvenErgebnis {
  jahr: number | null;
  verlauf: { jahr: number; gewinn: number }[];
}

export function findeBreakEvenHaltedauer(
  immobilie: Immobilie,
  kreditsumme: number,
  kaufnebenkostenGesamt: number,
  renovierungGesamt: number,
  maxJahre = 30,
): BreakEvenErgebnis {
  const kredit = berechneKredit(
    kreditsumme,
    immobilie.kredit.zinssatz,
    immobilie.kredit.tilgungssatz,
    immobilie.kredit.sondertilgungProJahr,
    immobilie.kredit.sondertilgungMonat,
    immobilie.kredit.zinsbindungJahre,
  );

  const verlauf: { jahr: number; gewinn: number }[] = [];
  let breakEvenJahr: number | null = null;

  for (let jahr = 1; jahr <= maxJahre; jahr++) {
    const ergebnis = berechneVerkauf(immobilie, kredit, kaufnebenkostenGesamt, renovierungGesamt, jahr);
    verlauf.push({ jahr, gewinn: ergebnis.gewinn });
    if (breakEvenJahr === null && ergebnis.gewinn > 0) {
      breakEvenJahr = jahr;
    }
  }

  return { jahr: breakEvenJahr, verlauf };
}
