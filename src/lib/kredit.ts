// Annuitätendarlehen mit konstanter Monatsrate. Sondertilgungen verkürzen die
// Laufzeit (Rate bleibt gleich), das ist die in Deutschland übliche Standardvariante.

const MAX_MONATE = 50 * 12; // Sicherheitsdeckel, falls Tilgung zu niedrig für Volltilgung ist

export interface TilgungsplanZeile {
  monat: number;
  zinsanteil: number;
  tilgungsanteil: number;
  sondertilgung: number;
  restschuldStart: number;
  restschuldEnde: number;
}

export interface KreditErgebnis {
  kreditsumme: number;
  monatlicheRate: number;
  plan: TilgungsplanZeile[];
  volltilgungMonate: number | null;
  restschuldZinsbindung: number;
  gezahlteZinsenGesamt: number;
  gezahlteZinsenBisZinsbindung: number;
  gezahlteSondertilgungGesamt: number;
  gesamtkostenKredit: number;
}

export function berechneKredit(
  kreditsumme: number,
  zinssatzPct: number,
  tilgungssatzPct: number,
  sondertilgungProJahr: number,
  sondertilgungMonat: number,
  zinsbindungJahre: number,
): KreditErgebnis {
  const summe = Math.max(0, kreditsumme);
  const monatlicherZins = zinssatzPct / 100 / 12;
  const monatlicheRate = (summe * (zinssatzPct + tilgungssatzPct)) / 100 / 12;

  const plan: TilgungsplanZeile[] = [];
  let restschuld = summe;
  let volltilgungMonate: number | null = null;
  let gezahlteZinsenGesamt = 0;
  let gezahlteSondertilgungGesamt = 0;
  const zinsbindungMonate = Math.round(zinsbindungJahre * 12);
  let restschuldZinsbindung = summe;

  if (summe > 0 && monatlicheRate > 0) {
    for (let monat = 1; monat <= MAX_MONATE; monat++) {
      const restschuldStart = restschuld;
      let zinsanteil = restschuldStart * monatlicherZins;
      let tilgungsanteil = monatlicheRate - zinsanteil;

      if (tilgungsanteil >= restschuldStart) {
        tilgungsanteil = restschuldStart;
        zinsanteil = Math.min(zinsanteil, restschuldStart * monatlicherZins);
      }

      let zwischenstand = restschuldStart - tilgungsanteil;

      let sondertilgung = 0;
      const istSonderMonat = monat % 12 === sondertilgungMonat % 12;
      if (sondertilgungProJahr > 0 && istSonderMonat && zwischenstand > 0) {
        sondertilgung = Math.min(sondertilgungProJahr, zwischenstand);
        zwischenstand -= sondertilgung;
      }

      restschuld = Math.max(0, zwischenstand);
      gezahlteZinsenGesamt += zinsanteil;
      gezahlteSondertilgungGesamt += sondertilgung;

      plan.push({
        monat,
        zinsanteil,
        tilgungsanteil,
        sondertilgung,
        restschuldStart,
        restschuldEnde: restschuld,
      });

      if (monat === zinsbindungMonate) {
        restschuldZinsbindung = restschuld;
      }

      if (restschuld <= 0.005) {
        volltilgungMonate = monat;
        break;
      }
    }
  } else {
    restschuldZinsbindung = summe;
  }

  if (volltilgungMonate !== null && zinsbindungMonate >= volltilgungMonate) {
    restschuldZinsbindung = 0;
  } else if (plan.length > 0 && zinsbindungMonate > plan.length) {
    restschuldZinsbindung = plan[plan.length - 1].restschuldEnde;
  } else if (plan.length === 0) {
    restschuldZinsbindung = summe;
  }

  const grenzeZinsbindung = Math.min(zinsbindungMonate, plan.length);
  const gezahlteZinsenBisZinsbindung = plan
    .slice(0, grenzeZinsbindung)
    .reduce((sum, z) => sum + z.zinsanteil, 0);

  return {
    kreditsumme: summe,
    monatlicheRate,
    plan,
    volltilgungMonate,
    restschuldZinsbindung,
    gezahlteZinsenGesamt,
    gezahlteZinsenBisZinsbindung,
    gezahlteSondertilgungGesamt,
    gesamtkostenKredit: summe + gezahlteZinsenGesamt,
  };
}

export function restschuldNachMonaten(kredit: KreditErgebnis, monate: number): number {
  if (monate <= 0) return kredit.kreditsumme;
  if (monate >= kredit.plan.length) {
    return kredit.plan.length > 0 ? kredit.plan[kredit.plan.length - 1].restschuldEnde : 0;
  }
  return kredit.plan[monate - 1].restschuldEnde;
}

export function gezahlteZinsenBisMonat(kredit: KreditErgebnis, monate: number): number {
  const grenze = Math.min(monate, kredit.plan.length);
  let summe = 0;
  for (let i = 0; i < grenze; i++) summe += kredit.plan[i].zinsanteil;
  return summe;
}

export function jahresUebersicht(kredit: KreditErgebnis): {
  jahr: number;
  zins: number;
  tilgung: number;
  sondertilgung: number;
  restschuldEnde: number;
}[] {
  const jahre: { jahr: number; zins: number; tilgung: number; sondertilgung: number; restschuldEnde: number }[] = [];
  let jahr = 1;
  let zins = 0;
  let tilgung = 0;
  let sondertilgung = 0;
  kredit.plan.forEach((zeile, idx) => {
    zins += zeile.zinsanteil;
    tilgung += zeile.tilgungsanteil;
    sondertilgung += zeile.sondertilgung;
    const istJahresEnde = (idx + 1) % 12 === 0;
    const istLetzte = idx === kredit.plan.length - 1;
    if (istJahresEnde || istLetzte) {
      jahre.push({ jahr, zins, tilgung, sondertilgung, restschuldEnde: zeile.restschuldEnde });
      jahr += 1;
      zins = 0;
      tilgung = 0;
      sondertilgung = 0;
    }
  });
  return jahre;
}
