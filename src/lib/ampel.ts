import type { Immobilie } from "../types";
import type { KreditErgebnis } from "./kredit";
import { projiziereLaufendeKosten } from "./laufendeKosten";

export type AmpelFarbe = "gruen" | "gelb" | "rot";

export interface Teilbewertung {
  label: string;
  score: number;
  kommentar: string;
}

export interface KillerZahl {
  gesamt: number;
  zinsen: number;
  kaufnebenkosten: number;
  sanierung: number;
  laufendeKosten: number;
  jahre: number;
}

export interface AmpelErgebnis {
  score: number;
  farbe: AmpelFarbe;
  teilbewertungen: Teilbewertung[];
  killerZahl: KillerZahl;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function bewerteImmobilie(
  immobilie: Immobilie,
  kredit: KreditErgebnis,
  kaufnebenkostenGesamt: number,
  renovierungGesamt: number,
  modernisierungGesamt: number,
): AmpelErgebnis {
  const teilbewertungen: Teilbewertung[] = [];

  // 1. Quadratmeterpreis im Vergleich zur Region
  const qmPreis = immobilie.wohnflaeche > 0 ? immobilie.kaufpreis / immobilie.wohnflaeche : 0;
  if (immobilie.regionalerQmPreis && immobilie.regionalerQmPreis > 0) {
    const ratio = qmPreis / immobilie.regionalerQmPreis;
    const score = clamp(100 - (ratio - 1) * 150, 0, 100);
    teilbewertungen.push({
      label: "Quadratmeterpreis vs. Region",
      score,
      kommentar:
        ratio <= 1
          ? `${Math.round((1 - ratio) * 100)} % günstiger als der regionale Vergleichswert.`
          : `${Math.round((ratio - 1) * 100)} % teurer als der regionale Vergleichswert.`,
    });
  } else {
    teilbewertungen.push({
      label: "Quadratmeterpreis vs. Region",
      score: 60,
      kommentar: "Kein regionaler Vergleichswert hinterlegt – bei Modul „Übersicht“ ergänzen für eine genauere Einschätzung.",
    });
  }

  // 2. Sanierungsbedarf relativ zum Kaufpreis
  const sanierungSumme = renovierungGesamt + modernisierungGesamt;
  const sanierungRatio = immobilie.kaufpreis > 0 ? sanierungSumme / immobilie.kaufpreis : 0;
  teilbewertungen.push({
    label: "Sanierungsbedarf",
    score: clamp(100 - sanierungRatio * 400, 0, 100),
    kommentar: `Geschätzter Sanierungsbedarf entspricht ${formatRatioPct(sanierungRatio)} des Kaufpreises.`,
  });

  // 3. Finanzierung (Beleihungsauslauf)
  const ltv = immobilie.kaufpreis > 0 ? kredit.kreditsumme / immobilie.kaufpreis : 0;
  teilbewertungen.push({
    label: "Finanzierung (Beleihungsauslauf)",
    score: clamp(100 - Math.max(0, ltv - 0.5) * 200, 0, 100),
    kommentar: `Kredit deckt ${formatRatioPct(ltv)} des Kaufpreises ab.`,
  });

  // 4. Eigenkapitalquote
  const ekBasis = immobilie.kaufpreis + kaufnebenkostenGesamt;
  const ekQuote = ekBasis > 0 ? immobilie.eigenkapital / ekBasis : 0;
  teilbewertungen.push({
    label: "Eigenkapitalquote",
    score: clamp((ekQuote / 0.3) * 100, 0, 100),
    kommentar: `Eigenkapital deckt ${formatRatioPct(ekQuote)} von Kaufpreis + Kaufnebenkosten.`,
  });

  const score = teilbewertungen.reduce((sum, t) => sum + t.score, 0) / teilbewertungen.length;
  const farbe: AmpelFarbe = score >= 70 ? "gruen" : score >= 40 ? "gelb" : "rot";

  const jahre = 20;
  const monateHorizont = jahre * 12;
  const zinsenHorizont = kredit.plan
    .slice(0, Math.min(monateHorizont, kredit.plan.length))
    .reduce((sum, z) => sum + z.zinsanteil, 0);

  const laufendeKostenHorizont = projiziereLaufendeKosten(immobilie.laufendeKosten, immobilie.laufendeKostenSteigerungPct, jahre);

  const killerZahl: KillerZahl = {
    zinsen: zinsenHorizont,
    kaufnebenkosten: kaufnebenkostenGesamt,
    sanierung: sanierungSumme,
    laufendeKosten: laufendeKostenHorizont,
    gesamt: zinsenHorizont + kaufnebenkostenGesamt + sanierungSumme + laufendeKostenHorizont,
    jahre,
  };

  return { score, farbe, teilbewertungen, killerZahl };
}

function formatRatioPct(ratio: number): string {
  return `${Math.round(ratio * 100)} %`;
}
