import type { Immobilie } from "../../types";
import type { Berechnungen } from "../../lib/engine";
import { Card, Hinweis } from "../ui/Card";
import { formatEUR } from "../../lib/format";
import { MODERNISIERUNGS_RISIKO } from "../../lib/modernisierungsrisiko";

interface ModuleProps {
  immobilie: Immobilie;
  berechnungen: Berechnungen;
}

export function Modernisierungsrisiko({ immobilie, berechnungen }: ModuleProps) {
  const { modernisierung } = berechnungen;

  return (
    <>
      <Card title="Modernisierungsrisiko nach Baujahr" subtitle={`Dieses Objekt: Baujahr ${immobilie.baujahr} → Kategorie „${modernisierung.eintrag.label}“`}>
        <div className="risiko-tabelle">
          {MODERNISIERUNGS_RISIKO.map((r) => (
            <div className={`risiko-zelle ${r === modernisierung.eintrag ? "aktuell" : ""}`} key={r.label}>
              <span className="risiko-zelle-titel">{r.label}</span>
              <span className="risiko-zelle-text">{r.beschreibung}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Wahrscheinliche Sanierungen in den nächsten 10 Jahren"
        subtitle="Geschätzte Kosten bei vollständiger Erneuerung der betroffenen Gewerke"
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Gewerk</th>
                <th>Geschätzte Kosten</th>
              </tr>
            </thead>
            <tbody>
              {modernisierung.positionen.map((p) => (
                <tr key={p.kategorie}>
                  <td>{p.label}</td>
                  <td>{formatEUR(p.kosten)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="posten-summe">
          <span>Geschätzte Gesamtkosten</span>
          <span>{formatEUR(modernisierung.gesamtkosten)}</span>
        </div>
        <Hinweis>
          Diese Schätzung basiert ausschließlich auf dem Baujahr und typischen Lebenszyklen von Bauteilen (z. B.
          Heizung ~20–25 Jahre, Fenster/Dämmung ~30 Jahre, Elektrik ~40 Jahre). Der tatsächliche Zustand kann
          abweichen – siehe Modul „Renovierung“ für eine zustandsbasierte Schätzung.
        </Hinweis>
      </Card>
    </>
  );
}
