import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Immobilie, Zustand, Bundesland } from "../../types";
import type { Berechnungen } from "../../lib/engine";
import { useImmobilien } from "../../state/ImmobilienContext";
import { Card, StatGrid, StatCard, Hinweis } from "../ui/Card";
import { NumberField, SelectField, FieldGrid } from "../ui/Field";
import { formatEUR, formatJahreMonate } from "../../lib/format";
import { jahresUebersicht } from "../../lib/kredit";
import { BUNDESLAENDER, grunderwerbsteuerFuer } from "../../lib/bundeslaender";
import { ZUSTAND_LABEL, aktualisiereSchaetzungen } from "../../lib/renovierung";

interface ModuleProps {
  immobilie: Immobilie;
  berechnungen: Berechnungen;
}

const ZUSTAND_OPTIONEN = (Object.keys(ZUSTAND_LABEL) as Zustand[]).map((z) => ({
  value: z,
  label: ZUSTAND_LABEL[z],
}));

const BUNDESLAND_OPTIONEN = BUNDESLAENDER.map((b) => ({ value: b, label: b }));

export function KreditRechner({ immobilie, berechnungen }: ModuleProps) {
  const { aktualisiere } = useImmobilien();
  const { kredit, kreditsumme, nebenkosten } = berechnungen;

  const jahresdaten = jahresUebersicht(kredit);
  const chartDaten = jahresdaten.map((j) => ({
    jahr: j.jahr,
    Zins: Math.round(j.zins),
    Tilgung: Math.round(j.tilgung + j.sondertilgung),
    Restschuld: Math.round(j.restschuldEnde),
  }));

  function setStammdaten(patch: Partial<Pick<Immobilie, "wohnflaeche" | "baujahr" | "zustand">>) {
    aktualisiere((i) => {
      const naechste = { ...i, ...patch };
      return { ...naechste, renovierung: aktualisiereSchaetzungen(i.renovierung, naechste.wohnflaeche, naechste.zustand) };
    });
  }

  function setBundesland(bundesland: Bundesland) {
    aktualisiere((i) => ({
      ...i,
      bundesland,
      nebenkostenSaetze: { ...i.nebenkostenSaetze, grunderwerbsteuerPct: grunderwerbsteuerFuer(bundesland) },
    }));
  }

  return (
    <>
      <Card title="Objekt- & Kaufdaten">
        <FieldGrid>
          <NumberField
            label="Kaufpreis"
            value={immobilie.kaufpreis}
            onChange={(v) => aktualisiere((i) => ({ ...i, kaufpreis: v }))}
            suffix="€"
            step={5000}
          />
          <NumberField
            label="Wohnfläche"
            value={immobilie.wohnflaeche}
            onChange={(v) => setStammdaten({ wohnflaeche: v })}
            suffix="m²"
            step={5}
          />
          <NumberField
            label="Baujahr"
            value={immobilie.baujahr}
            onChange={(v) => setStammdaten({ baujahr: Math.round(v) })}
            step={1}
          />
          <SelectField
            label="Zustand"
            value={immobilie.zustand}
            onChange={(v) => setStammdaten({ zustand: v })}
            options={ZUSTAND_OPTIONEN}
          />
          <SelectField
            label="Bundesland"
            value={immobilie.bundesland}
            onChange={setBundesland}
            options={BUNDESLAND_OPTIONEN}
            hint="Bestimmt die Grunderwerbsteuer bei den Kaufnebenkosten."
          />
        </FieldGrid>
      </Card>

      <Card title="Finanzierung">
        <FieldGrid>
          <NumberField
            label="Eigenkapital"
            value={immobilie.eigenkapital}
            onChange={(v) => aktualisiere((i) => ({ ...i, eigenkapital: v }))}
            suffix="€"
            step={5000}
          />
          <NumberField
            label="Zinssatz (nominal, p.a.)"
            value={immobilie.kredit.zinssatz}
            onChange={(v) => aktualisiere((i) => ({ ...i, kredit: { ...i.kredit, zinssatz: v } }))}
            suffix="%"
            step={0.05}
          />
          <NumberField
            label="Anfängliche Tilgung"
            value={immobilie.kredit.tilgungssatz}
            onChange={(v) => aktualisiere((i) => ({ ...i, kredit: { ...i.kredit, tilgungssatz: v } }))}
            suffix="%"
            step={0.1}
          />
          <NumberField
            label="Zinsbindung"
            value={immobilie.kredit.zinsbindungJahre}
            onChange={(v) => aktualisiere((i) => ({ ...i, kredit: { ...i.kredit, zinsbindungJahre: Math.round(v) } }))}
            suffix="Jahre"
            step={1}
          />
          <NumberField
            label="Sondertilgung pro Jahr"
            value={immobilie.kredit.sondertilgungProJahr}
            onChange={(v) => aktualisiere((i) => ({ ...i, kredit: { ...i.kredit, sondertilgungProJahr: v } }))}
            suffix="€"
            step={1000}
          />
          <NumberField
            label="Sondertilgung im Monat"
            value={immobilie.kredit.sondertilgungMonat}
            onChange={(v) =>
              aktualisiere((i) => ({
                ...i,
                kredit: { ...i.kredit, sondertilgungMonat: Math.min(12, Math.max(1, Math.round(v))) },
              }))
            }
            min={1}
            max={12}
            step={1}
            hint="1 = Januar … 12 = Dezember"
          />
        </FieldGrid>
      </Card>

      <Card title="Ergebnis" subtitle={`Kreditsumme: Kaufpreis + Kaufnebenkosten (${formatEUR(nebenkosten.gesamt)}) − Eigenkapital`}>
        <StatGrid>
          <StatCard label="Kreditsumme" value={formatEUR(kreditsumme)} />
          <StatCard label="Monatliche Rate" value={formatEUR(Math.round(kredit.monatlicheRate))} />
          <StatCard
            label="Restschuld zum Ende der Zinsbindung"
            value={formatEUR(Math.round(kredit.restschuldZinsbindung))}
            sub={`nach ${immobilie.kredit.zinsbindungJahre} Jahren`}
          />
          <StatCard
            label="Volltilgung"
            value={kredit.volltilgungMonate ? formatJahreMonate(kredit.volltilgungMonate) : "> 50 Jahre"}
          />
          <StatCard label="Gesamte Zinskosten" value={formatEUR(Math.round(kredit.gezahlteZinsenGesamt))} sub="bei angenommener gleicher Verzinsung über die gesamte Laufzeit" />
          <StatCard label="Gesamtkosten des Kredits" value={formatEUR(Math.round(kredit.gesamtkostenKredit))} sub="Kreditsumme + Zinsen" />
        </StatGrid>
        {kredit.volltilgungMonate === null && (
          <Hinweis>
            Mit der aktuellen Tilgung wird der Kredit innerhalb von 50 Jahren nicht vollständig zurückgezahlt. Erhöhe die
            Tilgung oder die Sondertilgung.
          </Hinweis>
        )}
      </Card>

      <Card title="Tilgungsverlauf" subtitle="Zins- und Tilgungsanteil pro Jahr sowie Restschuld">
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <ComposedChart data={chartDaten} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="jahr" tickFormatter={(v) => `J${v}`} fontSize={12} />
              <YAxis yAxisId="left" tickFormatter={(v) => `${Math.round(v / 1000)}k`} fontSize={12} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${Math.round(v / 1000)}k`} fontSize={12} />
              <Tooltip formatter={(v) => formatEUR(Number(v))} labelFormatter={(v) => `Jahr ${v}`} />
              <Bar yAxisId="left" dataKey="Zins" stackId="a" fill="var(--red)" />
              <Bar yAxisId="left" dataKey="Tilgung" stackId="a" fill="var(--accent)" />
              <Line yAxisId="right" type="monotone" dataKey="Restschuld" stroke="var(--text)" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Tilgungsplan (jährlich)">
        <div className="table-wrap table-scroll">
          <table>
            <thead>
              <tr>
                <th>Jahr</th>
                <th>Zinsanteil</th>
                <th>Tilgungsanteil</th>
                <th>Sondertilgung</th>
                <th>Restschuld Ende</th>
              </tr>
            </thead>
            <tbody>
              {jahresdaten.map((j) => (
                <tr key={j.jahr}>
                  <td>{j.jahr}</td>
                  <td>{formatEUR(Math.round(j.zins))}</td>
                  <td>{formatEUR(Math.round(j.tilgung))}</td>
                  <td>{j.sondertilgung > 0 ? formatEUR(Math.round(j.sondertilgung)) : "–"}</td>
                  <td>{formatEUR(Math.round(j.restschuldEnde))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
