import type { Immobilie } from "../../types";
import { useImmobilien } from "../../state/ImmobilienContext";
import { Card, Hinweis, Badge } from "../ui/Card";
import { NumberField, ToggleField, FieldGrid } from "../ui/Field";
import { FOERDERPROGRAMME } from "../../lib/foerderungen";

interface ModuleProps {
  immobilie: Immobilie;
}

export function Foerderungen({ immobilie }: ModuleProps) {
  const { aktualisiere } = useImmobilien();
  const f = immobilie.foerderung;

  function set<K extends keyof typeof f>(key: K, value: (typeof f)[K]) {
    aktualisiere((i) => ({ ...i, foerderung: { ...i.foerderung, [key]: value } }));
  }

  return (
    <>
      <Hinweis>
        Förderprogramme und ihre Konditionen ändern sich häufig. Diese Übersicht basiert auf öffentlich bekannten
        Programmen und ist eine Orientierung, keine Rechts- oder Förderberatung. Vor Antragstellung immer die
        aktuellen Konditionen bei KfW, Landesförderbank oder einem Berater prüfen.
      </Hinweis>

      <Card title="Angaben für die Eignungsprüfung">
        <FieldGrid>
          <NumberField label="Anzahl Kinder im Haushalt" value={f.anzahlKinder} onChange={(v) => set("anzahlKinder", Math.max(0, Math.round(v)))} step={1} />
          <NumberField label="Haushaltseinkommen pro Jahr" value={f.haushaltseinkommenJahr} onChange={(v) => set("haushaltseinkommenJahr", v)} suffix="€" step={1000} />
        </FieldGrid>
        <FieldGrid>
          <ToggleField label="Selbstnutzung geplant" checked={f.selbstnutzung} onChange={(v) => set("selbstnutzung", v)} />
          <ToggleField label="Neubau (kein Bestandskauf)" checked={f.neubau} onChange={(v) => set("neubau", v)} />
          <ToggleField label="Energetische Sanierung geplant" checked={f.energetischeSanierungGeplant} onChange={(v) => set("energetischeSanierungGeplant", v)} />
        </FieldGrid>
      </Card>

      <Card title="Mögliche Förderprogramme">
        {FOERDERPROGRAMME.map((p) => {
          const passt = p.pruefe(immobilie);
          return (
            <div className={`foerder-card ${passt ? "passend" : ""}`} key={p.id}>
              <div className="foerder-card-header">
                <span className="foerder-card-name">{p.name}</span>
                <Badge tone={passt ? "gruen" : "neutral"}>{passt ? "könnte passen" : "eher nicht relevant"}</Badge>
              </div>
              <span className="muted" style={{ fontSize: "0.8rem" }}>{p.traeger}</span>
              <p style={{ fontSize: "0.85rem" }}>{p.beschreibung}</p>
              {p.hinweis && <span className="field-hint">{p.hinweis}</span>}
            </div>
          );
        })}
      </Card>
    </>
  );
}
