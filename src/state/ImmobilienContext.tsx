import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Immobilie } from "../types";
import { ladeImmobilien, speichereImmobilien } from "../lib/storage";
import { erstelleNeueImmobilie } from "../lib/defaults";
import { erzeugeId } from "../lib/id";

interface ImmobilienContextValue {
  immobilien: Immobilie[];
  aktiveId: string | null;
  aktiv: Immobilie | null;
  speicherFehler: string | null;
  waehleAktiv: (id: string) => void;
  neuesObjekt: () => void;
  loescheObjekt: (id: string) => void;
  dupliziere: (id: string) => void;
  aktualisiere: (updater: (i: Immobilie) => Immobilie) => void;
}

const ImmobilienContext = createContext<ImmobilienContextValue | null>(null);

export function ImmobilienProvider({ children }: { children: ReactNode }) {
  const [immobilien, setImmobilien] = useState<Immobilie[]>(() => ladeImmobilien());
  const [aktiveId, setAktiveId] = useState<string | null>(() => ladeImmobilien()[0]?.id ?? null);
  const [speicherFehler, setSpeicherFehler] = useState<string | null>(null);

  useEffect(() => {
    const ergebnis = speichereImmobilien(immobilien);
    setSpeicherFehler(ergebnis.ok ? null : ergebnis.fehler ?? "Speichern fehlgeschlagen.");
  }, [immobilien]);

  const waehleAktiv = useCallback((id: string) => setAktiveId(id), []);

  const neuesObjekt = useCallback(() => {
    const neu = erstelleNeueImmobilie(`Objekt ${immobilien.length + 1}`);
    setImmobilien((liste) => [...liste, neu]);
    setAktiveId(neu.id);
  }, [immobilien.length]);

  const loescheObjekt = useCallback(
    (id: string) => {
      setImmobilien((liste) => {
        const neueListe = liste.filter((i) => i.id !== id);
        setAktiveId((aktuelle) => {
          if (aktuelle !== id) return aktuelle;
          return neueListe[0]?.id ?? null;
        });
        return neueListe;
      });
    },
    [],
  );

  const dupliziere = useCallback((id: string) => {
    setImmobilien((liste) => {
      const original = liste.find((i) => i.id === id);
      if (!original) return liste;
      const jetzt = new Date().toISOString();
      const kopie: Immobilie = {
        ...original,
        id: erzeugeId(),
        name: `${original.name} (Kopie)`,
        erstelltAm: jetzt,
        aktualisiertAm: jetzt,
      };
      setAktiveId(kopie.id);
      return [...liste, kopie];
    });
  }, []);

  const aktualisiere = useCallback(
    (updater: (i: Immobilie) => Immobilie) => {
      setImmobilien((liste) =>
        liste.map((i) => (i.id === aktiveId ? { ...updater(i), aktualisiertAm: new Date().toISOString() } : i)),
      );
    },
    [aktiveId],
  );

  const aktiv = useMemo(() => immobilien.find((i) => i.id === aktiveId) ?? null, [immobilien, aktiveId]);

  const value: ImmobilienContextValue = {
    immobilien,
    aktiveId,
    aktiv,
    speicherFehler,
    waehleAktiv,
    neuesObjekt,
    loescheObjekt,
    dupliziere,
    aktualisiere,
  };

  return <ImmobilienContext.Provider value={value}>{children}</ImmobilienContext.Provider>;
}

export function useImmobilien(): ImmobilienContextValue {
  const ctx = useContext(ImmobilienContext);
  if (!ctx) throw new Error("useImmobilien muss innerhalb von ImmobilienProvider verwendet werden");
  return ctx;
}
