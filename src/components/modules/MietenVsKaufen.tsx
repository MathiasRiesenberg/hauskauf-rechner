import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Immobilie } from "../../types";
import type { Berechnungen } from "../../lib/engine";
import { useImmobilien } from "../../state/ImmobilienContext";
import { Card, StatCard, StatGrid, Hinweis } from "../ui/Card";
import { NumberField, FieldGrid } from "../ui/Field";
import { formatEUR, formatZahl } from "../../lib/format";

interface ModuleProps {
  immobilie: Immobilie;
  berechnungen: Berechnungen;
}

export function MietenVsKaufen({ immobilie, berechnungen }: ModuleProps) {
  const { aktualisiere } = useImmobilien();
  const { mietenKaufen } = berechnungen;

  const chartDaten = mietenKaufen.verlauf.map((p) => ({
    jahr: p.jahr,
    Kaufen: Math.round(p.vermoegenKaeufer),
    Mieten: Math.round(p.vermoegenMieter),
  }));

  return (
    <>
      <Card title="Aktuelle Miete">
        <FieldGrid>
          <NumberField
            label="Kaltmiete"
            value={immobilie.aktuelleKaltmiete}
            onChange={(v) => aktualisiere((i) => ({ ...i, aktuelleKaltmiete: v }))}
            suffix="€/Monat"
            step={25}
          />
          <NumberField
            label="Mietnebenkosten"
            value={immobilie.aktuelleMietNebenkosten}
            onChange={(v) => aktualisiere((i) => ({ ...i, aktuelleMietNebenkosten: v }))}
            suffix="€/Monat"
            step={10}
          />
          <NumberField
            label="Mietsteigerung pro Jahr"
            value={immobilie.mietsteigerungProJahrPct}
            onChange={(v) => aktualisiere((i) => ({ ...i, mietsteigerungProJahrPct: v }))}
            suffix="%"
            step={0.1}
          />
        </FieldGrid>
      </Card>

      <Card title="Marktannahmen">
        <FieldGrid>
          <NumberField
            label="Wertsteigerung Immobilie pro Jahr"
            value={immobilie.wertsteigerungProJahrPct}
            onChange={(v) => aktualisiere((i) => ({ ...i, wertsteigerungProJahrPct: v }))}
            suffix="%"
            step={0.1}
          />
          <NumberField
            label="Anlagerendite der Alternative"
            value={immobilie.anlagerenditeAlternativPct}
            onChange={(v) => aktualisiere((i) => ({ ...i, anlagerenditeAlternativPct: v }))}
            suffix="%"
            step={0.1}
            hint="Rendite, die der Mieter erzielt, wenn er Eigenkapital + Ersparnis am Kapitalmarkt anlegt."
          />
        </FieldGrid>
      </Card>

      <Card title="Ergebnis">
        <StatGrid>
          <StatCard
            label="Kaufen lohnt sich ab"
            value={mietenKaufen.breakEvenJahr ? `Jahr ${formatZahl(mietenKaufen.breakEvenJahr)}` : "> 30 Jahre"}
            tone={mietenKaufen.breakEvenJahr === null ? "bad" : mietenKaufen.breakEvenJahr <= 10 ? "good" : "warn"}
          />
        </StatGrid>
        <Hinweis>
          Verglichen wird das Nettovermögen beider Szenarien: Käufer = Immobilienwert − Restschuld + investierte
          Ersparnis. Mieter = Eigenkapital + monatliche Ersparnis, jeweils am Kapitalmarkt angelegt. Die
          Kaufnebenkosten sind im Vermögen des Käufers ab Tag 1 als Verlust enthalten.
        </Hinweis>
      </Card>

      <Card title="Vermögensverlauf" subtitle="Nettovermögen über 30 Jahre">
        <div style={{ width: "100%", height: 340 }}>
          <ResponsiveContainer>
            <LineChart data={chartDaten} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="jahr" tickFormatter={(v) => `J${v}`} fontSize={12} />
              <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} fontSize={12} />
              <Tooltip formatter={(v) => formatEUR(Number(v))} labelFormatter={(v) => `Jahr ${v}`} />
              <Legend />
              <Line type="monotone" dataKey="Kaufen" stroke="var(--accent)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Mieten" stroke="var(--text-muted)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );
}
