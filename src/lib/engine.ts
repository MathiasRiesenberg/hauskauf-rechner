import type { Immobilie } from "../types";
import { berechneKredit, type KreditErgebnis } from "./kredit";
import { berechneKaufnebenkosten, type KaufnebenkostenErgebnis } from "./nebenkosten";
import { summeRenovierung } from "./renovierung";
import { berechneModernisierungsrisiko, type ModernisierungsErgebnis } from "./modernisierungsrisiko";
import { vergleicheMietenKaufen, type MietenKaufenErgebnis } from "./mietenVsKaufen";
import { berechneVerkauf, findeBreakEvenHaltedauer, type VerkaufErgebnis } from "./verkauf";
import { bewerteImmobilie, type AmpelErgebnis } from "./ampel";

export interface Berechnungen {
  kreditsumme: number;
  kredit: KreditErgebnis;
  nebenkosten: KaufnebenkostenErgebnis;
  renovierungGesamt: number;
  modernisierung: ModernisierungsErgebnis;
  mietenKaufen: MietenKaufenErgebnis;
  verkauf: VerkaufErgebnis;
  verkaufBreakEvenJahr: number | null;
  ampel: AmpelErgebnis;
  benoetigtesEigenkapital: number;
  eigenkapitalquote: number;
}

export function berechneAlles(immobilie: Immobilie): Berechnungen {
  const nebenkosten = berechneKaufnebenkosten(immobilie.kaufpreis, immobilie.nebenkostenSaetze);
  const kreditsumme = Math.max(0, immobilie.kaufpreis + nebenkosten.gesamt - immobilie.eigenkapital);

  const kredit = berechneKredit(
    kreditsumme,
    immobilie.kredit.zinssatz,
    immobilie.kredit.tilgungssatz,
    immobilie.kredit.sondertilgungProJahr,
    immobilie.kredit.sondertilgungMonat,
    immobilie.kredit.zinsbindungJahre,
  );

  const renovierungGesamt = summeRenovierung(immobilie.renovierung);
  const modernisierung = berechneModernisierungsrisiko(immobilie.baujahr, immobilie.wohnflaeche);

  const mietenKaufen = vergleicheMietenKaufen(immobilie, kredit, nebenkosten.gesamt);

  const verkauf = berechneVerkauf(
    immobilie,
    kredit,
    nebenkosten.gesamt,
    renovierungGesamt,
    immobilie.haltedauerJahreGeplant,
  );
  const verkaufBreakEvenJahr = findeBreakEvenHaltedauer(immobilie, kreditsumme, nebenkosten.gesamt, renovierungGesamt).jahr;

  const ampel = bewerteImmobilie(immobilie, kredit, nebenkosten.gesamt, renovierungGesamt, modernisierung.gesamtkosten);

  const benoetigtesEigenkapital = Math.max(0, immobilie.kaufpreis + nebenkosten.gesamt - kreditsumme);
  const ekBasis = immobilie.kaufpreis + nebenkosten.gesamt;
  const eigenkapitalquote = ekBasis > 0 ? immobilie.eigenkapital / ekBasis : 0;

  return {
    kreditsumme,
    kredit,
    nebenkosten,
    renovierungGesamt,
    modernisierung,
    mietenKaufen,
    verkauf,
    verkaufBreakEvenJahr,
    ampel,
    benoetigtesEigenkapital,
    eigenkapitalquote,
  };
}
