import type { Immobilie } from "../../types";
import type { Berechnungen } from "../../lib/engine";
import { useImmobilien } from "../../state/ImmobilienContext";
import { Card, StatGrid, StatCard } from "../ui/Card";
import { NumberField, FieldGrid } from "../ui/Field";
import { formatEUR } from "../../lib/format";
import { summeLaufendeKostenJahr, projiziereLaufendeKosten } from "../../lib/laufendeKosten";

interface ModuleProps {
  immobilie: Immobilie;
  berechnungen: Berechnungen;
}

export function LaufendeKosten({ immobilie }: ModuleProps) {
  const { aktualisiere } = useImmobilien();
  const lk = immobilie.laufendeKosten;

  function set<K extends keyof typeof lk>(key: K, value: number) {
    aktualisiere((i) => ({ ...i, laufendeKosten: { ...i.laufendeKosten, [key]: value } }));
  }

  const jahresSumme = summeLaufendeKostenJahr(lk);
  const in10 = projiziereLaufendeKosten(lk, immobilie.laufendeKostenSteigerungPct, 10);
  const in20 = projiziereLaufendeKosten(lk, immobilie.laufendeKostenSteigerungPct, 20);

  return (
    <>
      <Card title="Jährliche Posten">
        <FieldGrid>
          <NumberField label="Grundsteuer" value={lk.grundsteuerJahr} onChange={(v) => set("grundsteuerJahr", v)} suffix="€/Jahr" step={50} hint="Abhängig vom Hebesatz der Gemeinde – beim Verkäufer/Grundsteuerbescheid erfragen." />
          <NumberField label="Gebäudeversicherung" value={lk.gebaeudeversicherungJahr} onChange={(v) => set("gebaeudeversicherungJahr", v)} suffix="€/Jahr" step={25} />
        </FieldGrid>
      </Card>

      <Card title="Monatliche Posten">
        <FieldGrid>
          <NumberField label="Strom" value={lk.stromMonat} onChange={(v) => set("stromMonat", v)} suffix="€/Monat" step={10} />
          <NumberField label="Wasser" value={lk.wasserMonat} onChange={(v) => set("wasserMonat", v)} suffix="€/Monat" step={5} />
          <NumberField label="Müll" value={lk.muellMonat} onChange={(v) => set("muellMonat", v)} suffix="€/Monat" step={5} />
          <NumberField label="Heizung" value={lk.heizungMonat} onChange={(v) => set("heizungMonat", v)} suffix="€/Monat" step={10} />
          <NumberField label="Internet" value={lk.internetMonat} onChange={(v) => set("internetMonat", v)} suffix="€/Monat" step={5} />
          <NumberField
            label="Instandhaltungsrücklage"
            value={lk.ruecklageMonat}
            onChange={(v) => set("ruecklageMonat", v)}
            suffix="€/Monat"
            step={10}
            hint="Empfehlung: ca. 1 €/m² Wohnfläche pro Monat."
          />
        </FieldGrid>
      </Card>

      <Card title="Annahme für Projektionen">
        <FieldGrid>
          <NumberField
            label="Jährliche Kostensteigerung"
            value={immobilie.laufendeKostenSteigerungPct}
            onChange={(v) => aktualisiere((i) => ({ ...i, laufendeKostenSteigerungPct: v }))}
            suffix="%"
            step={0.1}
            hint="Wird für Hochrechnungen in „Übersicht“ und „Mieten vs. Kaufen“ verwendet."
          />
        </FieldGrid>
      </Card>

      <Card title="Ergebnis">
        <StatGrid>
          <StatCard label="Monatlich gesamt" value={formatEUR(Math.round(jahresSumme / 12))} />
          <StatCard label="Jährlich gesamt" value={formatEUR(Math.round(jahresSumme))} />
          <StatCard label="In 10 Jahren (mit Steigerung)" value={formatEUR(Math.round(in10))} />
          <StatCard label="In 20 Jahren (mit Steigerung)" value={formatEUR(Math.round(in20))} />
        </StatGrid>
      </Card>
    </>
  );
}
