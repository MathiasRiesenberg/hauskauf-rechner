import type { Immobilie } from "../types";

const STORAGE_KEY = "hauskauf-rechner:immobilien:v1";

export function ladeImmobilien(): Immobilie[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export interface SpeicherErgebnis {
  ok: boolean;
  fehler?: string;
}

export function speichereImmobilien(liste: Immobilie[]): SpeicherErgebnis {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(liste));
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      fehler:
        e instanceof DOMException && e.name === "QuotaExceededError"
          ? "Speicher voll – bitte Fotos/Dokumente verkleinern oder entfernen."
          : "Speichern fehlgeschlagen.",
    };
  }
}
