import type { Bundesland } from "../types";

export const BUNDESLAENDER: Bundesland[] = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
];

// Grunderwerbsteuersätze – Richtwerte, Stand der Recherche. Sätze werden von
// den Bundesländern gelegentlich angepasst, vor Kauf unbedingt aktuell prüfen.
export const GRUNDERWERBSTEUER: Record<Bundesland, number> = {
  "Baden-Württemberg": 5.0,
  Bayern: 3.5,
  Berlin: 6.0,
  Brandenburg: 6.5,
  Bremen: 5.0,
  Hamburg: 5.5,
  Hessen: 6.0,
  "Mecklenburg-Vorpommern": 6.0,
  Niedersachsen: 5.0,
  "Nordrhein-Westfalen": 6.5,
  "Rheinland-Pfalz": 5.0,
  Saarland: 6.5,
  Sachsen: 5.5,
  "Sachsen-Anhalt": 5.0,
  "Schleswig-Holstein": 6.5,
  Thüringen: 5.0,
};

export function grunderwerbsteuerFuer(bundesland: Bundesland): number {
  return GRUNDERWERBSTEUER[bundesland] ?? 5.0;
}
