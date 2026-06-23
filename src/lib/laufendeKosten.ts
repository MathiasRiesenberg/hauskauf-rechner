import type { LaufendeKostenMonatlich } from "../types";

export function summeLaufendeKostenJahr(lk: LaufendeKostenMonatlich): number {
  return (
    lk.grundsteuerJahr +
    lk.gebaeudeversicherungJahr +
    12 * (lk.stromMonat + lk.wasserMonat + lk.muellMonat + lk.heizungMonat + lk.internetMonat + lk.ruecklageMonat)
  );
}

export function summeLaufendeKostenMonat(lk: LaufendeKostenMonatlich): number {
  return summeLaufendeKostenJahr(lk) / 12;
}

export function projiziereLaufendeKosten(lk: LaufendeKostenMonatlich, steigerungProJahrPct: number, jahre: number): number {
  const basis = summeLaufendeKostenJahr(lk);
  let summe = 0;
  for (let j = 0; j < jahre; j++) {
    summe += basis * Math.pow(1 + steigerungProJahrPct / 100, j);
  }
  return summe;
}
