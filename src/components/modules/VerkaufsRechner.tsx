import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Immobilie } from "../../types";
import type { Berechnungen } from "../../lib/engine";
import { useImmobilien } from "../../state/ImmobilienContext";
import { Card, StatGrid, StatCard, Hinweis } from "../ui/Card";
import { NumberField, FieldGrid } from "../ui/Field";
import { formatEUR, formatPct, formatZahl } from "../../lib/format";
import { findeBreakEvenHaltedauer } from "../../lib/verkauf";

interface ModuleProps {
  immobilie: Immobilie;
  berechnungen: Berechnungen;
}

export function VerkaufsRechner({ immobilie, berechnungen }: ModuleProps) {
  const { aktualisiere } = useImmobilien();
  const { verkauf, verkaufBreakEvenJahr, kreditsumme, nebenkosten, renovierungGesamt } = berechnungen;

  const breakEven = useMemo(
    () => findeBreakEvenHaltedauer(immobilie, kreditsumme, nebenkosten.gesamt, renovierungGesamt),
    [immobilie, kreditsumme, nebenkosten.gesamt, renovierungGesamt],
  );

  const chartDaten = breakEven.verlauf.map((p) => ({ jahr: p.jahr, Gewinn: Math.round(p.gewinn) }));

  return (
    <>
      <Card title="Verkaufsannahmen">
        <FieldGrid>
          <NumberField
            label="Geplante Haltedauer"
            value={immobilie.haltedauerJahreGeplant}
            onChange={(v) => aktualisiere((i) => ({ ...i, haltedauerJahreGeplant: Math.max(1, Math.round(v)) }))}
            suffix="Jahre"
            step={1}
          />
          <NumberField
            label="Wertsteigerung Immobilie pro Jahr"
            value={immobilie.wertsteigerungProJahrPct}
            onChange={(v) => aktualisiere((i) => ({ ...i, wertsteigerungProJahrPct: v }))}
            suffix="%"
            step={0.1}
          />
          <NumberField
            label="Verkaufsmakler"
            value={immobilie.verkaufsmaklerPct}
            onChange={(v) => aktualisiere((i) => ({ ...i, verkaufsmaklerPct: v }))}
            suffix="%"
            step={0.1}
          />
        </FieldGrid>
      </Card>

      <Card
        title={`Ergebnis nach ${immobilie.haltedauerJahreGeplant} Jahren`}
        subtitle={
          verkaufBreakEvenJahr
            ? `Haus lohnt sich erst ab ${formatZahl(verkaufBreakEvenJahr)} Jahren Besitzdauer.`
            : "Mit den aktuellen Annahmen wird innerhalb von 30 Jahren kein Gewinn erzielt."
        }
      >
        <StatGrid>
          <StatCard label="Verkaufspreis" value={formatEUR(Math.round(verkauf.verkaufspreis))} />
          <StatCard label="Restschuld" value={formatEUR(Math.round(verkauf.restschuld))} />
          <StatCard label="Verkaufsmaklerkosten" value={formatEUR(Math.round(verkauf.verkaufsmaklerkosten))} />
          <StatCard label="Erlös" value={formatEUR(Math.round(verkauf.erloes))} sub="Verkaufspreis − Restschuld − Makler" />
          <StatCard label="Eingesetztes Kapital" value={formatEUR(Math.round(verkauf.eingesetztesKapital))} sub="Eigenkapital + Nebenkosten + Sanierung + Zinsen" />
          <StatCard
            label="Gewinn / Verlust"
            value={formatEUR(Math.round(verkauf.gewinn))}
            tone={verkauf.gewinn >= 0 ? "good" : "bad"}
          />
          <StatCard
            label="Rendite (gesamt)"
            value={formatPct(verkauf.renditeGesamtPct, 1)}
            tone={verkauf.renditeGesamtPct >= 0 ? "good" : "bad"}
          />
          <StatCard
            label="Rendite p.a."
            value={formatPct(verkauf.renditeProJahrPct, 1)}
            tone={verkauf.renditeProJahrPct >= 0 ? "good" : "bad"}
          />
        </StatGrid>
        {verkauf.zinsbindungUeberschritten && (
          <Hinweis>
            Die geplante Haltedauer endet vor Ablauf der Zinsbindung ({immobilie.kredit.zinsbindungJahre} Jahre). Beim
            Verkauf fällt voraussichtlich eine Vorfälligkeitsentschädigung an – grob geschätzt{" "}
            {formatEUR(Math.round(verkauf.vorfaelligkeitsentschaedigungGeschaetzt))} (Richtwert, hängt stark vom
            tatsächlichen Marktzins zum Verkaufszeitpunkt ab).
          </Hinweis>
        )}
      </Card>

      <Card title="Gewinn nach Haltedauer" subtitle="Wann kippt der Verkauf von Verlust zu Gewinn?">
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartDaten} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="jahr" tickFormatter={(v) => `J${v}`} fontSize={12} />
              <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} fontSize={12} />
              <Tooltip formatter={(v) => formatEUR(Number(v))} labelFormatter={(v) => `Jahr ${v}`} />
              <Bar dataKey="Gewinn">
                {chartDaten.map((d) => (
                  <Cell key={d.jahr} fill={d.Gewinn >= 0 ? "var(--green)" : "var(--red)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );
}
