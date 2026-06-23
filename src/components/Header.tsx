import type { Immobilie } from "../types";
import type { Berechnungen } from "../lib/engine";
import { useImmobilien } from "../state/ImmobilienContext";
import { Badge } from "./ui/Card";
import { formatZahl } from "../lib/format";

const FARBE_LABEL: Record<string, string> = {
  gruen: "Sehr guter Kauf",
  gelb: "Fairer Kauf",
  rot: "Teurer Kauf",
};

interface HeaderProps {
  immobilie: Immobilie;
  berechnungen: Berechnungen;
}

export function Header({ immobilie, berechnungen }: HeaderProps) {
  const { aktualisiere, dupliziere } = useImmobilien();

  return (
    <header className="page-header">
      <div className="page-header-title">
        <input
          className="header-input header-input-name"
          value={immobilie.name}
          onChange={(e) => aktualisiere((i) => ({ ...i, name: e.target.value }))}
          placeholder="Objektname"
        />
        <input
          className="header-input header-input-adresse"
          value={immobilie.adresse}
          onChange={(e) => aktualisiere((i) => ({ ...i, adresse: e.target.value }))}
          placeholder="Adresse hinzufügen…"
        />
      </div>
      <div className="page-header-meta">
        <Badge tone={berechnungen.ampel.farbe as "gruen" | "gelb" | "rot"}>
          {FARBE_LABEL[berechnungen.ampel.farbe]} · {formatZahl(berechnungen.ampel.score)}/100
        </Badge>
        <button className="btn btn-secondary btn-sm" onClick={() => dupliziere(immobilie.id)}>
          Duplizieren
        </button>
      </div>
    </header>
  );
}
