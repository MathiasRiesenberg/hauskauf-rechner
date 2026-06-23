import type { Immobilie, RenovierungsKategorie } from "../../types";
import type { Berechnungen } from "../../lib/engine";
import { useImmobilien } from "../../state/ImmobilienContext";
import { Card, Hinweis } from "../ui/Card";
import { NumberField } from "../ui/Field";
import { formatEUR } from "../../lib/format";
import { RENOVIERUNG_BASIS, ZUSTAND_LABEL } from "../../lib/renovierung";

interface ModuleProps {
  immobilie: Immobilie;
  berechnungen: Berechnungen;
}

export function Renovierung({ immobilie, berechnungen }: ModuleProps) {
  const { aktualisiere } = useImmobilien();

  function setOverride(kategorie: RenovierungsKategorie, wert: number) {
    aktualisiere((i) => ({
      ...i,
      renovierung: i.renovierung.map((p) => (p.kategorie === kategorie ? { ...p, override: wert } : p)),
    }));
  }

  function resetOverride(kategorie: RenovierungsKategorie) {
    aktualisiere((i) => ({
      ...i,
      renovierung: i.renovierung.map((p) => (p.kategorie === kategorie ? { ...p, override: null } : p)),
    }));
  }

  function toggleAktiv(kategorie: RenovierungsKategorie, aktiv: boolean) {
    aktualisiere((i) => ({
      ...i,
      renovierung: i.renovierung.map((p) => (p.kategorie === kategorie ? { ...p, aktiv } : p)),
    }));
  }

  return (
    <>
      <Card
        title="Renovierungskosten schätzen"
        subtitle={`Geschätzt auf Basis von ${immobilie.wohnflaeche} m² Wohnfläche und Zustand „${ZUSTAND_LABEL[immobilie.zustand]}“. Werte können pro Kategorie überschrieben werden.`}
      >
        <div className="posten-list">
          {immobilie.renovierung.map((p) => {
            const def = RENOVIERUNG_BASIS[p.kategorie];
            const aktuellerWert = p.override ?? p.geschaetzt;
            return (
              <div className={`posten-row ${p.aktiv ? "" : "inaktiv"}`} key={p.kategorie}>
                <span className="posten-toggle">
                  <input type="checkbox" checked={p.aktiv} onChange={(e) => toggleAktiv(p.kategorie, e.target.checked)} />
                </span>
                <div className="posten-main">
                  <span className="posten-label">{def.label}</span>
                  <span className="posten-meta">
                    Richtwert: {def.einheit} → geschätzt {formatEUR(p.geschaetzt)}
                    {p.override !== null && (
                      <>
                        {" · "}
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "0 4px", height: "auto" }}
                          onClick={() => resetOverride(p.kategorie)}
                        >
                          ↺ auf Schätzung zurücksetzen
                        </button>
                      </>
                    )}
                  </span>
                </div>
                <div className="posten-input">
                  <NumberField label="" value={aktuellerWert} onChange={(v) => setOverride(p.kategorie, v)} suffix="€" step={500} />
                </div>
              </div>
            );
          })}
          <div className="posten-summe">
            <span>Gesamte Renovierungskosten</span>
            <span>{formatEUR(berechnungen.renovierungGesamt)}</span>
          </div>
        </div>
      </Card>

      <Hinweis>
        Die Schätzungen sind grobe Richtwerte für Vollsanierung der jeweiligen Kategorie, gewichtet mit dem angegebenen
        Zustand. Tatsächliche Kosten hängen stark von Region, Materialwahl und Handwerkerverfügbarkeit ab. Kategorien,
        die nicht benötigt werden, können per Häkchen deaktiviert werden.
      </Hinweis>
    </>
  );
}
