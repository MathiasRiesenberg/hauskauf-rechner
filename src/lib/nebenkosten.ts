import type { KaufnebenkostenSaetze } from "../types";

export interface KaufnebenkostenErgebnis {
  grunderwerbsteuer: number;
  notar: number;
  grundbuch: number;
  makler: number;
  gesamt: number;
  gesamtPct: number;
}

export function berechneKaufnebenkosten(
  kaufpreis: number,
  saetze: KaufnebenkostenSaetze,
): KaufnebenkostenErgebnis {
  const grunderwerbsteuer = (kaufpreis * saetze.grunderwerbsteuerPct) / 100;
  const notar = (kaufpreis * saetze.notarPct) / 100;
  const grundbuch = (kaufpreis * saetze.grundbuchPct) / 100;
  const makler = (kaufpreis * saetze.maklerPct) / 100;
  const gesamt = grunderwerbsteuer + notar + grundbuch + makler;
  return {
    grunderwerbsteuer,
    notar,
    grundbuch,
    makler,
    gesamt,
    gesamtPct:
      saetze.grunderwerbsteuerPct + saetze.notarPct + saetze.grundbuchPct + saetze.maklerPct,
  };
}
