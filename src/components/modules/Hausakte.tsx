import { useState } from "react";
import type { Immobilie } from "../../types";
import { useImmobilien } from "../../state/ImmobilienContext";
import { Card, Hinweis } from "../ui/Card";
import { NumberField, TextField, TextAreaField, FieldGrid } from "../ui/Field";
import { resizeImageToDataUrl, fileToDataUrl } from "../../lib/image";
import { erzeugeId } from "../../lib/id";
import { formatDatum } from "../../lib/format";

interface ModuleProps {
  immobilie: Immobilie;
}

function energieeffizienzklasse(wert: number): string {
  if (wert <= 30) return "A+";
  if (wert <= 50) return "A";
  if (wert <= 75) return "B";
  if (wert <= 100) return "C";
  if (wert <= 130) return "D";
  if (wert <= 160) return "E";
  if (wert <= 200) return "F";
  if (wert <= 250) return "G";
  return "H";
}

export function Hausakte({ immobilie }: ModuleProps) {
  const { aktualisiere } = useImmobilien();
  const [neuesDatum, setNeuesDatum] = useState("");
  const [neueNotiz, setNeueNotiz] = useState("");

  async function fotosHinzufuegen(files: FileList | null) {
    if (!files || files.length === 0) return;
    const neue = await Promise.all(
      Array.from(files).map(async (file) => ({
        id: erzeugeId(),
        name: file.name,
        dataUrl: await resizeImageToDataUrl(file),
      })),
    );
    aktualisiere((i) => ({ ...i, fotos: [...i.fotos, ...neue] }));
  }

  function fotoEntfernen(id: string) {
    aktualisiere((i) => ({ ...i, fotos: i.fotos.filter((f) => f.id !== id) }));
  }

  async function dokumentHinzufuegen(files: FileList | null) {
    if (!files || files.length === 0) return;
    const neue = await Promise.all(
      Array.from(files).map(async (file) => ({
        id: erzeugeId(),
        name: file.name,
        typ: file.type,
        dataUrl: await fileToDataUrl(file),
      })),
    );
    aktualisiere((i) => ({ ...i, dokumente: [...i.dokumente, ...neue] }));
  }

  function dokumentEntfernen(id: string) {
    aktualisiere((i) => ({ ...i, dokumente: i.dokumente.filter((d) => d.id !== id) }));
  }

  function besichtigungHinzufuegen() {
    if (!neuesDatum) return;
    aktualisiere((i) => ({
      ...i,
      besichtigungen: [...i.besichtigungen, { id: erzeugeId(), datum: neuesDatum, notiz: neueNotiz }],
    }));
    setNeuesDatum("");
    setNeueNotiz("");
  }

  function besichtigungEntfernen(id: string) {
    aktualisiere((i) => ({ ...i, besichtigungen: i.besichtigungen.filter((b) => b.id !== id) }));
  }

  return (
    <>
      <Card title="Energieausweis">
        <FieldGrid>
          <NumberField
            label="Energiekennwert"
            value={immobilie.energieausweisWert ?? 0}
            onChange={(v) => aktualisiere((i) => ({ ...i, energieausweisWert: v || null }))}
            suffix="kWh/(m²a)"
            step={5}
          />
        </FieldGrid>
        {immobilie.energieausweisWert ? (
          <p>
            Effizienzklasse: <strong>{energieeffizienzklasse(immobilie.energieausweisWert)}</strong>
          </p>
        ) : (
          <span className="field-hint">Wert aus dem Energieausweis eintragen, um die Effizienzklasse zu sehen.</span>
        )}
      </Card>

      <Card title="Fotos" actions={
        <label className="upload-label btn btn-secondary btn-sm">
          + Fotos hochladen
          <input type="file" accept="image/*" multiple onChange={(e) => fotosHinzufuegen(e.target.files)} />
        </label>
      }>
        {immobilie.fotos.length === 0 ? (
          <span className="field-hint">Noch keine Fotos hinterlegt.</span>
        ) : (
          <div className="foto-grid">
            {immobilie.fotos.map((f) => (
              <div className="foto-item" key={f.id}>
                <img src={f.dataUrl} alt={f.name} />
                <button className="foto-remove" onClick={() => fotoEntfernen(f.id)} title="Entfernen">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <Hinweis>
          Fotos werden lokal im Browser gespeichert (localStorage, Limit ca. 5–10 MB). Bei vielen oder sehr großen
          Fotos kann der Speicher voll laufen – Bilder werden daher beim Hochladen automatisch verkleinert.
        </Hinweis>
      </Card>

      <Card title="Dokumente (Exposé, Energieausweis, etc.)" actions={
        <label className="upload-label btn btn-secondary btn-sm">
          + Dokument hochladen
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={(e) => dokumentHinzufuegen(e.target.files)} />
        </label>
      }>
        {immobilie.dokumente.length === 0 ? (
          <span className="field-hint">Noch keine Dokumente hinterlegt.</span>
        ) : (
          <div className="liste-list">
            {immobilie.dokumente.map((d) => (
              <div className="liste-item" key={d.id}>
                <div className="liste-item-main">
                  <a className="liste-item-title" href={d.dataUrl} download={d.name} target="_blank" rel="noreferrer">
                    {d.name}
                  </a>
                  <span className="liste-item-sub">{d.typ || "Datei"}</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => dokumentEntfernen(d.id)}>
                  Entfernen
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Besichtigungstermine">
        <div className="row">
          <label className="field">
            <span className="field-label">Datum</span>
            <input type="date" className="field-input" value={neuesDatum} onChange={(e) => setNeuesDatum(e.target.value)} />
          </label>
          <TextField label="Notiz" value={neueNotiz} onChange={setNeueNotiz} placeholder="Eindrücke, offene Fragen…" />
          <button className="btn btn-primary" style={{ alignSelf: "flex-end" }} onClick={besichtigungHinzufuegen}>
            Hinzufügen
          </button>
        </div>
        {immobilie.besichtigungen.length > 0 && (
          <div className="liste-list">
            {immobilie.besichtigungen
              .slice()
              .sort((a, b) => a.datum.localeCompare(b.datum))
              .map((b) => (
                <div className="liste-item" key={b.id}>
                  <div className="liste-item-main">
                    <span className="liste-item-title">{formatDatum(b.datum)}</span>
                    {b.notiz && <span className="liste-item-sub">{b.notiz}</span>}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => besichtigungEntfernen(b.id)}>
                    Entfernen
                  </button>
                </div>
              ))}
          </div>
        )}
      </Card>

      <Card title="Notizen">
        <TextAreaField
          label=""
          value={immobilie.notizen}
          onChange={(v) => aktualisiere((i) => ({ ...i, notizen: v }))}
          placeholder="Freie Notizen zu diesem Objekt…"
          rows={6}
        />
      </Card>
    </>
  );
}
