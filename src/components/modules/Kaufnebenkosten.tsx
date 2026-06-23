import type { Immobilie } from "../../types";
import type { Berechnungen } from "../../lib/engine";
import { useImmobilien } from "../../state/ImmobilienContext";
import { Card, StatGrid, StatCard, Hinweis } from "../ui/Card";
import { NumberField, FieldGrid } from "../ui/Field";
import { formatEUR, formatPct } from "../../lib/format";

interface ModuleProps {
  immobilie: Immobilie;
  berechnungen: Berechnungen;
}

export function Kaufnebenkosten({ immobilie, berechnungen }: ModuleProps) {
  const { aktualisiere } = useImmobilien();
  const { nebenkosten, benoetigtesEigenkapital, eigenkapitalquote } = berechnungen;

  return (
    <>
      <Card title="Sätze" subtitle={`Bundesland: ${immobilie.bundesland} (Grunderwerbsteuer wird im Modul „Kredit“ über das Bundesland gesetzt)`}>
        <FieldGrid>
          <NumberField
            label="Grunderwerbsteuer"
            value={immobilie.nebenkostenSaetze.grunderwerbsteuerPct}
            onChange={(v) => aktualisiere((i) => ({ ...i, nebenkostenSaetze: { ...i.nebenkostenSaetze, grunderwerbsteuerPct: v } }))}
            suffix="%"
            step={0.1}
          />
          <NumberField
            label="Notar"
            value={immobilie.nebenkostenSaetze.notarPct}
            onChange={(v) => aktualisiere((i) => ({ ...i, nebenkostenSaetze: { ...i.nebenkostenSaetze, notarPct: v } }))}
            suffix="%"
            step={0.1}
          />
          <NumberField
            label="Grundbuch"
            value={immobilie.nebenkostenSaetze.grundbuchPct}
            onChange={(v) => aktualisiere((i) => ({ ...i, nebenkostenSaetze: { ...i.nebenkostenSaetze, grundbuchPct: v } }))}
            suffix="%"
            step={0.1}
          />
          <NumberField
            label="Makler"
            value={immobilie.nebenkostenSaetze.maklerPct}
            onChange={(v) => aktualisiere((i) => ({ ...i, nebenkostenSaetze: { ...i.nebenkostenSaetze, maklerPct: v } }))}
            suffix="%"
            step={0.1}
            hint="0 % falls kein Makler beteiligt ist."
          />
        </FieldGrid>
        <Hinweis>
          Richtwerte – Grunderwerbsteuersätze und Maklerprovisionen ändern sich gelegentlich und variieren je nach
          Verhandlung. Vor dem Kauf die aktuellen Sätze beim Notar bzw. Makler prüfen.
        </Hinweis>
      </Card>

      <Card title="Aufschlüsselung">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Position</th>
                <th>Satz</th>
                <th>Betrag</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Grunderwerbsteuer</td>
                <td>{formatPct(immobilie.nebenkostenSaetze.grunderwerbsteuerPct, 2)}</td>
                <td>{formatEUR(Math.round(nebenkosten.grunderwerbsteuer))}</td>
              </tr>
              <tr>
                <td>Notar</td>
                <td>{formatPct(immobilie.nebenkostenSaetze.notarPct, 2)}</td>
                <td>{formatEUR(Math.round(nebenkosten.notar))}</td>
              </tr>
              <tr>
                <td>Grundbuch</td>
                <td>{formatPct(immobilie.nebenkostenSaetze.grundbuchPct, 2)}</td>
                <td>{formatEUR(Math.round(nebenkosten.grundbuch))}</td>
              </tr>
              <tr>
                <td>Makler</td>
                <td>{formatPct(immobilie.nebenkostenSaetze.maklerPct, 2)}</td>
                <td>{formatEUR(Math.round(nebenkosten.makler))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Ergebnis">
        <StatGrid>
          <StatCard label="Gesamte Kaufnebenkosten" value={formatEUR(Math.round(nebenkosten.gesamt))} sub={formatPct(nebenkosten.gesamtPct, 2)} />
          <StatCard label="Benötigtes Eigenkapital" value={formatEUR(Math.round(benoetigtesEigenkapital))} sub="Kaufpreis + Nebenkosten − Kredit" />
          <StatCard
            label="Eigenkapitalquote"
            value={formatPct(eigenkapitalquote * 100, 0)}
            tone={eigenkapitalquote >= 0.2 ? "good" : eigenkapitalquote >= 0.1 ? "warn" : "bad"}
          />
        </StatGrid>
      </Card>
    </>
  );
}
